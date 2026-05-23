// admin-view.jsx — read-only admin / audit observability surface.

const VALID_ADMIN_TABS = new Set(['audit', 'users', 'projects']);
const ADMIN_TAB_IDS = ['audit', 'users', 'projects'];

function normalizeAdminTab(tab) {
  return VALID_ADMIN_TABS.has(tab) ? tab : 'audit';
}

function AdminFilterDropdown(props) {
  const DD = window.CustomDropdown;
  if (typeof DD !== 'function') {
    const { value, options, onChange, ariaLabel } = props;
    return (
      <select
        value={value}
        aria-label={ariaLabel}
        onChange={e => onChange(e.target.value)}
      >
        {options.map(opt => (
          <option key={opt.id || '__empty'} value={opt.id}>{opt.label}</option>
        ))}
      </select>
    );
  }
  return <DD {...props} />;
}

function AdminSummaryCards({ summary }) {
  const cards = [
    { label: 'Projects', value: summary.projectCount },
    { label: 'Users', value: summary.userCount },
    { label: 'Files indexed', value: summary.fileCount.toLocaleString() },
    { label: 'Query turns', value: summary.queryCount },
    { label: 'No-context answers', value: summary.noContextCount },
  ];
  return (
    <div className="admin-cards">
      {cards.map(c => (
        <div className="admin-card" key={c.label}>
          <div className="admin-card-val">{c.value}</div>
          <div className="admin-card-lbl">{c.label}</div>
        </div>
      ))}
    </div>
  );
}

function AdminAnalyticsPlaceholder() {
  return (
    <div className="admin-future">
      <div className="admin-future-title">Analytics — coming soon</div>
      <p>Search trends, anomaly detection, and usage dashboards will build on this audit event stream.</p>
    </div>
  );
}

