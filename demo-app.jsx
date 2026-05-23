// demo-app.jsx
// Linear clickable demo for WECC RAG. Re-renders the existing Sidebar /
// ChatHead / Thread / Composer / RightPanel / Palette / NewProjectModal /
// CitePopover, plus three new views (SourceDrawer / FileLibrary /
// MobileInset). State is driven by a step script — Prev/Next buttons or
// arrow keys advance.

const STORAGE_KEY_DEMO = 'wecc-rag-demo-v1';

// ─── Step script ──────────────────────────────────────────────
// Each step has: id, label (shown in controls), apply(set) which mutates
// the demo store to reach this step's state, and optional onEnter(c)
// which runs once (used for animation triggers).
const buildSteps = ({ projects, currentUser }) => ([

  // 0 — Intro cover
  { id: 'intro', label: 'Intro', cover: 'intro' },

  // 1 — Cold start: empty account
  { id: 'cold', label: 'Cold start',
    apply: (set) => set({
      projects: [], currentProjectId: null, currentSessionId: null,
      openProjects: {}, newProjectOpen: false, paletteOpen: false,
      sourceDrawer: null, libraryOpen: false, mobileOpen: false,
      acc: { instructions: false, users: false, files: false },
    }),
  },

  // 2 — New project modal (pre-filled, ready to create)
  { id: 'create-modal', label: 'New project',
    apply: (set) => set({
      projects: [], currentProjectId: null, currentSessionId: null,
      newProjectOpen: true,
      npPrefill: {
        name: 'Cisco MIB Reference',
        desc: 'Network device docs + vendor MIB definitions for the ops team.',
        instructions:
`You are an SNMP / network ops assistant for the WECC ops team.

Cite MIB names and exact OIDs when relevant. Prefer terse,
technical answers in Markdown.`,
      },
      sourceDrawer: null, libraryOpen: false, mobileOpen: false,
    }),
  },

  // 3 — Indexing: project created, files mid-upload
  { id: 'indexing', label: 'Indexing files',
    apply: (set, { projects: allProj }) => set({
      projects: [ withIndexingFiles(allProj[0]) ],
      currentProjectId: 'cisco', currentSessionId: null,
      openProjects: { cisco: true },
      newProjectOpen: false, paletteOpen: false,
      acc: { instructions: false, users: false, files: true },
      sourceDrawer: null, libraryOpen: false, mobileOpen: false,
    }),
  },

  // 4 — Indexed + panels populated, ready to ask
  { id: 'ready', label: 'Ready to ask',
    apply: (set, { projects: allProj }) => set({
      projects: [ withFreshSession(allProj[0], 'fresh') ],
      currentProjectId: 'cisco', currentSessionId: 'fresh',
      openProjects: { cisco: true },
      newProjectOpen: false, paletteOpen: false,
      acc: { instructions: true, users: true, files: true },
      sourceDrawer: null, libraryOpen: false, mobileOpen: false,
    }),
  },

  // 5 — Streaming answer (HERO sub-step)
  { id: 'answer', label: 'Streaming answer',
    apply: (set, { projects: allProj }) => set({
      projects: [ withFinishedAnswer(allProj[0], 'fresh') ],
      currentProjectId: 'cisco', currentSessionId: 'fresh',
      openProjects: { cisco: true },
      newProjectOpen: false, paletteOpen: false,
      acc: { instructions: false, users: false, files: false },
      sourceDrawer: null, libraryOpen: false, mobileOpen: false,
    }),
  },

  // 6 — HERO: source drawer open showing citation [1]
  { id: 'source', label: 'Source drilldown',
    apply: (set, { projects: allProj }) => set({
      projects: [ withFinishedAnswer(allProj[0], 'fresh') ],
      currentProjectId: 'cisco', currentSessionId: 'fresh',
      openProjects: { cisco: true },
      newProjectOpen: false, paletteOpen: false,
      acc: { instructions: false, users: false, files: false },
      sourceDrawer: 'if-mib-hcin',
      libraryOpen: false, mobileOpen: false,
    }),
  },

  // 7 — ⌘K palette open
  { id: 'palette', label: '⌘K switcher',
    apply: (set, { projects: allProj }) => set({
      projects: [ withFinishedAnswer(allProj[0], 'fresh'), allProj[3] /* atlas */ ],
      currentProjectId: 'cisco', currentSessionId: 'fresh',
      openProjects: { cisco: true },
      paletteOpen: true,
      paletteQuery: 'atlas',
      sourceDrawer: null, libraryOpen: false, mobileOpen: false,
    }),
  },

  // 8 — Atlas project loaded — second domain
  { id: 'atlas', label: 'Cross-domain',
    apply: (set, { projects: allProj }) => set({
      projects: [ withFinishedAnswer(allProj[0], 'fresh'), allProj[3] ],
      currentProjectId: 'atlas', currentSessionId: 's-atlas-1',
      openProjects: { cisco: false, atlas: true },
      paletteOpen: false,
      acc: { instructions: false, users: true, files: true },
      sourceDrawer: null, libraryOpen: false, mobileOpen: false,
      appView: 'chat',
    }),
  },

  // 9 — Admin audit: review cross-domain AI usage
  { id: 'admin', label: 'Admin audit',
    apply: (set, { projects: allProj }) => set({
      projects: [ withFinishedAnswer(allProj[0], 'fresh'), allProj[3] ],
      currentProjectId: 'atlas', currentSessionId: 's-atlas-1',
      openProjects: { atlas: true },
      paletteOpen: false,
      libraryOpen: false, mobileOpen: false, sourceDrawer: null,
      appView: 'admin',
      adminUnlocked: true,
      adminAuthOpen: false,
      adminAuthError: null,
      adminTab: 'audit',
      adminSelection: { type: 'turn', id: 'atlas:s-atlas-1:0' },
      adminFilters: { userId: 'mb', projectId: 'atlas', query: '', eventType: 'all' },
    }),
  },

  // 10 — File library at scale
  { id: 'library', label: 'Files at scale',
    apply: (set, { projects: allProj }) => set({
      projects: [ withFinishedAnswer(allProj[0], 'fresh'), allProj[3] ],
      currentProjectId: 'atlas', currentSessionId: 's-atlas-1',
      openProjects: { atlas: true },
      paletteOpen: false,
      libraryOpen: true,
      sourceDrawer: null, mobileOpen: false,
      appView: 'chat',
    }),
  },

  // 11 — Mobile inset
  { id: 'mobile', label: 'Mobile view',
    apply: (set, { projects: allProj }) => set({
      projects: [ withFinishedAnswer(allProj[0], 'fresh'), allProj[3] ],
      currentProjectId: 'atlas', currentSessionId: 's-atlas-1',
      openProjects: { atlas: true },
      paletteOpen: false,
      libraryOpen: false,
      sourceDrawer: null,
      mobileOpen: true,
      appView: 'chat',
    }),
  },

  // 12 — Final cover
  { id: 'end', label: 'Wrap', cover: 'end' },
]);

