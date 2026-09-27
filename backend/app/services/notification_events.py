"""Small event-to-notification helpers. Call these from application/grievance/officer services."""
from app.schemas.notifications import NotificationCreate


def application_updated(repo, citizen_id: str, application_id: str, title: str, message: str, link: str = "/journeys"):
    return repo.create(NotificationCreate(
        recipient_id=citizen_id, recipient_type="citizen", type="application_update",
        title=title, message=message, entity_id=application_id, link=link
    ))


def document_requested(repo, citizen_id: str, application_id: str, message: str):
    return repo.create(NotificationCreate(
        recipient_id=citizen_id, recipient_type="citizen", type="document_request",
        title="Document required", message=message, entity_id=application_id, link="/vault", priority="high"
    ))


def sla_alert(repo, recipient_id: str, recipient_type: str, application_id: str, message: str):
    return repo.create(NotificationCreate(
        recipient_id=recipient_id, recipient_type=recipient_type, type="sla_alert",
        title="SLA attention required", message=message, entity_id=application_id, link="/officer/queue", priority="high"
    ))
