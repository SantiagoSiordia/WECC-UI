// admin-data.jsx — derive audit events and indexes from prototype project data.

function buildRetrieval(assistantMsg, snippets, project) {
  const citeIds = assistantMsg?.cites || [];
  const chunks = citeIds.map((snippetId, i) => {
    const s = snippets[snippetId];
    if (!s) return { snippetId, file: snippetId, loc: '—', score: 0.5 - i * 0.05, text: '' };
    return {
      snippetId,
      file: s.file,
      loc: s.loc,
      score: Math.max(0.55, 0.96 - i * 0.08),
      text: s.text,
    };
  });
  const fileSet = new Set(chunks.map(c => c.file));
  (project?.files || []).slice(0, 6).forEach(f => fileSet.add(f.name));
  return {
    filesScanned: project?.fileCountTotal || project?.files?.length || 0,
    chunks,
    scannedLabels: [...fileSet].slice(0, 8),
  };
}

function estimateTokens(userMsg, asstMsg) {
  const inLen = (userMsg?.text || '').length;
  const outLen = (asstMsg?.html || asstMsg?.text || '').replace(/<[^>]+>/g, '').length;
  return { prompt: Math.round(inLen / 4), completion: Math.round(outLen / 4) };
}

const ADMIN_DEMO_QUERY_TOPICS = [
  {
    title: 'OID lookup and polling guidance',
    prompt: 'Which high-capacity counters should we poll for backbone interfaces, and which MIB defines them?',
    answer: '<p>Use the IF-MIB high-capacity interface counters for backbone links. Prefer ifHCInOctets and ifHCOutOctets for ingress and egress octets, and cite the exact OIDs in the runbook.</p>',
    hints: ['if-mib-hcin', 'if-mib-hcout'],
  },
  {
    title: 'SNMPv3 hardening review',
    prompt: 'Review our SNMPv3 setup and flag any weak authentication or privacy settings.',
    answer: '<p>The config should use authPriv, SHA authentication, and AES privacy. Any SNMPv2c community still present on production edge routers should be treated as a remediation item.</p>',
    hints: ['snmpv3-notes', 'nexus-snmp-cfg'],
  },
  {
    title: 'Alarm escalation summary',
    prompt: 'Summarize escalation criteria for Sev 1 and Sev 2 alarms for the NOC handoff.',
    answer: '<p>Sev 1 incidents should page the on-call NOC immediately. Sev 2 events can wait until the next business day unless they repeat within the escalation window.</p>',
    hints: ['runbook-alarm'],
  },
  {
    title: 'Compliance evidence check',
    prompt: 'What evidence should we collect for the next CIP patching audit?',
    answer: '<p>Collect patch inventory, approval evidence, deployment dates, exceptions, and verification output. Tie the artifacts back to the relevant CIP requirement IDs.</p>',
    hints: ['cip007-r2'],
  },
  {
    title: 'Patent risk diligence',
    prompt: 'What documents support the patent-risk summary, and what revenue exposure did the answer cite?',
    answer: '<p>The risk summary is supported by the C&D letter, issued patent claim, board minutes, and TargetCo financials. The cited revenue exposure is tied to Atlas Cache Q3 revenue.</p>',
    hints: ['cease-desist-northshore', 'us-9847231-claim1', 'tc-revenue-q3-2024'],
  },
  {
    title: 'Contract change-of-control review',
    prompt: 'Which contracts should legal review first for change-of-control language?',
    answer: '<p>Start with licenses and customer agreements with assignment, exclusivity, or consent language. Flag ambiguous clauses for counsel before relying on the answer.</p>',
    hints: ['license-2022-target'],
  },
];

function pickProjectSnippetIds(project, snippets, topic, idx) {
  const projectSnippetIds = Object.keys(snippets).filter(id => snippets[id].project === project.id);
  const hinted = (topic.hints || []).filter(id => snippets[id]?.project === project.id);
  const source = hinted.length ? hinted : projectSnippetIds;
  if (!source.length) return [];
  const rotated = source.slice(idx % source.length).concat(source.slice(0, idx % source.length));
  return rotated.slice(0, Math.min(3, rotated.length));
}

