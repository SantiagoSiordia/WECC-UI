// WECC RAG Hi-Fi — the four hero frames.
// Each frame is a single full screen, dark theme.

// Sample sidebar projects used across frames
const HIFI_PROJECTS = [
  {
    name: 'Cisco MIB Reference', open: true, active: true, fileCount: 1248,
    sessions: [
      { id: 'a1', title: 'ifHCInOctets OID lookup', when: 'you · 4m', active: true },
      { id: 'a2', title: 'SNMPv3 on N9k', when: 'mh · 1h' },
      { id: 'a3', title: 'Alarm escalation playbook', when: 'sk · 2h' },
      { id: 'a4', title: 'BGP graceful restart timers', when: 'you · yest' },
    ]
  },
  { name: 'WECC Compliance Docs', open: false, fileCount: 87 },
  { name: 'Field Tech Runbooks', open: false, fileCount: 1240 },
];

// ─────────────────────────────────────────────────────────────────
//  FRAME 1 — COLD START
//  A brand-new account. No projects yet, big quiet empty state.
// ─────────────────────────────────────────────────────────────────
function FrameColdStart() {
  return (
    <div className="scr no-right">
      <TopBar project="No project" user={{ initials: 'RS', color: 'u-1' }} />

      {/* Slim sidebar — empty list */}
      <div className="sb">
        <div className="sb-top">
          <div className="sb-search">
            <span className="ic"><Icon name="search" size={12}/></span>
            <input placeholder="Search projects & chats…"/>
          </div>
          <button className="sb-newproj"><Icon name="plus" size={11}/>New project</button>
        </div>
        <div className="sb-list">
          <div className="sb-label">
            <span>Projects</span>
            <span style={{fontFamily:'var(--mono)', fontSize:10, color:'var(--whisper)'}}>0</span>
          </div>
          <div style={{
            margin:'8px 8px 0',
            padding:'14px 12px',
            border:'1px dashed var(--hair)',
            borderRadius:6,
            fontFamily:'var(--mono)',
            fontSize:10.5,
            lineHeight:1.6,
            color:'var(--muted)'
          }}>
            <div style={{color:'var(--ink-2)', marginBottom:4}}>No projects yet.</div>
            Create one to start asking grounded questions over your team's docs.
          </div>
        </div>
        <div className="sb-foot">
          <span className="avatar sm u-1">RS</span>
          <div className="who">
            <div className="nm">Ryan Sandoval</div>
            <div className="rl">admin</div>
          </div>
          <button className="ico-btn"><Icon name="settings" size={12}/></button>
        </div>
      </div>

      {/* Hero zen state */}
      <div className="chat">
        <div className="zen" style={{flex:1}}>
          <span className="mark">WECC&nbsp;RAG · ops</span>
          <h1 style={{textWrap:'balance'}}>Project-scoped chat for your team's documents.</h1>
          <p className="sub">
            Group docs into projects, set instructions, share with teammates.
            Ask questions and get answers grounded in your files — with citations.
          </p>

          <div className="cta-row">
            <button className="cta"><Icon name="plus" size={12}/>Create your first project</button>
            <button className="cta-ghost"><Icon name="cmd" size={11}/>Quick start<span className="k">⌘ K</span></button>
          </div>

          {/* Three short cards explaining the loop */}
          <div style={{
            marginTop:36,
            display:'grid',
            gridTemplateColumns:'repeat(3, 220px)',
            gap:12,
            textAlign:'left'
          }}>
            {[
              { n: '01', t: 'Make a project', s: 'Bucket of files + instructions + members. Unlimited files per project.' },
              { n: '02', t: 'Drop in your docs', s: 'PDFs, Markdown, MIB files, runbooks. Indexed within seconds.' },
              { n: '03', t: 'Ask, with citations', s: 'Every answer cites the snippets it came from. Click to open the source.' },
            ].map(c => (
              <div key={c.n} style={{
                background:'var(--surface)',
                border:'1px solid var(--hair)',
                borderRadius:6,
                padding:'14px 16px',
              }}>
                <div style={{fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.14em', color:'var(--accent)', marginBottom:8}}>{c.n}</div>
                <div style={{fontWeight:500, fontSize:13.5, marginBottom:4}}>{c.t}</div>
                <div style={{fontSize:12, color:'var(--muted)', lineHeight:1.55}}>{c.s}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  FRAME 2 — PROJECT CREATE + FIRST UPLOAD
//  Modal closed; a freshly-created project showing indexing state.
//  We show the moment AFTER they hit "Create" — files are indexing.
// ─────────────────────────────────────────────────────────────────
function FrameProjectCreate() {
  const projects = [
    { name: 'Q2 Switch Refresh', open: true, active: true, fileCount: 8, sessions: [] },
    { name: 'Cisco MIB Reference', open: false, fileCount: 1248 },
  ];

  return (
    <div className="scr">
      <TopBar project="Q2 Switch Refresh" user={{ initials: 'RS', color: 'u-1' }} />

      <Sidebar projects={projects}/>

      {/* Center — empty thread + indexing card */}
      <div className="chat">
        <div className="chat-head">
          <span className="title">Q2 Switch Refresh</span>
          <div className="meta">
            <span className="chip">1 member</span>
          </div>
        </div>

        <div style={{flex:1, overflow:'hidden', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'30px 24px', gap:18}}>
          <div style={{textAlign:'center', maxWidth:520, display:'flex', flexDirection:'column', gap:8}}>
            <div className="tiny" style={{color:'var(--accent)'}}>New project · ready in a moment</div>
            <h2 style={{fontSize:22, fontWeight:500, letterSpacing:'-0.01em', margin:0}}>Indexing your docs.</h2>
            <p style={{color:'var(--muted)', fontSize:13, margin:0, lineHeight:1.55}}>
              You can start chatting as soon as the first file is ready. New files keep indexing in the background.
            </p>
          </div>

          {/* Indexing card */}
          <div className="idx-card">
            <div className="idx-head">
              <span className="spin"/>
              <span>Indexing · 5 of 8 files</span>
              <span style={{marginLeft:'auto', color:'var(--whisper)'}}>~ 12s remaining</span>
            </div>
            <div className="idx-bar"><div className="fill" style={{width:'62%'}}/></div>
            <div className="idx-files">
              <div className="idx-line"><span className="nm">cisco-ios-cli-ref-15.4.pdf</span><span style={{fontFamily:'var(--mono)', fontSize:9, color:'var(--whisper)'}}>4.2 MB</span><span className="st ok">ok</span></div>
              <div className="idx-line"><span className="nm">CISCO-IF-EXTENSION-MIB.txt</span><span style={{fontFamily:'var(--mono)', fontSize:9, color:'var(--whisper)'}}>180 KB</span><span className="st ok">ok</span></div>
              <div className="idx-line"><span className="nm">IF-MIB.txt</span><span style={{fontFamily:'var(--mono)', fontSize:9, color:'var(--whisper)'}}>74 KB</span><span className="st ok">ok</span></div>
              <div className="idx-line"><span className="nm">CISCO-PROCESS-MIB.txt</span><span style={{fontFamily:'var(--mono)', fontSize:9, color:'var(--whisper)'}}>94 KB</span><span className="st ok">ok</span></div>
              <div className="idx-line"><span className="nm">Nexus-9000-snmp-cfg.pdf</span><span style={{fontFamily:'var(--mono)', fontSize:9, color:'var(--whisper)'}}>2.1 MB</span><span className="st ok">ok</span></div>
              <div className="idx-line"><span className="nm">WECC-ops-runbook-v3.docx</span><span style={{fontFamily:'var(--mono)', fontSize:9, color:'var(--whisper)'}}>1.1 MB</span><span className="st proc"><span style={{width:6,height:6,borderRadius:'50%',background:'var(--warn)',display:'inline-block'}}/>chunking</span></div>
              <div className="idx-line"><span className="nm">snmp-v3-deployment-notes.md</span><span style={{fontFamily:'var(--mono)', fontSize:9, color:'var(--whisper)'}}>32 KB</span><span className="st queued">queued</span></div>
              <div className="idx-line"><span className="nm">CIP-007 compliance checklist.pdf</span><span style={{fontFamily:'var(--mono)', fontSize:9, color:'var(--whisper)'}}>780 KB</span><span className="st queued">queued</span></div>
            </div>
          </div>

          <div style={{display:'flex', gap:8}}>
            <button style={{
              background:'var(--ink)', color:'var(--bg)', border:'none',
              borderRadius:4, padding:'7px 14px', fontSize:12, fontWeight:500,
              display:'inline-flex', alignItems:'center', gap:6,
            }}><Icon name="upload" size={11}/>Add more files</button>
            <button style={{
              background:'transparent', border:'1px solid var(--hair)', color:'var(--ink-2)',
              borderRadius:4, padding:'7px 14px', fontSize:12, fontFamily:'var(--mono)',
              display:'inline-flex', alignItems:'center', gap:6,
            }}><Icon name="users" size={11}/>Invite teammates</button>
          </div>
        </div>

        {/* Disabled composer */}
        <div className="composer">
          <div className="composer-inner">
            <div className="cbox" style={{opacity:0.7}}>
              <textarea disabled placeholder="Wait for the first file to finish indexing…" rows={2} style={{minHeight:32}}/>
              <div className="crow">
                <button className="tool" disabled style={{opacity:0.5}} title="Add">+</button>
                <button className="send" disabled>↑</button>
              </div>
            </div>
            <div className="cfoot">Grounded in 5 of 8 files · more coming online</div>
          </div>
        </div>
      </div>

      {/* Right panel — Instructions populated, Users + Files visible */}
      <RightPanel>
        <Accordion title="Instructions" meta="142 chars" open>
          <textarea
            className="instr-input"
            defaultValue="You are an SNMP / network ops assistant for the Q2 switch refresh. Cite MIB names and exact OIDs. Prefer terse, technical Markdown."
          />
          <div className="instr-save">
            <span className="saved"><span style={{width:6,height:6,borderRadius:'50%',background:'var(--ok)',display:'inline-block'}}/>Saved · 12s ago</span>
            <span>auto-save</span>
          </div>
        </Accordion>

        <Accordion title="Members" meta="1" open headExtra={<button className="acc-add iconbtn" title="Invite" style={{marginLeft:'auto', border:'none', background:'transparent'}}>+</button>}>
          <UserRow initials="RS" color="u-1" name="Ryan Sandoval" email="ryan@wecc.local" you/>
        </Accordion>

        <Accordion title="Files" meta="8" open>
          <div className="files-tools">
            <input placeholder="Search files…"/>
            <button style={{background:'var(--ink)', color:'var(--bg)', border:'none', borderRadius:4, padding:'4px 10px', fontSize:11, fontWeight:500}}>
              + Upload
            </button>
          </div>
          <FileRow name="cisco-ios-cli-ref-15.4.pdf" size="4.2 MB"/>
          <FileRow name="CISCO-IF-EXTENSION-MIB.txt" size="180 KB"/>
          <FileRow name="IF-MIB.txt" size="74 KB"/>
          <FileRow name="CISCO-PROCESS-MIB.txt" size="94 KB"/>
          <FileRow name="Nexus-9000-snmp-cfg.pdf" size="2.1 MB"/>
          <FileRow name="WECC-ops-runbook-v3.docx" size="1.1 MB" status="proc"/>
        </Accordion>
      </RightPanel>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  FRAME 3 — PROJECT SWITCHER (⌘K palette)
//  Palette open over a working session.
// ─────────────────────────────────────────────────────────────────
function FrameProjectSwitcher() {
  return (
    <div className="scr" style={{position:'relative'}}>
      <TopBar project="Cisco MIB Reference" session="ifHCInOctets OID lookup" user={{ initials: 'RS', color: 'u-1' }} />

      <Sidebar projects={HIFI_PROJECTS} activeSession="a1"/>

      <div className="chat">
        <div className="chat-head">
          <span className="title">ifHCInOctets OID lookup</span>
        </div>
        <div className="thread">
          <div className="thread-inner" style={{opacity:0.5}}>
            <div className="msg user">
              <div className="who">YOU · 4M</div>
              <div className="body">What OID returns the cumulative inbound octet count on an interface, and how is it different from ifInOctets?</div>
            </div>
            <div className="msg assistant">
              <div className="who">WECC RAG</div>
              <div className="body">
                <p><code>ifHCInOctets</code> from <strong>IF-MIB</strong> is the high-capacity counter for inbound octets per interface <span className="cite">1</span>. Path: <code>1.3.6.1.2.1.31.1.1.1.6</code>.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="composer">
          <div className="composer-inner">
            <div className="cbox">
              <textarea placeholder="Ask anything about this project…" rows={1}/>
              <div className="crow">
                <button className="tool" title="Add">+</button>
                <button className="send">↑</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <RightPanel>
        <Accordion title="Instructions" meta="218 chars">
          <></>
        </Accordion>
        <Accordion title="Members" meta="3">
          <></>
        </Accordion>
        <Accordion title="Files" meta="1248">
          <></>
        </Accordion>
      </RightPanel>

      {/* Palette overlay */}
      <div className="pal-back">
        <div className="palette">
          <div className="pal-input">
            <span className="ic"><Icon name="search" size={14}/></span>
            <input placeholder="Jump to project, chat, file, or command…" defaultValue="cisc"/>
            <span className="esc">esc</span>
          </div>
          <div className="pal-list">
            <div className="pal-group">Projects · 3</div>
            <div className="pal-item sel">
              <span className="ic"><Icon name="folder" size={13}/></span>
              <div className="info">
                <div className="nm"><b style={{color:'var(--accent-ink)'}}>Cisc</b>o MIB Reference</div>
                <div className="sub">1,248 files · 3 members · last active 4m</div>
              </div>
              <span className="meta">current<span className="k">↵</span></span>
            </div>
            <div className="pal-item">
              <span className="ic"><Icon name="folder" size={13}/></span>
              <div className="info">
                <div className="nm">WECC Compliance Docs</div>
                <div className="sub">87 files · 5 members · last active 2h</div>
              </div>
            </div>
            <div className="pal-item">
              <span className="ic"><Icon name="folder" size={13}/></span>
              <div className="info">
                <div className="nm">Field Tech Runbooks</div>
                <div className="sub">1,240 files · 12 members · last active yest</div>
              </div>
            </div>

            <div className="pal-group">Chats · 2</div>
            <div className="pal-item">
              <span className="ic"><Icon name="chat" size={13}/></span>
              <div className="info">
                <div className="nm">SNMPv3 on N9k</div>
                <div className="sub">Cisco MIB Reference · mh · 1h ago</div>
              </div>
            </div>
            <div className="pal-item">
              <span className="ic"><Icon name="chat" size={13}/></span>
              <div className="info">
                <div className="nm">BGP graceful restart timers</div>
                <div className="sub">Cisco MIB Reference · you · yesterday</div>
              </div>
            </div>

            <div className="pal-group">Actions</div>
            <div className="pal-item">
              <span className="ic"><Icon name="plus" size={13}/></span>
              <div className="info"><div className="nm">Create new project</div></div>
              <span className="k">⌘ N</span>
            </div>
            <div className="pal-item">
              <span className="ic"><Icon name="upload" size={13}/></span>
              <div className="info"><div className="nm">Upload files to current project</div></div>
              <span className="k">⌘ U</span>
            </div>
          </div>
          <div className="pal-foot">
            <span><span className="kbd">↑</span><span className="kbd">↓</span> navigate</span>
            <span><span className="kbd">↵</span> open</span>
            <span><span className="kbd">⌘ ↵</span> open in new tab</span>
            <span style={{marginLeft:'auto'}}>esc to close</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  FRAME 4 — COLLABORATOR JOINS / SHARING
//  Right panel: Members open with invite in progress, plus a quiet
//  in-app notice that someone just joined.
// ─────────────────────────────────────────────────────────────────
function FrameCollabJoins() {
  return (
    <div className="scr" style={{position:'relative'}}>
      <TopBar project="WECC Compliance Docs" session="CIP-007 R2 patching gaps" user={{ initials: 'RS', color: 'u-1' }} />

      <Sidebar
        projects={[
          { name: 'WECC Compliance Docs', open: true, active: true, fileCount: 87, sessions: [
            { id: 'b1', title: 'CIP-007 R2 patching gaps', when: 'you · 6m', active: true },
            { id: 'b2', title: 'Evidence templates Q1', when: 'mh · 1d' },
            { id: 'b3', title: 'Audit prep checklist', when: 'sk · 3d' },
          ]},
          { name: 'Cisco MIB Reference', open: false, fileCount: 1248 },
          { name: 'Field Tech Runbooks', open: false, fileCount: 1240 },
        ]}
        activeSession="b1"
      />

      <div className="chat">
        <div className="chat-head">
          <span className="title">CIP-007 R2 patching gaps</span>
          <div className="meta">
            <span className="chip"><span className="avatar xs u-1" style={{marginRight:2}}>RS</span><span className="avatar xs u-2" style={{marginLeft:-6, marginRight:2}}>MH</span><span className="avatar xs u-3" style={{marginLeft:-6, marginRight:4}}>SK</span><span className="avatar xs u-4" style={{marginLeft:-6, marginRight:4, border:'1px solid var(--accent-line)'}}>EP</span>4 members</span>
          </div>
        </div>

        <div className="thread">
          <div className="thread-inner">
            <div className="msg user">
              <div className="who">YOU · 6M</div>
              <div className="body">Which CIP-007 R2 sub-requirements does the patching attestation cover, and which are still gaps for us?</div>
            </div>
            <div className="msg assistant">
              <div className="who">WECC RAG</div>
              <div className="body">
                <p>
                  Per the attestation, <strong>R2.1, R2.2, and R2.3</strong> are covered — patch source identification, monthly evaluation, and the 35-day remediation window <span className="cite">1</span>. Sub-requirements <strong>R2.4</strong> (mitigation plan when patch deferred) is partially covered: the workflow exists, but evidence retention isn't documented <span className="cite">2</span>.
                </p>
                <p>Gaps that still need an owner:</p>
                <ul>
                  <li><strong>R2.4 evidence retention</strong> — pick a system of record (SharePoint vs. ServiceNow).</li>
                  <li><strong>R2.5 dispute process</strong> — currently undocumented per the runbook.</li>
                </ul>
                <div className="sources-row">
                  <span className="sources-label">Sources</span>
                  <span className="src-chip"><span className="n">1</span>CIP-007 attestation 2025.pdf · p.4</span>
                  <span className="src-chip"><span className="n">2</span>WECC-ops-runbook-v3.docx · §6.2</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="composer">
          <div className="composer-inner">
            <div className="cbox">
              <textarea placeholder="Reply…" rows={1}/>
              <div className="crow">
                <button className="tool" title="Add">+</button>
                <button className="send">↑</button>
              </div>
            </div>
            <div className="cfoot">Grounded in 87 files · everything you ask is shared with project members</div>
          </div>
        </div>
      </div>

      <RightPanel>
        <Accordion title="Instructions" meta="180 chars">
          <></>
        </Accordion>
        <Accordion title="Members" meta="4" open headExtra={<button className="acc-add iconbtn" title="Invite" style={{marginLeft:'auto', border:'none', background:'transparent'}}>+</button>}>
          <UserRow initials="RS" color="u-1" name="Ryan Sandoval" email="ryan@wecc.local" you/>
          <UserRow initials="MH" color="u-2" name="Muhammad Haque" email="muhammad@wecc.local"/>
          <UserRow initials="SK" color="u-3" name="Santi Kowalski" email="santi@wecc.local"/>
          <UserRow initials="EP" color="u-4" name="Eli Park" email="eli@wecc.local"/>
        </Accordion>
        <Accordion title="Files" meta="87">
          <></>
        </Accordion>
      </RightPanel>

      {/* In-app notice — collaborator just joined */}
      <div className="notice">
        <span className="avatar sm u-4" style={{border:'1px solid var(--accent-line)'}}>EP</span>
        <span><span className="ttl">Eli Park</span> joined the project</span>
        <span style={{fontFamily:'var(--mono)', fontSize:10, color:'var(--whisper)'}}>· they'll see this chat from the start</span>
        <span className="kbd">esc</span>
      </div>
    </div>
  );
}

Object.assign(window, { FrameColdStart, FrameProjectCreate, FrameProjectSwitcher, FrameCollabJoins });
