// App root — state, mutations, Claude integration, key bindings.

const STORAGE_KEY = 'wecc-rag-prototype-v1';

// Map snippet -> keyword triggers for grounded retrieval simulation
const SNIPPET_KEYWORDS = {
  'if-mib-hcin': ['ifhcin', 'hcinoctets', 'oid', 'counter64', 'if-mib', 'ifmib', 'octets', 'interface counter', 'inbound'],
  'if-mib-hcout': ['ifhcout', 'hcoutoctets', 'outbound', 'transmit', 'out octet'],
  'cisco-cli-hc': ['high-speed', 'wrap', 'gbps', '20g', '40g', 'hc counter', 'rollover', 'high capacity'],
  'snmpv3-notes': ['snmpv3', 'snmp v3', 'authpriv', 'auth priv', 'snmpget', 'snmp v3'],
  'nexus-snmp-cfg': ['nexus', 'n9k', 'snmp-server', '9000'],
  'runbook-alarm': ['alarm', 'escalation', 'severity', 'sev', 'noc', 'page', 'playbook'],
  'cip007-r2': ['cip-007', 'cip 7', 'cip007', 'patching', 'r2', 'r2.1'],
};

function selectSnippetsForQuery(project, q) {
  const ql = q.toLowerCase();
  const hits = [];
  Object.entries(SNIPPET_KEYWORDS).forEach(([id, kws]) => {
    if (SNIPPETS[id].project !== project.id) return;
    const score = kws.reduce((s, kw) => s + (ql.includes(kw) ? 1 : 0), 0);
    if (score > 0) hits.push({ id, score });
  });
  hits.sort((a, b) => b.score - a.score);
  return hits.slice(0, 2).map(h => h.id);
}

function buildPrompt(project, query, snippetIds) {
  const snipBlock = snippetIds.length === 0
    ? '(No snippets retrieved — answer briefly and warn the reader that you are not grounded in this project.)'
    : snippetIds.map((id, i) => {
        const s = SNIPPETS[id];
        return `[${i+1}] ${s.file} — ${s.loc}\n${s.text}`;
      }).join('\n\n');

  return [
    `You are a RAG assistant for the WECC ops team, scoped to project: "${project.name}".`,
    `Project instructions: ${project.instructions || '(none)'}`,
    ``,
    `Retrieved snippets:`,
    snipBlock,
    ``,
    `Answer the user's question. Be terse and technical. Use Markdown.`,
    snippetIds.length > 0
      ? `When a sentence is supported by a snippet, append a citation marker in the form [N] where N is the snippet number. Use multiple markers when more than one snippet applies. Place the marker right after the supported phrase or sentence.`
      : `Open the response by stating that no relevant project snippets were found, then answer from general knowledge.`,
    ``,
    `User question: ${query}`,
  ].join('\n');
}

