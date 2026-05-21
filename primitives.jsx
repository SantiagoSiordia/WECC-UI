// Shared primitives for the wireframe set
// All components plain functional; share via window assignment at the bottom.

const Caret = ({open=true}) => <span className="chev">{open ? '▾' : '▸'}</span>;

function TopBar({ project, view='Chat', user='RS', extra=null }) {
  return (
    <div className="topbar" style={{gridColumn:'1 / -1'}}>
      <span className="brand">WECC RAG</span>
      <span className="crumb">/</span>
      <span className="crumb"><b>{project || 'No project'}</b></span>
      {view ? <><span className="crumb">/</span><span className="crumb">{view}</span></> : null}
      <span className="sep" />
      {extra}
      <span className="avatar" title="user">{user}</span>
    </div>
  );
}

// Accordion
function Acc({ title, meta, open=true, children }) {
  return (
    <div className={'acc' + (open ? '' : ' collapsed')}>
      <div className="ahead">
        <span><Caret open={open}/> {title}</span>
        <span className="meta">{meta}</span>
      </div>
      {open ? <div className="abody">{children}</div> : null}
    </div>
  );
}

// Sidebar tree row
function Row({ active, indent=0, ico='', label, meta, actions, chev, muted, dim, style }) {
  const cls = ['row'];
  if (active) cls.push('active');
  if (indent === 1) cls.push('indent');
  if (indent === 2) cls.push('indent2');
  if (muted) cls.push('muted');
  return (
    <div className={cls.join(' ')} style={style}>
      {chev ? <span className="chev">{chev}</span> : null}
      {ico ? <span className="ico">{ico}</span> : null}
      <span className="lbl" style={{opacity: dim ? 0.6 : 1}}>{label}</span>
      {meta ? <span className="meta">{meta}</span> : null}
      {actions ? <span className="actions" style={{display:'flex', gap:4, marginLeft:'auto'}}>{actions}</span> : null}
    </div>
  );
}

// Hover-revealed action icons for session rows
function RowActions() {
  return (
    <>
      <button className="btn icon sm" title="rename">✎</button>
      <button className="btn icon sm" title="delete">×</button>
    </>
  );
}

// Section header
function SHead({ title, right, solid }) {
  return (
    <div className={'shead' + (solid ? ' solid' : '')}>
      <span>{title}</span>
      {right ? <span className="right">{right}</span> : null}
    </div>
  );
}

// Chat messages
function MsgUser({ children }) {
  return (
    <div className="msg user">
      <div className="who">You</div>
      <div className="body">{children}</div>
    </div>
  );
}

function MsgAssistant({ children, citations=[], style='chips', footnotes=null }) {
  return (
    <div className="msg assistant">
      <div className="who">Assistant</div>
      <div className="body">{children}</div>
      {style === 'chips' && citations.length ? (
        <div className="sources">
          {citations.map((c,i) => (
            <span className="cite-chip" key={i} title={c.full}>
              <span className="kbd">[{i+1}]</span> {c.short}
            </span>
          ))}
        </div>
      ) : null}
      {style === 'footnotes' && footnotes ? (
        <div className="footnotes">{footnotes}</div>
      ) : null}
    </div>
  );
}

// Inline numbered citation marker (for inline-in-text style)
const Sup = ({ n }) => <sup className="cite-sup">{n}</sup>;

function Composer({ placeholder='Ask anything grounded in this project…', disabled=false, attach=true }) {
  return (
    <div className="composer">
      <div className="box">
        <div className="ph" style={{flex:1, padding:'2px 0'}}>{placeholder}</div>
      </div>
      <div className="tools">
        {attach ? <button className="btn sm">+ Attach</button> : null}
        <button className="chip dashed" title="Add">+</button>
        <button className="btn primary sm send" disabled={disabled}>Send ⏎</button>
      </div>
    </div>
  );
}

function Dropzone({ title='Upload documents', sub='Drag files here, or click to browse · Unlimited files per project' }) {
  return (
    <div className="dropzone">
      <div className="icon-stack">
        <div className="file-icon" />
        <div className="file-icon" style={{transform:'rotate(-3deg)'}}/>
        <div className="file-icon" style={{transform:'rotate(3deg)'}}/>
      </div>
      <div className="big">{title}</div>
      <div className="small">{sub}</div>
      <div style={{display:'flex', gap:8, marginTop:4}}>
        <button className="btn primary">Browse files</button>
        <span className="tiny" style={{alignSelf:'center'}}>PDF · DOCX · TXT · MIB</span>
      </div>
    </div>
  );
}

// File list row (right panel)
function FRow({ name, status='ok', meta }) {
  const sCls = status === 'proc' ? 'fstat proc' : status === 'fail' ? 'fstat' : 'fstat ok';
  const sText = status === 'proc' ? 'indexing' : status === 'fail' ? 'failed' : 'indexed';
  return (
    <div className="frow">
      <span className="ico" style={{flex:'0 0 14px', color:'var(--mute)'}}>▤</span>
      <span className="fname">{name}</span>
      {meta ? <span className="fstat" style={{color:'var(--mute)'}}>{meta}</span> : null}
      <span className={sCls}>{sText}</span>
    </div>
  );
}

// User list row
function URow({ initials, name, email, role='user', you=false, removable=true }) {
  return (
    <div style={{display:'flex', alignItems:'center', gap:8, padding:'5px 0'}}>
      <span className="avatar">{initials}</span>
      <div style={{flex:1, minWidth:0, overflow:'hidden'}}>
        <div style={{fontSize:11, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{name} {you ? <span className="tiny" style={{marginLeft:4}}>(you)</span> : null}</div>
        <div className="small muted" style={{overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{email}</div>
      </div>
      <span className="chip">{role}</span>
      {removable ? <button className="btn icon sm" style={{marginLeft:4}} title="remove">×</button> : null}
    </div>
  );
}

// Annotation sticky note
function Note({ children, top, left, right, bottom, arrow='tl', tip=false, w }) {
  const cls = ['note', arrow + '-arrow'];
  if (tip) cls.push('tip');
  return (
    <div className={cls.join(' ')} style={{top, left, right, bottom, width: w}}>
      <span className="arrow"></span>
      {children}
    </div>
  );
}

// Numbered step badge (for storyboard frames)
function Step({ n, label }) {
  return (
    <>
      <div className="step">{n}</div>
      <div style={{position:'absolute', top:-8, left:28, fontSize:11, fontWeight:600, letterSpacing:'0.04em'}}>
        {label}
      </div>
    </>
  );
}

// Direction intro panel (used as a small artboard above each hero)
function DirIntro({ kicker, name, dims }) {
  return (
    <div className="dir-intro">
      <div className="kicker">{kicker}</div>
      <h2>{name}</h2>
      <div className="dims">
        {Object.entries(dims).map(([k,v]) => (
          <div key={k}><b>{k}:</b> {v}</div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, {
  Caret, TopBar, Acc, Row, RowActions, SHead, MsgUser, MsgAssistant, Sup,
  Composer, Dropzone, FRow, URow, Note, Step, DirIntro
});
