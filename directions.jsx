// Four structural directions — each remixes the 6 dimensions the user
// flagged: sidebar, right panel, citations, project picker, history
// visibility, file library.

// Shared sample data
const SAMPLE_INSTRUCTIONS = "You are an SNMP / network ops assistant. Cite MIB names and exact OIDs when relevant. Prefer terse, technical answers in Markdown. When a question touches WECC compliance, flag CIP-007 implications.";
const SAMPLE_USERS = [
  {initials:'RS', name:'Ryan S.', email:'ryan@wecc.local', role:'admin', you:true, removable:false},
  {initials:'MH', name:'Muhammad H.', email:'muhammad@wecc.local', role:'editor'},
  {initials:'SK', name:'Santi K.', email:'santi@wecc.local', role:'user'},
];
const SAMPLE_FILES_FLAT = [
  { name: 'cisco-ios-cli-ref-15.4.pdf', status:'ok', meta:'4.2 MB' },
  { name: 'CISCO-IF-EXTENSION-MIB.txt', status:'ok', meta:'180 KB' },
  { name: 'IF-MIB.txt', status:'ok', meta:'74 KB' },
  { name: 'CISCO-PROCESS-MIB.txt', status:'ok', meta:'94 KB' },
  { name: 'Nexus 9000 SNMP cfg examples.pdf', status:'ok', meta:'2.1 MB' },
  { name: 'WECC ops runbook v3.docx', status:'ok', meta:'1.1 MB' },
  { name: 'snmp-v3-deployment-notes.md', status:'ok', meta:'32 KB' },
  { name: 'CIP-007 compliance checklist.pdf', status:'ok', meta:'780 KB' },
  { name: 'BGP graceful-restart RFC4724.pdf', status:'proc' },
  { name: '… 1,239 more', status:'ok' },
];
const SAMPLE_CITATIONS = [
  { short: 'IF-MIB.txt · L412', full: '' },
  { short: 'cisco-ios-cli-ref · p.84', full: '' },
];

