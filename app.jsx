// Root — wires every frame onto the design canvas.
const { useEffect } = React;

function App() {
  return (
    <DesignCanvas>
      {/* Overview / brief */}
      <DCSection id="brief" title="WECC RAG — Wireframes" subtitle="Tidy mono · b&w · single warm accent for active state. 10 frames across one storyboard and four directions.">
        <DCArtboard id="brief-card" label="brief" width={760} height={360}>
          <div style={{padding:'28px 36px', height:'100%', boxSizing:'border-box', background:'var(--paper)', border:'1px solid var(--ink)', fontFamily:'var(--mono)'}}>
            <div className="tiny">Wireframe pass · {new Date().toISOString().slice(0,10)}</div>
            <h1 style={{fontSize:24, marginTop:8, letterSpacing:'-0.01em'}}>WECC RAG — UI exploration</h1>
            <p style={{fontSize:12, lineHeight:1.6, color:'var(--ink-2)', maxWidth:620, marginTop:10}}>
              Project-scoped document chat. Each project holds <b>unlimited</b> files;
              the assistant answers from retrieved snippets and cites them.
              This pass maps the design space so we can lock structure before
              hi-fi.
            </p>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px 24px', fontSize:11, marginTop:18}}>
              <div><span className="tiny">storyboard</span><div style={{marginTop:2}}>6 frames · happy path · uses your stated baseline</div></div>
              <div><span className="tiny">directions</span><div style={{marginTop:2}}>4 distinct structural remixes</div></div>
              <div><span className="tiny">dimensions explored</span><div style={{marginTop:2}}>sidebar · right panel · citations · project picker · history visibility · file library</div></div>
              <div><span className="tiny">held constant</span><div style={{marginTop:2}}>unlimited files · grounded answers · roles user/editor/admin</div></div>
            </div>
            <div style={{marginTop:18, display:'flex', gap:6, flexWrap:'wrap'}}>
              <span className="chip">drag to reorder</span>
              <span className="chip">click any artboard's ⤢ to focus</span>
              <span className="chip">space + drag to pan · scroll to zoom</span>
            </div>
          </div>
        </DCArtboard>
      </DCSection>

      {/* Storyboard */}
      <DCSection id="storyboard" title="Storyboard · Happy Path" subtitle="Cold start → first grounded answer → collaborator joins. Uses the stated baseline: tree sidebar, expanded accordions, center dropzone, inline add-user, hover-reveal session actions.">
        <DCArtboard id="s1" label="1 · Cold start" width={1100} height={720}><Frame1/></DCArtboard>
        <DCArtboard id="s2" label="2 · Create project" width={1100} height={720}><Frame2/></DCArtboard>
        <DCArtboard id="s3" label="3 · Empty project · upload zone" width={1100} height={720}><Frame3/></DCArtboard>
        <DCArtboard id="s4" label="4 · Files indexing · type Q" width={1100} height={720}><Frame4/></DCArtboard>
        <DCArtboard id="s5" label="5 · Grounded answer + citations" width={1100} height={720}><Frame5/></DCArtboard>
        <DCArtboard id="s6" label="6 · Collaborator joins" width={1100} height={720}><Frame6/></DCArtboard>
      </DCSection>

      {/* Directions */}
      <DCSection id="directions" title="Directions · Structural remixes" subtitle="Each hero rewires the six dimensions you flagged. Same content, four different ways to surface it.">
        <DCArtboard id="dA-intro" label="A · intro" width={420} height={760}>
          <DirIntro
            kicker="Direction A"
            name="Tree & Stack"
            dims={{
              Sidebar: 'single tree, projects → sessions',
              'Right panel': 'stacked accordions (Inst / Users / Files)',
              Citations: 'inline [n] + chip strip',
              'Project picker': 'in sidebar',
              History: 'mine / everyone pill',
              Files: 'flat list + search',
              Vibe: 'familiar, conservative, low cognitive load',
              Risk: 'right column gets tall when files grow',
            }}
          />
        </DCArtboard>
        <DCArtboard id="dA" label="A · Tree & Stack" width={1320} height={760}><DirectionA/></DCArtboard>

        <DCArtboard id="dB-intro" label="B · intro" width={420} height={760}>
          <DirIntro
            kicker="Direction B"
            name="Rail & Tabs"
            dims={{
              Sidebar: 'icon rail + sessions list',
              'Right panel': 'tabs — one section at a time',
              Citations: 'side-pinned source panel (slides over chat)',
              'Project picker': 'top switcher dropdown',
              History: 'author avatars on each row',
              Files: 'grouped by upload date',
              Vibe: 'app-like, IDE-flavored',
              Risk: 'tabs hide content — users may miss instructions tab',
            }}
          />
        </DCArtboard>
        <DCArtboard id="dB" label="B · Rail & Tabs" width={1320} height={760}><DirectionB/></DCArtboard>

        <DCArtboard id="dC-intro" label="C · intro" width={420} height={760}>
          <DirIntro
            kicker="Direction C"
            name="Palette-Driven"
            dims={{
              Sidebar: 'minimal — current project only',
              'Right panel': 'floating drawer, summoned',
              Citations: 'hover preview tooltip',
              'Project picker': '⌘K command palette',
              History: 'Mine / All toggle pill',
              Files: 'search-first',
              Vibe: 'power-user / keyboard-first',
              Risk: 'discoverability — needs onboarding hints',
            }}
          />
        </DCArtboard>
        <DCArtboard id="dC" label="C · Palette-driven" width={1320} height={760}><DirectionC/></DCArtboard>

        <DCArtboard id="dD-intro" label="D · intro" width={420} height={760}>
          <DirIntro
            kicker="Direction D"
            name="Split Inspector"
            dims={{
              Sidebar: 'single tree (same as A)',
              'Right panel': 'split — small top (inst/users), large bottom (files)',
              Citations: 'footnote section with excerpts',
              'Project picker': 'top switcher',
              History: 'filter chips',
              Files: 'faceted by type · pinned + recent groups',
              Vibe: 'heavy-corpus optimized',
              Risk: 'less room for long instructions',
            }}
          />
        </DCArtboard>
        <DCArtboard id="dD" label="D · Split Inspector" width={1320} height={760}><DirectionD/></DCArtboard>
      </DCSection>

      {/* Decisions still open */}
      <DCSection id="decisions" title="Open decisions" subtitle="What still needs to be picked before hi-fi.">
        <DCArtboard id="decisions-card" label="open" width={760} height={460}>
          <div style={{padding:'24px 30px', height:'100%', background:'var(--paper)', border:'1px solid var(--ink)', boxSizing:'border-box', fontFamily:'var(--mono)', overflow:'auto'}}>
            <h2 style={{fontSize:16, letterSpacing:'-0.01em'}}>Still TBD</h2>
            <ol style={{paddingLeft:18, marginTop:10, fontSize:12, lineHeight:1.7}}>
              <li><b>Pick one direction (A–D)</b> for the right panel — or a hybrid (e.g. A's accordions + D's grouped files).</li>
              <li><b>Citation style</b> — chips (A/B), hover preview (C), or footnotes (D)? Affects copy-paste behaviour.</li>
              <li><b>Project picker scale</b> — does a sidebar list still work at 50+ projects, or do we go palette-first (C)?</li>
              <li><b>History attribution</b> — pill filter (A), avatars on rows (B), or both?</li>
              <li><b>File library at 1,000+ files</b> — flat search (A), date groups (B), or facets (D)? Virtualization is required either way.</li>
              <li><b>Add-user UX</b> confirmed as inline-email — need to confirm role picker default and whether admins can change roles inline.</li>
              <li><b>Error states</b> not shown — ingest failed, retrieval empty, inference timeout. Will add to next pass if useful.</li>
              <li><b>Streaming</b> — token stream inside assistant bubble (default assumed) vs. status line. Confirm before hi-fi.</li>
            </ol>
            <div className="tiny" style={{marginTop:14}}>reply with picks → next pass goes hi-fi on the winning direction.</div>
          </div>
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App/>);
