import asyncio

from app.workers.connector_worker import ConnectorWorker
from app.workers.notification_worker import NotificationWorker


async def main() -> None:
    connector = ConnectorWorker()
    notifications = NotificationWorker()
    await asyncio.gather(connector.run_forever(), notifications.run_forever())


if __name__ == "__main__":
    asyncio.run(main())
