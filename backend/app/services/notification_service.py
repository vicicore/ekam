from app.repositories.notification_repository import NotificationRepository
from app.schemas.notifications import NotificationCreate

class NotificationService:
    def __init__(self, repository: NotificationRepository):
        self.repository = repository

    def create(self, data: NotificationCreate):
        return self.repository.create(data)

    def list_for_recipient(self, recipient_id: str, unread_only: bool = False, limit: int = 50):
        return self.repository.list_for_recipient(recipient_id, unread_only, limit)

    def mark_read(self, notification_id: str, recipient_id: str):
        return self.repository.mark_read(notification_id, recipient_id)
