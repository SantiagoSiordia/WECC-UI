// hifi-tweaks.jsx — adds a Tweaks panel to the hi-fi prototype.
// Toggles between Comfortable / Standard / Compact density via body class.
// Persists via the host's __edit_mode_set_keys protocol.

const HIFI_TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "density": "standard",
  "accent": "#fdc749"
}/*EDITMODE-END*/;

const ACCENTS = ['#fdc749', '#fdcd5b', '#ffc107', '#04286d'];

function applyHifiTweaks(t) {
  const body = document.body;
  body.classList.remove('den-comfortable', 'den-compact');
  if (t.density === 'comfortable') body.classList.add('den-comfortable');
  else if (t.density === 'compact') body.classList.add('den-compact');

  // Accent override
  const root = document.documentElement;
  if (t.accent) {
    root.style.setProperty('--accent', t.accent);
    root.style.setProperty('--accent-ink', shade(t.accent, 1.08));
    root.style.setProperty('--accent-soft', hexToRGBA(t.accent, 0.2));
    root.style.setProperty('--accent-soft-2', hexToRGBA(t.accent, 0.1));
    root.style.setProperty('--accent-line', hexToRGBA(t.accent, 0.45));
    const h = t.accent.replace('#','');
    const r = parseInt(h.slice(0,2),16) / 255;
    const g = parseInt(h.slice(2,4),16) / 255;
    const b = parseInt(h.slice(4,6),16) / 255;
    const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    root.style.setProperty('--accent-fg', L > 0.55 ? '#04286d' : '#ffffff');
  }
}

function hexToRGBA(hex, a) {
  const h = hex.replace('#','');
  const r = parseInt(h.slice(0,2),16), g = parseInt(h.slice(2,4),16), b = parseInt(h.slice(4,6),16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
function shade(hex, factor) {
  const h = hex.replace('#','');
  const r = Math.min(255, Math.round(parseInt(h.slice(0,2),16) * factor));
  const g = Math.min(255, Math.round(parseInt(h.slice(2,4),16) * factor));
  const b = Math.min(255, Math.round(parseInt(h.slice(4,6),16) * factor));
  return `rgb(${r}, ${g}, ${b})`;
}

function HifiTweaks() {
  const [t, setTweak] = useTweaks(HIFI_TWEAK_DEFAULTS);

  React.useEffect(() => { applyHifiTweaks(t); }, [t.density, t.accent]);

  return (
    <TweaksPanel>
      <TweakSection label="Density"/>
      <TweakRadio
        label="Spacing"
        value={t.density}
        options={['compact', 'standard', 'comfortable']}
        onChange={(v) => setTweak('density', v)}
      />
      <TweakSection label="Accent"/>
      <TweakColor
        label="Hue"
        value={t.accent}
        options={ACCENTS}
        onChange={(v) => setTweak('accent', v)}
      />
    </TweaksPanel>
  );
}

// Apply persisted state immediately on load (before mount), so the Tweaks panel
// can be toggled later but the initial density is already correct.
applyHifiTweaks(HIFI_TWEAK_DEFAULTS);

// Mount panel into its own root (separate from the main app) so we don't
// have to fork prototype-app.jsx.
(() => {
  const node = document.createElement('div');
  node.id = 'hifi-tweaks-root';
  document.body.appendChild(node);
  const r = ReactDOM.createRoot(node);
  r.render(<HifiTweaks/>);
})();