function App() {
  // Persisted UI state
  const persisted = (() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch (e) { return {}; }
  })();

  const [projects, setProjects] = useState(PROJECTS_INIT);
  const [currentProjectId, setCurrentProjectId] = useState(persisted.currentProjectId || 'cisco');
  const [currentSessionId, setCurrentSessionId] = useState(persisted.currentSessionId || 'sess-1');
  const [openProjects, setOpenProjects] = useState(persisted.openProjects || { cisco: true });
  const [historyFilter, setHistoryFilter] = useState(persisted.historyFilter || 'all');
  const [projectQuery, setProjectQuery] = useState('');
  const [acc, setAccState] = useState(persisted.acc || { instructions: false, users: false, files: false });
  const [sidebarMode, setSidebarModeState] = useState(persisted.sidebarMode || 'projects');
  const [standaloneChats, setStandaloneChats] = useState(
    persisted.standaloneChats || STANDALONE_CHATS_INIT
  );
  const [currentStandaloneChatId, setCurrentStandaloneChatId] = useState(
    persisted.currentStandaloneChatId || STANDALONE_CHATS_INIT[0]?.id || null
  );
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteProjectId, setInviteProjectId] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadProjectId, setUploadProjectId] = useState(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);
  const [citePopover, setCitePopover] = useState(null); // { id, anchor }
  const [isStreaming, setIsStreaming] = useState(false);
  const hideTimer = useRef(null);

  const currentUser = projects[0]?.users.find(u => u.you) || { id: 'rs', initials: 'RS', name: 'Ryan Sandoval', role: 'admin', color: 'user-1' };

  // Persist on changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        currentProjectId, currentSessionId, openProjects, historyFilter, acc,
        sidebarMode, standaloneChats, currentStandaloneChatId,
      }));
    } catch (e) {}
  }, [currentProjectId, currentSessionId, openProjects, historyFilter, acc, sidebarMode, standaloneChats, currentStandaloneChatId]);

  // Toast
  const toast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2000);
  };

  // ─── Mutations ─────────────────────────────────
  const updateProject = (pid, fn) => {
    setProjects(prev => prev.map(p => p.id === pid ? fn({ ...p }) : p));
  };

  const setCurrentProject = (pid) => {
    setCurrentProjectId(pid);
    setOpenProjects(prev => ({ ...prev, [pid]: true }));
    const p = projects.find(x => x.id === pid);
    if (p && p.sessions[0]) setCurrentSessionId(p.sessions[0].id);
    else setCurrentSessionId(null);
  };

  const setCurrentSession = (sid) => setCurrentSessionId(sid);

  const toggleProject = (pid) => {
    setOpenProjects(prev => ({ ...prev, [pid]: !prev[pid] }));
  };

  const setAcc = (key) => setAccState(prev => ({ ...prev, [key]: !prev[key] }));
  const toggleAcc = (key) => setAccState(prev => ({ ...prev, [key]: !prev[key] }));

  const addSession = (pid) => {
    const id = 'sess-' + Math.random().toString(36).slice(2, 8);
    const newSess = {
      id, title: 'New chat', author: currentUser.id, when: 'now', whenDate: Date.now(),
      visibility: 'public', messages: [],
    };
    updateProject(pid, p => ({ ...p, sessions: [newSess, ...p.sessions] }));
    setCurrentProjectId(pid);
    setCurrentSessionId(id);
    setOpenProjects(prev => ({ ...prev, [pid]: true }));
    return newSess;
  };

  const renameSession = (pid, sid, title) => {
    updateProject(pid, p => ({
      ...p,
      sessions: p.sessions.map(s => s.id === sid ? { ...s, title } : s)
    }));
  };

  const deleteSession = (pid, sid) => {
    updateProject(pid, p => ({ ...p, sessions: p.sessions.filter(s => s.id !== sid) }));
    if (currentSessionId === sid) {
      const p = projects.find(x => x.id === pid);
      const next = p?.sessions.find(s => s.id !== sid);
      setCurrentSessionId(next?.id || null);
    }
  };

  const setInstructions = (pid, val) => updateProject(pid, p => ({ ...p, instructions: val }));

  const addUser = (pid, email, role = 'admin') => {
    const initials = email.slice(0,2).toUpperCase();
    const name = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    const newUser = { id: 'u-' + Math.random().toString(36).slice(2,6), initials, name, email, role, color: 'user-4' };
    updateProject(pid, p => ({ ...p, users: [...p.users, newUser] }));
    toast(`Invited ${email}`);
  };

  const openInviteModal = (pid) => { setInviteProjectId(pid); setInviteModalOpen(true); };
  const closeInviteModal = () => { setInviteModalOpen(false); setInviteProjectId(null); };
  const openUploadModal = (pid) => { setUploadProjectId(pid); setUploadModalOpen(true); };
  const closeUploadModal = () => { setUploadModalOpen(false); setUploadProjectId(null); };

  const setSidebarMode = (mode) => {
    setSidebarModeState(mode);
    if (mode === 'chat' && !currentStandaloneChatId && standaloneChats[0]) {
      setCurrentStandaloneChatId(standaloneChats[0].id);
    }
  };

  const setCurrentStandaloneChat = (id) => {
    setCurrentStandaloneChatId(id);
    setSidebarModeState('chat');
  };

  const addStandaloneChat = () => {
    const id = 'g-' + Math.random().toString(36).slice(2, 8);
    const chat = { id, title: 'New chat', when: 'now', whenDate: Date.now(), visibility: 'public', messages: [] };
    setStandaloneChats(prev => [chat, ...prev]);
    setCurrentStandaloneChatId(id);
    setSidebarModeState('chat');
    return chat;
  };

  const renameStandaloneChat = (id, title) => {
    setStandaloneChats(prev => prev.map(c => c.id === id ? { ...c, title } : c));
  };

  const setSessionVisibility = (pid, sid, vis) => {
    updateProject(pid, p => ({
      ...p,
      sessions: p.sessions.map(s => s.id === sid ? { ...s, visibility: vis } : s),
    }));
    if (vis === 'private') toast('Chat is now private');
  };

  const setStandaloneVisibility = (id, vis) => {
    setStandaloneChats(prev => prev.map(c => c.id === id ? { ...c, visibility: vis } : c));
    if (vis === 'private') toast('Chat is now private');
  };

  const sendStandaloneMessage = async (chatId, text) => {
    if (isStreaming) return;
    const userMsg = { role: 'user', text, author: currentUser.id };
    const placeholder = { role: 'assistant', streaming: true, text: '' };

    setStandaloneChats(prev => prev.map(c => {
      if (c.id !== chatId) return c;
      const messages = [...c.messages, userMsg, placeholder];
      const title = c.title === 'New chat' && c.messages.length === 0
        ? text.slice(0, 50) + (text.length > 50 ? '…' : '')
        : c.title;
      return { ...c, messages, title, when: 'now' };
    }));

    setIsStreaming(true);
    const canned = `**General chat** (no project files): ${text}\n\nThis is a prototype reply without retrieval or citations. Switch to a **project** in the sidebar for grounded answers with inline sources.`;
    const tokens = canned.split(/(\s+)/);
    let acc = '';
    for (let i = 0; i < tokens.length; i++) {
      acc += tokens[i];
      if (i % 3 === 0 || i === tokens.length - 1) {
        setStandaloneChats(prev => prev.map(c => {
          if (c.id !== chatId) return c;
          const ms = [...c.messages];
          ms[ms.length - 1] = { ...ms[ms.length - 1], text: acc };
          return { ...c, messages: ms };
        }));
        await new Promise(r => setTimeout(r, 12));
      }
    }
    setStandaloneChats(prev => prev.map(c => {
      if (c.id !== chatId) return c;
      const ms = [...c.messages];
      ms[ms.length - 1] = { role: 'assistant', html: textToHtml(acc), text: acc };
      return { ...c, messages: ms };
    }));
    setIsStreaming(false);
  };

  const removeUser = (pid, uid) => {
    updateProject(pid, p => ({ ...p, users: p.users.filter(u => u.id !== uid) }));
    toast(`User removed`);
  };

  const changeRole = (pid, uid, role) => {
    updateProject(pid, p => ({
      ...p,
      users: p.users.map(u => u.id === uid ? { ...u, role } : u)
    }));
    toast(`Role updated to ${role}`);
  };

  const simulateUpload = (pid) => {
    const samples = [
      'vendor-rmail-process.md',
      'maintenance-window-2026-Q2.docx',
      'switch-port-template.txt',
      'fiber-cabling-survey.pdf',
      'change-mgmt-form.pdf',
    ];
    const name = samples[Math.floor(Math.random() * samples.length)];
    const newFile = { name: 'upload-' + Date.now() + '-' + name, size: (Math.random()*5+0.1).toFixed(1)+' MB', status: 'proc', added: 'today' };
    updateProject(pid, p => ({ ...p, files: [newFile, ...p.files] }));
    toast(`Indexing ${name}…`);
    // Flip to 'ok' after delay
    setTimeout(() => {
      updateProject(pid, p => ({
        ...p,
        files: p.files.map(f => f === newFile || f.name === newFile.name ? { ...f, status: 'ok' } : f)
      }));
    }, 2400);
  };

  const retryFile = (pid, fname) => {
    updateProject(pid, p => ({
      ...p,
      files: p.files.map(f => f.name === fname ? { ...f, status: 'proc' } : f)
    }));
    toast(`Retrying ${fname}…`);
    setTimeout(() => {
      updateProject(pid, p => ({
        ...p,
        files: p.files.map(f => f.name === fname ? { ...f, status: 'ok' } : f)
      }));
    }, 1800);
  };

  // ── Send message → simulated streaming
  const sendMessage = async (pid, sid, text) => {
    if (isStreaming) return;
    const project = projects.find(p => p.id === pid);
    if (!project) return;

    // Append user message and a streaming assistant placeholder
    const userMsg = { role: 'user', text, author: currentUser.id };
    const snipIds = selectSnippetsForQuery(project, text);
    const placeholder = {
      role: 'assistant',
      streaming: true,
      retrieving: snipIds.length > 0
        ? `Retrieving from ${snipIds.length} source${snipIds.length===1?'':'s'} in ${project.files.length} files…`
        : `Searching project for relevant snippets…`,
      text: '',
      cites: snipIds,
      noContext: snipIds.length === 0,
    };

    // Title from first user msg if still "New chat"
    updateProject(pid, p => ({
      ...p,
      sessions: p.sessions.map(s => {
        if (s.id !== sid) return s;
        const messages = [...s.messages, userMsg, placeholder];
        const title = s.title === 'New chat' && s.messages.length === 0
          ? text.slice(0, 50) + (text.length > 50 ? '…' : '')
          : s.title;
        return { ...s, messages, title, when: 'now' };
      })
    }));

    setIsStreaming(true);

    const updateLastAssistant = (patch) => {
      updateProject(pid, p => ({
        ...p,
        sessions: p.sessions.map(s => {
          if (s.id !== sid) return s;
          const ms = [...s.messages];
          const idx = ms.length - 1;
          ms[idx] = { ...ms[idx], ...patch };
          return { ...s, messages: ms };
        })
      }));
    };

    try {
      // Simulate retrieval delay so the spinner is visible
      await new Promise(r => setTimeout(r, snipIds.length > 0 ? 700 : 400));
      updateLastAssistant({ retrieving: null });

      const prompt = buildPrompt(project, text, snipIds);

      let full;
      try {
        full = await window.claude.complete(prompt);
      } catch (e) {
        // Fallback canned answer
        full = snipIds.length > 0
          ? `Based on the retrieved snippets, the answer is documented in **${SNIPPETS[snipIds[0]].file}**${snipIds.length > 0 ? '[1]' : ''}. ${snipIds[1] ? `Also see ${SNIPPETS[snipIds[1]].file}[2].` : ''}\n\n(Note: live LLM was unreachable, this is a placeholder.)`
          : `No project snippets matched this query. From general knowledge: please refer to the relevant vendor documentation or RFC. (Live LLM was unreachable.)`;
      }

      // Stream word-by-word
      const tokens = full.split(/(\s+)/); // keep whitespace
      let acc = '';
      for (let i = 0; i < tokens.length; i++) {
        acc += tokens[i];
        // Update every few tokens for smoother streaming
        if (i % 2 === 0 || i === tokens.length - 1) {
          updateLastAssistant({ text: acc });
          await new Promise(r => setTimeout(r, 14 + Math.random() * 18));
        }
      }

      // Done streaming — finalize. Build html from text so we can render citations.
      const html = textToHtml(acc);
      const noContext = snipIds.length === 0;
      updateLastAssistant({
        streaming: false,
        text: acc,
        html,
        cites: snipIds,
        noContext,
      });
    } catch (err) {
      updateLastAssistant({ streaming: false, error: 'Inference failed: ' + (err?.message || 'unknown error') });
    } finally {
      setIsStreaming(false);
    }
  };

  const retryLast = () => toast('Retry — not wired in prototype');
  const regenerate = () => toast('Regenerate — not wired in prototype');

  // ─── Palette / modal ─────────────────────────────
  const openPalette = () => setPaletteOpen(true);
  const closePalette = () => setPaletteOpen(false);
  const openNewProject = () => setNewProjectOpen(true);
  const closeNewProject = () => setNewProjectOpen(false);

  const createProject = (name, desc) => {
    const id = 'proj-' + Math.random().toString(36).slice(2,8);
    const newProj = {
      id, name, desc, instructions: '',
      users: [{ ...currentUser }],
      files: [], sessions: []
    };
    setProjects(prev => [...prev, newProj]);
    setCurrentProjectId(id);
    setCurrentSessionId(null);
    setOpenProjects(prev => ({ ...prev, [id]: true }));
    toast(`Project "${name}" created`);
  };

  // ─── Citation popover ───────────────────────────
  const showCite = (id, anchor) => {
    clearTimeout(hideTimer.current);
    setCitePopover({ id, anchor });
  };
  const hideCiteSoon = () => {
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setCitePopover(null), 140);
  };
  const cancelHideCite = () => clearTimeout(hideTimer.current);

  // ─── Global key bindings ────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      const isMod = e.metaKey || e.ctrlKey;
      if (isMod && e.key.toLowerCase() === 'k') { e.preventDefault(); setPaletteOpen(o => !o); }
      else if (isMod && e.key.toLowerCase() === 'n' && !e.shiftKey) { e.preventDefault(); setNewProjectOpen(true); }
      else if (isMod && e.key.toLowerCase() === 'n' && e.shiftKey) {
        e.preventDefault();
        if (currentProjectId) addSession(currentProjectId);
      }
      else if (isMod && e.key.toLowerCase() === 'u') {
        e.preventDefault();
        if (currentProjectId) openUploadModal(currentProjectId);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [currentProjectId, projects]);

  const project = projects.find(p => p.id === currentProjectId);
  const session = project?.sessions.find(s => s.id === currentSessionId);
  const standalone = standaloneChats.find(c => c.id === currentStandaloneChatId);
  const inChatMode = sidebarMode === 'chat';
  const activeSession = inChatMode ? standalone : session;
  const isEmptySession = activeSession && activeSession.messages.length === 0;

  const store = {
    projects, currentProjectId, currentSessionId, currentUser,
    openProjects, historyFilter, setHistoryFilter,
    projectQuery, setProjectQuery,
    setCurrentProject, setCurrentSession, toggleProject,
    acc, setAcc, toggleAcc,
    sidebarMode, setSidebarMode,
    standaloneChats, currentStandaloneChatId,
    setCurrentStandaloneChat, addStandaloneChat,
    renameStandaloneChat, setSessionVisibility, setStandaloneVisibility,
    sendStandaloneMessage,
    inviteModalOpen, inviteProjectId, openInviteModal, closeInviteModal,
    uploadModalOpen, uploadProjectId, openUploadModal, closeUploadModal,
    addSession, renameSession, deleteSession,
    setInstructions, addUser, removeUser, changeRole,
    simulateUpload, retryFile,
    sendMessage, isStreaming, retryLast, regenerate,
    paletteOpen, openPalette, closePalette,
    newProjectOpen, openNewProject, closeNewProject, createProject,
    citePopover, showCite, hideCiteSoon, cancelHideCite,
    toast,
  };

  return (
    <div className={`app ${inChatMode || !project ? 'no-right' : ''}`}>
      <div className="topbar">
        <span className="logo">WECC</span>
        <div className="crumbs">
          {inChatMode ? (
            <span className="project">{standalone?.title || 'General chat'}</span>
          ) : (
            <>
              <span className="project">{project?.name || 'No project'}</span>
              {session && <>
                <span className="sep">/</span>
                <span className="session">{session.title}</span>
              </>}
            </>
          )}
        </div>
        <span className="sep-flex"/>
      </div>

      <Sidebar store={store}/>

      <div className={`chat${isEmptySession ? ' chat-empty-session' : ''}`}>
        <ChatHead store={store}/>
        <Thread store={store}/>
        <Composer store={store}/>
      </div>

      {!inChatMode && project && <RightPanel store={store}/>}

      <Palette store={store}/>
      <NewProjectModal store={store}/>
      <InviteModal store={store}/>
      <UploadModal store={store}/>
      <CitePopover store={store}/>
      {toastMsg && <div className="toast">{toastMsg}</div>}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App/>);