// ────────────────────────────────────────────────────────────
// Direction A — TREE & STACK (baseline, the user's stated preference)
// • Sidebar: single tree, projects expand to sessions
// • Right panel: stacked accordions
// • Citations: inline [n] + chip strip
// • Project picker: in sidebar
// • History: mine/everyone pill above session list
// • Files: flat list with search
// ────────────────────────────────────────────────────────────
function DirectionA() {
  const projects = [{
    name: 'Cisco MIB Reference', open: true, active: true, fileCount: 1248, filter: 'all',
    sessions: [
      { title: 'ifHCInOctets OID lookup', when: 'you · 4m', active: true },
      { title: 'SNMPv3 on N9k', when: 'mh · 1h' },
      { title: 'Alarm escalation playbook', when: 'sk · 2h' },
      { title: 'BGP graceful restart timers', when: 'you · yest' },
      { title: 'PoE+ budget calculation', when: 'sk · 2d' },
    ]
  }, {
    name: 'WECC Compliance Docs', open: false, fileCount: 87
  }, {
    name: 'Field Tech Runbooks', open: false, fileCount: 1240
  }];

  return (
    <div className="wf grid-3" style={{height: 760}}>
      <TopBar project="Cisco MIB Reference" user="RS" />
      <SBTree projects={projects} />
      <div className="col">
        <SHead title="ifHCInOctets OID lookup" solid right={<><span className="chip">1,248 files</span><button className="btn sm">⋯</button></>}/>
        <div className="thread">
          <MsgUser>What's the OID for ifHCInOctets and which MIB defines it?</MsgUser>
          <MsgAssistant citations={SAMPLE_CITATIONS}>
            <p style={{margin:'0 0 6px'}}><code style={{background:'var(--paper-2)', padding:'1px 4px'}}>ifHCInOctets</code> is defined in <b>IF-MIB</b> at OID <code style={{background:'var(--paper-2)', padding:'1px 4px'}}>1.3.6.1.2.1.31.1.1.1.6</code><Sup n={1}/>. 64-bit counter for received octets — preferred over the 32-bit <code>ifInOctets</code> on high-speed links where wrap is fast<Sup n={2}/>.</p>
          </MsgAssistant>
        </div>
        <Composer />
      </div>
      <RightPanel instructions={SAMPLE_INSTRUCTIONS} files={SAMPLE_FILES_FLAT} users={SAMPLE_USERS} />

      <Note top={62} left={250} arrow="tl" w={170}>
        Single tree — project expands to reveal its sessions. Click to collapse.
      </Note>
      <Note top={170} left={250} arrow="tl" w={170}>
        Filter pill: <span className="chip">mine</span> / <span className="chip solid">everyone</span> — applies to the active project only.
      </Note>
      <Note top={400} right={20} arrow="tr" w={170} tip>
        Stacked accordions. All three open on first visit; collapse-state persists per user.
      </Note>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Direction B — RAIL & TABS
// • Sidebar: icon-only nav rail + contextual list
// • Right panel: tabs (Instructions | Users | Files)
// • Citations: side-pinned panel that slides over chat
// • Project picker: top switcher (dropdown)
// • History: avatar markers on each session row
// • Files: grouped by upload date
// ────────────────────────────────────────────────────────────
function DirectionB() {
  return (
    <div className="wf grid-rail" style={{height: 760}}>
      <TopBar project="Cisco MIB Reference ▾" user="RS"
        extra={<><span className="chip">switch project…</span></>}/>
      <div className="rail">
        <div className="rico active" title="Chats">◫</div>
        <div className="rico" title="Files">▤</div>
        <div className="rico" title="Search">⌕</div>
        <div className="rico" title="Members">◐</div>
        <div className="sp" />
        <div className="rico" title="Settings">⚙</div>
      </div>
      <div className="col">
        <div style={{padding:'14px 14px 6px'}}>
          <button className="btn block primary">+ New chat</button>
        </div>
        <div style={{padding:'4px 14px', display:'flex', gap:6, alignItems:'center'}}>
          <span className="tiny">project</span>
          <span className="chip">Cisco MIB Reference ▾</span>
        </div>
        <SHead title="Sessions" right={<>
          <button className="btn icon sm" title="search sessions">⌕</button>
          <button className="btn icon sm" title="sort">⇅</button>
        </>}/>
        <Row active ico={<span className="avatar sm">RS</span>} label="ifHCInOctets OID lookup" meta="4m"/>
        <Row ico={<span className="avatar sm">MH</span>} label="SNMPv3 on N9k" meta="1h"/>
        <Row ico={<span className="avatar sm">SK</span>} label="Alarm escalation playbook" meta="2h"/>
        <Row ico={<span className="avatar sm">RS</span>} label="BGP graceful restart timers" meta="1d"/>
        <Row ico={<span className="avatar sm">SK</span>} label="PoE+ budget calc" meta="2d"/>
        <Row ico={<span className="avatar sm">MH</span>} label="QoS policy for VoIP edge" meta="3d"/>
        <Row ico={<span className="avatar sm">RS</span>} label="Loopback addressing scheme" meta="1w"/>
        <div style={{marginTop:'auto', padding:'10px 14px', borderTop:'1px solid var(--ink)', display:'flex', alignItems:'center', gap:8}}>
          <span className="avatar sm">RS</span>
          <span style={{fontSize:11, flex:1}}>Ryan S.</span>
        </div>
      </div>
      <div className="col">
        <SHead title="ifHCInOctets OID lookup" solid right={<><span className="chip">1,248 files</span><span className="chip"><span className="avatar sm">RS</span><span className="avatar sm">MH</span></span></>}/>
        <div className="thread">
          <MsgUser>What's the OID for ifHCInOctets and which MIB defines it?</MsgUser>
          <MsgAssistant citations={SAMPLE_CITATIONS}>
            <p style={{margin:0}}><code style={{background:'var(--paper-2)', padding:'1px 4px'}}>ifHCInOctets</code> is defined in <b>IF-MIB</b> at OID <code style={{background:'var(--paper-2)', padding:'1px 4px'}}>1.3.6.1.2.1.31.1.1.1.6</code><Sup n={1}/>. 64-bit counter; preferred over 32-bit <code>ifInOctets</code> on high-speed links<Sup n={2}/>. <span className="chip" style={{cursor:'pointer'}}>▤ open sources →</span></p>
          </MsgAssistant>
        </div>
        <Composer />
      </div>
      <div className="col right">
        <div className="tabs">
          <span className="tab">Instructions</span>
          <span className="tab">Users</span>
          <span className="tab active">Files</span>
        </div>
        <div style={{padding:'12px 14px', borderBottom:'1px solid var(--ink)', display:'flex', gap:6}}>
          <input className="input" placeholder="⌕ search 1,248 files" readOnly style={{flex:1}}/>
          <button className="btn primary sm">+</button>
        </div>
        <div style={{flex:1, overflow:'hidden', padding:'8px 14px'}}>
          <div className="tiny" style={{marginTop:4, marginBottom:4}}>Today · 3</div>
          {SAMPLE_FILES_FLAT.slice(0,3).map((f,i) => <FRow key={i} {...f}/>)}
          <div className="tiny" style={{marginTop:10, marginBottom:4}}>This week · 4</div>
          {SAMPLE_FILES_FLAT.slice(3,7).map((f,i) => <FRow key={i} {...f}/>)}
          <div className="tiny" style={{marginTop:10, marginBottom:4}}>Older · 1,241</div>
          {SAMPLE_FILES_FLAT.slice(7).map((f,i) => <FRow key={i} {...f}/>)}
        </div>
      </div>

      <Note top={60} left={70} arrow="tl" w={150}>
        Icon-only rail keeps the project list narrow; saves ~80px vs Direction A.
      </Note>
      <Note top={70} right={360} arrow="tr" w={170}>
        Right panel as <b>tabs</b> — one section visible at a time. Less scrolling, more clicking.
      </Note>
      <Note top={210} left={325} arrow="tl" w={170} tip>
        Each session row carries an author avatar — no separate filter needed.
      </Note>
      <Note top={420} left={620} arrow="tl" w={170}>
        Citations link to a <b>side-pinned</b> source panel that slides over the chat (not shown).
      </Note>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Direction C — PALETTE-DRIVEN
// • Sidebar: minimal — just current project's sessions
// • Right panel: floating drawer, summoned by button
// • Citations: hover preview tooltip
// • Project picker: ⌘K command palette (overlay shown)
// • History: toggle pill (Mine / All)
// • Files: search-first
// ────────────────────────────────────────────────────────────
function DirectionC() {
  return (
    <div className="wf grid-mini" style={{height: 760}}>
      <TopBar project="Cisco MIB Reference" user="RS"
        extra={<>
          <button className="btn sm">⌘K Switch project</button>
          <button className="btn sm">▤ Project context</button>
        </>}/>
      <div className="col">
        <div style={{padding:'14px 14px 6px', display:'flex', gap:6, alignItems:'center'}}>
          <span className="chip" style={{flex:1, justifyContent:'flex-start'}}>▣ Cisco MIB Reference</span>
          <button className="btn icon sm">▾</button>
        </div>
        <div style={{padding:'2px 14px 10px'}}>
          <button className="btn block primary">+ New chat</button>
        </div>
        <SHead title="Sessions" right={<>
          <span className="chip solid">Mine</span>
          <span className="chip">All</span>
        </>}/>
        <Row active ico="◫" label="ifHCInOctets OID lookup" meta="4m"/>
        <Row ico="◫" label="BGP graceful restart timers" meta="1d"/>
        <Row ico="◫" label="Loopback addressing scheme" meta="1w"/>
        <Row ico="◫" label="VRF leak audit Q1" meta="2w"/>
        <div style={{marginTop:'auto', padding:'10px 14px', borderTop:'1px solid var(--ink)', display:'flex', alignItems:'center', gap:8}}>
          <span className="avatar sm">RS</span>
          <span style={{fontSize:11, flex:1}}>Ryan S.</span>
          <span className="tiny">⌘K to navigate</span>
        </div>
      </div>
      <div className="col">
        <div className="thread" style={{maxWidth:900, margin:'0 auto', width:'100%'}}>
          <MsgUser>What's the OID for ifHCInOctets and which MIB defines it?</MsgUser>
          <MsgAssistant citations={[]}>
            <p style={{margin:0}}>
              <code style={{background:'var(--paper-2)', padding:'1px 4px'}}>ifHCInOctets</code> is defined in <b>IF-MIB</b> at OID <code style={{background:'var(--paper-2)', padding:'1px 4px'}}>1.3.6.1.2.1.31.1.1.1.6</code><Sup n={1}/>. 64-bit counter for received octets — preferred over 32-bit <code>ifInOctets</code> on high-speed links where wrap is fast<Sup n={2}/>.
            </p>
          </MsgAssistant>
        </div>
        <Composer />
      </div>

      {/* command palette overlay */}
      <div className="palette-back">
        <div className="palette">
          <div className="pin">
            <span className="muted">⌘K</span>
            <input defaultValue="cis" placeholder="Jump to project, chat, file, or command…" readOnly/>
            <span className="kbd">esc</span>
          </div>
          <div className="plist">
            <div className="pgroup">Projects</div>
            <div className="pitem sel">
              <span>▣</span>
              <span style={{flex:1}}>Cisco MIB Reference <span className="muted small">· 1,248 files</span></span>
              <span className="k">↵</span>
            </div>
            <div className="pitem">
              <span>▣</span>
              <span style={{flex:1}}>WECC Compliance Docs <span className="muted small">· 87 files</span></span>
            </div>
            <div className="pgroup">Recent chats</div>
            <div className="pitem">
              <span>◫</span>
              <span style={{flex:1}}>SNMPv3 on N9k <span className="muted small">· MIB Reference</span></span>
            </div>
            <div className="pgroup">Commands</div>
            <div className="pitem">
              <span>▤</span>
              <span style={{flex:1}}>Open project context drawer</span>
              <span className="k">⌘.</span>
            </div>
            <div className="pitem">
              <span>＋</span>
              <span style={{flex:1}}>Create new project…</span>
              <span className="k">⌘N</span>
            </div>
          </div>
        </div>
      </div>

      {/* hover-citation preview (mocked) */}
      <div style={{position:'absolute', top:280, left:540, width:280, background:'var(--paper)', border:'1px solid var(--ink)', boxShadow:'2px 2px 0 var(--ink)', padding:'10px 12px', fontSize:10, zIndex:6}}>
        <div className="tiny" style={{marginBottom:4}}>IF-MIB.txt · lines 410–418</div>
        <div style={{fontFamily:'var(--mono)', lineHeight:1.5, color:'var(--ink-2)'}}>
          ifHCInOctets OBJECT-TYPE<br/>
          &nbsp;&nbsp;SYNTAX Counter64<br/>
          &nbsp;&nbsp;MAX-ACCESS read-only<br/>
          &nbsp;&nbsp;STATUS current<br/>
          &nbsp;&nbsp;DESCRIPTION "The total number of octets received..."<br/>
          &nbsp;&nbsp;::= {'{ ifXEntry 6 }'}
        </div>
        <div className="tiny" style={{marginTop:6, textAlign:'right'}}>open file →</div>
      </div>

      <Note top={290} left={420} arrow="bl" w={150} tip>
        Hovering <span className="kbd">[1]</span> reveals the cited snippet — no chip clutter.
      </Note>
      <Note top={100} right={20} arrow="tr" w={170}>
        Right panel hidden by default — open via "Project context" or <span className="kbd">⌘.</span>
      </Note>
      <Note top={150} left={170} arrow="tl" w={150}>
        Sidebar only shows the current project. Switching is a palette task, not a list scan.
      </Note>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Direction D — SPLIT INSPECTOR
// • Sidebar: single tree (same as A)
// • Right panel: split — top half compact Instructions+Users, bottom large Files (most-used)
// • Citations: footnote section at bottom of message
// • Project picker: top switcher dropdown
// • History: filter chip row
// • Files: grouped by section / type
// ────────────────────────────────────────────────────────────
function DirectionD() {
  const projects = [{
    name: 'Cisco MIB Reference', open: true, active: true, fileCount: 1248, filter: 'all',
    sessions: [
      { title: 'ifHCInOctets OID lookup', when: 'you · 4m', active: true },
      { title: 'SNMPv3 on N9k', when: 'mh · 1h' },
      { title: 'Alarm escalation playbook', when: 'sk · 2h' },
    ]
  }];
  return (
    <div className="wf grid-split" style={{height: 760}}>
      <TopBar project="Cisco MIB Reference ▾" user="RS" />
      <SBTree projects={projects} />
      <div className="col">
        <SHead title="ifHCInOctets OID lookup" solid right={<>
          <span className="chip">1,248 files</span>
          <span className="chip"><span className="avatar sm">MH</span></span>
        </>}/>
        <div className="thread">
          <MsgUser>What's the OID for ifHCInOctets and which MIB defines it?</MsgUser>
          <MsgAssistant
            style="footnotes"
            footnotes={<>
              <div>[1] IF-MIB.txt · lines 410–418 — <span className="muted">"ifHCInOctets OBJECT-TYPE SYNTAX Counter64…"</span></div>
              <div>[2] cisco-ios-cli-ref-15.4.pdf · p.84 — <span className="muted">"on high-speed (≥20 Gbps) interfaces the 32-bit counter wraps…"</span></div>
            </>}
          >
            <p style={{margin:0}}><code style={{background:'var(--paper-2)', padding:'1px 4px'}}>ifHCInOctets</code> is defined in <b>IF-MIB</b> at OID <code style={{background:'var(--paper-2)', padding:'1px 4px'}}>1.3.6.1.2.1.31.1.1.1.6</code><Sup n={1}/>. 64-bit counter for received octets — preferred over 32-bit <code>ifInOctets</code> on high-speed links where wrap is fast<Sup n={2}/>.</p>
          </MsgAssistant>
        </div>
        <Composer />
      </div>
      <div className="col right">
        <div className="topbar" style={{height:36, fontSize:10}}>
          <span className="brand" style={{fontSize:10}}>Project context</span>
          <span className="sep"/>
          <button className="btn icon sm" title="collapse">›</button>
        </div>
        <div className="split-top">
          <Acc title="Instructions" meta="saved · 1.2k" open>
            <div className="input" style={{minHeight:60, whiteSpace:'normal', fontSize:11, lineHeight:1.5}}>
              {SAMPLE_INSTRUCTIONS.slice(0,140)}…
            </div>
          </Acc>
          <Acc title="Users" meta="3" open>
            <div style={{display:'flex', alignItems:'center', gap:6, flexWrap:'wrap'}}>
              {SAMPLE_USERS.map((u,i) => (
                <span key={i} className="chip" style={{padding:'2px 8px'}}>
                  <span className="avatar sm">{u.initials}</span>
                  {u.name.split(' ')[0]}
                  <span className="muted">· {u.role}</span>
                </span>
              ))}
              <span className="chip dashed">+ invite</span>
            </div>
          </Acc>
        </div>
        <div className="split-bot">
          <div className="shead solid">
            <span>Files · 1,248</span>
            <span className="right">
              <button className="btn primary sm">+ Upload</button>
            </span>
          </div>
          <div style={{padding:'8px 14px', borderBottom:'1px solid var(--ink)', display:'flex', gap:6, flexWrap:'wrap'}}>
            <input className="input" placeholder="⌕ search files" readOnly style={{flex:'1 1 100%'}}/>
            <span className="chip solid">All</span>
            <span className="chip">MIBs · 47</span>
            <span className="chip">PDFs · 218</span>
            <span className="chip">Markdown · 124</span>
          </div>
          <div style={{flex:1, overflow:'hidden', padding:'8px 14px'}}>
            <div className="tiny" style={{marginTop:4, marginBottom:4}}>Pinned · 2</div>
            {SAMPLE_FILES_FLAT.slice(0,2).map((f,i) => <FRow key={i} {...f}/>)}
            <div className="tiny" style={{marginTop:8, marginBottom:4}}>Recently added</div>
            {SAMPLE_FILES_FLAT.slice(2,8).map((f,i) => <FRow key={i} {...f}/>)}
          </div>
        </div>
      </div>

      <Note top={75} right={350} arrow="tr" w={160}>
        Right panel <b>split</b> — instructions + users stay compact at top; <br/>files get the lion's share of the column.
      </Note>
      <Note top={310} left={320} arrow="tl" w={180}>
        Citations as <b>footnotes</b> with text excerpts — quicker to scan than chips.
      </Note>
      <Note top={500} right={20} arrow="tr" w={170} tip>
        File library faceted by type (MIBs / PDFs / etc.). No artificial cap UI.
      </Note>
    </div>
  );
}

Object.assign(window, { DirectionA, DirectionB, DirectionC, DirectionD });
