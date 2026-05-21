// Storyboard — happy path through WECC RAG using the baseline UX
// (single-tree sidebar, accordions all expanded, center dropzone for empty,
//  inline add-user, hover-revealed session actions, citation chips below msg).

// ────────────────────────────────────────────────────────────
// Reusable sidebar tree
// ────────────────────────────────────────────────────────────
function SBTree({ projects = [] }) {
  return (
    <div className="col">
      <div style={{padding:'14px 14px 6px'}}>
        <button className="btn block">+ New project</button>
      </div>
      <SHead title="Projects" right={<button className="btn icon sm" title="search">⌕</button>} />
      <div style={{flex:1, overflowY:'hidden'}}>
        {projects.length === 0 ? (
          <div style={{padding:'14px', color:'var(--mute)', fontSize:11, fontStyle:'italic'}}>
            No projects yet. Create one to start a grounded chat.
          </div>
        ) : (
          projects.map((p, pi) => (
            <React.Fragment key={pi}>
              <Row
                chev={p.open ? '▾' : '▸'}
                ico="▣"
                label={p.name}
                meta={p.fileCount != null ? `${p.fileCount}` : null}
                active={p.active && !p.activeSession}
              />
              {p.open && p.sessions ? (
                <>
                  <div style={{padding:'2px 14px 4px 34px', display:'flex', gap:6, alignItems:'center'}}>
                    <span className="tiny">show</span>
                    <span className={p.filter === 'mine' ? 'chip solid' : 'chip'}>mine</span>
                    <span className={p.filter === 'all' ? 'chip solid' : 'chip'}>everyone</span>
                  </div>
                  <Row indent={1} ico="✎" label="+ New chat" muted />
                  {p.sessions.map((s, si) => (
                    <Row
                      key={si}
                      indent={1}
                      ico={s.by ? null : '◫'}
                      label={s.title}
                      meta={s.when}
                      active={s.active}
                      style={s.hover ? {background:'var(--paper-2)'} : {}}
                      actions={s.hover ? <RowActions /> : null}
                    />
                  ))}
                </>
              ) : null}
            </React.Fragment>
          ))
        )}
      </div>
      <div style={{borderTop:'1px solid var(--ink)', padding:'10px 14px', display:'flex', alignItems:'center', gap:8}}>
        <span className="avatar sm">RS</span>
        <span style={{fontSize:11, flex:1}}>Ryan S.</span>
        <button className="btn icon sm" title="settings">⚙</button>
      </div>
    </div>
  );
}