function expandDemoAuditTurns(projects, turns, snippets) {
  if (turns.length >= 24) return turns;
  const expanded = [...turns];
  const now = Date.now();

  (projects || []).forEach((project, pIdx) => {
    const users = (project.users || []).filter(u => !u.you);
    const actors = users.length ? users : (project.users || []);
    const sessions = project.sessions || [];
    const rounds = project.id === 'atlas' ? 8 : 6;

    for (let i = 0; i < rounds; i++) {
      const topic = ADMIN_DEMO_QUERY_TOPICS[(i + pIdx) % ADMIN_DEMO_QUERY_TOPICS.length];
      const actor = actors[i % Math.max(1, actors.length)];
      const session = sessions[i % Math.max(1, sessions.length)] || {
        id: `admin-demo-${project.id}-${i}`,
        title: topic.title,
      };
      const cites = pickProjectSnippetIds(project, snippets, topic, i);
      const noContext = cites.length === 0 || (i === rounds - 1 && project.id === 'runbooks');
      const userMsg = {
        role: 'user',
        text: topic.prompt,
      };
      const assistantMsg = {
        role: 'assistant',
        html: noContext
          ? '<p class="msg-warn-noctx">No relevant snippets were found in this project. Answering from general knowledge and flagging for verification.</p>'
          : topic.answer,
        cites,
        noContext,
      };
      const at = now - ((pIdx * 7 + i + 1) * 38 * 60_000);

      expanded.push({
        id: `rich-demo:${project.id}:${i}`,
        type: 'query.turn',
        at,
        actorId: actor?.id || null,
        projectId: project.id,
        projectName: project.name,
        sessionId: session.id,
        sessionTitle: session.title || topic.title,
        turnIndex: i,
        scope: 'project',
        input: { text: userMsg.text },
        output: {
          html: assistantMsg.html,
          text: assistantMsg.text,
          cites: assistantMsg.cites || [],
          noContext: !!assistantMsg.noContext,
          error: false,
        },
        retrieval: buildRetrieval(assistantMsg, snippets, project),
        latencyMs: 820 + ((i + pIdx) % 6) * 210,
        tokens: estimateTokens(userMsg, assistantMsg),
        model: 'wecc-rag-v1',
      });
    }
  });

  return expanded.sort((a, b) => b.at - a.at);
}

