from typing import List, Dict, Any, Optional
from app.schemas.educational import EducationalModule, TourStep, EducationalModulesResponse

class EducationalService:
    """
    Phase 18: Student & Educational Oceanography Workspace Service
    Curates interactive oceanographic concept modules, step-by-step 3D tours, and quizzes.
    """
    def __init__(self):
        self._modules: List[EducationalModule] = self._build_curriculum()

    def _build_curriculum(self) -> List[EducationalModule]:
        return [
            EducationalModule(
                id="mod-argo-robotics",
                title="Argo Robotic Floats: The Autonomous Ocean Fleet",
                subtitle="Discover how 4,000+ robotic floats dive to 2,000 meters and report live satellite CTD profiles.",
                difficulty_level="Beginner",
                duration_minutes=12,
                category="Ocean Instrumentation",
                cover_gradient="linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
                summary=(
                    "Argo floats are battery-powered, autonomous robotic platforms that drift at 1,000m park depth "
                    "for 9 days, descend to 2,000m, and record high-precision temperature, salinity, and pressure as they ascend. "
                    "At the sea surface, they transmit data via Iridium / Argos satellites before starting the next 10-day cycle."
                ),
                key_takeaways=[
                    "Argo floats regulate buoyancy by pumping hydraulic oil in and out of an external rubber bladder.",
                    "Ascending profiles yield CTD data with 0.002°C temperature and 0.005 PSU salinity accuracy.",
                    "The Indian Argo Program, maintained by INCOIS, continuously monitors the northern and southern Indian Ocean."
                ],
                tour_steps=[
                    TourStep(
                        step_number=1,
                        title="Surface Transmission & GPS Fix",
                        description="The float breaches the ocean surface, acquires a GPS lock, and beams CTD data to satellites.",
                        target_lat=14.285,
                        target_lon=87.450,
                        camera_altitude_m=450000.0,
                        camera_pitch_deg=-45.0,
                        highlight_layer="argo_floats",
                        phenomenon_explained="Satellite Iridium uplink and surface temperature logging"
                    ),
                    TourStep(
                        step_number=2,
                        title="Descending to 1,000m Parking Depth",
                        description="Oil is drawn into the internal reservoir, increasing float density to drift silently with deep currents.",
                        target_lat=12.500,
                        target_lon=85.200,
                        camera_altitude_m=200000.0,
                        camera_pitch_deg=-30.0,
                        highlight_layer="argo_tracks",
                        phenomenon_explained="Isobaric drifting across intermediate water masses"
                    ),
                    TourStep(
                        step_number=3,
                        title="Deep Profile Ascent (2,000m to 0m)",
                        description="CTD sensors record continuous conductivity, temperature, and pressure every few meters.",
                        target_lat=10.100,
                        target_lon=82.000,
                        camera_altitude_m=120000.0,
                        camera_pitch_deg=-25.0,
                        highlight_layer="vertical_profiles",
                        phenomenon_explained="Full ocean stratification measurement"
                    )
                ],
                interactive_simulation_type="buoyancy_cycle",
                quiz_questions=[
                    {
                        "question": "How do Argo floats control their vertical ascent and descent in the water column?",
                        "options": [
                            "Using electric motorized propellers",
                            "Pumping mineral oil between an internal tank and an external rubber bladder",
                            "Dropping lead ballast weights",
                            "Using solar-powered fins"
                        ],
                        "correct_index": 1,
                        "explanation": "Buoyancy engines use hydraulic pumps to expand/contract an external bladder, changing float displacement and density relative to surrounding seawater."
                    },
                    {
                        "question": "What is the typical profiling cycle duration of a standard Core Argo float?",
                        "options": ["24 hours", "10 days", "30 days", "6 months"],
                        "correct_index": 1,
                        "explanation": "A standard Argo float operates on a 10-day cycle: 9 days drifting at 1,000m depth, then diving to 2,000m and ascending to sample the water column."
                    }
                ]
            ),
            EducationalModule(
                id="mod-marine-heatwaves",
                title="Marine Heatwaves (MHW): Thermal Extremes at Sea",
                subtitle="Explore what causes underwater heatwaves, how they are categorized (Cat I–IV), and their ecological impact.",
                difficulty_level="Intermediate",
                duration_minutes=15,
                category="Ocean Climate & Ecology",
                cover_gradient="linear-gradient(135deg, #e11d48 0%, #be123c 100%)",
                summary=(
                    "A Marine Heatwave (MHW) occurs when sea surface temperatures exceed the 90th percentile of local historical "
                    "climatology for at least 5 consecutive days. In the Arabian Sea and Bay of Bengal, MHWs suppress vertical nutrient upwelling, "
                    "bleach coral reefs, and intensify pre-monsoon cyclogenesis."
                ),
                key_takeaways=[
                    "MHWs are classified into four severity tiers: Moderate (Cat I), Strong (Cat II), Severe (Cat III), and Extreme (Cat IV).",
                    "Prolonged heatwaves disrupt phytoplankton blooms and force pelagic fish stocks into deeper, cooler waters.",
                    "Anomalies exceeding +2.5°C in the Arabian Sea frequently correlate with positive Indian Ocean Dipole (IOD) phases."
                ],
                tour_steps=[
                    TourStep(
                        step_number=1,
                        title="Central Arabian Sea Hotspot",
                        description="Observe the severe +2.85°C sea surface temperature anomaly tracked by INCOIS satellite feeds.",
                        target_lat=16.450,
                        target_lon=61.200,
                        camera_altitude_m=800000.0,
                        camera_pitch_deg=-50.0,
                        highlight_layer="anomalies_mhw",
                        phenomenon_explained="High solar insolation coupled with reduced wind-driven mixing"
                    ),
                    TourStep(
                        step_number=2,
                        title="Lakshadweep Coral Archipelago Vulnerability",
                        description="Explore coral bleaching alert zones where Degree Heating Weeks (DHW) exceed critical thresholds.",
                        target_lat=10.566,
                        target_lon=72.641,
                        camera_altitude_m=150000.0,
                        camera_pitch_deg=-35.0,
                        highlight_layer="coral_reefs",
                        phenomenon_explained="Thermal stress and symbiotic zooxanthellae expulsion"
                    )
                ],
                interactive_simulation_type="heatwave_intensity",
                quiz_questions=[
                    {
                        "question": "What is the minimum duration required for an ocean warming event to be formally designated as a Marine Heatwave?",
                        "options": ["12 hours", "48 hours", "5 consecutive days", "1 full month"],
                        "correct_index": 2,
                        "explanation": "According to the internationally standardized Hobday et al. (2016) definition, SST must exceed the 90th percentile threshold for at least 5 consecutive days."
                    }
                ]
            ),
            EducationalModule(
                id="mod-stratification-barrier-layer",
                title="Ocean Stratification & The Bay of Bengal Barrier Layer",
                subtitle="Understand how massive freshwater discharge from rivers creates an inverted thermal trap in the Bay of Bengal.",
                difficulty_level="Advanced",
                duration_minutes=18,
                category="Physical Oceanography",
                cover_gradient="linear-gradient(135deg, #0d9488 0%, #0f766e 100%)",
                summary=(
                    "The Bay of Bengal receives over 1,600 km³ of freshwater annually from the Ganges, Brahmaputra, and Irrawaddy rivers. "
                    "This creates a thin, low-salinity surface lens. The difference between the Isothermal Layer Depth (ILD) and Mixed Layer Depth (MLD) "
                    "forms a 'Barrier Layer' (BLT = ILD - MLD) that traps solar radiation and inhibits cooling."
                ),
                key_takeaways=[
                    "Barrier Layer Thickness (BLT) acts as an insulator, isolating the mixed layer from cooler sub-thermocline water.",
                    "Under strong barrier layer conditions, subsurface temperatures can actually become hotter than the surface (Thermal Inversion).",
                    "This heat reservoir provides rapid energetic fuel for intense tropical cyclones in the Bay of Bengal."
                ],
                tour_steps=[
                    TourStep(
                        step_number=1,
                        title="Ganga-Brahmaputra Delta Discharge Zone",
                        description="View the freshwater plume spreading southwards along the western boundary of the Bay of Bengal.",
                        target_lat=20.500,
                        target_lon=89.000,
                        camera_altitude_m=500000.0,
                        camera_pitch_deg=-45.0,
                        highlight_layer="salinity_gradients",
                        phenomenon_explained="Buoyant freshwater lens capping dense saline water"
                    )
                ],
                interactive_simulation_type="barrier_layer_depth",
                quiz_questions=[
                    {
                        "question": "How is Barrier Layer Thickness (BLT) mathematically defined in physical oceanography?",
                        "options": [
                            "BLT = Thermocline Depth + Mixed Layer Depth",
                            "BLT = Isothermal Layer Depth (ILD) - Mixed Layer Depth (MLD)",
                            "BLT = Surface Salinity / Surface Temperature",
                            "BLT = Pycnocline Depth × Coriolis Parameter"
                        ],
                        "correct_index": 1,
                        "explanation": "BLT is defined as the difference between the depth of the isothermal layer (where temperature drops by 0.2°C) and the density mixed layer depth."
                    }
                ]
            )
        ]

    def get_all_modules(self) -> EducationalModulesResponse:
        return EducationalModulesResponse(total=len(self._modules), modules=self._modules)

    def get_module_by_id(self, module_id: str) -> Optional[EducationalModule]:
        for m in self._modules:
            if m.id == module_id:
                return m
        return None

educational_service = EducationalService()
