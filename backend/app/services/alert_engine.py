from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from app.schemas.alerts import OceanAlert, AlertRule, AlertsListResponse

class AlertEngine:
    """
    Phase 21: Real-time Oceanographic Alert & Notification Engine
    Evaluates in-situ observations and model differences against physical threshold rules.
    """
    def __init__(self):
        self._alerts: Dict[str, OceanAlert] = {}
        self._rules: List[AlertRule] = []
        self._init_rules_and_alerts()

    def _init_rules_and_alerts(self):
        now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")

        self._rules = [
            AlertRule(
                rule_id="rule-mhw-severe",
                name="Marine Heatwave Cat III/IV Trigger",
                category="MHW",
                condition="SST > Climatology_90th + 2.0°C",
                threshold=2.0,
                units="°C",
                is_enabled=True,
                cooldown_hours=12
            ),
            AlertRule(
                rule_id="rule-salinity-barrier",
                name="Extreme Low-Salinity Lens Trigger",
                category="SALINITY",
                condition="Surface Salinity < 32.5 PSU",
                threshold=32.5,
                units="PSU",
                is_enabled=True,
                cooldown_hours=24
            ),
            AlertRule(
                rule_id="rule-sensor-offline",
                name="Argo Telemetry Dropout Alert",
                category="SENSOR_OFFLINE",
                condition="Last Transmission Delay > 48 Hours",
                threshold=48.0,
                units="hours",
                is_enabled=True,
                cooldown_hours=6
            ),
            AlertRule(
                rule_id="rule-model-bias",
                name="Numerical Model Departure Excursion",
                category="MODEL_BIAS",
                condition="|HYCOM - InSitu| > 1.5°C",
                threshold=1.5,
                units="°C",
                is_enabled=True,
                cooldown_hours=12
            )
        ]

        active_seed_alerts = [
            OceanAlert(
                id="alert-mhw-arabian-01",
                title="Severe Marine Heatwave (Cat III) Detected",
                severity="CRITICAL",
                category="MHW",
                basin="Central Arabian Sea",
                latitude=16.450,
                longitude=61.200,
                trigger_value="+2.85 °C Anomaly",
                threshold_value="90th Percentile + 2.0 °C",
                description="Prolonged sea surface warming exceeding 90th percentile threshold for 18 consecutive days.",
                impact="High risk of coral bleaching in Lakshadweep / Maldives reef ecosystems; mixed layer shallowing.",
                status="ACTIVE",
                created_at=now_str,
                duration_days=18,
                actions=[
                    {"label": "Fly in 3D Cesium", "path": "/explorer?lat=16.45&lon=61.2&zoom=basin"},
                    {"label": "View MHW Evolution", "path": "/anomalies"}
                ]
            ),
            OceanAlert(
                id="alert-sal-bob-02",
                title="Freshwater Barrier Layer Inversion",
                severity="CRITICAL",
                category="SALINITY",
                basin="Northern Bay of Bengal",
                latitude=19.820,
                longitude=89.210,
                trigger_value="31.80 PSU Salinity",
                threshold_value="< 32.50 PSU",
                description="Massive monsoonal river discharge creating strong upper-ocean halocline and trapping subsurface heat.",
                impact="Barrier layer thickness exceeds 32m; energetic thermodynamic fueling for severe cyclogenesis.",
                status="ACTIVE",
                created_at=now_str,
                duration_days=24,
                actions=[
                    {"label": "Fly in 3D Cesium", "path": "/explorer?lat=19.82&lon=89.21&zoom=basin"},
                    {"label": "Inspect CTD Profile", "path": "/ctd"}
                ]
            ),
            OceanAlert(
                id="alert-bias-somali-03",
                title="Somali Current Upwelling Model Bias",
                severity="WARNING",
                category="MODEL_BIAS",
                basin="Western Arabian Sea",
                latitude=9.500,
                longitude=52.800,
                trigger_value="+1.42 °C RMSE",
                threshold_value="> 1.00 °C",
                description="HYCOM underestimating coastal upwelling intensity compared with OMNI buoy and Argo float observations.",
                impact="Forecast boundary layer temperature overestimation.",
                status="ACTIVE",
                created_at=now_str,
                duration_days=6,
                actions=[
                    {"label": "Error Heatmap", "path": "/errors"},
                    {"label": "Taylor Diagram", "path": "/accuracy"}
                ]
            ),
            OceanAlert(
                id="alert-sensor-coriolis-04",
                title="Argo Float #2901540 Delayed Telemetry",
                severity="INFO",
                category="SENSOR_OFFLINE",
                basin="Arabian Sea (West)",
                latitude=16.450,
                longitude=61.200,
                trigger_value="52h Transmission Lag",
                threshold_value="> 48h",
                description="Float cycle #89 ascent completed; satellite Iridium handshake queued.",
                impact="Minor delay in real-time QC data assimilation.",
                status="ACTIVE",
                created_at=now_str,
                duration_days=2,
                actions=[
                    {"label": "Track Float", "path": "/argo"}
                ]
            )
        ]

        for a in active_seed_alerts:
            self._alerts[a.id] = a

    def get_alerts(self, severity: Optional[str] = None, status: Optional[str] = None) -> AlertsListResponse:
        items = list(self._alerts.values())
        if severity and severity != "all":
            items = [a for a in items if a.severity.lower() == severity.lower()]
        if status and status != "all":
            items = [a for a in items if a.status.lower() == status.lower()]

        crit = sum(1 for a in self._alerts.values() if a.severity == "CRITICAL" and a.status == "ACTIVE")
        warn = sum(1 for a in self._alerts.values() if a.severity == "WARNING" and a.status == "ACTIVE")

        return AlertsListResponse(
            total_active=len([a for a in self._alerts.values() if a.status == "ACTIVE"]),
            critical_count=crit,
            warning_count=warn,
            alerts=items,
            rules=self._rules
        )

    def acknowledge_alert(self, alert_id: str) -> Optional[OceanAlert]:
        alert = self._alerts.get(alert_id)
        if alert:
            alert.status = "ACKNOWLEDGED"
            return alert
        return None

    def dismiss_alert(self, alert_id: str) -> bool:
        if alert_id in self._alerts:
            self._alerts[alert_id].status = "RESOLVED"
            return True
        return False

alert_engine = AlertEngine()
