export type LeaderRecord = {
  id: string;
  name: string;
  designation: string;
  department: string;
  responsibility: string;
  office: string;
  officialPortal: string;
  roleBadge: string;
  initials: string;
  coordinatingServices?: string[];
};

export const GOVERNMENT_LEADERSHIP: LeaderRecord[] = [
  {
    id: "governor",
    name: "Governor of Maharashtra",
    designation: "Hon'ble Governor",
    department: "Raj Bhavan, Maharashtra",
    responsibility: "Constitutional Head of the State of Maharashtra, overseeing constitutional governance, state university chancellor duties, and statutory commissions.",
    office: "Raj Bhavan, Walkeshwar Road, Malabar Hill, Mumbai 400035",
    officialPortal: "https://rajbhavan-maharashtra.gov.in",
    roleBadge: "Constitutional Head",
    initials: "GM",
    coordinatingServices: ["Statutory Commission Oversight", "Constitutional Appeals"],
  },
  {
    id: "chief-minister",
    name: "Chief Minister of Maharashtra",
    designation: "Hon'ble Chief Minister",
    department: "General Administration, Home & Urban Development",
    responsibility: "Head of Government, steering state policy, digital public infrastructure, inter-departmental convergence, and EKAM citizen service delivery.",
    office: "Mantralaya, Madam Cama Road, Nariman Point, Mumbai 400032",
    officialPortal: "https://maharashtra.gov.in",
    roleBadge: "Head of Government",
    initials: "CM",
    coordinatingServices: ["Urban Development Services", "General Administration", "Direct Citizen Services"],
  },
  {
    id: "deputy-cm-1",
    name: "Deputy Chief Minister",
    designation: "Hon'ble Deputy Chief Minister",
    department: "Finance & Planning Department",
    responsibility: "Guiding state economic policy, public infrastructure financing, treasury allocations, and citizen welfare scheme disbursements.",
    office: "Mantralaya, Madam Cama Road, Nariman Point, Mumbai 400032",
    officialPortal: "https://finance.maharashtra.gov.in",
    roleBadge: "State Executive",
    initials: "DCM",
    coordinatingServices: ["Treasury Payments", "Welfare Scheme Financing", "Public Service Budgeting"],
  },
  {
    id: "chief-secretary",
    name: "Chief Secretary",
    designation: "Chief Secretary, IAS",
    department: "Government of Maharashtra",
    responsibility: "Senior-most civil servant leading administrative machinery, inter-departmental coordination, and statewide implementation of the RTS Act.",
    office: "Chief Secretary's Office, 6th Floor, Mantralaya, Mumbai 400032",
    officialPortal: "https://maharashtra.gov.in",
    roleBadge: "Administrative Head",
    initials: "CS",
    coordinatingServices: ["Inter-Departmental Coordination", "District Collectorates Supervision"],
  },
  {
    id: "sec-it",
    name: "Principal Secretary (IT)",
    designation: "Principal Secretary, IAS",
    department: "Information Technology & DIT",
    responsibility: "Directing state digital infrastructure, e-governance policy, data interoperability standards, and EKAM / MahaOnline platform architecture.",
    office: "Directorate of Information Technology, 7th Floor, Mantralaya, Mumbai 400032",
    officialPortal: "https://it.maharashtra.gov.in",
    roleBadge: "Digital Transformation",
    initials: "PS",
    coordinatingServices: ["EKAM Citizen Portal", "DigiLocker Integration", "Data Interoperability Framework"],
  },
  {
    id: "rts-commissioner",
    name: "State Chief Commissioner",
    designation: "State RTS Commissioner",
    department: "Maharashtra Right to Public Services Commission",
    responsibility: "Ensuring transparent, time-bound delivery of notified citizen services under the Maharashtra Right to Public Services Act (RTSA 2015).",
    office: "Maharashtra RTS Commission, Old Secretariat Building, Mumbai 400032",
    officialPortal: "https://aaplesarkar.mahaonline.gov.in",
    roleBadge: "Citizen Rights Oversight",
    initials: "RTS",
    coordinatingServices: ["Statutory RTS Timelines", "Grievance Redressal Appeals", "Notified Public Services"],
  },
];
