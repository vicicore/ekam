"""Provider-neutral outbound notification dispatcher foundation.

Phase 22 keeps delivery in-app by default. Email/SMS/WhatsApp adapters can be
registered later without changing application event producers.
"""
from dataclasses import dataclass
from typing import Protocol
from app.schemas.notifications import NotificationRecord

class NotificationChannel(Protocol):
    name: str
    def send(self, notification: NotificationRecord) -> bool: ...

@dataclass
class InAppChannel:
    name: str = "in_app"
    def send(self, notification: NotificationRecord) -> bool:
        return True

class NotificationDispatcher:
    def __init__(self, channels: list[NotificationChannel] | None = None):
        self.channels = channels or [InAppChannel()]

    def dispatch(self, notification: NotificationRecord) -> dict[str, bool]:
        return {channel.name: bool(channel.send(notification)) for channel in self.channels}
