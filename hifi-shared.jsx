// WECC RAG Hi-Fi — shared chrome pieces used across the four frames.
// All components are pure presentation — props in, JSX out.

// ── Inline icons (1.5px stroke, 14px viewBox) ─────────────────────────────
const Icon = ({ name, size = 14, stroke = 1.5 }) => {
  const p = {
    search:   <><circle cx="7" cy="7" r="4.5"/><path d="m10.3 10.3 3.2 3.2"/></>,
    plus:     <><path d="M7 2v10M2 7h10"/></>,
    folder:   <><path d="M1.5 4.5h4l1 1.4h6.5v6.4a1.2 1.2 0 0 1-1.2 1.2H2.7a1.2 1.2 0 0 1-1.2-1.2v-7.8z"/></>,
    chat:     <><path d="M2 3h11v8H6.5L3.5 13.5V11H2V3z"/></>,
    settings: <><circle cx="7" cy="7" r="2"/><path d="M7 1.5v1.6M7 10.9v1.6M12.5 7h-1.6M3.1 7H1.5M11 11l-1.1-1.1M4.1 4.1L3 3M11 3l-1.1 1.1M4.1 9.9 3 11"/></>,
    users:    <><circle cx="5" cy="5" r="2.4"/><path d="M1 12.5c0-2.2 1.8-4 4-4s4 1.8 4 4M10 12.5c0-1.7 1.1-3.2 2.6-3.7M10.5 6a2.1 2.1 0 1 0 0-4.2"/></>,
    files:    <><path d="M3.5 1.5h5l3.5 3.5v8a.8.8 0 0 1-.8.8H3.5a.8.8 0 0 1-.8-.8V2.3a.8.8 0 0 1 .8-.8z"/><path d="M8.5 1.5V5h3.5"/></>,
    upload:   <><path d="M7 9.5V2M3.5 5.5 7 2l3.5 3.5M2.5 11.5h9v1.5h-9z"/></>,
    book:     <><path d="M2 2.5h4.5c.8 0 1.5.7 1.5 1.5V13l-1-1H2V2.5zM13 2.5H8.5C7.7 2.5 7 3.2 7 4v8.5l1-1h5V2.5z"/></>,
    cmd:      <><path d="M5 2.5h4v4H5zM2.5 5v4M11.5 5v4M5 9.5h4v4H5zM2.5 9.5a2 2 0 1 0 0-4M11.5 9.5a2 2 0 1 1 0-4M5 11.5a2 2 0 1 1-4 0M9 11.5a2 2 0 1 0 4 0"/></>,
    return:   <><path d="M2.5 7.5h8a2 2 0 0 0 2-2V3M2.5 7.5l3-3M2.5 7.5l3 3"/></>,
    chevron:  <><path d="m5 3 4 4-4 4"/></>,
    chevrond: <><path d="m3 5 4 4 4-4"/></>,
    sliders:  <><path d="M2 3.5h7M11 3.5h2M2 7h2M6 7h7M2 10.5h7M11 10.5h2"/><circle cx="10" cy="3.5" r="1"/><circle cx="5" cy="7" r="1"/><circle cx="10" cy="10.5" r="1"/></>,
    dotsh:    <><circle cx="4" cy="7" r="1"/><circle cx="7" cy="7" r="1"/><circle cx="10" cy="7" r="1"/></>,
    star:     <><path d="M7 1.5l1.7 3.6 4 .5-2.9 2.7.8 3.9L7 10.3 3.4 12.2l.8-3.9-2.9-2.7 4-.5z"/></>,
    pin:      <><path d="M7 1.5v6M3.5 7.5h7l-1.5 2.5h-4l-1.5-2.5zM7 10v3"/></>,
    spark:    <><path d="M7 1v3M7 10v3M1 7h3M10 7h3M3 3l2 2M11 3l-2 2M3 11l2-2M11 11l-2-2"/></>,
    clock:    <><circle cx="7" cy="7" r="5.2"/><path d="M7 4v3l2 1.5"/></>,
  }[name] || null;
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={{flex:'0 0 auto'}}>
      {p}
    </svg>
  );
};

// ── Top bar ──────────────────────────────────────────────────────────────
function TopBar({ project = 'WECC Compliance Docs', session = null, user = { initials: 'RS', color: 'u-1' }, onCmd }) {
  return (
    <div className="tb">
      <span className="wm"><span className="dot"/>WECC&nbsp;RAG</span>
      <span style={{width:1, height:18, background:'var(--hair)'}}/>
      <div className="crumbs">
        <span className="proj">{project}</span>
        {session && <>
          <span className="sep">/</span>
          <span className="sess">{session}</span>
        </>}
      </div>
      <span className="grow"/>
    </div>
  );
}

