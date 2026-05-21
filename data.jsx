// Sample data + snippet bank for the WECC RAG prototype.
// Everything is held in window globals so the rest of the app can mutate it
// while keeping setState driven by a tick counter (kept dead-simple — this is
// a prototype, not a Redux app).

// React hook aliases — declared once here (first loaded file) so all other
// Babel scripts share them in the global lexical scope.
const { useState, useEffect, useRef, useCallback, useMemo, Fragment } = React;

// Citation snippets: keyed by `id`, referenced by sessions and inserted by
// the assistant's response stitcher.
const SNIPPETS = {
  'if-mib-hcin': {
    file: 'IF-MIB.txt',
    loc: 'lines 410–418',
    project: 'cisco',
    text:
`ifHCInOctets OBJECT-TYPE
    SYNTAX        Counter64
    MAX-ACCESS    read-only
    STATUS        current
    DESCRIPTION
      "The total number of octets received on the
      interface, including framing characters. This object
      is a 64-bit version of ifInOctets."
    ::= { ifXEntry 6 }`
  },
  'if-mib-hcout': {
    file: 'IF-MIB.txt',
    loc: 'lines 429–437',
    project: 'cisco',
    text:
`ifHCOutOctets OBJECT-TYPE
    SYNTAX        Counter64
    MAX-ACCESS    read-only
    STATUS        current
    DESCRIPTION
      "The total number of octets transmitted out of the
      interface, including framing characters. 64-bit
      version of ifOutOctets."
    ::= { ifXEntry 10 }`
  },
  'cisco-cli-hc': {
    file: 'cisco-ios-cli-ref-15.4.pdf',
    loc: 'page 84',
    project: 'cisco',
    text:
`High-Capacity Counters

On interfaces operating at 20 Gbps or greater, the 32-bit
ifInOctets/ifOutOctets counters wrap too rapidly to be
useful for accurate polling. Cisco IOS automatically
exposes the 64-bit ifHCInOctets / ifHCOutOctets variants
defined by IF-MIB. Configure your NMS to poll the HC
variants for any interface ≥ 1 Gbps.`
  },
  'snmpv3-notes': {
    file: 'snmp-v3-deployment-notes.md',
    loc: 'section 4',
    project: 'cisco',
    text:
`## 4. Creating an SNMPv3 user (Nexus 9k)

config t
  snmp-server user wecc-nms wecc-admins auth sha
    <auth-pass> priv aes-128 <priv-pass>
  snmp-server group wecc-admins v3 priv read all-ops
end

Verify from the NMS with:
  snmpget -v3 -l authPriv -u wecc-nms ...`
  },
  'nexus-snmp-cfg': {
    file: 'Nexus 9000 SNMP cfg examples.pdf',
    loc: 'page 12',
    project: 'cisco',
    text:
`Example: Creating an SNMPv3 user with authentication and
privacy on Nexus 9000.

  snmp-server user <user> <group> auth sha <auth-pwd>
    priv aes-128 <priv-pwd>

Verify with: show snmp user
The user must be bound to a group with the appropriate
read/write views before queries will succeed.`
  },
  'runbook-alarm': {
    file: 'WECC ops runbook v3.docx',
    loc: '§3.2 Alarm escalation',
    project: 'cisco',
    text:
`3.2 Alarm escalation

Severity 1 alarms (link down on aggregate, BGP session
flap on transit) are paged immediately to the on-call
NOC engineer. Severity 2 (counter thresholds, env
warnings) wait for next business day unless they repeat
within 15 minutes. Severity 3 are summarized in the
daily report only.`
  },
  'cip007-r2': {
    file: 'CIP-007 compliance checklist.pdf',
    loc: 'requirement R2.1',
    project: 'wecc',
    text:
`R2.1 Each Responsible Entity shall implement a
documented process to identify a source or sources that
the Responsible Entity tracks for the release of
cyber security patches for applicable Cyber Assets that
are updateable and for which a patching source exists.`
  },
};

