from fastapi import APIRouter, HTTPException, Query, Path
from typing import Optional
from app.schemas.alerts import AlertsListResponse, OceanAlert
from app.services.alert_engine import alert_engine

router = APIRouter()

@router.get("/active", response_model=AlertsListResponse)
def get_active_alerts(
    severity: Optional[str] = Query(None, description="Filter by severity: CRITICAL, WARNING, INFO"),
    status: Optional[str] = Query("ACTIVE", description="Filter by status: ACTIVE, ACKNOWLEDGED, RESOLVED, all")
):
    """Get active real-time oceanographic alerts and threshold monitoring rules."""
    return alert_engine.get_alerts(severity=severity, status=status)

@router.post("/{alert_id}/ack", response_model=OceanAlert)
def acknowledge_alert(alert_id: str = Path(..., description="Alert ID to acknowledge")):
    """Acknowledge an active alert."""
    res = alert_engine.acknowledge_alert(alert_id)
    if not res:
        raise HTTPException(status_code=404, detail="Alert not found.")
    return res

@router.post("/{alert_id}/dismiss")
def dismiss_alert(alert_id: str = Path(..., description="Alert ID to dismiss/resolve")):
    """Dismiss and resolve an alert."""
    success = alert_engine.dismiss_alert(alert_id)
    if not success:
        raise HTTPException(status_code=404, detail="Alert not found.")
    return {"status": "SUCCESS", "message": f"Alert {alert_id} dismissed."}
