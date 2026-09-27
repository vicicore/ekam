from collections import defaultdict
from datetime import datetime, timezone

from app.repositories.models import ApplicationRecord, DocumentRecord, AuditLogEntry
from app.schemas.analytics import (
    AdminAnalytics, AnalyticsDepartment, AnalyticsSeriesPoint, AnalyticsSummary,
)
from app.schemas.enums import ApplicationStepStatus
from app.services.dependency_graph import get_graph


def _sla(step):
    if not step.sla_due_at or step.status in {ApplicationStepStatus.VERIFIED, ApplicationStepStatus.REJECTED}:
        return None
    now = datetime.now(timezone.utc)
    due = step.sla_due_at
    if due.tzinfo is None:
        due = due.replace(tzinfo=timezone.utc)
    seconds = (due - now).total_seconds()
    if seconds < 0:
        return "breached"
    if seconds <= 48 * 3600:
        return "at_risk"
    return "on_track"


def compute_analytics(
    applications: list[ApplicationRecord],
    documents: list[DocumentRecord],
    audit_events: list[AuditLogEntry],
) -> AdminAnalytics:
    total = len(applications)
    completed_apps = sum(1 for a in applications if all(s.status == ApplicationStepStatus.VERIFIED for s in a.steps.values()))
    blocked_apps = sum(1 for a in applications if any(s.status == ApplicationStepStatus.BLOCKED for s in a.steps.values()))
    active_apps = max(total - completed_apps, 0)

    dept = defaultdict(lambda: {"pending": 0, "in_progress": 0, "completed": 0, "rejected": 0, "sla_at_risk": 0, "sla_breached": 0})
    status_counts = defaultdict(int)
    total_steps = pending = completed = rejected = at_risk = breached = 0

    for app in applications:
        for step in app.steps.values():
            total_steps += 1
            department = get_graph(app.life_event_code).department_of(step.service_code)
            if step.status in {ApplicationStepStatus.NOT_STARTED, ApplicationStepStatus.READY}:
                pending += 1
                dept[department]["pending"] += 1
                status_counts["Pending"] += 1
            elif step.status == ApplicationStepStatus.IN_PROGRESS:
                dept[department]["in_progress"] += 1
                status_counts["In progress"] += 1
            elif step.status == ApplicationStepStatus.VERIFIED:
                completed += 1
                status_counts["Completed"] += 1
            elif step.status == ApplicationStepStatus.REJECTED:
                rejected += 1
                status_counts["Rejected"] += 1
            elif step.status == ApplicationStepStatus.BLOCKED:
                pending += 1
                status_counts["Blocked"] += 1
            else:
                status_counts[str(step.status)] += 1

            if step.status == ApplicationStepStatus.VERIFIED:
                dept[department]["completed"] += 1
            if step.status == ApplicationStepStatus.REJECTED:
                dept[department]["rejected"] += 1
            sla = _sla(step)
            if sla == "at_risk":
                at_risk += 1
                dept[department]["sla_at_risk"] += 1
            elif sla == "breached":
                breached += 1
                dept[department]["sla_breached"] += 1

    # Service codes are intentionally used as the stable grouping key because
    # the base repository's StepRecord does not persist department separately.
    departments = [AnalyticsDepartment(department=k, **v) for k, v in sorted(dept.items())]

    doc_counts = defaultdict(int)
    for d in documents:
        doc_counts[d.status.value if hasattr(d.status, "value") else str(d.status)] += 1

    recent = []
    for event in sorted(audit_events, key=lambda x: x.created_at, reverse=True)[:12]:
        recent.append({
            "id": event.id,
            "actor": event.actor,
            "action": event.action,
            "resource_type": event.resource_type,
            "resource_id": event.resource_id,
            "created_at": event.created_at.isoformat(),
        })

    return AdminAnalytics(
        summary=AnalyticsSummary(
            total_applications=total,
            active_applications=active_apps,
            completed_applications=completed_apps,
            blocked_applications=blocked_apps,
            total_steps=total_steps,
            pending_steps=pending,
            completed_steps=completed,
            rejected_steps=rejected,
            sla_at_risk=at_risk,
            sla_breached=breached,
            total_documents=len(documents),
            total_audit_events=len(audit_events),
        ),
        departments=departments,
        application_status=[AnalyticsSeriesPoint(label=k, value=v) for k, v in status_counts.items()],
        document_status=[AnalyticsSeriesPoint(label=k, value=v) for k, v in doc_counts.items()],
        recent_activity=recent,
    )
