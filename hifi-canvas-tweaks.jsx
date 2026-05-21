// hifi-canvas-tweaks.jsx
// Adds a Tweaks panel to the hi-fi design canvas that swaps the accent hue
// across every artboard simultaneously. Curated options: yellow (default), blue secondary hue, sage.

const CANVAS_TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#fdc749"
}/*EDITMODE-END*/;

const CANVAS_ACCENTS = [
  '#fdc749',  // WECC yellow (default)
  '#04286d',  // WECC blue
  '#7fb069',  // sage green
];

function hexToRGBA(hex, a) {
  const h = hex.replace('#','');
  const r = parseInt(h.slice(0,2),16), g = parseInt(h.slice(2,4),16), b = parseInt(h.slice(4,6),16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
function lighten(hex, factor) {
  const h = hex.replace('#','');
  const r = Math.min(255, Math.round(parseInt(h.slice(0,2),16) * factor));
  const g = Math.min(255, Math.round(parseInt(h.slice(2,4),16) * factor));
  const b = Math.min(255, Math.round(parseInt(h.slice(4,6),16) * factor));
  return `rgb(${r}, ${g}, ${b})`;
}

// Readable foreground on accent buttons (matches wecc.org: blue text on yellow).
function inkOnAccent(hex) {
  const h = hex.replace('#','');
  const r = parseInt(h.slice(0,2),16) / 255;
  const g = parseInt(h.slice(2,4),16) / 255;
  const b = parseInt(h.slice(4,6),16) / 255;
  const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return L > 0.55 ? '#04286d' : '#ffffff';
}

function applyAccent(hex) {
  const root = document.documentElement;
  root.style.setProperty('--accent',        hex);
  root.style.setProperty('--accent-ink',    lighten(hex, 1.18));
  root.style.setProperty('--accent-soft',   hexToRGBA(hex, 0.16));
  root.style.setProperty('--accent-soft-2', hexToRGBA(hex, 0.08));
  root.style.setProperty('--accent-line',   hexToRGBA(hex, 0.42));
  root.style.setProperty('--accent-fg',     inkOnAccent(hex));

  // Patch hardcoded CTA text colors to follow --accent-fg.
  // We expose --accent-fg and rewrite those at runtime via a single inserted style block.
  let s = document.getElementById('__hifi-accent-fg-fix');
  if (!s) {
    s = document.createElement('style');
    s.id = '__hifi-accent-fg-fix';
    document.head.appendChild(s);
  }
  s.textContent = `
    .send, .zen .cta, .invite button, .modal .primary,
    .den-tag .num, .pal-foot .kbd-accent,
    .cite:hover {
      color: var(--accent-fg) !important;
    }
    a[href$="Hi-Fi.html"][style*="--accent"] { color: var(--accent-fg) !important; }
  `;
}

function HifiCanvasTweaks() {
  const [t, setTweak] = useTweaks(CANVAS_TWEAK_DEFAULTS);

  React.useEffect(() => { applyAccent(t.accent); }, [t.accent]);

  return (
    <TweaksPanel>
      <TweakSection label="Accent"/>
      <TweakColor
        label="Hue"
        value={t.accent}
        options={CANVAS_ACCENTS}
        onChange={(v) => setTweak('accent', v)}
      />
      <div style={{
        fontSize: 10,
        lineHeight: 1.5,
        color: 'rgba(41,38,27,.55)',
        padding: '4px 2px 0',
      }}>
        Swaps the active-state hue across every artboard — sidebar selection, citation chips, primary CTAs, focus rings.
      </div>
    </TweaksPanel>
  );
}

// Apply on load before first paint
applyAccent(CANVAS_TWEAK_DEFAULTS.accent);

// Mount in its own root
(() => {
  const node = document.createElement('div');
  node.id = 'hifi-canvas-tweaks-root';
  document.body.appendChild(node);
  ReactDOM.createRoot(node).render(<HifiCanvasTweaks/>);
})();
