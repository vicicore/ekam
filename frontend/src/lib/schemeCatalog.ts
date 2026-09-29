export type SchemeRecord = {
  id: string;
  title: string;
  category: string;
  department: string;
  summary: string;
  eligibility: string[];
  benefits: string[];
  documents: string[];
  status: "Open" | "Ongoing";
  tags: string[];
  relatedLifeEvent?: string;
};

/** EKAM scheme discovery catalogue. This is a structured prototype dataset, not a live department feed. */
export const SCHEME_CATALOG: SchemeRecord[] = [
  {
    id: "maha-scholarship",
    title: "Maharashtra State Scholarship Support",
    category: "Education",
    department: "Higher & Technical Education",
    summary: "Financial support information for eligible students pursuing higher education.",
    eligibility: ["Resident of Maharashtra", "Enrolled in an eligible institution", "Meets applicable income/category conditions"],
    benefits: ["Scholarship assistance", "Application tracking", "Document reuse through EKAM"],
    documents: ["Identity proof", "Residence proof", "Income certificate", "Institute admission proof"],
    status: "Open",
    tags: ["Students", "Scholarship"],
    relatedLifeEvent: "college_admission_scholarship",
  },
  {
    id: "farmer-support",
    title: "Farmer Welfare & Support Services",
    category: "Agriculture",
    department: "Agriculture Department",
    summary: "A unified discovery point for farmer-oriented support services and schemes.",
    eligibility: ["Eligible farmer/applicant", "Applicable land or beneficiary records", "Scheme-specific conditions"],
    benefits: ["Scheme discovery", "Eligibility guidance", "Application status visibility"],
    documents: ["Identity proof", "Bank details", "Land/beneficiary record", "Scheme-specific documents"],
    status: "Ongoing",
    tags: ["Farmers", "Welfare"],
  },
  {
    id: "women-child",
    title: "Women & Child Welfare Services",
    category: "Social Welfare",
    department: "Women & Child Development",
    summary: "Discover welfare support and citizen services for women and children.",
    eligibility: ["Applicant must meet the scheme-specific beneficiary criteria"],
    benefits: ["Centralized information", "Required-document checklist", "Service navigation"],
    documents: ["Identity proof", "Residence proof", "Age/relationship proof where applicable"],
    status: "Open",
    tags: ["Women", "Children", "Welfare"],
  },
  {
    id: "health-support",
    title: "Public Health Assistance",
    category: "Health",
    department: "Public Health Department",
    summary: "Find public health assistance programs and understand the documents and steps involved.",
    eligibility: ["Eligibility varies by program and beneficiary group"],
    benefits: ["Service discovery", "Eligibility guidance", "Application journey support"],
    documents: ["Identity proof", "Residence proof", "Medical/supporting documents where required"],
    status: "Ongoing",
    tags: ["Health", "Citizen Services"],
  },
  {
    id: "housing-support",
    title: "Housing & Urban Assistance",
    category: "Housing",
    department: "Housing / Urban Development",
    summary: "Explore housing-related assistance and citizen service pathways.",
    eligibility: ["Scheme-specific household and income criteria"],
    benefits: ["Scheme discovery", "Checklist", "Journey tracking"],
    documents: ["Identity proof", "Address proof", "Income proof", "Property/household documents where applicable"],
    status: "Open",
    tags: ["Housing", "Urban"],
    relatedLifeEvent: "start_small_business",
  },
  {
    id: "senior-support",
    title: "Senior Citizen Welfare Services",
    category: "Social Welfare",
    department: "Social Justice & Special Assistance",
    summary: "A discovery and navigation layer for services relevant to senior citizens.",
    eligibility: ["Age and scheme-specific beneficiary conditions"],
    benefits: ["Service discovery", "Document checklist", "Application navigation"],
    documents: ["Identity proof", "Age proof", "Residence proof", "Bank details where applicable"],
    status: "Ongoing",
    tags: ["Senior Citizens", "Welfare"],
  },
];

export const SCHEME_CATEGORIES = ["All", ...Array.from(new Set(SCHEME_CATALOG.map((s) => s.category)))];