// ── Sidebar ──────────────────────────────────────────────────────────────
function Sidebar({ projects = [], activeSession, currentUser = { name:'Ryan Sandoval', initials:'RS', role:'admin', color:'u-1' }, historyFilter = 'all', onHist }) {
  return (
    <div className="sb">
      <div className="sb-top">
        <div className="sb-search">
          <span className="ic"><Icon name="search" size={12}/></span>
          <input placeholder="Search projects & chats…" defaultValue=""/>
        </div>
        <button className="sb-newproj"><Icon name="plus" size={11}/>New project</button>
      </div>

      <div className="sb-list">
        <div className="sb-label"><span>Projects</span><span className="more">···</span></div>
        {projects.map((p, i) => (
          <React.Fragment key={i}>
            <div className={`p-row ${p.open ? 'open' : ''} ${p.active ? 'active' : ''}`}>
              <span className="chev"><Icon name="chevron" size={9}/></span>
              <span className="ic"><Icon name="folder" size={12}/></span>
              <span className="name">{p.name}</span>
              <span className="count">{p.fileCount}</span>
            </div>
            {p.open && (
              <div style={{paddingBottom:6}}>
                <div className="hist-row">
                  <span className="lbl">History</span>
                  <button className={`pill ${historyFilter==='mine'?'on':''}`} onClick={onHist && (()=>onHist('mine'))}>mine</button>
                  <button className={`pill ${historyFilter==='all'?'on':''}`} onClick={onHist && (()=>onHist('all'))}>everyone</button>
                </div>
                {p.sessions && p.sessions.map((s, j) => (
                  <div key={j} className={`s-row ${s.id === activeSession ? 'active' : ''}`}>
                    <span className="title">{s.title}</span>
                    <span className="when">{s.when}</span>
                  </div>
                ))}
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="sb-foot">
        <span className={`avatar sm ${currentUser.color || 'u-1'}`}>{currentUser.initials}</span>
        <div className="who">
          <div className="nm">{currentUser.name}</div>
          <div className="rl">{currentUser.role}</div>
        </div>
        <button className="ico-btn"><Icon name="settings" size={12}/></button>
      </div>
    </div>
  );
}

// ── Right panel: accordions ──────────────────────────────────────────────
function RightPanel({ children }) {
  return (
    <div className="right">
      <div className="right-head">
        <span className="label">Project</span>
        <button className="ico-btn" style={{
          width:24, height:24, border:'1px solid var(--hair)', borderRadius:4,
          color:'var(--muted)', display:'inline-flex', alignItems:'center', justifyContent:'center'
        }}><Icon name="dotsh" size={12}/></button>
      </div>
      <div className="right-body">{children}</div>
    </div>
  );
}

function Accordion({ title, meta, open, children, headExtra }) {
  return (
    <div className={`acc ${open ? 'open' : ''}`}>
      <button className="acc-head">
        <span className="chev"><Icon name="chevron" size={9}/></span>
        <span className="ttl">{title}</span>
        {meta && <span className="mt">{meta}</span>}
        {headExtra}
      </button>
      <div className="acc-body">{children}</div>
    </div>
  );
}

function UserRow({ initials, color, name, email, you, removable = true }) {
  return (
    <div className="u-row">
      <span className={`avatar sm ${color}`}>{initials}</span>
      <div className="info">
        <div className="nm">{name} {you && <span className="you-tag">· you</span>}</div>
        <div className="em">{email}</div>
      </div>
      {!you && removable && (
        <button className="iconbtn" title="Remove" style={{border:'none', background:'transparent', color:'var(--muted)', padding:2}}>×</button>
      )}
    </div>
  );
}

function FileRow({ name, status = 'ok', size }) {
  return (
    <div className="f-row">
      <span className="ic"><Icon name="files" size={11}/></span>
      <span className="nm">{name}</span>
      {size && <span style={{fontFamily:'var(--mono)', fontSize:9, color:'var(--whisper)'}}>{size}</span>}
      <span className={`stat ${status}`}>{status==='proc' ? 'idx' : 'ok'}</span>
    </div>
  );
}

// Export to window for cross-file use
Object.assign(window, { Icon, TopBar, Sidebar, RightPanel, Accordion, UserRow, FileRow });
