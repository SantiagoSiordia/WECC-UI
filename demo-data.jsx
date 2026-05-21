// demo-data.jsx
// Extends the existing PROJECTS_INIT / SNIPPETS with the legal-domain
// project used in the demo's second-half (cross-domain breadth moment).
// Also exposes DEMO_PROJECTS — the full set the demo App boots from.

// ── Legal snippets ───────────────────────────────────────────────────
const DEMO_LEGAL_SNIPPETS = {
  'us-9847231-claim1': {
    file: 'US-9,847,231 — issued patent.pdf',
    loc: 'claim 1, col. 14 ll. 22-41',
    project: 'atlas',
    text:
`1. A method for distributed cache invalidation comprising:
   receiving, at a coordinator node, a write request directed
   to a key-value pair; broadcasting an invalidation message
   to a quorum of peer nodes; and confirming the write only
   upon receipt of acknowledgment from a majority of said
   peer nodes — wherein the coordinator selects said peer
   nodes from a consistent-hashing ring partitioned by tenant.`
  },
  'license-2022-target': {
    file: 'TargetCo × Greenfield License (2022-04-11).pdf',
    loc: '§3.4 Exclusivity, p.6',
    project: 'atlas',
    text:
`3.4 Exclusivity. During the Term, Greenfield grants
TargetCo a worldwide, exclusive, royalty-free license
to the Licensed Patents in the Cache Coordination Field
(as defined in Schedule A). TargetCo shall have the right
to sublicense to Affiliates only; any third-party
sublicense requires Greenfield's prior written consent,
not to be unreasonably withheld.`
  },
  'board-minutes-2024-q4': {
    file: 'TargetCo board minutes 2024-Q4.docx',
    loc: 'item 7, p. 11',
    project: 'atlas',
    text:
`Item 7 — IP exposure review. The General Counsel reported
that an unsolicited cease-and-desist letter had been
received from NorthShore Systems on Sept 18, 2024,
asserting that TargetCo's "Atlas Cache" product reads
on three claims of US-9,847,231. Outside counsel
recommended (i) a non-infringement opinion and (ii)
opening license discussions; the Board approved (i)
without prejudice to (ii).`
  },
  'cease-desist-northshore': {
    file: 'NorthShore C&D letter 2024-09-18.pdf',
    loc: 'page 2, ¶3',
    project: 'atlas',
    text:
`Without limitation, NorthShore Systems asserts that
TargetCo's "Atlas Cache" product, as described in
TargetCo's public materials, embodies claims 1, 4, and
12 of US-9,847,231 (the "Patent"). NorthShore demands
that TargetCo (a) immediately cease and desist all
manufacture, use, offer for sale, and sale of the
infringing product, and (b) provide a written
accounting of all sales of said product to date.`
  },
  'tc-revenue-q3-2024': {
    file: 'TargetCo financials 2024-Q3.xlsx',
    loc: 'sheet: Product Lines, row 14',
    project: 'atlas',
    text:
`Atlas Cache (SaaS)        Q3 2024 revenue: $ 18.4 M
                          gross margin   : 71.2 %
                          customer count : 142
                          (% of company)  : 22.7 % of total revenue`
  },
};

