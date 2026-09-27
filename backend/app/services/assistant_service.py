from __future__ import annotations
from .assistant_knowledge import retrieve


MESSAGES = {
    "en": {
        "no_match": "I could not find a grounded SETU answer for that question. Try asking about a service, scheme, document vault, application tracking, grievance, or Maharashtra services.",
        "intro": "Based on the available SETU knowledge, ",
    },
    "hi": {
        "no_match": "मुझे उपलब्ध SETU जानकारी में इस प्रश्न का प्रमाणित उत्तर नहीं मिला। आप किसी सेवा, योजना, दस्तावेज़, आवेदन ट्रैकिंग, शिकायत या महाराष्ट्र सेवाओं के बारे में पूछ सकते हैं।",
        "intro": "उपलब्ध SETU जानकारी के आधार पर, ",
    },
    "mr": {
        "no_match": "उपलब्ध SETU माहितीत या प्रश्नाचे आधारभूत उत्तर सापडले नाही. सेवा, योजना, कागदपत्रे, अर्ज ट्रॅकिंग, तक्रार किंवा महाराष्ट्र सेवांबद्दल विचारू शकता.",
        "intro": "उपलब्ध SETU माहितीनुसार, ",
    },
}


def answer(message: str, language: str = "en"):
    language = language if language in MESSAGES else "en"
    items = retrieve(message)

    if not items:
        return {
            "answer": MESSAGES[language]["no_match"],
            "sources": [],
            "suggested_actions": [
                {"label": "Browse Services", "route": "/services"},
                {"label": "Browse Schemes", "route": "/schemes"},
            ],
            "grounded": True,
        }

    primary = items[0]
    if language == "hi":
        answer_text = MESSAGES["hi"]["intro"] + f"{primary.title} के लिए SETU में एक समर्पित जानकारी/सेवा पेज उपलब्ध है। विवरण देखने के लिए संबंधित पेज खोलें।"
    elif language == "mr":
        answer_text = MESSAGES["mr"]["intro"] + f"{primary.title} साठी SETU मध्ये संबंधित माहिती/सेवा पृष्ठ उपलब्ध आहे. तपशील पाहण्यासाठी संबंधित पृष्ठ उघडा."
    else:
        answer_text = MESSAGES["en"]["intro"] + f"{primary.title} has a dedicated SETU information/service page. Open the relevant page to review the available details."

    return {
        "answer": answer_text,
        "sources": [
            {"title": item.title, "source_type": "SETU Knowledge Base", "route": item.route}
            for item in items
        ],
        "suggested_actions": [
            {"label": primary.title, "route": primary.route},
        ],
        "grounded": True,
    }