function deriveQueryTurns(projects, standaloneChats, snippets) {
  const turns = [];

  (projects || []).forEach(project => {
    (project.sessions || []).forEach(session => {
      const msgs = session.messages || [];
      let turnIndex = 0;
      for (let i = 0; i < msgs.length; i++) {
        if (msgs[i].role !== 'user') continue;
        const userMsg = msgs[i];
        const asstMsg = msgs[i + 1]?.role === 'assistant' ? msgs[i + 1] : null;
        const actorId = userMsg.author || session.author;
        const stagger = (msgs.length - turnIndex) * 45_000;
        const at = (session.whenDate || Date.now()) - stagger;

        turns.push({
          id: `${project.id}:${session.id}:${turnIndex}`,
          type: 'query.turn',
          at,
          actorId,
          projectId: project.id,
          projectName: project.name,
          sessionId: session.id,
          sessionTitle: session.title,
          turnIndex,
          scope: 'project',
          input: { text: userMsg.text || '' },
          output: asstMsg
            ? {
                html: asstMsg.html,
                text: asstMsg.text,
                cites: asstMsg.cites || [],
                noContext: !!asstMsg.noContext,
                error: !!asstMsg.error,
              }
            : null,
          retrieval: buildRetrieval(asstMsg, snippets, project),
          latencyMs: 1100 + turnIndex * 380 + (project.id.length * 40),
          tokens: estimateTokens(userMsg, asstMsg),
          model: 'wecc-rag-v1',
        });
        turnIndex++;
      }
    });

    (project.files || []).forEach(file => {
      if (file.status === 'fail') {
        turns.push({
          id: `file-fail:${project.id}:${file.name}`,
          type: 'file.ingest_failed',
          at: (project.sessions?.[0]?.whenDate || Date.now()) - 120_000,
          actorId: null,
          projectId: project.id,
          projectName: project.name,
          sessionId: null,
          sessionTitle: null,
          turnIndex: null,
          scope: 'project',
          input: { text: file.name },
          output: { html: null, cites: [], noContext: false, error: file.error },
          retrieval: { filesScanned: 0, chunks: [], scannedLabels: [] },
          latencyMs: null,
          tokens: null,
          model: null,
        });
      }
    });
  });

  (standaloneChats || []).forEach(chat => {
    const msgs = chat.messages || [];
    let turnIndex = 0;
    for (let i = 0; i < msgs.length; i++) {
      if (msgs[i].role !== 'user') continue;
      const userMsg = msgs[i];
      const asstMsg = msgs[i + 1]?.role === 'assistant' ? msgs[i + 1] : null;
      const stagger = (msgs.length - turnIndex) * 30_000;
      const at = (chat.whenDate || Date.now()) - stagger;

      turns.push({
        id: `standalone:${chat.id}:${turnIndex}`,
        type: 'query.turn',
        at,
        actorId: null,
        projectId: null,
        projectName: 'General chat',
        sessionId: chat.id,
        sessionTitle: chat.title,
        turnIndex,
        scope: 'standalone',
        input: { text: userMsg.text || '' },
        output: asstMsg
          ? { html: asstMsg.html, text: asstMsg.text, cites: [], noContext: true }
          : null,
        retrieval: { filesScanned: 0, chunks: [], scannedLabels: [] },
        latencyMs: 800,
        tokens: estimateTokens(userMsg, asstMsg),
        model: 'wecc-general-v1',
      });
      turnIndex++;
    }
  });

  return turns.sort((a, b) => b.at - a.at);
}

function deriveAdminUsers(projects, turns) {
  const byId = {};
  (projects || []).forEach(project => {
    (project.users || []).forEach(u => {
      if (!byId[u.id]) {
        byId[u.id] = {
          ...u,
          projects: [],
          queryCount: 0,
          lastActive: 0,
          roles: {},
        };
      }
      byId[u.id].projects.push({
        projectId: project.id,
        projectName: project.name,
        role: u.role,
      });
      byId[u.id].roles[u.role] = (byId[u.id].roles[u.role] || 0) + 1;
    });
  });

  turns.forEach(t => {
    if (!t.actorId || !byId[t.actorId]) return;
    if (t.type === 'query.turn') byId[t.actorId].queryCount++;
    if (t.at > byId[t.actorId].lastActive) byId[t.actorId].lastActive = t.at;
  });

  return Object.values(byId).sort((a, b) => b.lastActive - a.lastActive);
}

function deriveAdminProjects(projects, turns) {
  return (projects || []).map(p => {
    const projectTurns = turns.filter(t => t.projectId === p.id && t.type === 'query.turn');
    const lastActive = projectTurns.reduce((m, t) => Math.max(m, t.at), 0);
    return {
      id: p.id,
      name: p.name,
      desc: p.desc,
      userCount: p.users?.length || 0,
      fileCount: p.fileCountTotal || p.files?.length || 0,
      sessionCount: p.sessions?.length || 0,
      queryCount: projectTurns.length,
      lastActive,
      users: p.users,
      files: p.files,
      sessions: p.sessions,
    };
  }).sort((a, b) => b.lastActive - a.lastActive);
}

function deriveAuditSummary(projects, turns, users) {
  const queryTurns = turns.filter(t => t.type === 'query.turn');
  return {
    projectCount: projects.length,
    userCount: users.length,
    fileCount: projects.reduce((n, p) => n + (p.fileCountTotal || p.files?.length || 0), 0),
    queryCount: queryTurns.length,
    noContextCount: queryTurns.filter(t => t.output?.noContext).length,
    failedIngestCount: turns.filter(t => t.type === 'file.ingest_failed').length,
  };
}

