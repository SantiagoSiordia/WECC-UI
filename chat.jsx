// Chat thread + composer + inline citations with hover preview.

function getChatContext(store) {
  if (store.sidebarMode === 'chat') {
    const standalone = (store.standaloneChats || []).find(c => c.id === store.currentStandaloneChatId);
    return { mode: 'standalone', project: null, session: standalone || null, standalone };
  }
  const project = store.projects.find(p => p.id === store.currentProjectId);
  const session = project?.sessions.find(s => s.id === store.currentSessionId);
  return { mode: 'project', project, session, standalone: null };
}

// ── Citation marker ─────────────────────────────────────────
function Cite({ n, snipId, store }) {
  const ref = useRef(null);
  return (
    <span
      ref={ref}
      className="cite"
      onMouseEnter={() => store.showCite(snipId, ref.current)}
      onMouseLeave={() => store.hideCiteSoon()}
      onClick={() => store.toast(`Open ${SNIPPETS[snipId]?.file} at ${SNIPPETS[snipId]?.loc}`)}
    >[{n}]</span>
  );
}

// Citation popover (rendered once at the App root)
function CitePopover({ store }) {
  const { citePopover } = store;
  const [pos, setPos] = useState(null);
  const popRef = useRef(null);

  useEffect(() => {
    if (!citePopover || !citePopover.anchor) { setPos(null); return; }
    const rect = citePopover.anchor.getBoundingClientRect();
    const popW = 360;
    const popH = 240;
    const margin = 6;
    let left = rect.left;
    if (left + popW + 16 > window.innerWidth) left = window.innerWidth - popW - 16;
    let top = rect.bottom + margin;
    if (top + popH > window.innerHeight - 16) top = rect.top - popH - margin;
    setPos({ top, left });
  }, [citePopover]);

  if (!citePopover || !pos) return null;
  const snip = SNIPPETS[citePopover.id];
  if (!snip) return null;

  return (
    <div
      ref={popRef}
      className="cite-pop"
      style={{ top: pos.top, left: pos.left }}
      onMouseEnter={() => store.cancelHideCite()}
      onMouseLeave={() => store.hideCiteSoon()}
    >
      <div className="head">
        <span className="fname">{snip.file}</span>
        <span className="loc">{snip.loc}</span>
      </div>
      <div className="snip">{snip.text}</div>
      <div className="foot">
        <span>retrieved snippet</span>
        <a href="#" className="open" onClick={e => { e.preventDefault(); store.toast(`Open ${snip.file}`); }}>open file →</a>
      </div>
    </div>
  );
}

// ── Render a message body with {{C:id}} or [N] markers turned into Cite ──
function renderAssistantHtml(html, citeIds, store) {
  let withSentinels = html;
  citeIds.forEach((id, idx) => {
    withSentinels = withSentinels
      .replace(new RegExp(`\\{\\{C:${id}\\}\\}`, 'g'), `‹CITE:${idx}›`);
  });
  withSentinels = withSentinels.replace(/\[(\d+)\]/g, (m, n) => {
    const i = parseInt(n, 10) - 1;
    if (i >= 0 && i < citeIds.length) return `‹CITE:${i}›`;
    return m;
  });

  const parts = withSentinels.split(/‹CITE:(\d+)›/);
  const nodes = [];
  parts.forEach((part, i) => {
    if (i % 2 === 0) {
      nodes.push(<span key={'t'+i} dangerouslySetInnerHTML={{ __html: part }}/>);
    } else {
      const idx = parseInt(part, 10);
      const id = citeIds[idx];
      nodes.push(<Cite key={'c'+i} n={idx+1} snipId={id} store={store}/>);
    }
  });
  return nodes;
}

function renderStreamingText(text) {
  const lines = text.split('\n');
  return lines.map((line, i) => (
    <React.Fragment key={i}>
      {line}
      {i < lines.length - 1 && <br/>}
    </React.Fragment>
  ));
}

