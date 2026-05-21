// demo-views.jsx — three demo-specific views used by the orchestrator.
//   1. SourceDrawer     — citation drilldown (slides in from right)
//   2. FileLibrary      — files-at-scale overlay (search + filters + pin)
//   3. MobileInset      — phone-shape preview of the same chat

// ── SourceDrawer ──────────────────────────────────────────────────────
// Visual: dark side drawer, document title + locator, a fake page-shaped
// pane with the cited passage highlighted in accent. Closes on ✕ or esc.
function SourceDrawer({ open, snipId, onClose }) {
  const snip = snipId && SNIPPETS[snipId];

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!snip) return null;

  // Split the snippet into pre/highlight/post — first non-empty line is the headline,
  // we highlight the whole body inside the page. To make it more interesting we
  // highlight the second sentence/clause if present.
  const text = snip.text;

  return (
    <div className={`src-drawer ${open ? 'open' : ''}`}>
      <div className="src-drawer-head">
        <div style={{display:'flex', alignItems:'center', gap:8, minWidth:0}}>
          <span className="src-pill">Source</span>
          <div style={{minWidth:0}}>
            <div className="src-file" title={snip.file}>{snip.file}</div>
            <div className="src-loc">{snip.loc}</div>
          </div>
        </div>
        <div style={{display:'flex', gap:6}}>
          <button className="src-btn" title="Open file in new tab">↗ open file</button>
          <button className="src-btn" title="Close" onClick={onClose}>✕</button>
        </div>
      </div>

      <div className="src-drawer-body">
        <div className="src-page">
          <div className="src-page-head">
            <span className="src-page-ttl">{snip.file.replace(/\.(pdf|docx?|md|txt|xlsx)$/i, '')}</span>
            <span className="src-page-loc">{snip.loc}</span>
          </div>

          {/* Fake doc context above the highlight */}
          <div className="src-context above">
            <span className="src-ellipsis">…</span>
            <p>The preceding paragraphs describe the protocol's failure-recovery semantics in general terms; we now turn to the specific invalidation method recited in the patent's principal claim.</p>
          </div>

          {/* Highlighted passage */}
          <div className="src-highlight">
            <span className="src-mark"/>
            <pre>{text}</pre>
          </div>

          {/* Context below */}
          <div className="src-context below">
            <p>The dependent claims further constrain (a) the quorum-selection method, (b) the consistency-hash partitioning, and (c) the acknowledgement timeout.</p>
            <span className="src-ellipsis">…</span>
          </div>
        </div>
      </div>

      <div className="src-drawer-foot">
        <div className="src-related-label">RELATED IN THIS PROJECT</div>
        <div className="src-related">
          <button className="src-rel-chip"><span className="n">1</span> US-9,847,231 — claim 4</button>
          <button className="src-rel-chip"><span className="n">2</span> Schedule A · Cache Coordination Field</button>
          <button className="src-rel-chip"><span className="n">3</span> Atlas Cache datasheet · §2</button>
        </div>
      </div>
    </div>
  );
}

