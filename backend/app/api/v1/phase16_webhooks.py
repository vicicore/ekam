import json
from datetime import datetime, timezone
from fastapi import APIRouter, Header, HTTPException, Request

from app.core.container import get_journey_service, get_webhook_delivery_repository
from app.schemas.webhook import ALLOWED_STATUSES, ConnectorWebhookPayload, WebhookAck
from app.services.webhook_security import verify_hmac_signature
from app.repositories.models import WebhookDeliveryRecord

router=APIRouter(prefix="/webhooks",tags=["phase16"])

@router.post("/signed/{event}",response_model=WebhookAck)
async def signed_webhook(
    event:str,
    request:Request,
    x_setu_event_id:str|None=Header(default=None),
    x_setu_signature:str|None=Header(default=None),
):
    raw=await request.body()
    if not verify_hmac_signature(raw,x_setu_signature):
        raise HTTPException(status_code=401,detail="Invalid webhook signature")
    if not x_setu_event_id:
        raise HTTPException(status_code=400,detail="Missing X-SETU-Event-ID")

    repo=get_webhook_delivery_repository()
    existing=repo.get_by_event_id(x_setu_event_id)
    if existing:
        return WebhookAck(application_id=None,service_code="",accepted_status="duplicate")

    try:
        payload=ConnectorWebhookPayload.model_validate(json.loads(raw))
    except Exception as exc:
        raise HTTPException(status_code=400,detail="Invalid webhook payload") from exc

    record=repo.create(WebhookDeliveryRecord(
        event_id=x_setu_event_id,
        external_reference=payload.external_reference,
        event_type=event,
        received_at=datetime.now(timezone.utc),
    ))

    if payload.status not in ALLOWED_STATUSES:
        record.status="ignored"
        record.processed_at=datetime.now(timezone.utc)
        repo.save(record)
        return WebhookAck(application_id=None,service_code=payload.service_code,accepted_status="ignored")

    try:
        journey=get_journey_service().receive_external_event(
            payload.external_reference,event_status=payload.status,source_event=event
        )
        record.status="processed"
        record.processed_at=datetime.now(timezone.utc)
        repo.save(record)
        return WebhookAck(application_id=journey.id,service_code=payload.service_code,accepted_status=payload.status)
    except Exception as exc:
        record.status="failed"
        record.error=str(exc)
        repo.save(record)
        raise HTTPException(status_code=409,detail="Webhook processing failed") from exc
