// ⌘K Command palette
function Palette({ store }) {
  const { paletteOpen, closePalette, projects, currentProjectId, currentUser,
          setCurrentProject, setCurrentSession, openNewProject,
          toggleAcc, addSession } = store;
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (paletteOpen) {
      setQ(''); setSel(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [paletteOpen]);

  // Build flat list of palette items
  const items = useMemo(() => {
    const list = [];

    // Projects
    projects.forEach(p => {
      list.push({
        kind: 'proj',
        group: 'Projects',
        icon: 'folder',
        label: p.name,
        sub: `${p.files.length} files · ${p.users.length} members`,
        keywords: p.name.toLowerCase(),
        action: () => { setCurrentProject(p.id); setCurrentSession(p.sessions[0]?.id || null); closePalette(); }
      });
    });

    // Recent chats (across all projects)
    projects.forEach(p => {
      (p.sessions || []).slice(0, 6).forEach(s => {
        const author = p.users.find(u => u.id === s.author);
        list.push({
          kind: 'chat',
          group: 'Recent chats',
          icon: 'chat',
          label: s.title,
          sub: `${p.name} · ${author?.name || ''}`,
          keywords: (s.title + ' ' + p.name + ' ' + (author?.name||'')).toLowerCase(),
          action: () => { setCurrentProject(p.id); setCurrentSession(s.id); closePalette(); }
        });
      });
    });

    // Files (top 8 of current project)
    const current = projects.find(p => p.id === currentProjectId);
    if (current) {
      current.files.slice(0, 12).forEach(f => {
        list.push({
          kind: 'file',
          group: 'Files in this project',
          icon: 'file',
          label: f.name,
          sub: f.status,
          keywords: f.name.toLowerCase(),
          action: () => { store.toast(`Open ${f.name}`); closePalette(); }
        });
      });
    }

    // Commands
    const cmds = [
      { label: 'Create new project…', keys: '⌘N', icon: 'plus', action: () => { closePalette(); openNewProject(); } },
      { label: 'New chat in current project', keys: '⌘⇧N', icon: 'chat',
        action: () => { if (current) { addSession(current.id); closePalette(); } } },
      { label: 'Toggle Instructions accordion', keys: '', icon: 'edit', action: () => { toggleAcc('instructions'); closePalette(); } },
      { label: 'Toggle Users accordion', keys: '', icon: 'edit', action: () => { toggleAcc('users'); closePalette(); } },
      { label: 'Toggle Files accordion', keys: '', icon: 'edit', action: () => { toggleAcc('files'); closePalette(); } },
      { label: 'Upload files to current project', keys: '⌘U', icon: 'upload',
        action: () => { if (current) { store.simulateUpload(current.id); closePalette(); } } },
    ];
    cmds.forEach(c => list.push({ ...c, kind: 'cmd', group: 'Commands', sub: '', keywords: c.label.toLowerCase() }));

    return list;
  }, [projects, currentProjectId]);

  const ql = q.trim().toLowerCase();
  const filtered = ql ? items.filter(i => i.keywords.includes(ql)) : items;

  // Group filtered while preserving order
  const grouped = [];
  let lastGroup = null;
  filtered.forEach(item => {
    if (item.group !== lastGroup) {
      grouped.push({ groupHeader: item.group });
      lastGroup = item.group;
    }
    grouped.push(item);
  });
  const selectables = filtered;

  // Keyboard nav
  useEffect(() => {
    if (!paletteOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); closePalette(); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); setSel(s => Math.min(selectables.length - 1, s + 1)); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setSel(s => Math.max(0, s - 1)); }
      else if (e.key === 'Enter') { e.preventDefault(); selectables[sel]?.action?.(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [paletteOpen, sel, selectables]);

  useEffect(() => { setSel(0); }, [q]);

  if (!paletteOpen) return null;

  return (
    <div className="pal-back" onMouseDown={(e) => { if (e.target.classList.contains('pal-back')) closePalette(); }}>
      <div className="palette" onMouseDown={e => e.stopPropagation()}>
        <div className="pal-input">
          <span className="ic"><Icon name="search" size={14}/></span>
          <input
            ref={inputRef}
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Jump to project, chat, file, or run a command…"
          />
          <span className="kbd">esc</span>
        </div>
        <div className="pal-list">
          {grouped.length === 0 && <div className="pal-empty">No matches for "{q}"</div>}
          {(() => {
            let selIdx = -1;
            return grouped.map((it, i) => {
              if (it.groupHeader) return <div key={'g'+i} className="pal-group">{it.groupHeader}</div>;
              selIdx++;
              const isSel = selIdx === sel;
              const myIdx = selIdx;
              return (
                <div
                  key={'i'+i}
                  className={'pal-item' + (isSel ? ' sel' : '')}
                  onMouseEnter={() => setSel(myIdx)}
                  onClick={it.action}
                >
                  <span className="ic"><Icon name={it.icon} size={13}/></span>
                  <span className="lbl">
                    {it.label}
                    {it.sub && <span className="sub">· {it.sub}</span>}
                  </span>
                  {it.keys && <span className="k">{it.keys}</span>}
                </div>
              );
            });
          })()}
        </div>
      </div>
    </div>
  );
}

// New-project modal
function NewProjectModal({ store }) {
  const { newProjectOpen, closeNewProject, createProject } = store;
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (newProjectOpen) {
      setName(''); setDesc('');
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [newProjectOpen]);

  if (!newProjectOpen) return null;

  const submit = () => {
    if (!name.trim()) return;
    createProject(name.trim(), desc.trim());
    closeNewProject();
  };

  return (
    <div className="modal-back" onMouseDown={(e) => { if (e.target.classList.contains('modal-back')) closeNewProject(); }}>
      <div className="modal" onMouseDown={e => e.stopPropagation()}>
        <h3>New project</h3>
        <div className="sub">Hold any number of documents and chat with them. Unlimited files — no caps.</div>
        <label>
          <div className="lab">Name</div>
          <input
            ref={inputRef}
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
            placeholder="e.g. SCADA Vendor Manuals"
          />
        </label>
        <label>
          <div className="lab">Description (optional)</div>
          <textarea
            value={desc}
            onChange={e => setDesc(e.target.value)}
            rows={2}
            placeholder="What lives in this project?"
          />
        </label>
        <div className="actions">
          <button className="cancel" onClick={closeNewProject}>Cancel</button>
          <button className="primary" onClick={submit} disabled={!name.trim()}>Create project</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Palette, NewProjectModal });