// ── FileLibrary ───────────────────────────────────────────────────────
// Full-page overlay showing every file in the active project with search,
// faceted kind filter, and pin status. Driven externally; close via ✕.
function FileLibrary({ open, project, onClose }) {
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState('all');
  const [pinnedOnly, setPinnedOnly] = useState(false);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!project) return null;

  // Synthesize a larger file roster around the project's real files,
  // so the library reads as "at scale".
  const seedFiles = project.files || [];
  const total = project.fileCountTotal || seedFiles.length;

  // Faux additional files for visual density
  const FAUX_KINDS = ['patent','contract','letter','minutes','financial','marketing'];
  const fauxCount = Math.max(0, total - seedFiles.length);
  const fauxFiles = [];
  for (let i = 0; i < Math.min(fauxCount, 60); i++) {
    const k = FAUX_KINDS[i % FAUX_KINDS.length];
    const stems = {
      patent: ['EP-3-217-901','US-9,124,338','WO/2019/103441','US-10,887,116','EP-3-441-208'],
      contract: ['MSA-2021-ProcessCore','SOW-2023-04-DataPipe','NDA-2019-Quorum','License-2020-Vortex','Reseller-2022-Halcyon'],
      letter: ['C&D-Alphaware-2023','Demand-letter-Riverside-2024','Tolling-agreement-Sept-2023','Settlement-correspondence-Vortex'],
      minutes: ['Board-2023-Q1','Board-2023-Q2','Board-2023-Q3','Audit-cmte-2023-Q4','Comp-cmte-2024-Q1'],
      financial: ['FY23-audited-statements','FY22-tax-return','Cap-table-2024-08','Revenue-build-2024-Q3','OpEx-detail-2024'],
      marketing: ['Product-brief-Atlas','Case-study-Bigwave','Investor-deck-2024','Whitepaper-cache-2023'],
    }[k];
    const stem = stems[i % stems.length];
    fauxFiles.push({
      name: `${stem}.${k === 'marketing' ? 'pdf' : k === 'financial' && i % 2 ? 'xlsx' : 'pdf'}`,
      size: `${(0.2 + (i % 7) * 0.8).toFixed(1)} MB`,
      status: 'ok',
      added: i < 6 ? 'today' : i < 18 ? 'this week' : 'older',
      pinned: false,
      kind: k,
    });
  }
  const allFiles = [...seedFiles, ...fauxFiles];

  const facets = ['all','patent','contract','letter','minutes','financial','marketing'];
  const counts = facets.reduce((m, f) => {
    m[f] = f === 'all' ? allFiles.length : allFiles.filter(x => x.kind === f).length;
    return m;
  }, {});

  const filtered = allFiles.filter(f => {
    if (pinnedOnly && !f.pinned) return false;
    if (kind !== 'all' && f.kind !== kind) return false;
    if (query && !f.name.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  if (!open) return null;

  return (
    <div className="lib-overlay">
      <div className="lib-head">
        <div className="lib-title">
          <Icon name="folder" size={14}/>
          <span style={{fontWeight:500}}>{project.name}</span>
          <span className="lib-sep">/</span>
          <span style={{color:'var(--muted)'}}>Files</span>
        </div>
        <div className="lib-stats">
          <span><b style={{color:'var(--ink)'}}>{total.toLocaleString()}</b> files</span>
          <span><b style={{color:'var(--ink)'}}>{allFiles.filter(f => f.pinned).length}</b> pinned</span>
          <span><b style={{color:'var(--ink)'}}>1.6 GB</b> indexed</span>
          <span style={{color:'var(--ok)'}}>● all indexed</span>
        </div>
        <button className="src-btn" onClick={onClose}>✕ close</button>
      </div>

      <div className="lib-body">
        <aside className="lib-side">
          <div className="lib-search">
            <Icon name="search" size={13}/>
            <input
              autoFocus
              placeholder="Search files…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>

          <div className="lib-side-label">KIND</div>
          {facets.map(f => (
            <button
              key={f}
              className={`lib-facet ${kind === f ? 'on' : ''}`}
              onClick={() => setKind(f)}
            >
              <span style={{flex:1, textTransform:'capitalize'}}>{f}</span>
              <span className="cnt">{counts[f]}</span>
            </button>
          ))}

          <div className="lib-side-label" style={{marginTop:18}}>VIEW</div>
          <button
            className={`lib-facet ${pinnedOnly ? 'on' : ''}`}
            onClick={() => setPinnedOnly(p => !p)}
          >
            <span style={{flex:1}}>Pinned only</span>
            <span className="cnt">{allFiles.filter(f => f.pinned).length}</span>
          </button>
          <div style={{marginTop:14, padding:'0 4px', fontSize:11, color:'var(--whisper)', lineHeight:1.5, fontFamily:'var(--mono)'}}>
            Pinned files are surfaced first to retrieval and shown at the top of every answer's citation chip strip.
          </div>
        </aside>

        <div className="lib-main">
          <div className="lib-toolbar">
            <div className="lib-result-count">
              {filtered.length === allFiles.length
                ? `${filtered.length.toLocaleString()} files`
                : `${filtered.length.toLocaleString()} of ${allFiles.length.toLocaleString()}`}
              {(query || kind !== 'all' || pinnedOnly) && (
                <button
                  className="lib-clear"
                  onClick={() => { setQuery(''); setKind('all'); setPinnedOnly(false); }}
                >clear</button>
              )}
            </div>
            <div style={{display:'flex', gap:6, alignItems:'center', marginLeft:'auto'}}>
              <button className="src-btn">↑ Sort: recent first</button>
              <button className="src-btn primary">⬆ Upload</button>
            </div>
          </div>

          <div className="lib-list">
            <div className="lib-row-head">
              <span className="lib-c-pin"/>
              <span className="lib-c-name">Name</span>
              <span className="lib-c-kind">Kind</span>
              <span className="lib-c-size">Size</span>
              <span className="lib-c-added">Added</span>
              <span className="lib-c-status">Status</span>
            </div>
            {filtered.slice(0, 32).map((f, i) => (
              <div key={i} className={`lib-row ${f.pinned ? 'pinned' : ''}`}>
                <span className="lib-c-pin" title={f.pinned ? 'Unpin' : 'Pin'}>
                  {f.pinned ? '★' : '☆'}
                </span>
                <span className="lib-c-name">
                  <Icon name="file" size={11}/>
                  <span className="nm">{f.name}</span>
                </span>
                <span className="lib-c-kind">
                  <span className={`lib-kind k-${f.kind || 'misc'}`}>{f.kind || 'misc'}</span>
                </span>
                <span className="lib-c-size">{f.size || '—'}</span>
                <span className="lib-c-added">{f.added || '—'}</span>
                <span className="lib-c-status">
                  <span className={`stat ${f.status}`}>{f.status === 'ok' ? '● indexed' : f.status}</span>
                </span>
              </div>
            ))}
            {filtered.length > 32 && (
              <div style={{padding:'14px 16px', textAlign:'center', fontFamily:'var(--mono)', fontSize:11, color:'var(--whisper)'}}>
                + {(filtered.length - 32).toLocaleString()} more · virtualized · scroll to load
              </div>
            )}
            {filtered.length === 0 && (
              <div style={{padding:'40px 16px', textAlign:'center', color:'var(--muted)'}}>
                No files match these filters.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MobileInset ───────────────────────────────────────────────────────
// A floating iPhone-shape mock in the lower right of the screen, showing the
// same active chat session at mobile width. Closes on ✕.
function MobileInset({ open, project, session, onClose }) {
  if (!open || !project || !session) return null;

  // Use the same messages but render them compactly inside the device.
  return (
    <div className="phone-shell">
      <div className="phone-label">
        <span>Same chat · mobile · 390 ×<br/>844</span>
        <button className="phone-x" onClick={onClose}>✕</button>
      </div>
      <div className="phone">
        <div className="phone-notch"/>
        <div className="phone-statusbar">
          <span>9:41</span>
          <span style={{display:'flex', gap:4, alignItems:'center'}}>● ● ●●●</span>
        </div>
        <div className="phone-screen">
          <div className="phone-topbar">
            <button className="phone-back">‹</button>
            <div style={{flex:1, textAlign:'center', minWidth:0}}>
              <div className="phone-proj">{project.name}</div>
              <div className="phone-sess">{session.title}</div>
            </div>
            <button className="phone-more">⋯</button>
          </div>
          <div className="phone-thread">
            {session.messages.map((m, i) => (
              <div key={i} className={`phone-msg ${m.role}`}>
                {m.role === 'assistant'
                  ? <PhoneAssistant m={m}/>
                  : <div className="phone-bubble">{m.text}</div>}
              </div>
            ))}
          </div>
          <div className="phone-composer">
            <span className="phone-attach">＋</span>
            <span style={{flex:1, color:'var(--whisper)', fontSize:13}}>Reply…</span>
            <span className="phone-send">↑</span>
          </div>
          <div className="phone-homebar"/>
        </div>
      </div>
    </div>
  );
}

function PhoneAssistant({ m }) {
  // Strip HTML tags + keep first paragraph or so + citation chips
  const html = m.html || '';
  const stripped = html
    .replace(/\{\{C:[^}]+\}\}/g, '◆')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const cap = stripped.length > 240 ? stripped.slice(0, 240) + '…' : stripped;
  return (
    <div className="phone-asst">
      <div className="phone-who">Assistant</div>
      <div className="phone-asst-body">{cap}</div>
      {m.cites && m.cites.length > 0 && (
        <div className="phone-sources">
          {m.cites.slice(0, 3).map((id, i) => (
            <span key={i} className="phone-src">
              <span className="n">{i+1}</span>
              {(SNIPPETS[id]?.file || '').split('.')[0].slice(0, 20)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

Object.assign(window, { SourceDrawer, FileLibrary, MobileInset });