function VisibilityToggle({ visibility, onChange, store, lockedPrivate = false }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const isPrivate = visibility === 'private';

  const setPublic = () => {
    if (!isPrivate) return;
    if (lockedPrivate) {
      store.toast('Private context cannot be made public again');
      return;
    }
    onChange('public');
  };

  const requestPrivate = () => {
    if (isPrivate) return;
    if (lockedPrivate) {
      setConfirmOpen(true);
      return;
    }
    onChange('private');
  };

  const confirmPrivate = () => {
    onChange('private');
    setConfirmOpen(false);
  };

  const title = lockedPrivate && isPrivate
    ? 'Private — cannot switch back to public'
    : isPrivate
      ? 'Private — you can switch back to public before the first message'
      : 'Public — visible to project members';

  return (
    <>
      <div className={'vis-toggle' + (lockedPrivate && isPrivate ? ' locked' : '')} title={title}>
        <button
          className={!isPrivate ? 'on' : ''}
          onClick={setPublic}
          disabled={lockedPrivate && isPrivate}
        >Public</button>
        <button className={isPrivate ? 'on' : ''} onClick={requestPrivate}>Private</button>
      </div>
      {confirmOpen && (
        <div className="modal-back" onClick={() => setConfirmOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Make this chat private?</h3>
            <div className="sub">
              Private chats cannot be made public again. Context and messages stay visible only
              to people who already have access — not the whole project.
            </div>
            <div className="actions">
              <button className="cancel" type="button" onClick={() => setConfirmOpen(false)}>Cancel</button>
              <button className="primary danger" type="button" onClick={confirmPrivate}>Make private</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Thread ──────────────────────────────────────────────────
function Thread({ store }) {
  const { currentUser } = store;
  const { mode, project, session } = getChatContext(store);
  const threadRef = useRef(null);

  useEffect(() => {
    const el = threadRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [session?.messages.length, session?.messages[session.messages.length - 1]?.text]);

  if (mode === 'standalone') {
    if (!session) {
      return (
        <div className="thread" ref={threadRef}>
          <div className="empty">
            <h2>General chat</h2>
            <div className="sub">Start a conversation without tying it to a project.</div>
          </div>
        </div>
      );
    }
    if (session.messages.length === 0) {
      const vis = session.visibility || 'public';
      return (
        <div className="thread" ref={threadRef}>
          <div className="empty empty-session empty-session-hero">
            <input
              className="empty-session-title"
              value={session.title}
              onChange={e => store.renameStandaloneChat(session.id, e.target.value)}
            />
            <div className="sub">Ask anything — general knowledge, no project files or citations.</div>
            <VisibilityToggle
              visibility={vis}
              lockedPrivate={false}
              onChange={(v) => store.setStandaloneVisibility(session.id, v)}
              store={store}
            />
          </div>
        </div>
      );
    }
    return (
      <div className="thread" ref={threadRef}>
        <div className="thread-inner">
          {session.messages.map((m, i) => (
            <StandaloneMessageView key={i} m={m} store={store} currentUser={currentUser}/>
          ))}
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="thread" ref={threadRef}>
        <div className="empty">
          <h2>No project selected</h2>
          <div className="sub">Pick a project from the sidebar to get started.</div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="thread" ref={threadRef}>
        <div className="empty">
          <h2>{project.name}</h2>
          <div className="sub">No chats yet. Start one to ask questions about this project.</div>
          <button className="sb-newchat" onClick={() => store.addSession(project.id)} style={{maxWidth:200}}>
            <Icon name="plus" size={11}/> New chat
          </button>
        </div>
      </div>
    );
  }

  if (session.messages.length === 0) {
    const vis = session.visibility || 'public';
    return (
      <div className="thread" ref={threadRef}>
        <div className="empty empty-session empty-session-hero">
          <input
            className="empty-session-title"
            value={session.title}
            onChange={e => store.renameSession(project.id, session.id, e.target.value)}
          />
          <div className="sub">{project.name} · Ask a question grounded in this project's documents.</div>
          <VisibilityToggle
            visibility={vis}
            lockedPrivate={false}
            onChange={(v) => store.setSessionVisibility(project.id, session.id, v)}
            store={store}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="thread" ref={threadRef}>
      <div className="thread-inner">
        {session.author !== currentUser.id && session.messages.length > 0 && (
          <div style={{
            display:'flex', alignItems:'center', gap:8,
            padding:'4px 0', borderBottom:'1px dashed var(--border)',
            fontSize:11, color:'var(--muted)', fontFamily:'var(--mono)', marginBottom:6
          }}>
            <Avatar user={project.users.find(u => u.id === session.author) || currentUser} size="xs"/>
            <span>started by {project.users.find(u => u.id === session.author)?.name || 'someone'} · {session.visibility === 'private' ? 'private' : 'visible to project'}</span>
          </div>
        )}
        {session.messages.map((m, i) => <MessageView key={i} m={m} project={project} store={store}/>)}
      </div>
    </div>
  );
}

function StandaloneMessageView({ m, store, currentUser }) {
  if (m.role === 'user') {
    return (
      <div className="msg user">
        <div className="who">
          <span>You</span>
          <Avatar user={currentUser} size="xs"/>
        </div>
        <div className="body">{m.text}</div>
      </div>
    );
  }
  if (m.streaming) {
    return (
      <div className="msg assistant">
        <div className="who">Assistant</div>
        {m.text && (
          <div className="body">
            <p>{renderStreamingText(m.text)}<span className="caret"/></p>
          </div>
        )}
      </div>
    );
  }
  const html = m.html || textToHtml(m.text || '');
  return (
    <div className="msg assistant">
      <div className="who">Assistant</div>
      <div className="body" dangerouslySetInnerHTML={{ __html: html }}/>
    </div>
  );
}

function MessageView({ m, project, store }) {
  if (m.role === 'user') {
    const user = project.users.find(u => u.id === (m.author || 'rs')) || project.users[0];
    return (
      <div className="msg user">
        <div className="who">
          <span>{user?.you ? 'You' : user?.name || 'User'}</span>
          <Avatar user={user} size="xs"/>
        </div>
        <div className="body">{m.text}</div>
      </div>
    );
  }

  if (m.streaming) {
    return (
      <div className="msg assistant">
        <div className="who">Assistant</div>
        {m.retrieving && (
          <div className="retrieving">
            <span className="spin"/>
            <span>{m.retrieving}</span>
          </div>
        )}
        {m.text && (
          <div className="body">
            <p>{renderStreamingText(m.text)}<span className="caret"/></p>
          </div>
        )}
      </div>
    );
  }

  if (m.error) {
    return (
      <div className="msg assistant">
        <div className="who">Assistant</div>
        <div className="body" style={{color:'var(--err)'}}>
          <p>{m.error}</p>
          <div className="msg-actions" style={{opacity:1}}>
            <button className="iconbtn" onClick={() => store.retryLast()}>↻ retry</button>
          </div>
        </div>
      </div>
    );
  }

  const html = m.html || textToHtml(m.text || '');
  const cites = m.cites || [];

  return (
    <div className="msg assistant">
      <div className="who">Assistant</div>
      <div className="body">{renderAssistantHtml(html, cites, store)}</div>
      {m.noContext && (
        <div className="msg-notice">
          <span className="dot"/>
          <span>No relevant snippets in this project — answered from general knowledge.</span>
        </div>
      )}
      <div className="msg-actions">
        <button className="iconbtn" title="Copy">⧉ copy</button>
        <button className="iconbtn" title="Regenerate" onClick={() => store.regenerate()}>↻ regen</button>
        <button className="iconbtn" title="Bad answer">⚐ flag</button>
      </div>
    </div>
  );
}

function textToHtml(text) {
  let s = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  s = s.replace(/```([\s\S]*?)```/g, (m, code) => `<pre>${code.trim()}</pre>`);
  s = s.replace(/`([^`\n]+)`/g, (m, c) => `<code>${c}</code>`);
  s = s.replace(/\*\*([^*]+)\*\*/g, (m, b) => `<b>${b}</b>`);
  const paras = s.split(/\n{2,}/).map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`);
  return paras.join('');
}

// ── Chat header (hidden while session is empty — hero lives in Thread) ──
function ChatHead({ store }) {
  const { mode, project, session } = getChatContext(store);

  if (session && session.messages.length === 0) return null;

  if (mode === 'standalone') {
    if (!session) return null;
    return (
      <div className="chat-head">
        <div className="title">
          <input
            className="ttl-edit"
            value={session.title}
            onChange={e => store.renameStandaloneChat(session.id, e.target.value)}
          />
        </div>
        <VisibilityToggle
          visibility={session.visibility || 'public'}
          lockedPrivate
          onChange={(v) => store.setStandaloneVisibility(session.id, v)}
          store={store}
        />
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="chat-head">
      <div className="title">
        {session
          ? <input
              className="ttl-edit"
              value={session.title}
              onChange={e => store.renameSession(project.id, session.id, e.target.value)}
            />
          : project.name}
      </div>
      {session && (
        <VisibilityToggle
          visibility={session.visibility || 'public'}
          lockedPrivate
          onChange={(v) => store.setSessionVisibility(project.id, session.id, v)}
          store={store}
        />
      )}
      {session && session.author !== store.currentUser.id && (
        <div className="meta">
          <span className="chip avatar-stack" title={project.users.find(u => u.id === session.author)?.name}>
            <Avatar user={project.users.find(u => u.id === session.author) || store.currentUser} size="xs"/>
          </span>
        </div>
      )}
    </div>
  );
}

// ── Composer ────────────────────────────────────────────────
function Composer({ store }) {
  const { isStreaming } = store;
  const { mode, project, session } = getChatContext(store);
  const [val, setVal] = useState('');
  const [plusOpen, setPlusOpen] = useState(false);
  const taRef = useRef(null);
  const plusRef = useRef(null);

  useEffect(() => {
    const ta = taRef.current; if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(200, ta.scrollHeight) + 'px';
  }, [val]);

  useEffect(() => {
    if (!plusOpen) return;
    const close = (e) => {
      if (plusRef.current && !plusRef.current.contains(e.target)) setPlusOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [plusOpen]);

  const isStandalone = mode === 'standalone';
  const canSend = isStandalone || !!project;

  const placeholder = isStandalone
    ? 'Ask anything (general chat, no project files)…'
    : project
      ? (project.files.filter(f => f.status === 'ok').length === 0
          ? "No indexed files — replies will be ungrounded"
          : `Ask about ${project.name}…`)
      : "Pick a project to chat";

  const send = () => {
    if (!val.trim() || !canSend || isStreaming) return;
    if (isStandalone) {
      let s = session;
      if (!s) s = store.addStandaloneChat();
      store.sendStandaloneMessage(s.id, val.trim());
    } else {
      let s = session;
      if (!s) s = store.addSession(project.id);
      store.sendMessage(project.id, s.id, val.trim());
    }
    setVal('');
    setPlusOpen(false);
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const footnote = isStandalone
    ? <>General chat · no project files or inline citations · <span className="kbd">⇧⏎</span> for newline</>
    : <>Grounded in <b>{project ? project.name : '—'}</b> · answers cite source files inline · <span className="kbd">⇧⏎</span> for newline</>;

  return (
    <div className="composer">
      <div className="composer-inner">
        <div className="composer-box">
          <textarea
            ref={taRef}
            placeholder={placeholder}
            value={val}
            onChange={e => setVal(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={!canSend}
          />
          <div className="row2">
            <div className="composer-plus" ref={plusRef}>
              <button
                className="plus-btn"
                title="Add to message"
                onClick={() => setPlusOpen(o => !o)}
                disabled={!canSend}
              ><Icon name="plus" size={14}/></button>
              {plusOpen && (
                <div className="plus-menu">
                  <button onClick={() => { store.toast('Attach file — coming soon'); setPlusOpen(false); }}>
                    <Icon name="paperclip" size={12}/> Attach file
                  </button>
                  <button className="disabled" disabled title="Coming soon">
                    <Icon name="spark" size={12}/> Skills
                  </button>
                </div>
              )}
            </div>
            <button
              className="send"
              disabled={!val.trim() || !canSend || isStreaming}
              onClick={send}
              title="Send (⏎)"
            ><Icon name="send" size={14}/></button>
          </div>
        </div>
        <div className="footnote">{footnote}</div>
      </div>
    </div>
  );
}

Object.assign(window, { Thread, Composer, ChatHead, Cite, CitePopover, renderAssistantHtml, textToHtml, getChatContext });