// ─── Helpers to reshape data per step ─────────────────────────
function withIndexingFiles(proj) {
  return {
    ...proj,
    files: proj.files.map((f, i) => i < 4 ? f : { ...f, status: i < 7 ? 'proc' : 'proc' }),
  };
}
function withFreshSession(proj, sessId) {
  const fresh = {
    id: sessId, title: 'New chat', author: 'rs',
    when: 'now', whenDate: Date.now(), visibility: 'public', messages: [],
  };
  return { ...proj, sessions: [fresh, ...proj.sessions] };
}
function withFinishedAnswer(proj, sessId) {
  const fresh = {
    id: sessId,
    title: "ifHCInOctets OID + difference from ifInOctets",
    author: 'rs', when: 'now', whenDate: Date.now(),
    messages: [
      { role: 'user', author: 'rs',
        text: "What OID returns the cumulative inbound octet count on an interface, and how is it different from ifInOctets?" },
      {
        role: 'assistant',
        html:
`<p><code>ifHCInOctets</code> is defined in <b>IF-MIB</b> at OID <code>1.3.6.1.2.1.31.1.1.1.6</code>{{C:if-mib-hcin}}. It returns the cumulative inbound octet count on an interface as a <code>Counter64</code>.</p>

<p>The difference from <code>ifInOctets</code>:</p>
<ul>
<li><code>ifInOctets</code> is the original 32-bit counter — it wraps in seconds on multi-Gbps links.</li>
<li><code>ifHCInOctets</code> is the 64-bit "high-capacity" replacement; on Cisco devices it's exposed automatically for any interface ≥ 1 Gbps{{C:cisco-cli-hc}}.</li>
</ul>

<p>For polling at the WECC edge, use the HC variant or you'll lose data between samples.</p>`,
        cites: ['if-mib-hcin', 'cisco-cli-hc']
      }
    ]
  };
  return { ...proj, sessions: [fresh, ...proj.sessions] };
}