const PROJECTS_INIT = [
  {
    id: 'cisco',
    name: 'Cisco MIB Reference',
    desc: 'Network device docs + vendor MIB definitions for ops team.',
    instructions:
`You are an SNMP / network ops assistant for the WECC ops team.

Cite MIB names and exact OIDs when relevant. Prefer terse,
technical answers in Markdown. Use code blocks for snippets
and OID values. When a question touches WECC compliance,
flag CIP-007 / CIP-010 implications inline.`,
    users: [
      { id: 'rs', initials: 'RS', name: 'Ryan Sandoval', email: 'ryan@wecc.local', role: 'admin', you: true, color: 'user-1' },
      { id: 'mh', initials: 'MH', name: 'Muhammad Husain', email: 'muhammad@wecc.local', role: 'editor', color: 'user-2' },
      { id: 'sk', initials: 'SK', name: 'Santi Kowalski', email: 'santi@wecc.local', role: 'user', color: 'user-3' },
    ],
    files: [
      { name: 'cisco-ios-cli-ref-15.4.pdf', size: '4.2 MB', status: 'ok', added: 'today' },
      { name: 'IF-MIB.txt', size: '74 KB', status: 'ok', added: 'today' },
      { name: 'CISCO-IF-EXTENSION-MIB.txt', size: '180 KB', status: 'ok', added: 'today' },
      { name: 'CISCO-PROCESS-MIB.txt', size: '94 KB', status: 'ok', added: 'week' },
      { name: 'Nexus 9000 SNMP cfg examples.pdf', size: '2.1 MB', status: 'ok', added: 'week' },
      { name: 'WECC ops runbook v3.docx', size: '1.1 MB', status: 'ok', added: 'week' },
      { name: 'snmp-v3-deployment-notes.md', size: '32 KB', status: 'ok', added: 'week' },
      { name: 'CIP-007 compliance checklist.pdf', size: '780 KB', status: 'ok', added: 'older' },
      { name: 'BGP graceful-restart RFC4724.pdf', size: '410 KB', status: 'proc', added: 'today' },
      { name: 'NEXUS-9k-FIRMWARE-RELNOTES-10.3.docx', size: '—', status: 'fail', added: 'today', error: 'Unsupported encoding (treat as scan; OCR queued)' },
      { name: 'arp-cache-tuning.md', size: '12 KB', status: 'ok', added: 'older' },
      { name: 'IS-IS area design notes.md', size: '24 KB', status: 'ok', added: 'older' },
      { name: 'qos-policy-edge.txt', size: '8 KB', status: 'ok', added: 'older' },
    ],
    sessions: [
      {
        id: 'sess-1', title: 'ifHCInOctets OID lookup', author: 'rs', when: '4m', whenDate: Date.now() - 4*60_000,
        messages: [
          { role: 'user', text: "What's the OID for ifHCInOctets and which MIB defines it?" },
          {
            role: 'assistant',
            html: `<p><code>ifHCInOctets</code> is defined in <b>IF-MIB</b> at OID <code>1.3.6.1.2.1.31.1.1.1.6</code>{{C:if-mib-hcin}}. It's a <code>Counter64</code> for received octets on an interface — the 64-bit replacement for <code>ifInOctets</code>, used because the 32-bit counter wraps too quickly on links ≥ 20 Gbps{{C:cisco-cli-hc}}.</p><p>To poll it via SNMPv3 on a Cisco device, see the configuration example on page 84 of the IOS CLI reference.</p>`,
            cites: ['if-mib-hcin', 'cisco-cli-hc']
          },
          { role: 'user', text: 'And the equivalent for outbound?' },
          {
            role: 'assistant',
            html: `<p><code>ifHCOutOctets</code> — OID <code>1.3.6.1.2.1.31.1.1.1.10</code>{{C:if-mib-hcout}}, same <code>Counter64</code> shape as the inbound counter.</p>`,
            cites: ['if-mib-hcout']
          }
        ]
      },
      {
        id: 'sess-2', title: 'SNMPv3 user creation on N9k', author: 'mh', when: '1h', whenDate: Date.now() - 60*60_000,
        messages: [
          { role: 'user', text: 'Walk me through creating an SNMPv3 user with priv on a Nexus 9k.' },
          {
            role: 'assistant',
            html: `<p>Here's the minimal config for an SNMPv3 user with auth + priv on Nexus 9k{{C:nexus-snmp-cfg}}:</p>
<pre>config t
  snmp-server user wecc-nms wecc-admins \\
    auth sha &lt;auth-pwd&gt; priv aes-128 &lt;priv-pwd&gt;
  snmp-server group wecc-admins v3 priv read all-ops
end</pre>
<p>Then verify from the NMS{{C:snmpv3-notes}}:</p>
<pre>snmpget -v3 -l authPriv -u wecc-nms \\
  -a SHA -A &lt;auth-pwd&gt; -x AES -X &lt;priv-pwd&gt; \\
  &lt;device&gt; 1.3.6.1.2.1.31.1.1.1.6.1</pre>`,
            cites: ['nexus-snmp-cfg', 'snmpv3-notes']
          }
        ]
      },
      {
        id: 'sess-3', title: 'Alarm escalation playbook', author: 'sk', when: '2h', whenDate: Date.now() - 2*60*60_000,
        messages: [
          { role: 'user', text: 'Summarize the runbook section on alarm escalation.' },
          {
            role: 'assistant',
            html: `<p>From the WECC ops runbook v3, §3.2{{C:runbook-alarm}}:</p>
<ul>
<li><b>Sev 1</b> (aggregate link down, BGP flap on transit) → page on-call NOC immediately.</li>
<li><b>Sev 2</b> (counter thresholds, env warnings) → next business day, unless repeating within 15 min.</li>
<li><b>Sev 3</b> → daily report only.</li>
</ul>`,
            cites: ['runbook-alarm']
          }
        ]
      },
      {
        id: 'sess-4', title: 'BGP graceful restart timers', author: 'rs', when: 'yest', whenDate: Date.now() - 26*60*60_000,
        messages: [
          { role: 'user', text: 'What are recommended BGP graceful-restart timers for our edge?' },
          {
            role: 'assistant',
            html: `<p class="msg-warn-noctx">No relevant snippets found in this project's files. Answering from general knowledge — please verify against your environment.</p><p>RFC 4724 recommends a <code>restart-time</code> of 120 seconds and a <code>stalepath-time</code> of 360 seconds as starting values. On Cisco edge routers handling transit, 300 / 600 is a common production tweak to absorb control-plane restarts cleanly.</p>`,
            cites: [],
            noContext: true,
          }
        ]
      },
      {
        id: 'sess-5', title: 'PoE+ budget calculation', author: 'sk', when: '2d', whenDate: Date.now() - 2*24*60*60_000,
        messages: [],
      },
    ]
  },
  {
    id: 'wecc',
    name: 'WECC Compliance Docs',
    desc: 'NERC-CIP and WECC standards corpus.',
    instructions: 'Answer with explicit NERC-CIP requirement IDs. Be conservative — flag uncertainty.',
    users: [
      { id: 'rs', initials: 'RS', name: 'Ryan Sandoval', email: 'ryan@wecc.local', role: 'admin', you: true, color: 'user-1' },
      { id: 'jr', initials: 'JR', name: 'Jamie Rangel', email: 'jamie@wecc.local', role: 'editor', color: 'user-4' },
    ],
    files: [
      { name: 'NERC-CIP-007-6.pdf', size: '1.2 MB', status: 'ok', added: 'week' },
      { name: 'CIP-010-3 R3 evidence requirements.pdf', size: '420 KB', status: 'ok', added: 'week' },
      { name: 'WECC reliability standards — 2024 set.pdf', size: '12 MB', status: 'ok', added: 'older' },
      { name: 'Internal audit findings Q3-2025.docx', size: '180 KB', status: 'ok', added: 'older' },
    ],
    sessions: [
      { id: 's-w1', title: 'CIP-007 patching evidence', author: 'rs', when: '3d', whenDate: Date.now() - 3*24*60*60_000, messages: [] },
    ]
  },
  {
    id: 'runbooks',
    name: 'Field Tech Runbooks',
    desc: 'On-site procedures, vendor manuals, escalation playbooks.',
    instructions: '',
    users: [
      { id: 'rs', initials: 'RS', name: 'Ryan Sandoval', email: 'ryan@wecc.local', role: 'admin', you: true, color: 'user-1' },
      { id: 'mh', initials: 'MH', name: 'Muhammad Husain', email: 'muhammad@wecc.local', role: 'editor', color: 'user-2' },
      { id: 'tg', initials: 'TG', name: 'Terri Gomez', email: 'terri@wecc.local', role: 'user', color: 'user-5' },
    ],
    files: [],
    sessions: []
  }
];