// ── Legal project ────────────────────────────────────────────────────
const DEMO_LEGAL_PROJECT = {
  id: 'atlas',
  name: 'Atlas Industries · M&A Diligence',
  desc: 'Patents, contracts, board minutes, and financials for the TargetCo acquisition.',
  instructions:
`You are an M&A due-diligence assistant for the Atlas
Industries deal team.

Cite the document name, exhibit, and page or section for
every claim. When a question touches IP or litigation
risk, surface the exposure quantitatively when possible
(revenue impact, customer counts, license obligations).
Prefer neutral, lawyer-readable prose. Flag anything
ambiguous as "verify with counsel".`,
  users: [
    { id: 'rs', initials: 'RS', name: 'Ryan Sandoval', email: 'ryan@atlas.legal', role: 'admin', you: true, color: 'user-1' },
    { id: 'mb', initials: 'MB', name: 'Marisol Beltran', email: 'marisol@atlas.legal', role: 'editor', color: 'user-4' },
    { id: 'di', initials: 'DI', name: 'Devin Iyer', email: 'devin@atlas.legal', role: 'editor', color: 'user-2' },
    { id: 'ek', initials: 'EK', name: 'External counsel (Knox)', email: 'k.knox@ravenlaw.com', role: 'user', color: 'user-5' },
  ],
  files: [
    { name: 'US-9,847,231 — issued patent.pdf', size: '1.4 MB', status: 'ok', added: 'today', pinned: true, kind: 'patent' },
    { name: 'TargetCo × Greenfield License (2022-04-11).pdf', size: '820 KB', status: 'ok', added: 'today', pinned: true, kind: 'contract' },
    { name: 'NorthShore C&D letter 2024-09-18.pdf', size: '380 KB', status: 'ok', added: 'today', pinned: true, kind: 'letter' },
    { name: 'TargetCo board minutes 2024-Q4.docx', size: '210 KB', status: 'ok', added: 'today', kind: 'minutes' },
    { name: 'TargetCo financials 2024-Q3.xlsx', size: '480 KB', status: 'ok', added: 'today', kind: 'financial' },
    { name: 'Schedule A — Cache Coordination Field (2022).pdf', size: '110 KB', status: 'ok', added: 'today', kind: 'contract' },
    { name: 'Atlas Cache — public product datasheet.pdf', size: '6.4 MB', status: 'ok', added: 'today', kind: 'marketing' },
    { name: 'TargetCo employment agreements (consolidated).pdf', size: '24.1 MB', status: 'ok', added: 'today', kind: 'contract' },
    // …and many more
  ],
  // Cap file count for display only — fileCountTotal is what the chrome shows
  fileCountTotal: 487,
  sessions: [
    {
      id: 's-atlas-1',
      title: 'Patent risk: US-9,847,231',
      author: 'mb', when: '12m', whenDate: Date.now() - 12*60_000,
      messages: [
        { role: 'user', author: 'mb', text: "What's TargetCo's exposure on US-9,847,231? Summarize the chain of correspondence and quantify the revenue at risk." },
        {
          role: 'assistant',
          html:
`<p>TargetCo received a cease-and-desist letter from <b>NorthShore Systems</b> on September 18, 2024, asserting infringement of claims 1, 4, and 12 of US-9,847,231 by the "Atlas Cache" product{{C:cease-desist-northshore}}.</p>

<p>Claim 1 reads on a method for <b>distributed cache invalidation using consistent-hashing-partitioned quorum</b>{{C:us-9847231-claim1}} — substantially the architecture described in TargetCo's public datasheet.</p>

<p><b>Existing license posture.</b> TargetCo holds a 2022 exclusive license from <b>Greenfield Technologies</b> in the "Cache Coordination Field"{{C:license-2022-target}}, but this license does not extend to NorthShore's portfolio — they are separate counterparties. The Greenfield license therefore <b>does not insulate</b> TargetCo from the NorthShore assertion.</p>

<p><b>Revenue at risk.</b> Atlas Cache contributed <b>$18.4 M</b> in Q3 2024 revenue at <b>71.2% gross margin</b>, across 142 customers — roughly <b>22.7% of total company revenue</b>{{C:tc-revenue-q3-2024}}.</p>

<p><b>Board awareness.</b> The Q4 2024 board minutes record that outside counsel was instructed to prepare a non-infringement opinion; license discussions were authorized as a fallback{{C:board-minutes-2024-q4}}.</p>

<p><b>Open question — verify with counsel:</b> whether the work-product privilege over the non-infringement opinion has been preserved in the data room. If not, disclosure exposure may exceed the substantive exposure.</p>`,
          cites: ['cease-desist-northshore', 'us-9847231-claim1', 'license-2022-target', 'tc-revenue-q3-2024', 'board-minutes-2024-q4']
        },
      ]
    },
    {
      id: 's-atlas-2', title: 'Material adverse change clauses', author: 'di', when: '2h', whenDate: Date.now() - 2*60*60_000, messages: []
    },
    {
      id: 's-atlas-3', title: 'Open employment agreements w/ non-competes', author: 'mb', when: 'yest', whenDate: Date.now() - 26*60*60_000, messages: []
    },
  ]
};

const DEMO_LEGAL_SUGGESTIONS = [
  { q: "What's TargetCo's exposure on US-9,847,231? Summarize the chain of correspondence and quantify the revenue at risk.", hint: 'IP risk · multi-doc' },
  { q: 'Which contracts contain change-of-control provisions triggered by this acquisition?', hint: 'Contract review' },
  { q: 'Summarize the audit findings from the Q3-2024 internal review.', hint: 'Summary' },
  { q: 'List all open litigation matters with their exposure estimates.', hint: 'Cross-doc' },
];

// ── Merge into globals ───────────────────────────────────────────────
Object.assign(SNIPPETS, DEMO_LEGAL_SNIPPETS);

const DEMO_PROJECTS = [
  ...PROJECTS_INIT.map(p => ({ ...p })), // shallow-copy original 3
  DEMO_LEGAL_PROJECT,
];

const DEMO_SUGGESTIONS = {
  ...SUGGESTIONS_BY_PROJECT,
  atlas: DEMO_LEGAL_SUGGESTIONS,
};

Object.assign(window, { DEMO_PROJECTS, DEMO_LEGAL_PROJECT, DEMO_LEGAL_SUGGESTIONS, DEMO_SUGGESTIONS });
