from __future__ import annotations
import re
from dataclasses import dataclass
from typing import List


@dataclass(frozen=True)
class KnowledgeItem:
    id: str
    title: str
    content: str
    category: str
    route: str


KNOWLEDGE_BASE: List[KnowledgeItem] = [
    KnowledgeItem(
        "income-certificate",
        "Income Certificate",
        "Income Certificate is a certificate service available through the SETU service catalogue. "
        "Applicants should review the service page for the required information and documents before starting.",
        "Certificates",
        "/services/income-certificate",
    ),
    KnowledgeItem(
        "domicile-certificate",
        "Domicile Certificate",
        "Domicile Certificate is listed in SETU's service catalogue. "
        "Open the service page to review the application flow and required documents.",
        "Certificates",
        "/services/domicile-certificate",
    ),
    KnowledgeItem(
        "document-vault",
        "Document Vault",
        "My SETU includes a document vault where citizens can review their stored documents and verification status.",
        "Documents",
        "/vault",
    ),
    KnowledgeItem(
        "track-application",
        "Track Application",
        "SETU provides a journey view for applications so citizens can review workflow stages, current status and next actions.",
        "Applications",
        "/journeys",
    ),
    KnowledgeItem(
        "grievance",
        "Grievance",
        "Citizens can register and track grievances through the SETU grievance workflow.",
        "Grievance",
        "/grievance",
    ),
    KnowledgeItem(
        "schemes",
        "Government Schemes",
        "SETU provides a scheme discovery layer with categories, eligibility information, benefits and required documents. "
        "Scheme data should be verified against authoritative government information before production use.",
        "Schemes",
        "/schemes",
    ),
    KnowledgeItem(
        "maharashtra-intelligence",
        "Maharashtra Service Intelligence",
        "SETU can navigate from district to department to service using the Maharashtra intelligence layer.",
        "Maharashtra",
        "/maharashtra/intelligence",
    ),
]


STOP_WORDS = {
    "the", "is", "a", "an", "to", "of", "for", "and", "or", "in", "on",
    "me", "my", "how", "what", "can", "i", "please", "tell", "about",
    "hai", "ka", "ki", "ke", "mujhe", "kya", "hai", "mein", "se"
}


def tokenize(text: str) -> set[str]:
    return {
        token for token in re.findall(r"[a-zA-Z0-9]+", text.lower())
        if token not in STOP_WORDS and len(token) > 2
    }


def retrieve(query: str, limit: int = 4) -> List[KnowledgeItem]:
    q = tokenize(query)
    scored = []
    for item in KNOWLEDGE_BASE:
        tokens = tokenize(item.title + " " + item.content + " " + item.category)
        score = len(q & tokens)
        if score:
            scored.append((score, item))
    scored.sort(key=lambda x: (-x[0], x[1].title))
    return [item for _, item in scored[:limit]]