function AdminBarList({ title, rows, emptyLabel = 'No activity yet' }) {
  const max = Math.max(1, ...rows.map(r => r.value));
  return (
    <div className="admin-data-card">
      <div className="admin-data-card-title">{title}</div>
      {rows.length === 0 ? (
        <div className="admin-data-empty">{emptyLabel}</div>
      ) : (
        <div className="admin-bar-list">
          {rows.map(row => (
            <div className="admin-bar-row" key={row.id || row.label}>
              <div className="admin-bar-meta">
                <span className="admin-bar-label" title={row.label}>{row.label}</span>
                <span className="admin-bar-val">{row.value}</span>
              </div>
              <div className="admin-bar-track">
                <span className="admin-bar-fill" style={{ width: `${Math.max(8, (row.value / max) * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminActivitySparkline({ buckets }) {
  const max = Math.max(1, ...buckets.map(b => b.count));
  return (
    <div className="admin-data-card admin-activity-card">
      <div className="admin-data-card-title">Query volume</div>
      <div className="admin-sparkline" aria-label="Query volume by recent hour">
        {buckets.map((b, i) => (
          <span
            key={`${b.label}-${i}`}
            className="admin-spark-bar"
            title={`${b.count} queries ${b.label} ago`}
            style={{ height: `${Math.max(8, (b.count / max) * 100)}%` }}
          />
        ))}
      </div>
      <div className="admin-spark-labels">
        <span>12h ago</span>
        <span>now</span>
      </div>
    </div>
  );
}

function AdminSignalCards({ signals }) {
  return (
    <div className="admin-signal-grid">
      {signals.map(signal => (
        <div className="admin-signal-card" key={signal.label}>
          <div className="admin-signal-value">{signal.value}</div>
          <div className="admin-signal-label">{signal.label}</div>
          <div className="admin-signal-note">{signal.note}</div>
        </div>
      ))}
    </div>
  );
}

function AdminInsights({ insights }) {
  if (!insights) return null;
  return (
    <div className="admin-insights">
      <div className="admin-insights-top">
        <AdminActivitySparkline buckets={insights.buckets || []} />
        <AdminSignalCards signals={insights.signals || []} />
      </div>
      <div className="admin-insights-grid">
        <AdminBarList title="Top users" rows={insights.userRows || []} />
        <AdminBarList title="Top projects" rows={insights.projectRows || []} />
        <AdminBarList title="Most cited files" rows={insights.citedFiles || []} emptyLabel="No cited files yet" />
        <div className="admin-data-card">
          <div className="admin-data-card-title">Signals to watch</div>
          <div className="admin-anomaly-list">
            {(insights.anomalies || []).map(item => (
              <div className="admin-anomaly" key={item}>
                <span className="admin-anomaly-dot" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const ADMIN_EVENT_TYPE_OPTIONS = [
  { id: 'all', label: 'All events' },
  { id: 'query.turn', label: 'Query turns' },
  { id: 'file.ingest_failed', label: 'Ingest failures' },
];

function AdminFilters({ filters, setFilters, users, projects }) {
  const userOptions = useMemo(
    () => [{ id: '', label: 'All users' }, ...users.map(u => ({ id: u.id, label: u.name }))],
    [users]
  );
  const projectOptions = useMemo(
    () => [{ id: '', label: 'All projects' }, ...projects.map(p => ({ id: p.id, label: p.name }))],
    [projects]
  );

  return (
    <div className="admin-filters">
      <div className="admin-filter">
        <span className="admin-filter-lbl">User</span>
        <AdminFilterDropdown
          variant="field"
          value={filters.userId || ''}
          options={userOptions}
          onChange={id => setFilters({ ...filters, userId: id || null })}
          ariaLabel="Filter by user"
        />
      </div>
      <div className="admin-filter">
        <span className="admin-filter-lbl">Project</span>
        <AdminFilterDropdown
          variant="field"
          value={filters.projectId || ''}
          options={projectOptions}
          onChange={id => setFilters({ ...filters, projectId: id || null })}
          ariaLabel="Filter by project"
        />
      </div>
      <div className="admin-filter">
        <span className="admin-filter-lbl">Type</span>
        <AdminFilterDropdown
          variant="field"
          value={filters.eventType || 'all'}
          options={ADMIN_EVENT_TYPE_OPTIONS}
          onChange={id => setFilters({ ...filters, eventType: id })}
          ariaLabel="Filter by event type"
        />
      </div>
      <div className="admin-filter admin-filter-grow">
        <span className="admin-filter-lbl">Search prompts</span>
        <input
          type="search"
          placeholder="Filter by prompt text…"
          value={filters.query || ''}
          onChange={e => setFilters({ ...filters, query: e.target.value })}
        />
      </div>
    </div>
  );
}

function AdminAuditTable({ turns, users, onSelectTurn }) {
  if (turns.length === 0) {
    return <div className="admin-empty">No audit events match the current filters.</div>;
  }
  return (
    <div className="admin-table-wrap">
      <div className="admin-table-head">
        <span>When</span>
        <span>User</span>
        <span>Project</span>
        <span>Session</span>
        <span>Prompt / event</span>
        <span>Status</span>
      </div>
      {turns.map(t => {
        const actor = resolveActor(t.actorId, users);
        const preview = t.type === 'file.ingest_failed'
          ? `Ingest failed: ${t.input.text}`
          : (t.input?.text || '').slice(0, 72) + ((t.input?.text?.length || 0) > 72 ? '…' : '');
        const citeCount = t.output?.cites?.length || 0;
        const status = t.type === 'file.ingest_failed'
          ? 'failed'
          : t.output?.noContext
            ? 'no-context'
            : t.output
              ? 'answered'
              : 'pending';
        return (
          <button
            type="button"
            key={t.id}
            className="admin-table-row"
            onClick={() => t.type === 'query.turn' && onSelectTurn(t.id)}
            disabled={t.type !== 'query.turn'}
          >
            <span className="admin-t-when">{formatAuditTime(t.at)}</span>
            <span className="admin-t-user">
              <span className="admin-t-initials">{actor.initials}</span>
              {actor.name}
            </span>
            <span className="admin-t-proj">{t.projectName}</span>
            <span className="admin-t-sess">{t.sessionTitle || '—'}</span>
            <span className="admin-t-prompt">{preview}</span>
            <span className={`admin-status admin-status-${status}`}>
              {status === 'answered' && `${citeCount} cite${citeCount !== 1 ? 's' : ''}`}
              {status === 'no-context' && 'no context'}
              {status === 'failed' && 'ingest fail'}
              {status === 'pending' && '—'}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function AdminTurnDetail({ turn, users, snippets, onBack, onFilterUser, onFilterProject }) {
  if (!turn) {
    return <div className="admin-empty">Select a query turn from the audit log.</div>;
  }
  const actor = resolveActor(turn.actorId, users);
  const citeEntries = (turn.output?.cites || []).map(id => ({ id, snip: snippets[id] })).filter(x => x.snip);

  return (
    <div className="admin-detail">
      <button type="button" className="admin-back" onClick={onBack}>← Audit log</button>
      <div className="admin-detail-head">
        <h2 className="admin-detail-title">Query turn</h2>
        <span className="admin-detail-meta">{formatAuditTimestamp(turn.at)}</span>
      </div>

      <div className="admin-detail-grid">
        <div className="admin-detail-meta-card">
          <div className="admin-meta-row"><span>User</span><button type="button" className="admin-link" onClick={() => onFilterUser(turn.actorId)}>{actor.name}</button></div>
          <div className="admin-meta-row"><span>Project</span><button type="button" className="admin-link" onClick={() => onFilterProject(turn.projectId)}>{turn.projectName}</button></div>
          <div className="admin-meta-row"><span>Session</span><span>{turn.sessionTitle}</span></div>
          <div className="admin-meta-row"><span>Model</span><span>{turn.model || '—'}</span></div>
          <div className="admin-meta-row"><span>Latency</span><span>{turn.latencyMs ? `${turn.latencyMs} ms` : '—'}</span></div>
          <div className="admin-meta-row"><span>Tokens</span><span>{turn.tokens ? `${turn.tokens.prompt} in · ${turn.tokens.completion} out` : '—'}</span></div>
        </div>
      </div>

      <section className="admin-section">
        <h3 className="admin-section-title">Input · user prompt</h3>
        <pre className="admin-io-block">{turn.input?.text || '(empty)'}</pre>
      </section>

      {turn.type === 'query.turn' && (
        <section className="admin-section">
          <h3 className="admin-section-title">Retrieval · mocked pipeline</h3>
          <div className="admin-retrieval-meta">
            Scanned ~{turn.retrieval?.filesScanned?.toLocaleString?.() || turn.retrieval?.filesScanned || 0} files
            {turn.retrieval?.scannedLabels?.length > 0 && (
              <span className="admin-retrieval-files">
                {turn.retrieval.scannedLabels.slice(0, 5).join(' · ')}
              </span>
            )}
          </div>
          {turn.retrieval?.chunks?.length > 0 ? (
            <div className="admin-chunks">
              {turn.retrieval.chunks.map((ch, i) => (
                <div className="admin-chunk" key={ch.snippetId || i}>
                  <div className="admin-chunk-head">
                    <span className="admin-chunk-score">{(ch.score * 100).toFixed(0)}%</span>
                    <span className="admin-chunk-file">{ch.file}</span>
                    <span className="admin-chunk-loc">{ch.loc}</span>
                  </div>
                  <pre className="admin-chunk-text">{(ch.text || '').slice(0, 280)}{(ch.text?.length > 280 ? '…' : '')}</pre>
                </div>
              ))}
            </div>
          ) : (
            <p className="admin-muted">No snippets retrieved for this turn.</p>
          )}
        </section>
      )}

      <section className="admin-section">
        <h3 className="admin-section-title">Output · assistant response</h3>
        {turn.output?.noContext && (
          <div className="admin-warn">Answered without project context — flagged for review.</div>
        )}
        {turn.output?.html ? (
          <div className="admin-output-html" dangerouslySetInnerHTML={{ __html: turn.output.html.replace(/\{\{C:[^}]+\}\}/g, '') }} />
        ) : turn.output?.text ? (
          <pre className="admin-io-block">{turn.output.text}</pre>
        ) : (
          <p className="admin-muted">No assistant response recorded.</p>
        )}
      </section>

      {citeEntries.length > 0 && (
        <section className="admin-section">
          <h3 className="admin-section-title">Citations · resolved snippets</h3>
          <div className="admin-cites">
            {citeEntries.map(({ id, snip }) => (
              <div className="admin-cite" key={id}>
                <div className="admin-cite-head">
                  <span className="admin-cite-id">{id}</span>
                  <span>{snip.file}</span>
                  <span className="admin-cite-loc">{snip.loc}</span>
                </div>
                <pre className="admin-cite-text">{snip.text}</pre>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function AdminUsersList({ users, onSelectUser }) {
  return (
    <div className="admin-table-wrap">
      <div className="admin-table-head admin-users-head">
        <span>User</span>
        <span>Email</span>
        <span>Projects</span>
        <span>Queries</span>
        <span>Last active</span>
      </div>
      {users.map(u => (
        <button type="button" key={u.id} className="admin-table-row admin-users-row" onClick={() => onSelectUser(u.id)}>
          <span className="admin-t-user">
            <span className="admin-t-initials">{u.initials}</span>
            {u.name} {u.you && <span className="admin-you">(you)</span>}
          </span>
          <span>{u.email}</span>
          <span>{u.projects.length}</span>
          <span>{u.queryCount}</span>
          <span>{u.lastActive ? formatAuditTime(u.lastActive) : '—'}</span>
        </button>
      ))}
    </div>
  );
}

function AdminUserDetail({ user, turns, adminProjects, onBack, onSelectTurn }) {
  if (!user) return <div className="admin-empty">Select a user.</div>;
  const userTurns = turns.filter(t => t.actorId === user.id && t.type === 'query.turn').slice(0, 20);

  return (
    <div className="admin-detail">
      <button type="button" className="admin-back" onClick={onBack}>← Users</button>
      <div className="admin-detail-head">
        <h2 className="admin-detail-title">{user.name}</h2>
        <span className="admin-detail-meta">{user.email}</span>
      </div>

      <section className="admin-section">
        <h3 className="admin-section-title">Project memberships</h3>
        <div className="admin-memberships">
          {user.projects.map(m => (
            <div className="admin-membership" key={m.projectId}>
              <span className="admin-membership-name">{m.projectName}</span>
              <span className="admin-role-pill">{m.role}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="admin-section">
        <h3 className="admin-section-title">Recent query turns</h3>
        {userTurns.length === 0 ? (
          <p className="admin-muted">No recorded queries for this user.</p>
        ) : (
          <div className="admin-mini-list">
            {userTurns.map(t => (
              <button type="button" key={t.id} className="admin-mini-row" onClick={() => onSelectTurn(t.id)}>
                <span className="admin-mini-when">{formatAuditTime(t.at)}</span>
                <span className="admin-mini-proj">{t.projectName}</span>
                <span className="admin-mini-prompt">{(t.input?.text || '').slice(0, 60)}…</span>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="admin-section">
        <h3 className="admin-section-title">Sessions authored</h3>
        <div className="admin-mini-list">
          {adminProjects.flatMap(p =>
            (p.sessions || [])
              .filter(s => s.author === user.id)
              .map(s => (
                <div key={`${p.id}-${s.id}`} className="admin-mini-row static">
                  <span className="admin-mini-proj">{p.name}</span>
                  <span>{s.title}</span>
                  <span className="admin-mini-when">{s.when}</span>
                </div>
              ))
          )}
        </div>
      </section>
    </div>
  );
}

function AdminProjectsList({ adminProjects, onSelectProject }) {
  return (
    <div className="admin-table-wrap">
      <div className="admin-table-head admin-proj-head">
        <span>Project</span>
        <span>Users</span>
        <span>Files</span>
        <span>Sessions</span>
        <span>Queries</span>
        <span>Last active</span>
      </div>
      {adminProjects.map(p => (
        <button type="button" key={p.id} className="admin-table-row admin-proj-row" onClick={() => onSelectProject(p.id)}>
          <span className="admin-t-proj-name">{p.name}</span>
          <span>{p.userCount}</span>
          <span>{p.fileCount > 999 ? `${(p.fileCount / 1000).toFixed(1)}k` : p.fileCount}</span>
          <span>{p.sessionCount}</span>
          <span>{p.queryCount}</span>
          <span>{p.lastActive ? formatAuditTime(p.lastActive) : '—'}</span>
        </button>
      ))}
    </div>
  );
}

function AdminProjectDetail({ project, turns, onBack, onSelectTurn }) {
  if (!project) return <div className="admin-empty">Select a project.</div>;
  const projectTurns = turns.filter(t => t.projectId === project.id && t.type === 'query.turn').slice(0, 15);

  const statusLabel = { ok: 'indexed', proc: 'indexing', fail: 'failed' };

  return (
    <div className="admin-detail">
      <button type="button" className="admin-back" onClick={onBack}>← Projects</button>
      <div className="admin-detail-head">
        <h2 className="admin-detail-title">{project.name}</h2>
        <span className="admin-detail-meta">{project.desc}</span>
      </div>

      <section className="admin-section">
        <h3 className="admin-section-title">Members ({project.users?.length || 0})</h3>
        <div className="admin-memberships">
          {(project.users || []).map(u => (
            <div className="admin-membership" key={u.id}>
              <span>{u.name}</span>
              <span className="admin-role-pill">{u.role}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="admin-section">
        <h3 className="admin-section-title">Files</h3>
        <div className="admin-table-wrap admin-files-inner">
          <div className="admin-table-head admin-files-head">
            <span>Name</span>
            <span>Size</span>
            <span>Status</span>
            <span>Added</span>
          </div>
          {(project.files || []).map(f => (
            <div key={f.name} className="admin-table-row admin-files-row static">
              <span>{f.name}</span>
              <span>{f.size}</span>
              <span className={`admin-file-status admin-file-${f.status}`}>{statusLabel[f.status] || f.status}</span>
              <span>{f.added}</span>
            </div>
          ))}
          {project.fileCount > (project.files?.length || 0) && (
            <div className="admin-muted" style={{ padding: '8px 12px' }}>
              + {(project.fileCount - project.files.length).toLocaleString()} more files in corpus (not listed)
            </div>
          )}
        </div>
      </section>

      <section className="admin-section">
        <h3 className="admin-section-title">All sessions</h3>
        <div className="admin-mini-list">
          {(project.sessions || []).map(s => (
            <div key={s.id} className="admin-mini-row static">
              <span>{s.title}</span>
              <span className="admin-mini-when">{s.when}</span>
              <span className="admin-muted">{s.messages?.length || 0} msgs</span>
            </div>
          ))}
        </div>
      </section>

      <section className="admin-section">
        <h3 className="admin-section-title">Query turns in this project</h3>
        <div className="admin-mini-list">
          {projectTurns.map(t => (
            <button type="button" key={t.id} className="admin-mini-row" onClick={() => onSelectTurn(t.id)}>
              <span className="admin-mini-when">{formatAuditTime(t.at)}</span>
              <span className="admin-mini-prompt">{(t.input?.text || '').slice(0, 70)}…</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function AdminView({ store }) {
  const {
    projects,
    standaloneChats,
    adminTab,
    setAdminTab,
    adminFilters,
    setAdminFilters,
    adminSelection,
    setAdminSelection,
    exitAdmin,
  } = store;

  const tab = normalizeAdminTab(adminTab);

  useEffect(() => {
    if (tab !== adminTab) setAdminTab(tab);
  }, [adminTab, tab, setAdminTab]);

  const snippets = typeof SNIPPETS !== 'undefined' ? SNIPPETS : {};
  const indexes = useMemo(() => {
    try {
      return deriveAuditIndexes(projects || [], standaloneChats || [], snippets);
    } catch (e) {
      console.error('deriveAuditIndexes failed', e);
      return {
        turns: [],
        users: [],
        adminProjects: [],
        summary: { projectCount: 0, userCount: 0, fileCount: 0, queryCount: 0, noContextCount: 0 },
        insights: null,
      };
    }
  }, [projects, standaloneChats, snippets]);
  const { turns, users, adminProjects, summary, insights } = indexes;

  const filteredTurns = useMemo(() => {
    const q = (adminFilters.query || '').toLowerCase();
    return turns.filter(t => {
      if (adminFilters.userId && t.actorId !== adminFilters.userId) return false;
      if (adminFilters.projectId && t.projectId !== adminFilters.projectId) return false;
      if (adminFilters.eventType && adminFilters.eventType !== 'all' && t.type !== adminFilters.eventType) return false;
      if (q && !(t.input?.text || '').toLowerCase().includes(q) && !(t.projectName || '').toLowerCase().includes(q)) return false;
      return true;
    });
  }, [turns, adminFilters]);

  const selectedTurn = adminSelection?.type === 'turn'
    ? turns.find(t => t.id === adminSelection.id)
    : null;
  const selectedUser = adminSelection?.type === 'user'
    ? users.find(u => u.id === adminSelection.id)
    : null;
  const selectedProject = adminSelection?.type === 'project'
    ? adminProjects.find(p => p.id === adminSelection.id)
    : null;

  const showTurnDetail = tab === 'audit' && selectedTurn;
  const showUserDetail = tab === 'users' && selectedUser;
  const showProjectDetail = tab === 'projects' && selectedProject;

  const tabs = [
    { id: 'audit', label: 'Audit log' },
    { id: 'users', label: 'Users' },
    { id: 'projects', label: 'Projects' },
  ];
  const tabIndex = ADMIN_TAB_IDS.indexOf(tab);

  return (
    <div className="admin-view">
      <div className="admin-toolbar">
        <nav
          className="admin-nav"
          role="tablist"
          aria-label="Admin sections"
          style={{ '--admin-tab-index': Math.max(0, tabIndex) }}
        >
          <span className="admin-nav-pill" aria-hidden />
          {tabs.map(tabItem => (
            <button
              type="button"
              role="tab"
              key={tabItem.id}
              aria-selected={tab === tabItem.id}
              className={tab === tabItem.id ? 'on' : ''}
              onClick={() => {
                setAdminTab(tabItem.id);
                setAdminSelection(null);
              }}
            >
              {tabItem.label}
            </button>
          ))}
        </nav>
        <button type="button" className="admin-exit" onClick={exitAdmin}>
          <span className="admin-exit-ic" aria-hidden><Icon name="arrowLeft" size={12}/></span>
          <span>Back to chat</span>
        </button>
      </div>

      <div className="admin-body">
        {tab === 'audit' && !showTurnDetail && (
          <>
            <AdminSummaryCards summary={summary} />
            <AdminInsights insights={insights} />
            <AdminFilters
              filters={adminFilters}
              setFilters={setAdminFilters}
              users={users}
              projects={adminProjects}
            />
            <AdminAuditTable
              turns={filteredTurns}
              users={users}
              onSelectTurn={(id) => setAdminSelection({ type: 'turn', id })}
            />
            <AdminAnalyticsPlaceholder />
          </>
        )}

        {tab === 'audit' && showTurnDetail && (
          <AdminTurnDetail
            turn={selectedTurn}
            users={users}
            snippets={snippets}
            onBack={() => setAdminSelection(null)}
            onFilterUser={(uid) => {
              setAdminFilters(f => ({ ...f, userId: uid }));
              setAdminSelection(null);
            }}
            onFilterProject={(pid) => {
              if (pid) setAdminFilters(f => ({ ...f, projectId: pid }));
              setAdminSelection(null);
            }}
          />
        )}

        {tab === 'users' && !showUserDetail && (
          <AdminUsersList users={users} onSelectUser={(id) => setAdminSelection({ type: 'user', id })} />
        )}
        {tab === 'users' && showUserDetail && (
          <AdminUserDetail
            user={selectedUser}
            turns={turns}
            adminProjects={adminProjects}
            onBack={() => setAdminSelection(null)}
            onSelectTurn={(id) => {
              setAdminTab('audit');
              setAdminSelection({ type: 'turn', id });
            }}
          />
        )}

        {tab === 'projects' && !showProjectDetail && (
          <AdminProjectsList adminProjects={adminProjects} onSelectProject={(id) => setAdminSelection({ type: 'project', id })} />
        )}
        {tab === 'projects' && showProjectDetail && (
          <AdminProjectDetail
            project={selectedProject}
            turns={turns}
            onBack={() => setAdminSelection(null)}
            onSelectTurn={(id) => {
              setAdminTab('audit');
              setAdminSelection({ type: 'turn', id });
            }}
          />
        )}
      </div>
    </div>
  );
}

Object.assign(window, { AdminView });
