/** Maps Maharashtra intelligence service ids / codes to existing SETU life-event journeys. */
export const SERVICE_TO_LIFE_EVENT: Record<string, string> = {
  "income-certificate": "college_admission_scholarship",
  income_certificate: "college_admission_scholarship",
  "domicile-certificate": "college_admission_scholarship",
  domicile_certificate: "college_admission_scholarship",
  "caste-certificate": "college_admission_scholarship",
  caste_certificate: "college_admission_scholarship",
  "scholarship-support": "college_admission_scholarship",
  "student-certificate": "college_admission_scholarship",
  education_scholarship: "college_admission_scholarship",
  identity_verification: "college_admission_scholarship",
  "worker-registration": "start_small_business",
  "labour-welfare": "start_small_business",
  "municipal-service-request": "start_small_business",
  "building-permission": "start_small_business",
  "fee-payment": "start_small_business",
  business_registration: "start_small_business",
  local_noc: "start_small_business",
  gst_registration: "start_small_business",
};

export function relatedLifeEvent(code: string): string | undefined {
  return SERVICE_TO_LIFE_EVENT[code] ?? SERVICE_TO_LIFE_EVENT[code.replaceAll("_", "-")];
}