function deriveAdminInsights(turns, users, projects) {
  const queryTurns = turns.filter(t => t.type === 'query.turn');
  const buckets = Array.from({ length: 12 }, (_, i) => ({
    label: `${11 - i}h`,
    count: 0,
  })).reverse();
  const now = Date.now();
  queryTurns.forEach(t => {
    const hoursAgo = Math.floor((now - t.at) / 3600_000);
    if (hoursAgo >= 0 && hoursAgo < buckets.length) {
      buckets[buckets.length - 1 - hoursAgo].count++;
    }
  });

  const userRows = users
    .map(u => ({ id: u.id, label: u.name, value: u.queryCount || 0 }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
  const projectRows = projects
    .map(p => ({ id: p.id, label: p.name, value: p.queryCount || 0 }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const cited = {};
  queryTurns.forEach(t => {
    (t.output?.cites || []).forEach(id => {
      const file = t.retrieval?.chunks?.find(c => c.snippetId === id)?.file || id;
      cited[file] = (cited[file] || 0) + 1;
    });
  });
  const citedFiles = Object.entries(cited)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const noContextCount = queryTurns.filter(t => t.output?.noContext).length;
  const totalCites = queryTurns.reduce((n, t) => n + (t.output?.cites?.length || 0), 0);
  const avgLatency = queryTurns.length
    ? Math.round(queryTurns.reduce((n, t) => n + (t.latencyMs || 0), 0) / queryTurns.length)
    : 0;

  return {
    buckets,
    userRows,
    projectRows,
    citedFiles,
    signals: [
      {
        label: 'No-context rate',
        value: queryTurns.length ? `${Math.round((noContextCount / queryTurns.length) * 100)}%` : '0%',
        note: `${noContextCount} answers flagged for verification`,
      },
      {
        label: 'Avg citations',
        value: queryTurns.length ? (totalCites / queryTurns.length).toFixed(1) : '0.0',
        note: 'citations emitted per query turn',
      },
      {
        label: 'Avg latency',
        value: avgLatency ? `${(avgLatency / 1000).toFixed(1)}s` : '—',
        note: 'mocked generation and retrieval time',
      },
    ],
    anomalies: [
      'Spike in patent-risk questions from Atlas diligence',
      'Runbooks produced one no-context answer in the last window',
      'SNMPv3 hardening is the most repeated operational topic',
    ],
  };
}

function formatAuditTime(at) {
  const d = new Date(at);
  const now = Date.now();
  const diff = now - at;
  if (diff < 60_000) return 'just now';
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86400_000) return `${Math.floor(diff / 3600_000)}h ago`;
  if (diff < 7 * 86400_000) return `${Math.floor(diff / 86400_000)}d ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatAuditTimestamp(at) {
  return new Date(at).toLocaleString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

function resolveActor(actorId, users) {
  if (!actorId) return { id: null, name: 'Unknown', initials: '??', email: '—' };
  return users.find(u => u.id === actorId) || { id: actorId, name: actorId, initials: actorId.slice(0, 2).toUpperCase(), email: '—' };
}

function deriveAuditIndexes(projects, standaloneChats, snippets) {
  const turns = expandDemoAuditTurns(projects, deriveQueryTurns(projects, standaloneChats, snippets), snippets);
  const users = deriveAdminUsers(projects, turns);
  const adminProjects = deriveAdminProjects(projects, turns);
  const summary = deriveAuditSummary(projects, turns, users);
  const insights = deriveAdminInsights(turns, users, adminProjects);
  return { turns, users, adminProjects, summary, insights };
}

Object.assign(window, {
  deriveQueryTurns,
  deriveAdminUsers,
  deriveAdminProjects,
  deriveAuditSummary,
  deriveAdminInsights,
  deriveAuditIndexes,
  formatAuditTime,
  formatAuditTimestamp,
  resolveActor,
});
