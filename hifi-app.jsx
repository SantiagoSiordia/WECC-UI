// WECC RAG Hi-Fi — design canvas app. Lays the four frames out across
// three density variants (comfortable / standard / compact).

const { useEffect } = React;

function DensityFrame({ density, children }) {
  // each artboard wraps in a density-class container so CSS vars cascade
  const cls = density === 'comfortable' ? 'den-comfortable'
            : density === 'compact' ? 'den-compact'
            : '';
  const label = density === 'comfortable' ? 'COMFORTABLE'
              : density === 'compact' ? 'COMPACT'
              : 'STANDARD';
  const num   = density === 'comfortable' ? '01'
              : density === 'compact' ? '03'
              : '02';
  return (
    <div className={cls} style={{position:'relative', width:'100%', height:'100%'}}>
      <div className="den-tag"><span className="num">{num}</span>{label}</div>
      {children}
    </div>
  );
}

const DENSITIES = ['comfortable', 'standard', 'compact'];
const FRAME_W = 1280;
const FRAME_H = 800;

function App() {
  return (
    <DesignCanvas>

      {/* Brief */}
      <DCSection id="brief" title="WECC RAG — Hi-Fi · Direction A" subtitle="Light · IBM Plex Sans + Mono · yellow accent · blue secondary · responsive 1280–1600 · 4 hero frames × 3 density variants.">
        <DCArtboard id="brief-card" label="brief" width={760} height={360}>
          <div style={{
            padding:'24px 28px', height:'100%', boxSizing:'border-box',
            background:'var(--surface)', border:'1px solid var(--hair)',
            fontFamily:'var(--sans)', color:'var(--ink)', borderRadius:6
          }}>
            <div style={{fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.14em', color:'var(--accent)', textTransform:'uppercase'}}>
              Hi-fi pass · {new Date().toISOString().slice(0,10)}
            </div>
            <h1 style={{fontSize:24, margin:'8px 0 0', letterSpacing:'-0.012em', fontWeight:500}}>Tree & Stack · light</h1>
            <p style={{fontSize:13, lineHeight:1.6, color:'var(--ink-2)', maxWidth:640, marginTop:10}}>
              Picked direction A from the wireframes with a warm off-white palette. Tabular numerics, hairline dividers, yellow for primary actions and citations, blue for secondary actions.
            </p>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px 24px', fontSize:11.5, marginTop:18, fontFamily:'var(--mono)'}}>
              <div><span className="tiny" style={{color:'var(--accent)'}}>frames</span><div style={{marginTop:4, color:'var(--ink-2)'}}>Cold start · Project create + upload · ⌘K switcher · Collab joins</div></div>
              <div><span className="tiny" style={{color:'var(--accent)'}}>variations</span><div style={{marginTop:4, color:'var(--ink-2)'}}>3 density treatments side-by-side</div></div>
              <div><span className="tiny" style={{color:'var(--accent)'}}>type</span><div style={{marginTop:4, color:'var(--ink-2)'}}>Plex Mono → chrome / data · Plex Sans → prose</div></div>
              <div><span className="tiny" style={{color:'var(--accent-ink)'}}>accent</span><div style={{marginTop:4, color:'var(--ink-2)', display:'flex', alignItems:'center', gap:8}}><span style={{width:14, height:14, background:'var(--accent)', borderRadius:3, display:'inline-block'}}/>#fdc749</div></div>
              <div><span className="tiny" style={{color:'var(--secondary-ink)'}}>secondary</span><div style={{marginTop:4, color:'var(--ink-2)', display:'flex', alignItems:'center', gap:8}}><span style={{width:14, height:14, background:'var(--secondary)', borderRadius:3, display:'inline-block'}}/>#04286d</div></div>
            </div>
            <div style={{marginTop:18, display:'flex', gap:6, flexWrap:'wrap'}}>
              <span style={{fontFamily:'var(--mono)', fontSize:10, padding:'2px 8px', border:'1px solid var(--hair)', borderRadius:999, color:'var(--muted)'}}>drag to reorder</span>
              <span style={{fontFamily:'var(--mono)', fontSize:10, padding:'2px 8px', border:'1px solid var(--hair)', borderRadius:999, color:'var(--muted)'}}>⤢ focus any artboard</span>
              <span style={{fontFamily:'var(--mono)', fontSize:10, padding:'2px 8px', border:'1px solid var(--hair)', borderRadius:999, color:'var(--muted)'}}>space-drag pan · scroll zoom</span>
            </div>
          </div>
        </DCArtboard>
      </DCSection>

      {/* Frame 1 */}
      <DCSection id="cold-start" title="01 · Cold start" subtitle="Brand-new account. Empty sidebar, hero invite to create the first project. Sets the tone.">
        {DENSITIES.map(d => (
          <DCArtboard key={d} id={`cold-${d}`} label={`cold start · ${d}`} width={FRAME_W} height={FRAME_H}>
            <DensityFrame density={d}><FrameColdStart/></DensityFrame>
          </DCArtboard>
        ))}
      </DCSection>

      {/* Frame 2 */}
      <DCSection id="create" title="02 · Project create + first upload" subtitle="Right after creating a project — files are indexing, composer is held back until at least one file is ready. Right panel pre-populated.">
        {DENSITIES.map(d => (
          <DCArtboard key={d} id={`create-${d}`} label={`project create · ${d}`} width={FRAME_W} height={FRAME_H}>
            <DensityFrame density={d}><FrameProjectCreate/></DensityFrame>
          </DCArtboard>
        ))}
      </DCSection>

      {/* Frame 3 */}
      <DCSection id="switcher" title="03 · Project switcher · ⌘K" subtitle="The fast-path between projects. Same palette also handles chats, files, and actions.">
        {DENSITIES.map(d => (
          <DCArtboard key={d} id={`switch-${d}`} label={`switcher · ${d}`} width={FRAME_W} height={FRAME_H}>
            <DensityFrame density={d}><FrameProjectSwitcher/></DensityFrame>
          </DCArtboard>
        ))}
      </DCSection>

      {/* Frame 4 */}
      <DCSection id="collab" title="04 · Collaborator joins / sharing" subtitle="The Members accordion opens with the pending-invite row visible. A quiet in-app notice confirms the join — easy to dismiss.">
        {DENSITIES.map(d => (
          <DCArtboard key={d} id={`collab-${d}`} label={`collab · ${d}`} width={FRAME_W} height={FRAME_H}>
            <DensityFrame density={d}><FrameCollabJoins/></DensityFrame>
          </DCArtboard>
        ))}
      </DCSection>

      {/* Prototype link */}
      <DCSection id="proto" title="Clickable prototype" subtitle="The key flow (project → ask → grounded answer with citations) runs in the live prototype.">
        <DCArtboard id="proto-card" label="prototype" width={760} height={300}>
          <div style={{
            padding:'24px 28px', height:'100%', boxSizing:'border-box',
            background:'var(--surface)', border:'1px solid var(--hair)',
            fontFamily:'var(--sans)', color:'var(--ink)', borderRadius:6,
            display:'flex', flexDirection:'column', gap:12
          }}>
            <div style={{fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.14em', color:'var(--accent)', textTransform:'uppercase'}}>
              Open the prototype
            </div>
            <h2 style={{fontSize:20, margin:0, fontWeight:500, letterSpacing:'-0.01em'}}>WECC RAG Prototype Hi-Fi</h2>
            <p style={{fontSize:13, color:'var(--ink-2)', lineHeight:1.6, margin:0}}>
              Live keyboard shortcuts, real LLM calls, the full sidebar tree, citation popovers, file indexing simulation. Includes a Tweaks panel to flip between the three density treatments live.
            </p>
            <div style={{display:'flex', gap:8, marginTop:6}}>
              <a href="WECC RAG Prototype Hi-Fi.html" style={{
                background:'var(--accent)', color:'var(--accent-fg)', textDecoration:'none',
                padding:'9px 16px', borderRadius:4, fontSize:13, fontWeight:600,
                display:'inline-flex', alignItems:'center', gap:6,
              }}>Open prototype →</a>
              <a href="WECC RAG Prototype.html" style={{
                background:'transparent', color:'var(--ink-2)', textDecoration:'none',
                padding:'9px 14px', borderRadius:4, fontSize:12, fontFamily:'var(--mono)',
                border:'1px solid var(--hair)',
                display:'inline-flex', alignItems:'center', gap:6,
              }}>Light-mode original</a>
              <a href="WECC RAG Wireframes.html" style={{
                background:'transparent', color:'var(--muted)', textDecoration:'none',
                padding:'9px 14px', borderRadius:4, fontSize:12, fontFamily:'var(--mono)',
                border:'1px solid var(--hair)',
                display:'inline-flex', alignItems:'center', gap:6,
              }}>Wireframes</a>
            </div>
          </div>
        </DCArtboard>
      </DCSection>

    </DesignCanvas>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App/>);
