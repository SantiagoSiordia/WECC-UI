// Sidebar + right panel + smaller UI widgets for the prototype.
// State + mutation helpers live on `store` (passed in by the parent).
// React hooks are declared globally in data.jsx (first loaded).

// ── small bits ──────────────────────────────────────────────
function Avatar({ user, size = '' }) {
  if (!user) return null;
  const cls = ['avatar', size, user.color].filter(Boolean).join(' ');
  return <span className={cls} title={user.name}>{user.initials}</span>;
}

function Icon({ name, size = 14 }) {
  // Minimal monoline icons inline. All 16x16 viewBox.
  const paths = {
    search: <><circle cx="7" cy="7" r="4.5"/><path d="m10.3 10.3 3 3"/></>,
    plus:   <path d="M8 3v10M3 8h10"/>,
    chev:   <path d="m6 4 4 4-4 4"/>,
    chevD:  <path d="m4 6 4 4 4-4"/>,
    folder: <path d="M2 5a1 1 0 0 1 1-1h3l1.5 1.5H13a1 1 0 0 1 1 1V12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5z"/>,
    chat:   <path d="M2.5 4.5h11v6h-5L5 13v-2.5H2.5v-6z"/>,
    file:   <path d="M4 2h5l3 3v9H4V2zM9 2v3h3"/>,
    edit:   <><path d="M11 3.5 12.5 5"/><path d="M3 13l2.5-.5L12 5l-2-2-6.5 6.5L3 13z"/></>,
    trash:  <><path d="M3 5h10M6 5V3.5h4V5M5 5l.5 8h5l.5-8"/></>,
    upload: <><path d="M8 11V3M4.5 6.5 8 3l3.5 3.5"/><path d="M3 12v1.5h10V12"/></>,
    x:      <path d="m4 4 8 8M12 4l-8 8"/>,
    send:   <path d="M3 8h10M9 4l4 4-4 4"/>,
    paperclip: <path d="M9.5 3 4 8.5a2.5 2.5 0 0 0 3.5 3.5l6-6a4 4 0 0 0-5.5-5.5"/>,
    settings: <><circle cx="8" cy="8" r="2"/><path d="M8 2v1.5M8 12.5V14M3.5 8H2M14 8h-1.5M4.6 4.6l1 1M10.4 10.4l1 1M4.6 11.4l1-1M10.4 5.6l1-1"/></>,
    cmd:    <path d="M5 3.5a1.5 1.5 0 1 1 1.5 1.5H11a1.5 1.5 0 1 1-1.5 1.5V11A1.5 1.5 0 1 1 8 12.5H5A1.5 1.5 0 1 1 6.5 11V6.5H5z"/>,
    book:   <path d="M3 3v10l5-1 5 1V3l-5 1-5-1z"/>,
    spark:  <><path d="M8 2l1.2 2.4 2.6.4-1.9 1.8.5 2.4L8 9.8 5.1 11.6l.5-2.4-1.9-1.8 2.6-.4L8 2z"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
}

// ── Modals ──────────────────────────────────────────────────
function InviteModal({ store }) {
  const { inviteModalOpen, inviteProjectId, projects, closeInviteModal, addUser } = store;
  const [email, setEmail] = useState('');
  const project = projects.find(p => p.id === inviteProjectId);

  useEffect(() => {
    if (inviteModalOpen) setEmail('');
  }, [inviteModalOpen]);

  if (!inviteModalOpen || !project) return null;

  const submit = () => {
    if (!/.+@.+\..+/.test(email)) { store.toast('Enter a valid email'); return; }
    addUser(project.id, email);
    closeInviteModal();
  };

  return (
    <div className="modal-back" onClick={closeInviteModal}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>Invite to {project.name}</h3>
        <div className="sub">Add a teammate to this project.</div>
        <label>
          <div className="lab">Email</div>
          <input
            type="email"
            autoFocus
            placeholder="name@team.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
          />
        </label>
        <div className="actions">
          <button className="cancel" onClick={closeInviteModal}>Cancel</button>
          <button className="primary" disabled={!email.trim()} onClick={submit}>Send invite</button>
        </div>
      </div>
    </div>
  );
}

function UploadModal({ store }) {
  const { uploadModalOpen, uploadProjectId, projects, closeUploadModal, simulateUpload } = store;
  const project = projects.find(p => p.id === uploadProjectId);
  if (!uploadModalOpen || !project) return null;

  return (
    <div className="modal-back" onClick={closeUploadModal}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>Upload files</h3>
        <div className="sub">Add documents to <b>{project.name}</b>. Indexing starts after upload.</div>
        <div className="drop-hint" style={{margin:'12px 0 16px', padding:'20px 16px'}}>
          <span className="big">Drop files here or browse</span>
          <span className="faint" style={{fontSize:11}}>PDF · DOCX · TXT · MIB · MD</span>
          <button onClick={() => { simulateUpload(project.id); closeUploadModal(); }}>Browse files</button>
        </div>
        <div className="actions">
          <button className="cancel" onClick={closeUploadModal}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function SidebarModeSwitch({ mode, onChange }) {
  return (
    <div className="sb-mode">
      <button className={mode === 'chat' ? 'on' : ''} onClick={() => onChange('chat')}>Chat</button>
      <button className={mode === 'projects' ? 'on' : ''} onClick={() => onChange('projects')}>Projects</button>
    </div>
  );
}

// ── Sidebar ─────────────────────────────────────────────────
function Sidebar({ store }) {
  const {
    projects, currentProjectId, currentSessionId,
    setCurrentProject, setCurrentSession,
    openProjects, toggleProject,
    historyFilter, setHistoryFilter,
    projectQuery, setProjectQuery,
    addSession, renameSession, deleteSession,
    openNewProject, openPalette,
    currentUser,
    sidebarMode, setSidebarMode,
    standaloneChats, currentStandaloneChatId,
    setCurrentStandaloneChat, addStandaloneChat,
  } = store;

  const filtered = projects.filter(p =>
    !projectQuery || p.name.toLowerCase().includes(projectQuery.toLowerCase())
  );

  const currentProject = projects.find(p => p.id === currentProjectId);
  const isChatMode = sidebarMode === 'chat';

  return (
    <div className="sidebar">
      <div className="sb-top">
        <SidebarModeSwitch mode={sidebarMode} onChange={setSidebarMode}/>
        <button
          className="sb-newchat"
          onClick={() => {
            if (isChatMode) addStandaloneChat();
            else if (currentProject) addSession(currentProject.id);
          }}
        >
          <Icon name="plus" size={12}/> New chat
        </button>
        {!isChatMode && (
          <div className="sb-search">
            <span className="ic"><Icon name="search" size={13}/></span>
            <input
              value={projectQuery}
              onChange={e => setProjectQuery(e.target.value)}
              placeholder="Search projects…"
              spellCheck={false}
            />
          </div>
        )}
      </div>

      <div className="sb-list">
        {isChatMode ? (
          <>
            <div className="sb-section-label">Chats</div>
            {standaloneChats.length === 0 && (
              <div style={{padding:'10px 12px', color:'var(--faint)', fontSize:12, fontStyle:'italic'}}>
                No chats yet. Start a general conversation.
              </div>
            )}
            {standaloneChats.map(c => (
              <div
                key={c.id}
                className={'sess-row' + (c.id === currentStandaloneChatId ? ' active' : '')}
                onClick={() => setCurrentStandaloneChat(c.id)}
              >
                <span className="ic" style={{color:'var(--muted)'}}><Icon name="chat" size={12}/></span>
                <span className="title">{c.title}</span>
                <span className="when">{c.when}</span>
              </div>
            ))}
          </>
        ) : (
          <>
        <div className="sb-section-label" style={{display:'flex', justifyContent:'space-between'}}>
          <span>Projects</span>
          <button
            className="iconbtn"
            onClick={openNewProject}
            style={{border:'none', background:'transparent', color:'var(--muted)', cursor:'pointer', padding:0, fontSize:11}}
            title="New project"
          >+ new</button>
        </div>

        {filtered.length === 0 && (
          <div style={{padding:'10px 12px', color:'var(--faint)', fontSize:12, fontStyle:'italic'}}>
            No projects match.
          </div>
        )}

        {filtered.map(p => {
          const isOpen = !!openProjects[p.id];
          const sessions = (p.sessions || []).filter(s =>
            historyFilter === 'all' ? true : s.author === currentUser.id
          );
          return (
            <div key={p.id}>
              <div
                className={'proj-row' + (isOpen ? ' open' : '') + (p.id === currentProjectId ? ' active' : '')}
                onClick={() => { toggleProject(p.id); setCurrentProject(p.id); }}
              >
                <span className="chev"><Icon name="chev" size={9}/></span>
                <span className="icon"><Icon name="folder" size={13}/></span>
                <span className="name">{p.name}</span>
                <span className="count">{p.files.length > 999 ? `${(p.files.length/1000).toFixed(1)}k` : p.files.length}</span>
              </div>

              {isOpen && (
                <div className="sess-list">
                  <div className="hist-pill-row">
                    <span className="label">history</span>
                    <span
                      className={'pill' + (historyFilter === 'mine' ? ' active' : '')}
                      onClick={(e) => { e.stopPropagation(); setHistoryFilter('mine'); }}
                    >mine</span>
                    <span
                      className={'pill' + (historyFilter === 'all' ? ' active' : '')}
                      onClick={(e) => { e.stopPropagation(); setHistoryFilter('all'); }}
                    >everyone</span>
                  </div>
                  <div className="sb-newsess" onClick={() => addSession(p.id)}>
                    <span className="plus">+</span>
                    <span>New chat</span>
                  </div>
                  {sessions.length === 0 && (
                    <div style={{padding:'4px 18px 8px', fontSize:11, color:'var(--faint)', fontStyle:'italic'}}>
                      No chats {historyFilter === 'mine' ? 'started by you yet' : 'in this project yet'}.
                    </div>
                  )}
                  {sessions.map(s => {
                    const author = p.users.find(u => u.id === s.author);
                    const isActive = s.id === currentSessionId && p.id === currentProjectId;
                    return (
                      <div
                        key={s.id}
                        className={'sess-row' + (isActive ? ' active' : '')}
                        onClick={() => { setCurrentProject(p.id); setCurrentSession(s.id); }}
                      >
                        <Avatar user={author || currentUser} size="xs"/>
                        <span className="title">{s.title}</span>
                        <span className="when">{s.when}</span>
                        <span className="actions" onClick={e => e.stopPropagation()}>
                          <button
                            className="iconbtn"
                            title="Rename"
                            onClick={() => {
                              const v = prompt('Rename session', s.title);
                              if (v && v.trim()) renameSession(p.id, s.id, v.trim());
                            }}
                          ><Icon name="edit" size={11}/></button>
                          <button
                            className="iconbtn"
                            title="Delete"
                            onClick={() => {
                              if (confirm(`Delete "${s.title}"? This can't be undone.`)) {
                                deleteSession(p.id, s.id);
                              }
                            }}
                          ><Icon name="trash" size={11}/></button>
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
          </>
        )}
      </div>

      <div className="sb-foot">
        <Avatar user={currentUser}/>
        <div className="who">
          <div className="name">{currentUser.name}</div>
          <div className="role">{currentUser.email}</div>
        </div>
        <button className="iconbtn" title="Open command palette" onClick={openPalette}>
          <Icon name="cmd" size={13}/>
        </button>
      </div>
    </div>
  );
}

// ── Right panel ─────────────────────────────────────────────
function RightPanel({ store }) {
  const { projects, currentProjectId, acc, setAcc, currentUser } = store;
  const project = projects.find(p => p.id === currentProjectId);

  if (!project) {
    return (
      <div className="right">
        <div className="right-head"><span className="label">Project context</span></div>
        <div style={{padding:24, color:'var(--faint)', fontSize:12, fontStyle:'italic'}}>
          Pick a project to see instructions, users and files.
        </div>
      </div>
    );
  }

  return (
    <div className="right">
      <div className="right-head">
        <span className="label">Project context</span>
      </div>
      <div className="right-body">
        <InstructionsAcc
          open={acc.instructions}
          onToggle={() => setAcc('instructions')}
          project={project}
          store={store}
        />
        <UsersAcc
          open={acc.users}
          onToggle={() => setAcc('users')}
          project={project}
          store={store}
        />
        <FilesAcc
          open={acc.files}
          onToggle={() => setAcc('files')}
          project={project}
          store={store}
        />
      </div>
    </div>
  );
}

// ── Instructions accordion ──────────────────────────────────
function InstructionsAcc({ open, onToggle, project, store }) {
  const [val, setVal] = useState(project.instructions);
  const [dirty, setDirty] = useState(false);
  const taRef = useRef(null);

  useEffect(() => { setVal(project.instructions); setDirty(false); }, [project.id]);

  const fitInstructionsHeight = useCallback(() => {
    const ta = taRef.current;
    if (!ta || !open) return;
    ta.style.height = 'auto';
    const min = 120;
    const max = Math.max(min, Math.floor(window.innerHeight * 0.5) - 120);
    ta.style.height = Math.min(Math.max(ta.scrollHeight, min), max) + 'px';
  }, [open]);

  useEffect(() => {
    fitInstructionsHeight();
  }, [val, open, project.id, fitInstructionsHeight]);

  useEffect(() => {
    if (!open) return;
    const onResize = () => fitInstructionsHeight();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [open, fitInstructionsHeight]);

  // Auto-save 800ms after typing stops
  useEffect(() => {
    if (!dirty) return;
    const t = setTimeout(() => {
      store.setInstructions(project.id, val);
      setDirty(false);
    }, 800);
    return () => clearTimeout(t);
  }, [val, dirty]);

  return (
    <div className={'acc' + (open ? ' open' : '')}>
      <button className="acc-head" onClick={onToggle}>
        <span className="chev"><Icon name="chev" size={9}/></span>
        <span className="title">Instructions</span>
        <span className="meta">{val.length ? `${val.length} chars` : 'empty'}</span>
      </button>
      <div className="acc-body">
        <textarea
          ref={taRef}
          className="instr-input"
          placeholder="How should the AI behave in this project? Tone, terminology, output format…"
          value={val}
          onChange={e => { setVal(e.target.value); setDirty(true); }}
        />
        <div className="instr-save">
          <span>
            {dirty
              ? <span className="dirty">● unsaved</span>
              : <span className="saved">✓ saved</span>
            }
          </span>
          <span className="faint">auto-save</span>
        </div>
      </div>
    </div>
  );
}

// ── Users accordion ─────────────────────────────────────────
function UsersAcc({ open, onToggle, project, store }) {
  return (
    <div className={'acc' + (open ? ' open' : '')}>
      <div className="acc-head-wrap">
        <button className="acc-head" onClick={onToggle}>
          <span className="chev"><Icon name="chev" size={9}/></span>
          <span className="title">Users</span>
          <span className="meta">{project.users.length}</span>
        </button>
        {open && (
          <button
            className="acc-add iconbtn"
            title="Invite member"
            onClick={() => store.openInviteModal(project.id)}
          ><Icon name="plus" size={12}/></button>
        )}
      </div>
      <div className="acc-body">
        {project.users.map(u => (
          <div className="user-row" key={u.id}>
            <Avatar user={u}/>
            <div className="info">
              <div className="name">
                {u.name} {u.you && <span className="you">(you)</span>}
              </div>
              <div className="email">{u.email}</div>
            </div>
            {!u.you && (
              <button
                className="iconbtn"
                title="Remove from project"
                onClick={() => {
                  if (confirm(`Remove ${u.name} from this project?`)) {
                    store.removeUser(project.id, u.id);
                  }
                }}
              ><Icon name="x" size={11}/></button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Files accordion ─────────────────────────────────────────
function FilesAcc({ open, onToggle, project, store }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  const filtered = useMemo(() =>
    project.files.filter(f => !query || f.name.toLowerCase().includes(query.toLowerCase())),
    [project.files, query]
  );

  const groups = {
    today: filtered.filter(f => f.added === 'today'),
    week:  filtered.filter(f => f.added === 'week'),
    older: filtered.filter(f => f.added === 'older'),
  };

  const procCount = project.files.filter(f => f.status === 'proc').length;
  const failCount = project.files.filter(f => f.status === 'fail').length;

  return (
    <div className={'acc' + (open ? ' open' : '')}>
      <button className="acc-head" onClick={onToggle}>
        <span className="chev"><Icon name="chev" size={9}/></span>
        <span className="title">Files</span>
        <span className="meta">
          {project.files.length}
          {procCount > 0 && <span style={{color:'var(--warn)', marginLeft:6}}>· {procCount} indexing</span>}
          {failCount > 0 && <span style={{color:'var(--err)', marginLeft:6}}>· {failCount} failed</span>}
        </span>
      </button>
      <div className="acc-body">
        <div className="files-toolbar">
          <input
            ref={inputRef}
            placeholder="Search files…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            spellCheck={false}
          />
          <button onClick={() => store.openUploadModal(project.id)}>
            <Icon name="upload" size={11}/> Upload
          </button>
        </div>

        {filtered.length === 0 && project.files.length === 0 && (
          <div className="drop-hint" style={{padding:'18px 14px', marginTop:4}}>
            <span className="big">Upload documents to enable retrieval</span>
            <span className="faint" style={{fontSize:11}}>PDF · DOCX · TXT · MIB · MD</span>
            <button onClick={() => store.openUploadModal(project.id)}>Browse files</button>
          </div>
        )}
        {filtered.length === 0 && project.files.length > 0 && (
          <div style={{padding:'12px 0', color:'var(--faint)', fontStyle:'italic', fontSize:12}}>
            No files match "{query}".
          </div>
        )}

        {['today','week','older'].map(group => {
          const list = groups[group];
          if (list.length === 0) return null;
          const labels = { today: 'Today', week: 'This week', older: 'Older' };
          return (
            <div key={group}>
              <div className="file-group-label">
                <span>{labels[group]}</span>
                <span className="count">{list.length}</span>
              </div>
              {list.map((f, i) => (
                <div className="file-row" key={f.name + i} title={f.error || ''}>
                  <span className="ic"><Icon name="file" size={11}/></span>
                  <span className={'name' + (f.status === 'fail' ? ' failed' : '')}>{f.name}</span>
                  <span className={'status ' + (f.status === 'ok' ? '' : f.status)}>
                    {f.status === 'ok' ? 'indexed' : f.status === 'proc' ? 'indexing' : 'failed'}
                  </span>
                  {f.status === 'fail' && (
                    <button className="retry" onClick={() => store.retryFile(project.id, f.name)}>retry</button>
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, { Sidebar, RightPanel, Avatar, Icon, InviteModal, UploadModal });
