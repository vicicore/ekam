# Curated demo intelligence dataset.
# These records are navigation metadata, not claims of live government integration.
# Verify official names, service availability, eligibility and department ownership
# against authoritative government sources before production use.

DIVISIONS = [
    {"id": "konkan", "name": "Konkan"},
    {"id": "pune", "name": "Pune"},
    {"id": "nashik", "name": "Nashik"},
    {"id": "chhatrapati-sambhajinagar", "name": "Chhatrapati Sambhajinagar"},
    {"id": "amravati", "name": "Amravati"},
    {"id": "nagpur", "name": "Nagpur"},
]

_DISTRICT_DIVISION = {
    "mumbai-city": ("Mumbai City", "konkan"),
    "mumbai-suburban": ("Mumbai Suburban", "konkan"),
    "thane": ("Thane", "konkan"),
    "palghar": ("Palghar", "konkan"),
    "raigad": ("Raigad", "konkan"),
    "ratnagiri": ("Ratnagiri", "konkan"),
    "sindhudurg": ("Sindhudurg", "konkan"),
    "pune": ("Pune", "pune"),
    "satara": ("Satara", "pune"),
    "sangli": ("Sangli", "pune"),
    "kolhapur": ("Kolhapur", "pune"),
    "solapur": ("Solapur", "pune"),
    "nashik": ("Nashik", "nashik"),
    "dhule": ("Dhule", "nashik"),
    "nandurbar": ("Nandurbar", "nashik"),
    "jalgaon": ("Jalgaon", "nashik"),
    "ahmednagar": ("Ahmednagar", "nashik"),
    "aurangabad": ("Aurangabad", "chhatrapati-sambhajinagar"),
    "jalna": ("Jalna", "chhatrapati-sambhajinagar"),
    "beed": ("Beed", "chhatrapati-sambhajinagar"),
    "latur": ("Latur", "chhatrapati-sambhajinagar"),
    "dharashiv": ("Dharashiv", "chhatrapati-sambhajinagar"),
    "nanded": ("Nanded", "chhatrapati-sambhajinagar"),
    "parbhani": ("Parbhani", "chhatrapati-sambhajinagar"),
    "hingoli": ("Hingoli", "chhatrapati-sambhajinagar"),
    "amravati": ("Amravati", "amravati"),
    "akola": ("Akola", "amravati"),
    "buldhana": ("Buldhana", "amravati"),
    "washim": ("Washim", "amravati"),
    "yavatmal": ("Yavatmal", "amravati"),
    "nagpur": ("Nagpur", "nagpur"),
    "wardha": ("Wardha", "nagpur"),
    "bhandara": ("Bhandara", "nagpur"),
    "gondia": ("Gondia", "nagpur"),
    "chandrapur": ("Chandrapur", "nagpur"),
    "gadchiroli": ("Gadchiroli", "nagpur"),
}

DISTRICTS = [
    {"id": k, "name": v[0], "division": v[1]}
    for k, v in _DISTRICT_DIVISION.items()
]

DEPARTMENTS = [
    {"id": "revenue", "name": "Revenue", "division": "State", "service_count": 4},
    {"id": "social-justice", "name": "Social Justice", "division": "State", "service_count": 3},
    {"id": "higher-education", "name": "Higher Education", "division": "State", "service_count": 2},
    {"id": "labour", "name": "Labour", "division": "State", "service_count": 2},
    {"id": "urban-development", "name": "Urban Development", "division": "State", "service_count": 2},
    {"id": "finance", "name": "Finance", "division": "State", "service_count": 1},
]

SERVICES = [
    {"id":"income-certificate","name":"Income Certificate","department_id":"revenue","department_name":"Revenue","category":"Certificates","district_id":None,"application_route":"/services/income-certificate"},
    {"id":"domicile-certificate","name":"Domicile Certificate","department_id":"revenue","department_name":"Revenue","category":"Certificates","district_id":None,"application_route":"/services/domicile-certificate"},
    {"id":"caste-certificate","name":"Caste Certificate","department_id":"revenue","department_name":"Revenue","category":"Certificates","district_id":None,"application_route":"/services/caste-certificate"},
    {"id":"land-record-request","name":"Land Record Request","department_id":"revenue","department_name":"Revenue","category":"Land & Revenue","district_id":None,"application_route":"/services/land-record-request"},
    {"id":"scholarship-support","name":"Scholarship Support","department_id":"higher-education","department_name":"Higher Education","category":"Education","district_id":None,"application_route":"/services/scholarship-support"},
    {"id":"student-certificate","name":"Student Certificate","department_id":"higher-education","department_name":"Higher Education","category":"Education","district_id":None,"application_route":"/services/student-certificate"},
    {"id":"social-assistance","name":"Social Assistance","department_id":"social-justice","department_name":"Social Justice","category":"Social Welfare","district_id":None,"application_route":"/services/social-assistance"},
    {"id":"senior-citizen-support","name":"Senior Citizen Support","department_id":"social-justice","department_name":"Social Justice","category":"Social Welfare","district_id":None,"application_route":"/services/senior-citizen-support"},
    {"id":"disability-support","name":"Disability Support","department_id":"social-justice","department_name":"Social Justice","category":"Social Welfare","district_id":None,"application_route":"/services/disability-support"},
    {"id":"worker-registration","name":"Worker Registration","department_id":"labour","department_name":"Labour","category":"Labour","district_id":None,"application_route":"/services/worker-registration"},
    {"id":"labour-welfare","name":"Labour Welfare Service","department_id":"labour","department_name":"Labour","category":"Labour","district_id":None,"application_route":"/services/labour-welfare"},
    {"id":"municipal-service-request","name":"Municipal Service Request","department_id":"urban-development","department_name":"Urban Development","category":"Urban Services","district_id":None,"application_route":"/services/municipal-service-request"},
    {"id":"building-permission","name":"Building Permission","department_id":"urban-development","department_name":"Urban Development","category":"Urban Services","district_id":None,"application_route":"/services/building-permission"},
    {"id":"fee-payment","name":"Government Fee Payment","department_id":"finance","department_name":"Finance","category":"Payments","district_id":None,"application_route":"/services/fee-payment"},
]
