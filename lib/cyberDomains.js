// Curated educational models. These are not observations about the author or
// any live environment. Relationships are illustrative, not telemetry.
const node = (id, label, detail, kind = 'Concept') => ({
  id,
  label,
  detail,
  kind,
})
const edge = (from, to, label) => ({ from, to, label })

export const CYBER_DOMAINS = [
  {
    id: 'intel',
    name: 'Threat Intelligence',
    short: 'Threat Intel',
    theme: 'Relationships, with context.',
    description:
      'Connect an illustrative actor, campaign, malware, indicators and techniques. An indicator becomes useful when its context and confidence are understood.',
    categories: ['Malware'],
    terms: /threat|malware|indicator|\bioc\b|attack technique/i,
    reference: {
      label: 'MITRE ATT&CK knowledge base',
      href: 'https://attack.mitre.org/',
    },
    nodes: [
      node(
        'actor',
        'Threat actor',
        'A fictional actor anchors this example. Attribution requires evidence and uncertainty; a shared indicator alone does not establish identity.',
        'Illustrative entity'
      ),
      node(
        'campaign',
        'Campaign',
        'A hypothetical set of related activity connects intent, time and infrastructure. No real campaign or victim is represented.',
        'Illustrative activity'
      ),
      node(
        'malware',
        'Malware',
        'A simulated malware relationship connects a tool to activity. Labels here describe concepts, not a detected sample or an infection.',
        'Illustrative artifact'
      ),
      node(
        'indicator',
        'Domain IOC',
        'example.invalid is a non-operational example indicator. Real indicators need provenance, timestamps, confidence and context.',
        'Illustrative indicator'
      ),
      node(
        'ttp',
        'ATT&CK context',
        'MITRE ATT&CK organizes adversary tactics and techniques. This concept node explains contextual mapping; it does not assert a verified technique match.',
        'Framework context'
      ),
      node(
        'detection',
        'Detection',
        'Intelligence can inform detection hypotheses. Validate those hypotheses against authorized data and record false positives and limitations.',
        'Defensive application'
      ),
    ],
    edges: [
      edge(0, 1, 'associated with'),
      edge(1, 2, 'may use'),
      edge(2, 3, 'may contact'),
      edge(1, 4, 'described through'),
      edge(4, 5, 'informs'),
      edge(3, 5, 'adds context'),
    ],
  },
  {
    id: 'vapt',
    name: 'VAPT',
    short: 'VAPT',
    theme: 'Permission before exploration.',
    description:
      'Follow an authorized vulnerability assessment and penetration test from agreed scope to evidence, severity, remediation and retesting.',
    categories: ['Web', 'Network', 'CTF'],
    terms: /vulnerability|assessment|penetration|remediation/i,
    nodes: [
      node(
        'scope',
        'Authorization',
        'Agree written permission, systems, boundaries, timing and stop conditions before beginning an assessment. A public target is not permission to test.',
        'Assessment boundary'
      ),
      node(
        'discover',
        'Discovery',
        'Identify in-scope assets and exposed services using the agreed methods. Keep evidence and avoid systems outside the authorization.',
        'Assessment stage'
      ),
      node(
        'validate',
        'Validation',
        'Confirm a suspected vulnerability with the least intrusive agreed test. Distinguish reproducible evidence from scanner output.',
        'Assessment stage'
      ),
      node(
        'severity',
        'Severity',
        'Assess technical severity and business context. No CVSS value or risk score is assigned by this illustrative graph.',
        'Qualitative assessment'
      ),
      node(
        'remediate',
        'Remediation',
        'Document the finding, affected scope, evidence and actionable remediation. Agree ownership and priorities with the system owner.',
        'Defensive action'
      ),
      node(
        'retest',
        'Retest',
        'Check the agreed fix and record residual limitations. Retesting closes the feedback loop; it does not guarantee that a system is vulnerability-free.',
        'Validation stage'
      ),
    ],
    edges: [
      edge(0, 1, 'permits'),
      edge(1, 2, 'informs'),
      edge(2, 3, 'supports'),
      edge(3, 4, 'prioritizes'),
      edge(4, 5, 'verified by'),
      edge(5, 0, 'feeds next scope'),
    ],
  },
  {
    id: 'grc',
    name: 'Governance, Risk & Compliance',
    short: 'GRC',
    theme: 'Make accountability visible.',
    description:
      'Connect governance, assets, qualitative risk, controls and audit evidence. Frameworks guide the questions; evidence supports the answers.',
    categories: [],
    terms: /\bgrc\b|governance|compliance|audit|risk register|iso.?27001/i,
    reference: {
      label: 'NIST Cybersecurity Framework',
      href: 'https://www.nist.gov/cyberframework',
    },
    nodes: [
      node(
        'govern',
        'Governance',
        'Define responsibility, risk appetite and policy. Frameworks such as NIST CSF and ISO/IEC 27001 provide context, not an automatic compliance claim.',
        'Accountability'
      ),
      node(
        'assets',
        'Assets',
        'Understand information, services, owners and dependencies before considering what needs protection.',
        'Business context'
      ),
      node(
        'risk',
        'Risk matrix',
        'A qualitative likelihood-and-impact matrix can support discussion. The matrix here is an educational example, not an organizational risk assessment.',
        'Illustrative model'
      ),
      node(
        'control',
        'Controls',
        'Select preventive, detective or corrective controls in response to identified risks and obligations. A named control is not proof of effectiveness.',
        'Risk treatment'
      ),
      node(
        'audit',
        'Audit evidence',
        'Retain evidence that can be examined against defined criteria. Assess design and operation rather than relying on a policy document alone.',
        'Assurance activity'
      ),
      node(
        'improve',
        'Improvement',
        'Review findings, exceptions and changing context. Feed lessons into governance and risk decisions.',
        'Feedback loop'
      ),
    ],
    edges: [
      edge(0, 1, 'assigns ownership'),
      edge(1, 2, 'gives context'),
      edge(2, 3, 'informs treatment'),
      edge(3, 4, 'requires evidence'),
      edge(4, 5, 'identifies gaps'),
      edge(5, 0, 'informs decisions'),
    ],
  },
  {
    id: 'teams',
    name: 'Red / Blue / Purple Team',
    short: 'Red / Blue / Purple',
    theme: 'Practice. Observe. Improve.',
    description:
      'Explore a controlled adversary-emulation exercise and the defensive learning it can produce. Every offensive activity starts with authorization.',
    categories: ['CTF'],
    terms: /red team|blue team|purple team|detection|adversary|emulation/i,
    nodes: [
      node(
        'red',
        'Red team',
        'Emulate agreed adversary behavior within a defined exercise scope. The purpose here is learning about defenses, not unauthorized access.',
        'Authorized exercise'
      ),
      node(
        'technique',
        'Technique',
        'Select an agreed behavior and define what evidence would demonstrate it. Technique selection is illustrative, not a claim about a real intrusion.',
        'Exercise design'
      ),
      node(
        'signal',
        'Telemetry',
        'Observe the test signals produced in an authorized lab. This visualization does not collect or display any real event stream.',
        'Illustrative evidence'
      ),
      node(
        'blue',
        'Blue team',
        'Investigate the signals, test detection logic and identify defensive gaps while maintaining safe operations.',
        'Defensive role'
      ),
      node(
        'purple',
        'Purple team',
        'Share context between offense and defense. Collaborative iteration helps distinguish detection coverage from an exercise merely completing.',
        'Collaborative approach'
      ),
      node(
        'improve',
        'Improvement',
        'Update controls and detection hypotheses, then retest with agreed success criteria. No coverage percentage is asserted.',
        'Learning outcome'
      ),
    ],
    edges: [
      edge(0, 1, 'emulates'),
      edge(1, 2, 'produces test signals'),
      edge(2, 3, 'investigates'),
      edge(0, 4, 'shares context'),
      edge(3, 4, 'shares findings'),
      edge(4, 5, 'guides'),
      edge(5, 1, 'retests'),
    ],
  },
  {
    id: 'ethics',
    name: 'Hacker Ethics',
    short: 'Hacker Ethics',
    theme: 'Intent does not replace consent.',
    description:
      'Compare common educational descriptions of white-hat, gray-hat and black-hat activity through authorization, disclosure and harm. These labels are not legal determinations.',
    categories: [],
    terms:
      /ethic|responsible disclosure|authorization|authorisation|disclosure policy/i,
    reference: {
      label: 'CISA vulnerability disclosure guidance',
      href: 'https://www.cisa.gov/coordinated-vulnerability-disclosure-process',
    },
    nodes: [
      node(
        'white',
        'White hat',
        'Commonly describes authorized security work intended to improve protection. Written scope and responsible handling of evidence still matter.',
        'Educational comparison'
      ),
      node(
        'permission',
        'Authorization',
        'Permission and scope determine what testing is agreed. Good intentions, curiosity and a reachable system do not create authorization.',
        'Boundary'
      ),
      node(
        'gray',
        'Gray hat',
        'A common label for activity that may lack permission even when disclosure is intended. Intent does not remove legal or ethical risk.',
        'Educational comparison'
      ),
      node(
        'disclose',
        'Disclosure',
        'Follow a published disclosure policy or an agreed coordination process. Minimize exposed data and avoid further unauthorized testing.',
        'Responsible practice'
      ),
      node(
        'black',
        'Black hat',
        'Commonly describes malicious activity involving unauthorized access or harm. The label is educational, not a judgment about any person here.',
        'Educational comparison'
      ),
      node(
        'harm',
        'Impact & harm',
        'Consider privacy, operational disruption and affected people. Choose safe labs and explicit permission when learning.',
        'Ethical consideration'
      ),
    ],
    edges: [
      edge(0, 1, 'works within'),
      edge(0, 3, 'coordinates'),
      edge(2, 1, 'may lack'),
      edge(2, 3, 'may seek'),
      edge(4, 1, 'violates'),
      edge(4, 5, 'can cause'),
      edge(3, 5, 'aims to reduce'),
    ],
  },
  {
    id: 'infosec',
    name: 'Information Security',
    short: 'Information Security',
    theme: 'Protect what systems make possible.',
    description:
      'Explore confidentiality, integrity and availability alongside identity, data protection and resilience. Security decisions balance these objectives in context.',
    categories: ['Web', 'Network', 'Forensics'],
    terms:
      /confidentiality|integrity|availability|identity|resilience|data security/i,
    nodes: [
      node(
        'confidentiality',
        'Confidentiality',
        'Protect information from unauthorized disclosure. Access decisions, encryption and handling practices can support this objective.',
        'CIA principle'
      ),
      node(
        'integrity',
        'Integrity',
        'Preserve information accuracy and protect against unauthorized changes. Validation, controlled changes and trustworthy evidence can help.',
        'CIA principle'
      ),
      node(
        'availability',
        'Availability',
        'Keep information and services accessible when authorized users need them. Consider dependencies, capacity and recovery.',
        'CIA principle'
      ),
      node(
        'identity',
        'Identity',
        'Authenticate identities and authorize only the access required. Review privileged access and changes over time.',
        'Supporting practice'
      ),
      node(
        'data',
        'Data security',
        'Understand data ownership, classification and lifecycle. Select controls for storage, processing, sharing and disposal.',
        'Supporting practice'
      ),
      node(
        'resilience',
        'Resilience',
        'Prepare to sustain and recover essential functions. Backups, recovery exercises and lessons learned support resilience.',
        'Supporting practice'
      ),
    ],
    edges: [
      edge(3, 0, 'restricts access'),
      edge(4, 0, 'protects disclosure'),
      edge(4, 1, 'protects changes'),
      edge(1, 2, 'supports reliable use'),
      edge(5, 2, 'supports recovery'),
      edge(3, 4, 'enforces permissions'),
    ],
  },
  {
    id: 'soc',
    name: 'SOC / Incident Response',
    short: 'SOC / Incident Response',
    theme: 'From a signal to a considered response.',
    description:
      'Follow an illustrative event through alerting, triage, investigation, containment and recovery. This is a learning model, not a running monitoring system.',
    categories: ['Forensics'],
    terms:
      /incident|\bsoc\b|\bsiem\b|triage|containment|log analysis|recovery/i,
    reference: {
      label: 'NIST incident response guidance',
      href: 'https://csrc.nist.gov/pubs/sp/800/61/r3/final',
    },
    nodes: [
      node(
        'event',
        'Event',
        'A hypothetical log entry or observation begins the model. Events can be benign; there is no real data collection in this scene.',
        'Illustrative signal'
      ),
      node(
        'alert',
        'Alert',
        'A hypothetical detection rule raises an alert. An alert is a request for examination, not proof of an incident.',
        'Illustrative signal'
      ),
      node(
        'triage',
        'Triage',
        'Validate relevance, available evidence and urgency. Record uncertainty and route the case using the response plan.',
        'Response activity'
      ),
      node(
        'investigate',
        'Investigation',
        'Establish scope and a supported timeline. Preserve relevant evidence and distinguish facts from hypotheses.',
        'Response activity'
      ),
      node(
        'contain',
        'Containment',
        'Choose proportionate, authorized actions to limit impact while considering evidence preservation and operational needs.',
        'Response activity'
      ),
      node(
        'recover',
        'Recovery',
        'Restore trusted operation, validate recovery and capture lessons that can improve preparation and detection.',
        'Response activity'
      ),
    ],
    edges: [
      edge(0, 1, 'may trigger'),
      edge(1, 2, 'requires'),
      edge(2, 3, 'escalates to'),
      edge(3, 4, 'informs'),
      edge(4, 5, 'enables'),
      edge(5, 1, 'improves detection'),
    ],
  },
]

// Shared, bounded spatial layout. Every domain has its own meaningful edges.
export const NODE_POSITIONS = [
  [-2.8, 1.65, 0.1],
  [0, 2.25, -0.7],
  [2.8, 1.35, 0.15],
  [-2.65, -1.45, -0.4],
  [0, -2, 0.65],
  [2.7, -1.3, -0.3],
]
export const NODE_COLORS = [
  '#a4f4c4',
  '#79d9e8',
  '#c5b7f3',
  '#f0c893',
  '#79d9e8',
  '#a4f4c4',
]

export function relatedResearch(domain, writeups) {
  return writeups
    .filter(
      (w) =>
        domain.categories.includes(w.category) ||
        domain.terms.test(`${w.title || ''} ${w.overview || ''}`)
    )
    .slice(0, 3)
}