const STANDALONE_CHATS_INIT = [
  {
    id: 'g-1',
    title: 'SNMP community strings — security note',
    when: '2h',
    whenDate: Date.now() - 2 * 60 * 60_000,
    visibility: 'public',
    messages: [
      { role: 'user', text: 'Are SNMPv2c community strings still acceptable on edge routers?' },
      {
        role: 'assistant',
        html: '<p>For lab gear, sometimes — but production edge routers at WECC should use <b>SNMPv3</b> with authPriv. v2c communities are trivially sniffed on shared L2 segments.</p>',
      },
    ],
  },
  {
    id: 'g-2',
    title: 'New chat',
    when: 'now',
    whenDate: Date.now(),
    visibility: 'public',
    messages: [],
  },
];

const SUGGESTIONS_BY_PROJECT = {
  cisco: [
    { q: "What's the OID for ifHCInOctets in IF-MIB?", hint: 'OID lookup' },
    { q: 'Show me how to enable SNMPv3 on a Nexus 9k.', hint: 'Config walkthrough' },
    { q: 'Summarize the alarm escalation section of the ops runbook.', hint: 'Runbook summary' },
    { q: 'Which MIBs define interface counters and which are 64-bit?', hint: 'Cross-doc' },
  ],
  wecc: [
    { q: 'What evidence does CIP-007 R2 require for patching?', hint: 'Compliance' },
    { q: 'Difference between CIP-010 R1 and R3?', hint: 'Compare reqs' },
    { q: 'Audit findings from Q3-2025 — top three by severity.', hint: 'Summary' },
    { q: 'Which WECC standards apply to a new substation in CA?', hint: 'Scope' },
  ],
  runbooks: [
    { q: 'How do I replace a fan tray on a 9508?', hint: 'Procedure' },
    { q: 'What is the escalation path for a Sev-1 outage?', hint: 'Playbook' },
    { q: 'Vendor contact for Juniper RMA?', hint: 'Lookup' },
    { q: 'Pre-shift checklist for a field tech.', hint: 'Checklist' },
  ],
};

Object.assign(window, { SNIPPETS, PROJECTS_INIT, STANDALONE_CHATS_INIT, SUGGESTIONS_BY_PROJECT });
