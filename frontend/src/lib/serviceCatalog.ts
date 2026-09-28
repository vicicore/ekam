export type RequiredDoc = {
  docType: string;
  name: string;
  description: string;
  mandatory: boolean;
};

export type ProcessStep = {
  stepNumber: number;
  title: string;
  actor: "Citizen" | "SETU Orchestrator" | "Department" | "DigiLocker / Vault";
  description: string;
};

export type ServiceRecord = {
  id: string;
  name: string;
  department: string;
  departmentId: string;
  category: string;
  purpose: string;
  whoCanApply: string;
  eligibilityCriteria: string[];
  prerequisites: string[];
  requiredDocuments: RequiredDoc[];
  processSteps: ProcessStep[];
  consentDetails: {
    dataShared: string;
    recipient: string;
    purpose: string;
    retention: string;
  };
  relatedLifeEvent?: string;
  applicationRoute: string;
  slaDays: number;
};

export const SERVICE_CATALOG: ServiceRecord[] = [
  {
    id: "income-certificate",
    name: "Income Certificate",
    department: "Revenue Department",
    departmentId: "revenue",
    category: "Certificates",
    purpose: "Official certification of an individual's or household's annual income issued by the competent revenue authority for educational admissions, fee concessions, and government welfare programs.",
    whoCanApply: "Any permanent resident of Maharashtra residing within the jurisdiction of the respective Tahsildar / Sub-Divisional Officer.",
    eligibilityCriteria: [
      "Permanent resident of Maharashtra",
      "Applicant or head of family must declare verified annual family income",
      "No conflicting income certificate issued for the same financial period"
    ],
    prerequisites: [
      "Verified identity proof in SETU Document Vault or DigiLocker",
      "Verified address proof in Maharashtra"
    ],
    requiredDocuments: [
      { docType: "identity_verification", name: "Identity Proof", description: "Aadhaar Card, Voter ID, or PAN Card", mandatory: true },
      { docType: "domicile_certificate", name: "Address / Residence Proof", description: "Ration Card, Electricity Bill, or Domicile Certificate", mandatory: true },
      { docType: "income_certificate", name: "Income Proof / Declaration", description: "Salary slips, Form 16, or Talathi Income Verification Report", mandatory: true }
    ],
    processSteps: [
      { stepNumber: 1, title: "Vault & Eligibility Check", actor: "SETU Orchestrator", description: "Verifies existing documents in citizen vault to eliminate redundant submissions." },
      { stepNumber: 2, title: "Explicit Citizen Consent", actor: "Citizen", description: "Citizen reviews and authorizes sharing of vault records with the Revenue Department." },
      { stepNumber: 3, title: "Tahsildar Scrutiny & Field Report", actor: "Department", description: "Revenue officer verifies annual earnings against local records." },
      { stepNumber: 4, title: "Digitally Signed Certificate", actor: "Department", description: "Signed certificate issued and auto-deposited into citizen's SETU Document Vault." }
    ],
    consentDetails: {
      dataShared: "Citizen Full Name, Residential Address, Family Member Count, Declared Annual Income",
      recipient: "Revenue Department, Government of Maharashtra",
      purpose: "Issuance of official Income Certificate under Maharashtra Right to Public Services Act",
      retention: "Maintained in departmental records as per state statutory retention schedule"
    },
    relatedLifeEvent: "college_admission_scholarship",
    applicationRoute: "/services/income-certificate",
    slaDays: 15
  },
  {
    id: "domicile-certificate",
    name: "Domicile Certificate",
    department: "Revenue Department",
    departmentId: "revenue",
    category: "Certificates",
    purpose: "Certifies that an applicant has been a resident of Maharashtra for at least 15 continuous years, necessary for state-quota educational seats and government employment.",
    whoCanApply: "Citizens who have resided continuously in Maharashtra for a minimum of 15 years.",
    eligibilityCriteria: [
      "Continuous residence of at least 15 years in Maharashtra",
      "School leaving certificate or proof of continuous residence",
      "Parental residence proof in case of minors"
    ],
    prerequisites: [
      "Continuous proof of residence for 15 years",
      "Valid Identity Proof in SETU Vault"
    ],
    requiredDocuments: [
      { docType: "identity_verification", name: "Identity Proof", description: "Aadhaar Card / Voter ID / Passport", mandatory: true },
      { docType: "domicile_certificate", name: "15-Year Residence Evidence", description: "School Leaving Certificate, Electricity Bills, or Property Tax receipts", mandatory: true }
    ],
    processSteps: [
      { stepNumber: 1, title: "Digital Verification", actor: "SETU Orchestrator", description: "Validates stored address credentials." },
      { stepNumber: 2, title: "Citizen Consent", actor: "Citizen", description: "Authorizes Revenue Department verification." },
      { stepNumber: 3, title: "SDO / Executive Magistrate Verification", actor: "Department", description: "Verification of 15-year residency records." },
      { stepNumber: 4, title: "Issuance", actor: "Department", description: "Digitally signed Domicile Certificate issued to citizen vault." }
    ],
    consentDetails: {
      dataShared: "Applicant Full Name, Date of Birth, 15-Year Address History",
      recipient: "Revenue Department, Government of Maharashtra",
      purpose: "Residency verification for Domicile Certificate issuance",
      retention: "Permanent statutory record"
    },
    relatedLifeEvent: "college_admission_scholarship",
    applicationRoute: "/services/domicile-certificate",
    slaDays: 15
  },
  {
    id: "caste-certificate",
    name: "Caste Certificate",
    department: "Social Justice Department",
    departmentId: "social-justice",
    category: "Certificates",
    purpose: "Official verification of caste or tribe category for affirmative action, welfare schemes, and reserved educational entitlements in Maharashtra.",
    whoCanApply: "Citizens belonging to SC, ST, VJNT, OBC, or SBC categories with ancestral lineage residing in Maharashtra prior to the deemed date.",
    eligibilityCriteria: [
      "Belonging to a recognized reserved category in Maharashtra",
      "Lineage document showing caste before the statutory deemed date (1950/1961/1967)",
      "Permanent residence in Maharashtra"
    ],
    prerequisites: [
      "Family tree / ancestral lineage documentation",
      "Identity and address verification"
    ],
    requiredDocuments: [
      { docType: "identity_verification", name: "Identity Proof", description: "Aadhaar Card or Voter ID", mandatory: true },
      { docType: "domicile_certificate", name: "Residence Proof", description: "Proof of residence in Maharashtra", mandatory: true },
      { docType: "caste_certificate", name: "Ancestral Caste Proof", description: "Father's or grandfather's school leaving certificate with caste mentioned", mandatory: true }
    ],
    processSteps: [
      { stepNumber: 1, title: "Document Vault Screening", actor: "SETU Orchestrator", description: "Checks available lineage and identity documents in vault." },
      { stepNumber: 2, title: "Explicit Consent", actor: "Citizen", description: "Consent to transmit genealogy details to Social Justice authority." },
      { stepNumber: 3, title: "Scrutiny by Competent Authority", actor: "Department", description: "Sub-Divisional Officer verifies records against district archives." },
      { stepNumber: 4, title: "Certificate Issuance", actor: "Department", description: "Caste Certificate issued with barcode and digital signature." }
    ],
    consentDetails: {
      dataShared: "Applicant Personal Details, Parental Caste Records, Family Genealogy",
      recipient: "Social Justice & Special Assistance Department",
      purpose: "Issuance of Caste Certificate",
      retention: "Permanent record as per state archive norms"
    },
    relatedLifeEvent: "college_admission_scholarship",
    applicationRoute: "/services/caste-certificate",
    slaDays: 21
  },
  {
    id: "scholarship-support",
    name: "Higher Education Scholarship Support",
    department: "Higher & Technical Education",
    departmentId: "higher-education",
    category: "Education",
    purpose: "End-to-end scholarship discovery, fee reimbursement, and direct benefit transfer for eligible higher and technical education students across Maharashtra.",
    whoCanApply: "Students enrolled in recognized diploma, degree, engineering, or professional courses in Maharashtra meeting merit and income thresholds.",
    eligibilityCriteria: [
      "Enrolled in a recognized institution in Maharashtra",
      "Verified Income Certificate below statutory cap (e.g. ₹8 Lakhs)",
      "Verified Domicile of Maharashtra",
      "Regular attendance and passing marks in qualifying exam"
    ],
    prerequisites: [
      "Verified Income Certificate in SETU Vault",
      "Verified Domicile Certificate in SETU Vault",
      "Verified Identity Credentials"
    ],
    requiredDocuments: [
      { docType: "identity_verification", name: "Identity Proof", description: "Aadhaar verified profile", mandatory: true },
      { docType: "domicile_certificate", name: "Domicile Certificate", description: "Verified Maharashtra Domicile", mandatory: true },
      { docType: "income_certificate", name: "Income Certificate", description: "Current financial year verified income certificate", mandatory: true }
    ],
    processSteps: [
      { stepNumber: 1, title: "Multi-Department Prerequisite Check", actor: "SETU Orchestrator", description: "Reuses verified income and domicile records from Revenue Department." },
      { stepNumber: 2, title: "Citizen Authorization", actor: "Citizen", description: "Grants explicit consent to transfer credentials to Higher Education." },
      { stepNumber: 3, title: "College & Directorate Verification", actor: "Department", description: "Institutional scrutiny of enrollment and fee status." },
      { stepNumber: 4, title: "Sanction & Disbursal", actor: "Department", description: "Direct Benefit Transfer (DBT) to linked account and fee remission." }
    ],
    consentDetails: {
      dataShared: "Identity, Verified Domicile, Verified Family Income, College Enrollment Details",
      recipient: "Higher & Technical Education Department",
      purpose: "Processing of Higher Education Scholarship & Fee Concession",
      retention: "Academic cycle duration + statutory audit period"
    },
    relatedLifeEvent: "college_admission_scholarship",
    applicationRoute: "/services/scholarship-support",
    slaDays: 30
  },
  {
    id: "student-certificate",
    name: "Student Bonafide Verification",
    department: "Higher & Technical Education",
    departmentId: "higher-education",
    category: "Education",
    purpose: "Verification and issuance of academic status certification for state concessions, travel passes, and educational schemes.",
    whoCanApply: "Any student actively enrolled in a government or state-affiliated institution in Maharashtra.",
    eligibilityCriteria: [
      "Active enrollment in an affiliated educational institution",
      "Valid Student ID and admission reference"
    ],
    prerequisites: ["Proof of current admission / student ID"],
    requiredDocuments: [
      { docType: "identity_verification", name: "Student ID Proof", description: "Institution issued identification card", mandatory: true }
    ],
    processSteps: [
      { stepNumber: 1, title: "Verification", actor: "SETU Orchestrator", description: "Checks student credentials against institutional registry." },
      { stepNumber: 2, title: "Endorsement", actor: "Department", description: "Principal / Registrar digital endorsement." },
      { stepNumber: 3, title: "Issuance", actor: "Department", description: "Certificate added to citizen vault." }
    ],
    consentDetails: {
      dataShared: "Student ID, Academic Program, Year of Study",
      recipient: "Higher & Technical Education Department",
      purpose: "Bonafide student status verification",
      retention: "1 academic year"
    },
    relatedLifeEvent: "college_admission_scholarship",
    applicationRoute: "/services/student-certificate",
    slaDays: 7
  },
  {
    id: "worker-registration",
    name: "Shop & Establishment (Worker Registration)",
    department: "Labour Department",
    departmentId: "labour",
    category: "Labour",
    purpose: "Statutory registration under the Maharashtra Shops and Establishments (Regulation of Employment and Conditions of Service) Act for starting a small commercial venture or shop.",
    whoCanApply: "Entrepreneurs, shopkeepers, and commercial establishment owners starting a business in Maharashtra.",
    eligibilityCriteria: [
      "Commercial premises located within Maharashtra municipal or local body limits",
      "Valid proof of identity and business premises ownership or lease",
      "Valid declaration of nature of trade and employee count"
    ],
    prerequisites: ["Verified identity of applicant", "Premises lease agreement or property tax receipt"],
    requiredDocuments: [
      { docType: "identity_verification", name: "Applicant Identity", description: "Aadhaar or PAN Card", mandatory: true },
      { docType: "business_registration", name: "Premises Ownership / Lease", description: "Registered Rent Agreement or Municipal Tax receipt", mandatory: true }
    ],
    processSteps: [
      { stepNumber: 1, title: "Profile Reuse", actor: "SETU Orchestrator", description: "Loads citizen identity and location details from SETU profile." },
      { stepNumber: 2, title: "Citizen Consent", actor: "Citizen", description: "Explicit consent to forward registration intimation to Labour Department." },
      { stepNumber: 3, title: "Labour Officer Intimation Review", actor: "Department", description: "Automated scrutiny and compliance check." },
      { stepNumber: 4, title: "Registration Certificate (Form F)", actor: "Department", description: "Official Registration Certificate issued to Document Vault." }
    ],
    consentDetails: {
      dataShared: "Applicant Identity, Business Trade Name, Premises Address, Category of Trade",
      recipient: "Labour Department, Government of Maharashtra",
      purpose: "Issuance of Shops & Establishments Registration",
      retention: "Valid as per statutory provisions of the Act"
    },
    relatedLifeEvent: "start_small_business",
    applicationRoute: "/services/worker-registration",
    slaDays: 7
  },
  {
    id: "labour-welfare",
    name: "Building & Construction Worker Welfare",
    department: "Labour Department",
    departmentId: "labour",
    category: "Labour",
    purpose: "Registration with Maharashtra Building and Other Construction Workers Welfare Board (BOCW) for health insurance, child education grants, and safety equipment benefits.",
    whoCanApply: "Construction and informal workers aged 18 to 60 who worked at least 90 days in the preceding 12 months.",
    eligibilityCriteria: [
      "Age between 18 and 60 years",
      "Worked for 90 days or more in construction or allied trades during the previous year",
      "Resident of Maharashtra"
    ],
    prerequisites: ["90-day work certificate from contractor, registered union, or municipal authority"],
    requiredDocuments: [
      { docType: "identity_verification", name: "Identity Proof", description: "Aadhaar Card", mandatory: true },
      { docType: "domicile_certificate", name: "Age & Address Proof", description: "Voter ID or Domicile proof", mandatory: true }
    ],
    processSteps: [
      { stepNumber: 1, title: "Vault Document Check", actor: "SETU Orchestrator", description: "Matches identity and address proof." },
      { stepNumber: 2, title: "Board Review", actor: "Department", description: "BOCW Welfare Officer verifies 90-day certificate." },
      { stepNumber: 3, title: "Smart Card Issuance", actor: "Department", description: "Issuance of Welfare Smart Card." }
    ],
    consentDetails: {
      dataShared: "Identity, Bank Details, Trade Details, Work Certification",
      recipient: "Maharashtra BOCW Welfare Board",
      purpose: "Welfare scheme enrollment and benefit disbursal",
      retention: "Duration of active registration"
    },
    relatedLifeEvent: "start_small_business",
    applicationRoute: "/services/labour-welfare",
    slaDays: 15
  },
  {
    id: "municipal-service-request",
    name: "Municipal Local Body NOC / Permission",
    department: "Urban Development Department",
    departmentId: "urban-development",
    category: "Urban Services",
    purpose: "Single-window municipal consent and trade clearance from urban local bodies (Municipal Corporations / Councils) across Maharashtra.",
    whoCanApply: "Businesses, shop owners, and citizens setting up operations within municipal limits.",
    eligibilityCriteria: [
      "Premises located within recognized urban local body limits",
      "Valid Shop & Establishment Registration or application reference",
      "Compliance with fire and health safety guidelines"
    ],
    prerequisites: ["Active Shop & Establishment Registration in SETU Journey"],
    requiredDocuments: [
      { docType: "identity_verification", name: "Owner Identity", description: "Aadhaar / PAN", mandatory: true },
      { docType: "business_registration", name: "Shop Registration Reference", description: "Form F from Labour Department", mandatory: true }
    ],
    processSteps: [
      { stepNumber: 1, title: "Cross-Department Handoff", actor: "SETU Orchestrator", description: "Pipes verified Shop Registration from Labour Department to Municipal Corporation." },
      { stepNumber: 2, title: "Citizen Consent", actor: "Citizen", description: "Authorizes sharing of premises blueprints and trade category." },
      { stepNumber: 3, title: "Health & Fire Desk Clearance", actor: "Department", description: "Ward officer scrutiny." },
      { stepNumber: 4, title: "NOC Issued", actor: "Department", description: "Digitally authenticated NOC deposited in vault." }
    ],
    consentDetails: {
      dataShared: "Commercial Premises Address, Trade Type, Labour Registration ID",
      recipient: "Urban Development & Municipal Authorities of Maharashtra",
      purpose: "Local Trade NOC clearance",
      retention: "Annual municipal renewal cycle"
    },
    relatedLifeEvent: "start_small_business",
    applicationRoute: "/services/municipal-service-request",
    slaDays: 14
  },
  {
    id: "building-permission",
    name: "Building Plan Sanction / Permission",
    department: "Urban Development Department",
    departmentId: "urban-development",
    category: "Urban Services",
    purpose: "Automated scrutiny and sanction of building layouts, architectural blueprints, and commencement certificates under unified Development Control Rules.",
    whoCanApply: "Property owners, architects, and licensed structural engineers in Maharashtra urban areas.",
    eligibilityCriteria: [
      "Clear land ownership title (7/12 extract or Property Card)",
      "Licensed architect architectural submission",
      "Compliance with Unified DCR norms"
    ],
    prerequisites: ["Verified Land/Property Records", "Architect certification"],
    requiredDocuments: [
      { docType: "identity_verification", name: "Applicant Identity", description: "Aadhaar / Voter ID", mandatory: true },
      { docType: "business_registration", name: "Property Ownership Records", description: "Property Card (City Survey) or 7/12 Extract", mandatory: true }
    ],
    processSteps: [
      { stepNumber: 1, title: "Blueprint Scrutiny", actor: "SETU Orchestrator", description: "Coordinates with municipal Auto-DCR portal." },
      { stepNumber: 2, title: "Town Planning Review", actor: "Department", description: "Town planning officer technical assessment." },
      { stepNumber: 3, title: "Commencement Certificate", actor: "Department", description: "Approved sanction plan issued to citizen." }
    ],
    consentDetails: {
      dataShared: "Property Survey Numbers, Owner Names, Architectural Specifications",
      recipient: "Urban Development Department / Planning Authority",
      purpose: "Building permission and Commencement Certificate issuance",
      retention: "Permanent land planning record"
    },
    relatedLifeEvent: "start_small_business",
    applicationRoute: "/services/building-permission",
    slaDays: 30
  },
  {
    id: "land-record-request",
    name: "Digital Land Records (7/12 & 8A Extract)",
    department: "Revenue Department",
    departmentId: "revenue",
    category: "Land & Revenue",
    purpose: "Direct access to digitally signed Mahabhumi land rights records (7/12, 8A Khata extract, and Property Card) with legal QR code verification.",
    whoCanApply: "Landholders, legal heirs, agricultural applicants, or authorized representatives.",
    eligibilityCriteria: [
      "Land parcel located in Maharashtra revenue villages or city survey zones",
      "Applicant provides valid District, Taluka, Village, and Survey/Gat number"
    ],
    prerequisites: ["Survey number / Gat number of the land parcel"],
    requiredDocuments: [
      { docType: "identity_verification", name: "Citizen Identity", description: "Aadhaar Card", mandatory: true }
    ],
    processSteps: [
      { stepNumber: 1, title: "Query Land Database", actor: "SETU Orchestrator", description: "Fetches live Mahabhumi revenue parcel data." },
      { stepNumber: 2, title: "Citizen Selection", actor: "Citizen", description: "Confirms landholder name and survey details." },
      { stepNumber: 3, title: "Digital Signature Verification", actor: "Department", description: "Automated Talathi digital key verification." },
      { stepNumber: 4, title: "Instant Vault Delivery", actor: "SETU Orchestrator", description: "7/12 extract saved into Document Vault for lifetime reuse." }
    ],
    consentDetails: {
      dataShared: "Citizen Name, Mobile Number, Land Parcel Survey Information",
      recipient: "Revenue Department (Settlement Commissioner & Land Records)",
      purpose: "Issuance of authenticated digital 7/12 extract",
      retention: "Transaction log maintained for 3 years"
    },
    relatedLifeEvent: "college_admission_scholarship",
    applicationRoute: "/services/land-record-request",
    slaDays: 1
  },
  {
    id: "social-assistance",
    name: "Sanjay Gandhi Niradhar Welfare Assistance",
    department: "Social Justice Department",
    departmentId: "social-justice",
    category: "Social Welfare",
    purpose: "Monthly financial assistance for destitute persons, elderly citizens without family support, widowed women, and persons with severe disabilities.",
    whoCanApply: "Destitute citizens residing in Maharashtra whose annual family income is below the statutory threshold (e.g. ₹21,000/year) and who lack adult support.",
    eligibilityCriteria: [
      "Permanent resident of Maharashtra for at least 15 years",
      "Destitute status or elderly without family support",
      "Annual family income within statutory poverty limit"
    ],
    prerequisites: ["Verified Domicile Proof", "Verified Income Declaration"],
    requiredDocuments: [
      { docType: "identity_verification", name: "Identity Proof", description: "Aadhaar Card", mandatory: true },
      { docType: "domicile_certificate", name: "Domicile Certificate", description: "15-year Maharashtra residence certificate", mandatory: true },
      { docType: "income_certificate", name: "Income Certificate", description: "Revenue department verified income certificate", mandatory: true }
    ],
    processSteps: [
      { stepNumber: 1, title: "Eligibility Assessment", actor: "SETU Orchestrator", description: "Cross-checks vault certificates against pension criteria." },
      { stepNumber: 2, title: "Citizen Consent", actor: "Citizen", description: "Consents to direct DBT bank integration." },
      { stepNumber: 3, title: "Tahsildar Sanction Committee", actor: "Department", description: "District committee approves monthly pension benefit." },
      { stepNumber: 4, title: "DBT Activation", actor: "Department", description: "Monthly support initiated to citizen's verified bank account." }
    ],
    consentDetails: {
      dataShared: "Identity, Verified Income, Residence History, Bank Account / IFSC",
      recipient: "Social Justice & Special Assistance Department",
      purpose: "Sanction of monthly social security financial assistance",
      retention: "Duration of beneficiary lifetime"
    },
    relatedLifeEvent: "college_admission_scholarship",
    applicationRoute: "/services/social-assistance",
    slaDays: 30
  },
  {
    id: "senior-citizen-support",
    name: "Senior Citizen Identity Card & Support",
    department: "Social Justice Department",
    departmentId: "social-justice",
    category: "Social Welfare",
    purpose: "Issuance of official Senior Citizen Card for state transport bus travel concessions, public hospital priorities, and social protection services.",
    whoCanApply: "Any citizen of Maharashtra aged 60 years or above.",
    eligibilityCriteria: [
      "Age of 60 years completed",
      "Resident of Maharashtra"
    ],
    prerequisites: ["Proof of age (Birth certificate, School leaving certificate, or Aadhaar)"],
    requiredDocuments: [
      { docType: "identity_verification", name: "Age & Identity Proof", description: "Aadhaar Card or School Leaving Certificate", mandatory: true },
      { docType: "domicile_certificate", name: "Address Proof", description: "Electricity bill, ration card or domicile", mandatory: true }
    ],
    processSteps: [
      { stepNumber: 1, title: "Instant Age Verification", actor: "SETU Orchestrator", description: "Derives verified date of birth from citizen vault profile." },
      { stepNumber: 2, title: "Social Welfare Desk Endorsement", actor: "Department", description: "Officer reviews credentials." },
      { stepNumber: 3, title: "Digital Senior Card", actor: "Department", description: "Official card issued with QR verification." }
    ],
    consentDetails: {
      dataShared: "Citizen Name, Date of Birth, Blood Group, Emergency Contact, Address",
      recipient: "Social Justice Department, Government of Maharashtra",
      purpose: "Issuance of Senior Citizen Identity Card",
      retention: "Permanent citizen profile record"
    },
    relatedLifeEvent: "college_admission_scholarship",
    applicationRoute: "/services/senior-citizen-support",
    slaDays: 10
  },
  {
    id: "disability-support",
    name: "Disability Welfare & Equipment Assistance",
    department: "Social Justice Department",
    departmentId: "social-justice",
    category: "Social Welfare",
    purpose: "Unified gateway for assistive aids, artificial limbs, motorized tricycle grants, and education allowances for persons with disabilities (Divyangjan).",
    whoCanApply: "Persons with permanent benchmark disability of 40% or more possessing a valid UDID or government medical board certificate.",
    eligibilityCriteria: [
      "Permanent disability of 40% or above certified by Civil Surgeon / UDID",
      "Resident of Maharashtra",
      "Income criteria as defined for specific assistive equipment grants"
    ],
    prerequisites: ["UDID Card or Civil Surgeon Medical Certificate", "Verified Identity & Domicile"],
    requiredDocuments: [
      { docType: "identity_verification", name: "Identity Proof", description: "Aadhaar Card", mandatory: true },
      { docType: "domicile_certificate", name: "Domicile Proof", description: "Maharashtra residence certificate", mandatory: true },
      { docType: "income_certificate", name: "Income Certificate", description: "Annual income certificate", mandatory: true }
    ],
    processSteps: [
      { stepNumber: 1, title: "UDID & Vault Matching", actor: "SETU Orchestrator", description: "Links disability credentials with citizen vault." },
      { stepNumber: 2, title: "Equipment Application", actor: "Citizen", description: "Citizen chooses needed assistive aid or scheme benefit." },
      { stepNumber: 3, title: "District Divyang Welfare Committee", actor: "Department", description: "Medical scrutiny and equipment allocation." },
      { stepNumber: 4, title: "Distribution & Delivery", actor: "Department", description: "Disbursal through district social welfare center." }
    ],
    consentDetails: {
      dataShared: "Identity, Medical Disability Assessment, Income, Address",
      recipient: "Divyangjan Welfare Department / Social Justice",
      purpose: "Allotment of assistive devices and welfare allowance",
      retention: "Lifetime record"
    },
    relatedLifeEvent: "college_admission_scholarship",
    applicationRoute: "/services/disability-support",
    slaDays: 21
  },
  {
    id: "fee-payment",
    name: "Government Fee & Treasury Challan (Gras)",
    department: "Finance Department",
    departmentId: "finance",
    category: "Payments",
    purpose: "Integrated government receipt accounting system (GRAS) for paying statutory departmental fees, stamp duty, registration charges, and court fee challans.",
    whoCanApply: "Any citizen or business needing to remit government revenue or service application fees.",
    eligibilityCriteria: ["Valid service reference or department fee code in Maharashtra"],
    prerequisites: ["Department service reference or challan requirement"],
    requiredDocuments: [
      { docType: "identity_verification", name: "Payer Identity", description: "Aadhaar or PAN", mandatory: true }
    ],
    processSteps: [
      { stepNumber: 1, title: "Service Fee Calculation", actor: "SETU Orchestrator", description: "Computes exact departmental treasury head fee." },
      { stepNumber: 2, title: "Payment Gateway Integration", actor: "Citizen", description: "Payment through UPI, Netbanking, or Debit Card." },
      { stepNumber: 3, title: "Treasury Real-time Accounting", actor: "Department", description: "GRAS challan generation and treasury receipt." },
      { stepNumber: 4, title: "Vault Handoff", actor: "SETU Orchestrator", description: "Challan receipt automatically attached to active journey." }
    ],
    consentDetails: {
      dataShared: "Payer Name, Contact Number, Challan Amount, Department Head Code",
      recipient: "Finance Department (Directorate of Accounts & Treasuries)",
      purpose: "Treasury revenue reconciliation and GRAS e-Challan generation",
      retention: "Permanent financial audit record"
    },
    relatedLifeEvent: "start_small_business",
    applicationRoute: "/services/fee-payment",
    slaDays: 1
  }
];

export const SERVICE_CATEGORIES = [
  "All",
  "Certificates",
  "Education",
  "Labour",
  "Urban Services",
  "Land & Revenue",
  "Social Welfare",
  "Payments"
];

export function getServiceById(id: string): ServiceRecord | undefined {
  return SERVICE_CATALOG.find((s) => s.id === id || s.id.replaceAll("-", "_") === id || s.id === id.replaceAll("_", "-"));
}