// ─── App ──────────────────────────────────────────────────────
function DemoApp() {
  // Master demo state
  const [step, setStep] = useState(0);
  const [s, setS] = useState({
    projects: DEMO_PROJECTS,
    currentProjectId: null,
    currentSessionId: null,
    openProjects: {},
    historyFilter: 'all',
    projectQuery: '',
    acc: { instructions: false, users: false, files: false },
    paletteOpen: false,
    paletteQuery: '',
    newProjectOpen: false,
    npPrefill: null,
    citePopover: null,
    isStreaming: false,
    sourceDrawer: null,
    libraryOpen: false,
    mobileOpen: false,
    sidebarMode: 'projects',
    standaloneChats: typeof STANDALONE_CHATS_INIT !== 'undefined' ? STANDALONE_CHATS_INIT : [],
    currentStandaloneChatId: null,
    inviteModalOpen: false,
    inviteProjectId: null,
    uploadModalOpen: false,
    uploadProjectId: null,
    appView: 'chat',
    adminUnlocked: typeof readAdminUnlocked === 'function' ? readAdminUnlocked() : false,
    adminAuthOpen: false,
    adminAuthError: null,
    adminTab: 'audit',
    adminSelection: null,
    adminFilters: { userId: null, projectId: null, query: '', eventType: 'all' },
  });
  const set = (patch) => setS(prev => ({ ...prev, ...patch }));

  const currentUser = DEMO_PROJECTS[0].users.find(u => u.you);

  const steps = useMemo(() => buildSteps({ projects: DEMO_PROJECTS, currentUser }), []);

  // Apply step changes
  useEffect(() => {
    const st = steps[step];
    if (!st) return;
    if (st.apply) st.apply(set, { projects: DEMO_PROJECTS });
  }, [step]);

  // Persist step
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY_DEMO, JSON.stringify({ step })); } catch (e) {}
  }, [step]);
  useEffect(() => {
    try {
      const v = JSON.parse(localStorage.getItem(STORAGE_KEY_DEMO) || '{}');
      if (typeof v.step === 'number' && v.step >= 0 && v.step < steps.length) {
        setStep(v.step);
      }
    } catch (e) {}
  }, []);

  // Keyboard nav
  useEffect(() => {
    const onKey = (e) => {
      // Don't hijack typing in inputs
      const tag = (document.activeElement?.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      if (e.key === 'ArrowRight') {
        if (step < steps.length - 1) setStep(step + 1);
      } else if (e.key === 'ArrowLeft') {
        if (step > 0) setStep(step - 1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [step, steps.length]);

  // ─── Store passed to existing components ────────────────────
  const store = {
    projects: s.projects,
    currentProjectId: s.currentProjectId,
    currentSessionId: s.currentSessionId,
    currentUser,
    openProjects: s.openProjects,
    historyFilter: s.historyFilter,
    setHistoryFilter: (v) => set({ historyFilter: v }),
    projectQuery: s.projectQuery,
    setProjectQuery: (v) => set({ projectQuery: v }),
    setCurrentProject: (pid) => set({ currentProjectId: pid, openProjects: { ...s.openProjects, [pid]: true } }),
    setCurrentSession: (sid) => set({ currentSessionId: sid }),
    toggleProject: (pid) => set({ openProjects: { ...s.openProjects, [pid]: !s.openProjects[pid] } }),
    acc: s.acc,
    setAcc: (k) => set({ acc: { ...s.acc, [k]: !s.acc[k] } }),
    toggleAcc: (k) => set({ acc: { ...s.acc, [k]: !s.acc[k] } }),
    addSession: (pid) => {
      const id = 'sess-' + Math.random().toString(36).slice(2,8);
      const newSess = { id, title: 'New chat', author: 'rs', when: 'now', visibility: 'public', messages: [] };
      const projects = s.projects.map(p => p.id === pid ? { ...p, sessions: [newSess, ...p.sessions] } : p);
      set({ projects, currentProjectId: pid, currentSessionId: id });
      return newSess;
    },
    renameSession: () => {}, deleteSession: () => {},
    setInstructions: (pid, val) => {
      const projects = s.projects.map(p => p.id === pid ? { ...p, instructions: val } : p);
      set({ projects });
    },
    addUser: (pid, email, role = 'admin') => {
      const projects = s.projects.map(p => {
        if (p.id !== pid) return p;
        const initials = email.slice(0,2).toUpperCase();
        return { ...p, users: [...p.users, { id: 'u-'+Math.random().toString(36).slice(2,6), initials, name: email.split('@')[0], email, role, color: 'user-4' }] };
      });
      set({ projects });
      toast(`Invited ${email}`);
    },
    removeUser: (pid, uid) => {
      const projects = s.projects.map(p => p.id !== pid ? p : ({ ...p, users: p.users.filter(u => u.id !== uid) }));
      set({ projects });
      toast('User removed');
    },
    changeRole: () => {},
    inviteModalOpen: s.inviteModalOpen,
    inviteProjectId: s.inviteProjectId,
    openInviteModal: (pid) => set({ inviteModalOpen: true, inviteProjectId: pid }),
    closeInviteModal: () => set({ inviteModalOpen: false, inviteProjectId: null }),
    uploadModalOpen: s.uploadModalOpen,
    uploadProjectId: s.uploadProjectId,
    openUploadModal: (pid) => set({ uploadModalOpen: true, uploadProjectId: pid }),
    closeUploadModal: () => set({ uploadModalOpen: false, uploadProjectId: null }),
    sidebarMode: s.sidebarMode,
    setSidebarMode: (mode) => {
      const patch = { sidebarMode: mode };
      if (mode === 'chat' && !s.currentStandaloneChatId && s.standaloneChats[0]) {
        patch.currentStandaloneChatId = s.standaloneChats[0].id;
      }
      set(patch);
    },
    standaloneChats: s.standaloneChats,
    currentStandaloneChatId: s.currentStandaloneChatId,
    setCurrentStandaloneChat: (id) => set({ currentStandaloneChatId: id, sidebarMode: 'chat' }),
    addStandaloneChat: () => {
      const id = 'g-' + Math.random().toString(36).slice(2, 8);
      const chat = { id, title: 'New chat', when: 'now', whenDate: Date.now(), visibility: 'public', messages: [] };
      set({ standaloneChats: [chat, ...s.standaloneChats], currentStandaloneChatId: id, sidebarMode: 'chat' });
      return chat;
    },
    renameStandaloneChat: (id, title) => {
      set({ standaloneChats: s.standaloneChats.map(c => c.id === id ? { ...c, title } : c) });
    },
    setSessionVisibility: (pid, sid, vis) => {
      const projects = s.projects.map(p => p.id !== pid ? p : ({
        ...p,
        sessions: p.sessions.map(sess => sess.id === sid ? { ...sess, visibility: vis } : sess),
      }));
      set({ projects });
      if (vis === 'private') toast('Chat is now private');
    },
    setStandaloneVisibility: (id, vis) => {
      set({ standaloneChats: s.standaloneChats.map(c => c.id === id ? { ...c, visibility: vis } : c) });
      if (vis === 'private') toast('Chat is now private');
    },
    sendStandaloneMessage: (chatId, text) => {
      const userMsg = { role: 'user', text };
      const reply = {
        role: 'assistant',
        html: `<p>General chat prototype reply — no project retrieval. You asked: <i>${text.replace(/</g,'')}</i></p>`,
      };
      set({
        standaloneChats: s.standaloneChats.map(c => {
          if (c.id !== chatId) return c;
          const title = c.title === 'New chat' && c.messages.length === 0
            ? text.slice(0, 50) + (text.length > 50 ? '…' : '')
            : c.title;
          return { ...c, title, messages: [...c.messages, userMsg, reply], when: 'now' };
        }),
      });
    },
    simulateUpload: (pid) => {
      const samples = ['vendor-rmail-process.md', 'maintenance-window-2026-Q2.docx'];
      const name = samples[Math.floor(Math.random() * samples.length)];
      const newFile = { name: 'upload-' + Date.now() + '-' + name, size: '1.2 MB', status: 'proc', added: 'today' };
      const projects = s.projects.map(p => p.id !== pid ? p : ({ ...p, files: [newFile, ...p.files] }));
      set({ projects });
      toast(`Indexing ${name}…`);
      setTimeout(() => {
        setS(prev => ({
          ...prev,
          projects: prev.projects.map(p => p.id !== pid ? p : ({
            ...p,
            files: p.files.map(f => f.name === newFile.name ? { ...f, status: 'ok' } : f),
          })),
        }));
      }, 2000);
    },
    retryFile: () => {},
    sendMessage: (pid, sid, text) => demoSendMessage(pid, sid, text),
    isStreaming: s.isStreaming,
    retryLast: () => {}, regenerate: () => {},
    paletteOpen: s.paletteOpen,
    openPalette: () => set({ paletteOpen: true }),
    closePalette: () => set({ paletteOpen: false }),
    newProjectOpen: s.newProjectOpen,
    openNewProject: () => set({ newProjectOpen: true }),
    closeNewProject: () => set({ newProjectOpen: false, npPrefill: null }),
    createProject: (name, desc) => {
      // Advance demo to indexing step
      const next = steps.findIndex(x => x.id === 'indexing');
      if (next >= 0) setStep(next);
    },
    citePopover: s.citePopover,
    showCite: (id, anchor) => {
      if (hideCiteTimer.current) clearTimeout(hideCiteTimer.current);
      set({ citePopover: { id, anchor } });
    },
    hideCiteSoon: () => {
      if (hideCiteTimer.current) clearTimeout(hideCiteTimer.current);
      hideCiteTimer.current = setTimeout(() => set({ citePopover: null }), 180);
    },
    cancelHideCite: () => {
      if (hideCiteTimer.current) clearTimeout(hideCiteTimer.current);
    },
    toast,
    appView: s.appView,
    adminUnlocked: s.adminUnlocked,
    adminAuthOpen: s.adminAuthOpen,
    adminAuthError: s.adminAuthError,
    adminTab: s.adminTab,
    adminSelection: s.adminSelection,
    adminFilters: s.adminFilters,
    openAdmin: () => set({
      appView: 'admin',
      adminTab: 'audit',
      adminSelection: null,
      adminFilters: { userId: null, projectId: null, query: '', eventType: 'all' },
    }),
    requestAdmin: () => {
      if (s.adminUnlocked) {
        set({
          appView: 'admin',
          adminTab: 'audit',
          adminSelection: null,
          adminFilters: { userId: null, projectId: null, query: '', eventType: 'all' },
        });
      } else {
        set({ adminAuthOpen: true, adminAuthError: null });
      }
    },
    closeAdminAuth: () => set({ adminAuthOpen: false, adminAuthError: null }),
    submitAdminPasscode: (code) => {
      const pass = typeof ADMIN_DEMO_PASSCODE !== 'undefined' ? ADMIN_DEMO_PASSCODE : 'wecc-admin';
      if (code === pass) {
        if (typeof persistAdminUnlocked === 'function') persistAdminUnlocked(true);
        set({
          adminUnlocked: true,
          adminAuthOpen: false,
          adminAuthError: null,
          appView: 'admin',
          adminTab: 'audit',
          adminSelection: null,
          adminFilters: { userId: null, projectId: null, query: '', eventType: 'all' },
        });
      } else {
        set({ adminAuthError: 'Incorrect demo passcode' });
      }
    },
    exitAdmin: () => set({ appView: 'chat', adminSelection: null }),
    setAdminTab: (tab) => {
      const valid = tab === 'audit' || tab === 'users' || tab === 'projects' ? tab : 'audit';
      set({ adminTab: valid, adminSelection: null });
    },
    setAdminSelection: (sel) => set({ adminSelection: sel }),
    setAdminFilters: (fn) => set({
      adminFilters: typeof fn === 'function' ? fn(s.adminFilters) : fn,
    }),
  };

  // ─── Demo-specific sendMessage with streaming ───────────────
  const streamingRef = useRef(null);
  function demoSendMessage(pid, sid, text) {
    const project = s.projects.find(p => p.id === pid);
    if (!project) return;
    // Inject user + streaming placeholder, then animate streaming to completion.
    const cites = ['if-mib-hcin', 'cisco-cli-hc'];
    const full =
`ifHCInOctets is defined in IF-MIB at OID 1.3.6.1.2.1.31.1.1.1.6[1]. It returns the cumulative inbound octet count on an interface as a Counter64.

The difference from ifInOctets:
- ifInOctets is the original 32-bit counter — it wraps in seconds on multi-Gbps links.
- ifHCInOctets is the 64-bit "high-capacity" replacement; on Cisco devices it's exposed automatically for any interface ≥ 1 Gbps[2].

For polling at the WECC edge, use the HC variant or you'll lose data between samples.`;

    const userMsg = { role: 'user', author: 'rs', text };
    const placeholder = {
      role: 'assistant', streaming: true,
      retrieving: 'Searching project · scanning 1,248 files…',
      text: '', cites,
    };
    setS(prev => {
      const projects = prev.projects.map(p => p.id !== pid ? p : ({
        ...p,
        sessions: p.sessions.map(sess => sess.id !== sid ? sess : ({
          ...sess,
          title: text.slice(0, 56),
          messages: [...sess.messages, userMsg, placeholder],
        })),
      }));
      return { ...prev, projects, isStreaming: true };
    });

    const updateLast = (patch) => {
      setS(prev => {
        const projects = prev.projects.map(p => p.id !== pid ? p : ({
          ...p,
          sessions: p.sessions.map(sess => {
            if (sess.id !== sid) return sess;
            const ms = [...sess.messages];
            ms[ms.length - 1] = { ...ms[ms.length - 1], ...patch };
            return { ...sess, messages: ms };
          }),
        }));
        return { ...prev, projects };
      });
    };

    setTimeout(() => updateLast({ retrieving: 'Found 4 candidates · ranking by relevance…' }), 600);
    setTimeout(() => updateLast({ retrieving: 'Reading IF-MIB.txt · cisco-ios-cli-ref-15.4.pdf…' }), 1200);
    setTimeout(() => updateLast({ retrieving: null }), 1800);

    // Stream token-by-token
    const tokens = full.split(/(\s+)/);
    let acc = '';
    let i = 0;
    const stream = () => {
      if (i >= tokens.length) {
        // Finalize
        updateLast({
          streaming: false,
          text: acc,
          html: assistantTextToHtmlWithCites(acc, cites),
          cites,
        });
        setS(prev => ({ ...prev, isStreaming: false }));
        return;
      }
      acc += tokens[i];
      if (i % 2 === 0 || i === tokens.length - 1) {
        updateLast({ text: acc });
      }
      i++;
      streamingRef.current = setTimeout(stream, 18 + Math.random() * 22);
    };
    streamingRef.current = setTimeout(stream, 1900);
  }

  // Helper: convert plain text with [1] [2] markers → HTML with {{C:id}} sentinels.
  function assistantTextToHtmlWithCites(text, cites) {
    let s = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    s = s.replace(/\[(\d+)\]/g, (m, n) => {
      const id = cites[parseInt(n,10) - 1];
      return id ? `{{C:${id}}}` : m;
    });
    s = s.replace(/^- (.+)$/gm, '<li>$1</li>');
    s = s.replace(/(<li>[\s\S]*?<\/li>(?:\s*<li>[\s\S]*?<\/li>)*)/, '<ul>$1</ul>');
    const paras = s.split(/\n{2,}/).map(p => p.startsWith('<ul>') ? p : `<p>${p}</p>`);
    return paras.join('');
  }

  // Toast (transient) + citation→drawer intercept
  const [toastMsg, setToastMsg] = useState(null);
  const hideCiteTimer = useRef(null);
  function toast(msg) {
    // Citation clicks bubble through store.toast(`Open <file> at <loc>`).
    // Intercept those and open the source drawer instead.
    const m = /^Open (.+?) at (.+)$/.exec(msg);
    if (m) {
      const [, file, loc] = m;
      const id = Object.keys(SNIPPETS).find(k =>
        SNIPPETS[k].file === file && SNIPPETS[k].loc === loc
      );
      if (id) { set({ sourceDrawer: id }); return; }
    }
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 1800);
  }

  // ─── Render ─────────────────────────────────────────────────
  const stCur = steps[step];
  const isCover = !!stCur.cover;
  const project = s.projects.find(p => p.id === s.currentProjectId);
  const session = project?.sessions.find(x => x.id === s.currentSessionId);
  const standalone = s.standaloneChats.find(c => c.id === s.currentStandaloneChatId);
  const inChatMode = s.sidebarMode === 'chat';
  const inAdminView = s.appView === 'admin';
  const activeSession = inChatMode ? standalone : session;
  const isEmptySession = activeSession && activeSession.messages.length === 0;

  return (
    <>
      {isCover && stCur.cover === 'intro' && (
        <div className="demo-cover">
          <span className="mark">WECC RAG · demo</span>
          <h1>Project-scoped chat for your team's documents — with citations you can trust.</h1>
          <div className="sub">
            A ~5 minute walkthrough: from creating a project to asking a grounded
            question, drilling into source, and switching across domains.
          </div>
          <button className="start" onClick={() => setStep(step + 1)}>
            Start demo<span className="kb">→</span>
          </button>
          <div className="meta">
            <span>← → arrow keys to navigate</span>
            <span>·</span>
            <span>any UI element is clickable</span>
          </div>
        </div>
      )}

      {isCover && stCur.cover === 'end' && (
        <div className="demo-cover final">
          <span className="mark">end · demo complete</span>
          <h1>That's the loop. One product across every team's documents.</h1>
          <div className="sub">
            Every answer cited, every source one click away, every project scoped to the team that owns it.
          </div>
          <div className="recap">
            <span>1,248 files indexed in seconds</span>
            <span>Grounded answers · always cited</span>
            <span>One-key project switching</span>
            <span>Works across any domain</span>
            <span>Same product on mobile</span>
          </div>
          <div style={{display:'flex', gap:8, marginTop:18}}>
            <button className="start" onClick={() => setStep(0)}>Restart demo</button>
            <a className="start" href="WECC RAG Prototype Hi-Fi.html" style={{textDecoration:'none', background:'transparent', color:'var(--ink)', border:'1px solid var(--border)'}}>Open free-explore prototype →</a>
          </div>
        </div>
      )}

      {!isCover && (
        <div className={`app ${inAdminView || inChatMode || !project ? 'no-right' : ''}${inAdminView ? ' admin-active' : ''}`}>
          <div className="topbar">
            <span className="logo">WECC</span>
            <div className="crumbs">
              {inAdminView ? (
                <AdminBreadcrumbs store={store}/>
              ) : inChatMode ? (
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
            {!inAdminView && <TopbarAuditButton store={store}/>}
          </div>

          {project || inChatMode || inAdminView ? (
            <Sidebar store={store}/>
          ) : (
            <ColdSidebar/>
          )}

          <div className={`chat${!inAdminView && isEmptySession ? ' chat-empty-session' : ''}`}>
            {inAdminView ? (
              <AdminView store={store}/>
            ) : project || inChatMode ? (
              <>
                <ChatHead store={store}/>
                <Thread store={store}/>
                <Composer store={store}/>
              </>
            ) : (
              <ColdHero onCreate={() => setStep(steps.findIndex(x => x.id === 'create-modal'))}/>
            )}
          </div>

          {!inAdminView && !inChatMode && project && <RightPanel store={store}/>}

          {/* Modals + overlays */}
          {s.paletteOpen && (
            <DemoPalette
              store={store}
              query={s.paletteQuery || ''}
              setQuery={(v) => set({ paletteQuery: v })}
              onPickProject={(pid) => {
                const next = pid === 'atlas' ? steps.findIndex(x => x.id === 'atlas') : -1;
                if (next > 0) setStep(next);
                else set({ paletteOpen: false, currentProjectId: pid });
              }}
            />
          )}
          {s.newProjectOpen && (
            <DemoNewProjectModal
              prefill={s.npPrefill}
              onCancel={() => set({ newProjectOpen: false })}
              onCreate={(name, desc) => {
                store.createProject(name, desc);
              }}
            />
          )}
          <CitePopover store={store}/>
          <InviteModal store={store}/>
          <UploadModal store={store}/>
          <AdminAuthModal store={store}/>

          {/* Backdrop dims chat while drawer is open */}
          <div className={`src-drawer-back ${s.sourceDrawer ? 'open' : ''}`} onClick={() => set({ sourceDrawer: null })}/>
          <SourceDrawer
            open={!!s.sourceDrawer}
            snipId={s.sourceDrawer}
            onClose={() => set({ sourceDrawer: null })}
          />

          <FileLibrary
            open={s.libraryOpen}
            project={project}
            onClose={() => set({ libraryOpen: false })}
          />

          <MobileInset
            open={s.mobileOpen}
            project={project}
            session={session}
            onClose={() => set({ mobileOpen: false })}
          />

          {toastMsg && <div className="toast">{toastMsg}</div>}
        </div>
      )}

      {/* Demo controls — always visible */}
      <DemoControls
        step={step}
        steps={steps}
        onStep={(i) => setStep(Math.max(0, Math.min(steps.length - 1, i)))}
      />
    </>
  );
}

// ─── Cold-start sidebar + hero ────────────────────────────────
function ColdSidebar() {
  return (
    <div className="sidebar">
      <div className="sb-top">
        <button className="sb-newchat" disabled>
          <Icon name="plus" size={12}/> New chat
        </button>
        <div className="sb-search">
          <span className="ic"><Icon name="search" size={13}/></span>
          <input placeholder="Search projects…" disabled/>
        </div>
      </div>
      <div className="sb-list">
        <div className="sb-section-label">Projects</div>
        <div style={{
          margin:'8px 8px', padding:'14px 12px',
          border:'1px dashed var(--hairline)', borderRadius:6,
          fontFamily:'var(--mono)', fontSize:10.5, lineHeight:1.6,
          color:'var(--muted)'
        }}>
          <div style={{color:'var(--ink-2)', marginBottom:4}}>No projects yet.</div>
          Create one to start asking grounded questions over your team's docs.
        </div>
      </div>
      <div className="sb-foot">
        <Avatar user={DEMO_PROJECTS[0].users.find(u => u.you)}/>
        <div className="who">
          <div className="name">{DEMO_PROJECTS[0].users.find(u => u.you).name}</div>
          <div className="role">{DEMO_PROJECTS[0].users.find(u => u.you).email}</div>
        </div>
      </div>
    </div>
  );
}
function ColdHero({ onCreate }) {
  return (
    <div className="empty" style={{flex:1}}>
      <div className="cold-hero-inner">
      <div style={{
        fontFamily:'var(--mono)', fontSize:11, letterSpacing:'0.18em',
        color:'var(--whisper)', textTransform:'uppercase',
        display:'flex', alignItems:'center', justifyContent:'center', gap:10
      }}>
        <span style={{height:1, width:28, background:'var(--hairline)'}}/>
        WECC RAG · ops
        <span style={{height:1, width:28, background:'var(--hairline)'}}/>
      </div>
      <h2 style={{fontSize:30, textWrap:'balance', maxWidth:560, margin:'4px auto 0'}}>Project-scoped chat for your team's documents.</h2>
      <div className="sub" style={{fontSize:14, maxWidth:520, margin:'0 auto'}}>
        Group docs into projects, set instructions, share with teammates.
        Ask questions and get answers grounded in your files — with citations.
      </div>
      <div style={{display:'flex', gap:8, marginTop:8, justifyContent:'center'}}>
        <button onClick={onCreate} style={{
          background:'var(--accent)', color:'var(--accent-fg)', border:'none',
          padding:'10px 18px', borderRadius:6, fontWeight:600, fontSize:14,
          display:'inline-flex', alignItems:'center', gap:8,
        }}>
          <Icon name="plus" size={13}/>Create your first project
        </button>
      </div>
      <div style={{
        marginTop:48,
        display:'grid', gridTemplateColumns:'repeat(3, minmax(180px, 220px))', gap:12,
        textAlign:'left', justifyContent:'center'
      }}>
        {[
          { n:'01', t:'Make a project', s:"Bucket of files + instructions + members. Unlimited files per project." },
          { n:'02', t:'Drop in your docs', s:"PDFs, Markdown, MIB files, runbooks. Indexed in seconds." },
          { n:'03', t:'Ask, with citations', s:"Every answer cites the snippets it came from. Click to open the source." },
        ].map(c => (
          <div key={c.n} style={{
            background:'var(--surface)', border:'1px solid var(--hairline)',
            borderRadius:6, padding:'14px 16px',
          }}>
            <div style={{
              fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.14em',
              color:'var(--accent)', marginBottom:8
            }}>{c.n}</div>
            <div style={{fontWeight:500, fontSize:13.5, marginBottom:4}}>{c.t}</div>
            <div style={{fontSize:12, color:'var(--muted)', lineHeight:1.55}}>{c.s}</div>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}

// ─── Custom palette with cross-domain projects + actions ─────
function DemoPalette({ store, query, setQuery, onPickProject }) {
  const projects = store.projects;
  const ql = (query || '').toLowerCase();
  const filtered = projects.filter(p => !ql || p.name.toLowerCase().includes(ql));

  const onKey = (e) => { if (e.key === 'Escape') store.closePalette(); };

  return (
    <div className="pal-back" onClick={store.closePalette}>
      <div className="palette" onClick={e => e.stopPropagation()} onKeyDown={onKey}>
        <div className="pal-input">
          <span className="ic"><Icon name="search" size={14}/></span>
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Jump to project, chat, file, or command…"
          />
          <span className="kbd">esc</span>
        </div>
        <div className="pal-list">
          <div className="pal-group">Projects · {filtered.length}</div>
          {filtered.map((p, i) => (
            <div
              key={p.id}
              className={`pal-item ${i === 0 ? 'sel' : ''}`}
              onClick={() => onPickProject(p.id)}
            >
              <span className="ic"><Icon name="folder" size={13}/></span>
              <div className="lbl">
                <span>{highlight(p.name, query)}</span>
                <span className="sub">{(p.fileCountTotal || p.files.length).toLocaleString()} files · {p.users.length} members · {p.sessions[0]?.when || 'no chats'}</span>
              </div>
              {i === 0 && <span className="k">↵</span>}
            </div>
          ))}
          <div className="pal-group">Actions</div>
          <div className="pal-item">
            <span className="ic"><Icon name="plus" size={13}/></span>
            <div className="lbl">Create new project</div>
            <span className="k">⌘ N</span>
          </div>
          <div className="pal-item">
            <span className="ic"><Icon name="upload" size={13}/></span>
            <div className="lbl">Upload files</div>
            <span className="k">⌘ U</span>
          </div>
        </div>
      </div>
    </div>
  );
}
function highlight(str, q) {
  if (!q) return str;
  const i = str.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return str;
  return (
    <>{str.slice(0, i)}<b style={{color:'var(--accent-ink)'}}>{str.slice(i, i+q.length)}</b>{str.slice(i+q.length)}</>
  );
}

// ─── New project modal (with optional prefilled fields) ───────
function DemoNewProjectModal({ prefill, onCancel, onCreate }) {
  const [name, setName] = useState(prefill?.name || '');
  const [desc, setDesc] = useState(prefill?.desc || '');
  const [instructions, setInstructions] = useState(prefill?.instructions || '');

  useEffect(() => {
    if (prefill) {
      setName(prefill.name || '');
      setDesc(prefill.desc || '');
      setInstructions(prefill.instructions || '');
    }
  }, [prefill]);

  return (
    <div className="modal-back" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>New project</h3>
        <div className="sub">A project is a bucket of files plus the instructions for an assistant that answers questions about them.</div>
        <label>
          <div className="lab">Name</div>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Cisco MIB Reference"
            autoFocus
          />
        </label>
        <label>
          <div className="lab">Description (optional)</div>
          <input
            value={desc}
            onChange={e => setDesc(e.target.value)}
          />
        </label>
        <label>
          <div className="lab">Assistant instructions</div>
          <textarea
            value={instructions}
            onChange={e => setInstructions(e.target.value)}
            rows={5}
            style={{fontFamily:'var(--mono)', fontSize:12}}
          />
        </label>
        <div className="actions">
          <button className="cancel" onClick={onCancel}>Cancel</button>
          <button className="primary" disabled={!name.trim()} onClick={() => onCreate(name, desc)}>Create & upload</button>
        </div>
      </div>
    </div>
  );
}

// ─── Demo controls ───────────────────────────────────────────
function DemoControls({ step, steps, onStep }) {
  const cur = steps[step];
  const isLast = step >= steps.length - 1;
  const isFirst = step <= 0;
  return (
    <div className="demo-ctl">
      <button disabled={isFirst} onClick={() => onStep(0)} title="Restart">⏮</button>
      <button disabled={isFirst} onClick={() => onStep(step - 1)} title="Previous">‹</button>
      <span className="step"><b>{String(step + 1).padStart(2,'0')}</b> · {String(steps.length).padStart(2,'0')}</span>
      <span className="label">{cur.label}</span>
      {!isLast ? (
        <button onClick={() => onStep(step + 1)} title="Next">›</button>
      ) : (
        <button className="restart" onClick={() => onStep(0)}>Restart</button>
      )}
    </div>
  );
}

// (CiteClickBinder removed — citation→drawer is handled by toast intercept)

// ─── Mount ───────────────────────────────────────────────────
const _demoRoot = ReactDOM.createRoot(document.getElementById('root'));
_demoRoot.render(<DemoApp/>);
