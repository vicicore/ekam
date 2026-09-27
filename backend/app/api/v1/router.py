from fastapi import APIRouter

from app.api.v1 import (
    accessibility, admin, admin_operations, analytics, assistant, auth, citizens, demo,
    eligibility, grievances, health, journeys, life_events, maharashtra_intelligence,
    notifications, phase14, phase16_webhooks, phase17, phase19, phase20, security, vault, webhooks,
)

api_router = APIRouter()

api_router.include_router(health.router)
api_router.include_router(auth.router)
api_router.include_router(demo.router)
api_router.include_router(webhooks.router)
api_router.include_router(phase16_webhooks.router)
api_router.include_router(eligibility.router)
api_router.include_router(citizens.router)
api_router.include_router(vault.router)
api_router.include_router(admin.router)
api_router.include_router(admin_operations.router)
api_router.include_router(life_events.router)
api_router.include_router(journeys.router)
api_router.include_router(grievances.router)
api_router.include_router(phase14.router)
api_router.include_router(phase17.router)
api_router.include_router(phase19.router)
api_router.include_router(phase20.router)
api_router.include_router(notifications.router)
api_router.include_router(analytics.router)
api_router.include_router(maharashtra_intelligence.router)
api_router.include_router(assistant.router)
api_router.include_router(security.router)
api_router.include_router(accessibility.router)