// Right panel — the three accordions
function RightPanel({ instructions, files=[], users=[], collapsed={}, fileQuery='', extra=null }) {
  return (
    <div className="col right">
      <div className="topbar" style={{height:36, fontSize:10, borderBottom:'1px solid var(--ink)'}}>
        <span className="brand" style={{fontSize:10}}>Project</span>
        <span className="sep"/>
        <button className="btn icon sm" title="collapse panel">›</button>
      </div>

      <div style={{flex:1, overflow:'hidden'}}>
        <Acc title="Instructions" meta={instructions ? 'saved' : 'empty'} open={!collapsed.instructions}>
          {instructions ? (
            <div className="input" style={{minHeight:74, whiteSpace:'normal'}}>
              {instructions}
            </div>
          ) : (
            <div className="input dashed" style={{minHeight:74, fontStyle:'italic'}}>
              How should the AI behave in this project? Tone, terminology, output format…
            </div>
          )}
          <div className="tiny" style={{textAlign:'right'}}>auto-saves · ctrl+S</div>
        </Acc>

        <Acc title="Users" meta={`${users.length}`} open={!collapsed.users}>
          {users.length === 0 ? (
            <div className="muted small" style={{fontStyle:'italic'}}>No collaborators yet.</div>
          ) : (
            users.map((u,i) => <URow key={i} {...u} />)
          )}
          <div style={{display:'flex', gap:6, marginTop:6}}>
            <input className="input" placeholder="invite by email…" style={{flex:1}} readOnly />
            <select className="input" style={{width:80, padding:'4px 6px'}} defaultValue="user">
              <option>user</option><option>editor</option><option>admin</option>
            </select>
            <button className="btn primary sm">Invite</button>
          </div>
        </Acc>

        <Acc title="Files" meta={files.length ? `${files.length}` : 'none'} open={!collapsed.files}>
          <div style={{display:'flex', gap:6}}>
            <input className="input" placeholder="⌕ search files…" defaultValue={fileQuery} readOnly style={{flex:1}}/>
            <button className="btn primary sm">+ Upload</button>
          </div>
          {files.length === 0 ? (
            <div className="muted small" style={{fontStyle:'italic', padding:'10px 0'}}>
              Upload documents to enable retrieval.
            </div>
          ) : (
            <div style={{marginTop:4}}>
              {files.map((f,i) => <FRow key={i} {...f} />)}
            </div>
          )}
        </Acc>

        {extra}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// 1 — Empty state, no projects
// ────────────────────────────────────────────────────────────
function Frame1() {
  return (
    <div className="wf grid-3">
      <TopBar project="" user="RS" />
      <SBTree projects={[]} />
      <div className="col">
        <div className="empty">
          <h1 style={{fontSize:22, letterSpacing:'-0.01em'}}>Welcome to WECC RAG</h1>
          <div className="muted" style={{maxWidth:480, fontSize:12, lineHeight:1.6}}>
            Organize your docs into projects. Upload as many files as you need
            — there's no per-project cap. Chat with an LLM grounded in the
            files you've added.
          </div>
          <button className="btn primary">+ Create your first project</button>
          <div className="tiny" style={{marginTop:24}}>or press <span className="kbd">⌘ K</span> to open the command palette</div>
        </div>
      </div>
      <div className="col right">
        <div className="topbar" style={{height:36, fontSize:10}}>
          <span className="brand" style={{fontSize:10}}>Project</span>
        </div>
        <div className="empty" style={{padding:32}}>
          <div className="ph" style={{width:'100%', height:240, background:'var(--paper-2)'}}>NO PROJECT SELECTED</div>
          <div className="muted small">Instructions, users and files appear here once you pick a project.</div>
        </div>
      </div>

      <Step n={1} label="Cold start — no projects" />
      <Note top={88} left={300} arrow="tl" w={180}>
        Single hero CTA. Avoids "what is this app?" confusion on first run.
      </Note>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// 2 — Create-project modal
// ────────────────────────────────────────────────────────────
function Frame2() {
  return (
    <div className="wf grid-3">
      <TopBar project="" user="RS" />
      <SBTree projects={[]} />
      <div className="col">
        <div className="empty" style={{opacity:0.35}}>
          <h1 style={{fontSize:22}}>Welcome to WECC RAG</h1>
          <button className="btn primary">+ Create your first project</button>
        </div>
      </div>
      <div className="col right" style={{opacity:0.35}}>
        <div className="topbar" style={{height:36, fontSize:10}}>
          <span className="brand" style={{fontSize:10}}>Project</span>
        </div>
      </div>

      <div className="modal-back">
        <div className="modal">
          <div className="tiny">New project</div>
          <h3>Name your project</h3>
          <input className="input" defaultValue="Cisco MIB Reference" />
          <div>
            <div className="tiny" style={{marginBottom:4}}>Description (optional)</div>
            <textarea className="input" rows={2} defaultValue="Network device docs + vendor MIB definitions for ops team."/>
          </div>
          <div>
            <div className="tiny" style={{marginBottom:4}}>Visibility</div>
            <div style={{display:'flex', gap:6}}>
              <span className="chip solid">Just me</span>
              <span className="chip">Invite collaborators</span>
            </div>
          </div>
          <div className="footer">
            <button className="btn">Cancel</button>
            <button className="btn primary">Create project</button>
          </div>
        </div>
      </div>

      <Step n={2} label="Create a project" />
      <Note top={210} right={120} arrow="tr" w={200}>
        Lightweight modal — name + optional description. No file-limit copy anywhere.
      </Note>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// 3 — Project just created · center dropzone takes over the chat area
// ────────────────────────────────────────────────────────────
function Frame3() {
  const projects = [{
    name: 'Cisco MIB Reference', open: true, active: true, fileCount: 0, filter: 'mine',
    sessions: []
  }];
  return (
    <div className="wf grid-3">
      <TopBar project="Cisco MIB Reference" user="RS" />
      <SBTree projects={projects} />
      <div className="col">
        <SHead title="New chat" solid right={<><span className="chip dashed">no files yet</span><button className="btn sm">⋯</button></>}/>
        <div className="empty" style={{justifyContent:'flex-start', paddingTop:60}}>
          <h1 style={{fontSize:18, letterSpacing:'-0.01em'}}>Add some documents to ground the chat</h1>
          <div className="muted" style={{maxWidth:420, fontSize:11}}>
            The AI only answers from files you've added to this project. Drop
            your PDFs, MIBs, manuals — there's no cap.
          </div>
          <Dropzone />
          <div className="tiny" style={{marginTop:16}}>or skip and try a general question — answers will be marked <span className="chip">no sources</span></div>
        </div>
        <Composer placeholder="Type a question (no files added yet — replies will be ungrounded)" />
      </div>
      <RightPanel
        instructions=""
        files={[]}
        users={[{initials:'RS', name:'Ryan S.', email:'ryan@wecc.local', role:'admin', you:true, removable:false}]}
      />

      <Step n={3} label="Empty project — upload zone front and center" />
      <Note top={120} left={310} arrow="tl" w={180}>
        Dropzone occupies the chat area until the project has at least one file.
      </Note>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// 4 — Files indexing · user typing first question
// ────────────────────────────────────────────────────────────
function Frame4() {
  const projects = [{
    name: 'Cisco MIB Reference', open: true, active: true, fileCount: 14, filter: 'mine',
    sessions: [
      { title: 'New chat', when: 'now', active: true }
    ]
  }];
  const files = [
    { name: 'cisco-ios-cli-ref-15.4.pdf', status:'ok', meta:'4.2 MB' },
    { name: 'CISCO-IF-EXTENSION-MIB.txt', status:'ok', meta:'180 KB' },
    { name: 'CISCO-PROCESS-MIB.txt', status:'ok', meta:'94 KB' },
    { name: 'Nexus 9000 Series CLI Guide.pdf', status:'proc' },
    { name: 'IF-MIB.txt', status:'proc' },
    { name: 'WECC ops runbook v3.docx', status:'ok', meta:'1.1 MB' },
    { name: 'snmp-v3-deployment-notes.md', status:'ok', meta:'32 KB' },
  ];
  return (
    <div className="wf grid-3">
      <TopBar project="Cisco MIB Reference" user="RS" />
      <SBTree projects={projects} />
      <div className="col">
        <SHead title="New chat" solid/>
        <div className="thread" style={{paddingTop:80}}>
          <div className="empty" style={{padding:0}}>
            <div className="muted" style={{fontSize:12, maxWidth:520}}>
              Ask anything grounded in <b>Cisco MIB Reference</b>. Try one of:
            </div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:8, width:'min(100%, 560px)'}}>
              <div className="btn" style={{justifyContent:'flex-start', textAlign:'left', whiteSpace:'normal', lineHeight:1.4, padding:'8px 10px'}}>What's the OID for ifHCInOctets in IF-MIB?</div>
              <div className="btn" style={{justifyContent:'flex-start', textAlign:'left', whiteSpace:'normal', lineHeight:1.4, padding:'8px 10px'}}>Show me how to enable SNMPv3 on a Nexus 9k.</div>
              <div className="btn" style={{justifyContent:'flex-start', textAlign:'left', whiteSpace:'normal', lineHeight:1.4, padding:'8px 10px'}}>Summarize the WECC ops runbook section on alarm escalation.</div>
              <div className="btn" style={{justifyContent:'flex-start', textAlign:'left', whiteSpace:'normal', lineHeight:1.4, padding:'8px 10px'}}>Which MIBs define interface counters?</div>
            </div>
          </div>
        </div>
        <div className="composer">
          <div className="box">
            <div className="ph" style={{flex:1, padding:'2px 0', color:'var(--ink)'}}>
              What's the OID for ifHCInOctets and which MIB defines it?<span style={{opacity:0.4, marginLeft:1}}>|</span>
            </div>
          </div>
          <div className="tools">
            <button className="btn sm">+ Attach</button>
            <button className="chip dashed" title="Add">+</button>
            <button className="btn primary sm send">Send ⏎</button>
          </div>
        </div>
      </div>
      <RightPanel
        instructions="You are an SNMP / network ops assistant. Cite MIB names and exact OIDs when relevant. Prefer terse, technical answers."
        files={files}
        users={[{initials:'RS', name:'Ryan S.', email:'ryan@wecc.local', role:'admin', you:true, removable:false}]}
      />

      <Step n={4} label="Files indexing — user composes first question" />
      <Note top={110} right={300} arrow="tr" w={200}>
        Status pill in chat header: "2 indexing". No "X of Y" — just live state.
      </Note>
      <Note top={400} right={140} arrow="tr" w={180} tip>
        Per-file status: indexed / indexing / failed. No quota meter.
      </Note>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// 5 — Assistant replies with citation chips
// ────────────────────────────────────────────────────────────
function Frame5() {
  const projects = [{
    name: 'Cisco MIB Reference', open: true, active: true, fileCount: 14, filter: 'mine',
    sessions: [
      { title: 'ifHCInOctets OID lookup', when: '12s', active: true, hover: true }
    ]
  }];
  const files = [
    { name: 'cisco-ios-cli-ref-15.4.pdf', status:'ok' },
    { name: 'CISCO-IF-EXTENSION-MIB.txt', status:'ok' },
    { name: 'CISCO-PROCESS-MIB.txt', status:'ok' },
    { name: 'Nexus 9000 Series CLI Guide.pdf', status:'ok' },
    { name: 'IF-MIB.txt', status:'ok' },
    { name: 'WECC ops runbook v3.docx', status:'ok' },
    { name: 'snmp-v3-deployment-notes.md', status:'ok' },
  ];
  return (
    <div className="wf grid-3">
      <TopBar project="Cisco MIB Reference" user="RS" />
      <SBTree projects={projects} />
      <div className="col">
        <SHead title="ifHCInOctets OID lookup" solid right={<><span className="chip">14 files</span><button className="btn sm">⋯</button></>}/>
        <div className="thread">
          <MsgUser>What's the OID for ifHCInOctets and which MIB defines it?</MsgUser>
          <MsgAssistant
            citations={[
              { short: 'IF-MIB.txt · L412', full: '' },
              { short: 'cisco-ios-cli-ref · p.84', full: '' },
            ]}
          >
            <p style={{margin:'0 0 6px'}}><code style={{background:'var(--paper-2)', padding:'1px 4px'}}>ifHCInOctets</code> is defined in <b>IF-MIB</b> at OID <code style={{background:'var(--paper-2)', padding:'1px 4px'}}>1.3.6.1.2.1.31.1.1.1.6</code><Sup n={1}/>. It's a 64-bit counter (Counter64) for received octets on an interface, intended for high-speed links where the 32-bit <code>ifInOctets</code> wraps too quickly<Sup n={2}/>.</p>
            <p style={{margin:'6px 0 0'}}>To poll it via SNMPv3 on a Cisco device, see the configuration example on p.84 of the IOS CLI reference.</p>
          </MsgAssistant>
          <MsgUser>And the equivalent for outbound?</MsgUser>
          <MsgAssistant
            citations={[
              { short: 'IF-MIB.txt · L431', full: '' },
            ]}
          >
            <code style={{background:'var(--paper-2)', padding:'1px 4px'}}>ifHCOutOctets</code> — OID <code style={{background:'var(--paper-2)', padding:'1px 4px'}}>1.3.6.1.2.1.31.1.1.1.10</code><Sup n={1}/>, same Counter64 shape as the inbound counter.
          </MsgAssistant>
        </div>
        <Composer />
      </div>
      <RightPanel
        instructions="You are an SNMP / network ops assistant. Cite MIB names and exact OIDs when relevant. Prefer terse, technical answers."
        files={files}
        users={[{initials:'RS', name:'Ryan S.', email:'ryan@wecc.local', role:'admin', you:true, removable:false}]}
      />

      <Step n={5} label="Grounded answer with citation chips" />
      <Note top={140} left={310} arrow="tl" w={190}>
        Inline <span className="kbd">[n]</span> markers; chip strip under message lists each source. Click chip → opens file at page/line.
      </Note>
      <Note top={290} left={170} arrow="tl" w={170} tip>
        Hover a session row to reveal rename / delete (no kebab clutter).
      </Note>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// 6 — Collaborator joins, history filter shows everyone's chats
// ────────────────────────────────────────────────────────────
function Frame6() {
  const projects = [{
    name: 'Cisco MIB Reference', open: true, active: true, fileCount: 18, filter: 'all',
    sessions: [
      { title: 'ifHCInOctets OID lookup', when: 'you · 4m', active: false },
      { title: 'SNMPv3 user creation on N9k', when: 'mh · 1h', active: true },
      { title: 'Alarm escalation playbook', when: 'sk · 2h', active: false },
      { title: 'BGP graceful restart timers', when: 'you · yest', active: false },
    ]
  }, {
    name: 'WECC Compliance Docs', open: false, fileCount: 87, sessions: []
  }, {
    name: 'Field Tech Runbooks', open: false, fileCount: 1240, sessions: []
  }];
  const files = [
    { name: 'cisco-ios-cli-ref-15.4.pdf', status:'ok' },
    { name: 'CISCO-IF-EXTENSION-MIB.txt', status:'ok' },
    { name: 'IF-MIB.txt', status:'ok' },
    { name: 'Nexus 9000 SNMP cfg examples.pdf', status:'ok' },
    { name: 'WECC ops runbook v3.docx', status:'ok' },
    { name: '… 13 more', status:'ok' },
  ];
  return (
    <div className="wf grid-3">
      <TopBar project="Cisco MIB Reference" user="RS" extra={<span className="chip"><span className="avatar sm">MH</span> joined</span>} />
      <SBTree projects={projects} />
      <div className="col">
        <SHead title="SNMPv3 user creation on N9k" solid right={<>
          <span className="chip"><span className="avatar sm">MH</span> Muhammad</span>
          <span className="chip">18 files</span>
        </>}/>
        <div className="thread">
          <div style={{display:'flex', alignItems:'center', gap:8, padding:'0 0 6px', borderBottom:'1px dashed var(--mute-2)'}}>
            <span className="tiny">Started by</span>
            <span className="avatar sm">MH</span>
            <span className="small">Muhammad H. · 1h ago · visible to project</span>
          </div>
          <MsgUser>Walk me through creating an SNMPv3 user with priv on a Nexus 9k.</MsgUser>
          <MsgAssistant
            citations={[
              { short: 'Nexus 9000 SNMP cfg · p.12', full: '' },
              { short: 'snmp-v3-deployment-notes · §4', full: '' },
            ]}
          >
            <ol style={{margin:'0 0 0 18px', padding:0, lineHeight:1.6}}>
              <li>Enter config mode and define the user with auth + priv parameters<Sup n={1}/>.</li>
              <li>Bind the user to a group with read/write views as needed.</li>
              <li>Test from your NMS with <code style={{background:'var(--paper-2)', padding:'1px 4px'}}>snmpget -v3 -l authPriv …</code><Sup n={2}/>.</li>
            </ol>
          </MsgAssistant>
        </div>
        <Composer placeholder="Reply to this thread, or @-mention a teammate…" />
      </div>
      <RightPanel
        instructions="You are an SNMP / network ops assistant. Cite MIB names and exact OIDs when relevant. Prefer terse, technical answers."
        files={files}
        users={[
          {initials:'RS', name:'Ryan S.', email:'ryan@wecc.local', role:'admin', you:true, removable:false},
          {initials:'MH', name:'Muhammad H.', email:'muhammad@wecc.local', role:'editor'},
          {initials:'SK', name:'Santi K.', email:'santi@wecc.local', role:'user'},
        ]}
      />

      <Step n={6} label="Collaborator joins — history switches to 'everyone'" />
      <Note top={210} left={20} arrow="bl" w={200}>
        Filter pill set to "everyone": rows now show author initials and timestamps.
      </Note>
      <Note top={130} left={310} arrow="tl" w={210}>
        Thread header shows who started the session — sessions are project-scoped and shared.
      </Note>
    </div>
  );
}

Object.assign(window, { Frame1, Frame2, Frame3, Frame4, Frame5, Frame6, SBTree, RightPanel });
