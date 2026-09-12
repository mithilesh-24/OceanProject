# 🌊 BlueSphere — 4D Ocean Intelligence & Digital Twin Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18.6%20(Neon%20Cloud)-4169E1.svg?logo=postgresql&logoColor=white)](https://neon.tech)
[![CesiumJS](https://img.shields.io/badge/CesiumJS-1.115-68A063.svg?logo=cesium&logoColor=white)](https://cesium.com)
[![NVIDIA NIM](https://img.shields.io/badge/NVIDIA%20NIM-Agentic%20Copilot-76B900.svg?logo=nvidia&logoColor=white)](https://build.nvidia.com)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg?logo=react&logoColor=black)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org)

> **BlueSphere** is an unhurried, state-of-the-art 4D Oceanographic Digital Twin and Intelligence Platform engineered for the **Ministry of Earth Sciences (MoES)** and **INCOIS (Indian National Centre for Ocean Information Services)**. It brings together live ERDDAP satellite telemetry, autonomous Argo float profiles, glider transects, multi-model hydrodynamics (HYCOM / ROMS / NEMO), and an Agentic AI Copilot into a unified scientific workstation.

---

## 🏛️ Comprehensive Architecture & Flowchart

### 1. High-Level System Architecture Diagram

```mermaid
graph TB
    subgraph Client_Layer["🖥️ Frontend Client Layer (React 18 + TypeScript + Vite)"]
        Landing["Scenic Welcome & Wind Particle Canvas<br/><code>/welcome</code>"]
        GuestExp["3D Cesium Digital Twin Explorer<br/><code>/explorer</code>"]
        StudentLab["🎓 Student Lab Workspace<br/><code>/student</code>"]
        ResearcherStudio["🔬 Researcher Studio Workbench<br/><code>/researcher</code>"]
        AdminHub["🛡️ Admin Hub & Telemetry<br/><code>/admin</code>"]
        CopilotUI["🤖 NVIDIA NIM Copilot Drawer"]
    end

    subgraph API_Gateway["⚡ API & Gateway Layer (FastAPI + Uvicorn)"]
        AuthRouter["🔐 /api/v1/auth<br/>(JWT, Bcrypt, 3 Roles)"]
        ObsRouter["🌊 /api/v1/observations<br/>(Argo, Gliders, Buoys, CTD)"]
        ModelsRouter["🌐 /api/v1/models<br/>(HYCOM, ROMS, NEMO 4D)"]
        AnalysisRouter["📊 /api/v1/analysis<br/>(Skill Scores, Hotspots, Drift)"]
        CopilotRouter["🧠 /api/v1/copilot<br/>(NVIDIA NIM Agentic Tool Calling)"]
        TelemetryRouter["📡 /api/v1/admin & /telemetry<br/>(ERDDAP Sync & Pipeline Health)"]
    end

    subgraph Cloud_Data_Layer["☁️ Cloud Database & Remote Sensing Services"]
        NeonDB[("🐘 Neon PostgreSQL Cloud Cluster<br/>(AWS ap-southeast-1)")]
        NvidiaNIM["🟢 NVIDIA NIM AI Cloud<br/>(openai/gpt-oss-20b)"]
        INCOIS_ERDDAP["🛰️ INCOIS ERDDAP & OPeNDAP Server"]
        NOAA_HYCOM["🌀 NOAA / HYCOM TDS Server"]
    end

    Landing --> AuthRouter
    StudentLab --> ObsRouter
    ResearcherStudio --> ModelsRouter
    ResearcherStudio --> AnalysisRouter
    AdminHub --> TelemetryRouter
    CopilotUI --> CopilotRouter

    AuthRouter --> NeonDB
    ObsRouter --> NeonDB
    ModelsRouter --> NeonDB
    AnalysisRouter --> NeonDB
    TelemetryRouter --> NeonDB
    TelemetryRouter --> INCOIS_ERDDAP
    ModelsRouter --> NOAA_HYCOM
    CopilotRouter --> NvidiaNIM
    CopilotRouter --> NeonDB
```

---

### 2. Multi-Role Authentication & Access Flowchart

```mermaid
sequenceDiagram
    autonumber
    actor User as User / Specialist
    participant UI as Welcome Portal (/welcome)
    participant AuthAPI as FastAPI /api/v1/auth/login
    participant Neon as Neon PostgreSQL Database
    participant Workspace as Role Workspace

    User->>UI: Selects Role (Student Lab / Researcher Studio / Admin Hub)
    UI->>UI: Renders clean login form (Empty credentials)
    User->>UI: Enters Email & Password
    UI->>AuthAPI: POST /api/v1/auth/login {email, password, role}
    AuthAPI->>Neon: Query User Record (SELECT * FROM users WHERE email=?)
    
    alt User Found & Password Matches
        Neon-->>AuthAPI: User Profile & Role Record
        AuthAPI-->>UI: 200 OK + JWT Bearer Token + User Metadata
        UI->>Workspace: Navigate to (/student, /researcher, or /admin)
        Workspace-->>User: Render Tailored Scientific Workbench
    else New Role User (Auto-Provisioned)
        AuthAPI->>Neon: INSERT INTO users (id, email, hash, role, org)
        Neon-->>AuthAPI: User Created
        AuthAPI-->>UI: 200 OK + JWT Token
        UI->>Workspace: Navigate to Target Role Dashboard
    else Invalid Password
        AuthAPI-->>UI: 401 Unauthorized Error
        UI-->>User: Display Toast Error Alert
    end
```

---

### 3. Agentic AI Copilot (NVIDIA NIM) Execution Flow

```mermaid
flowchart TD
    Q[User Natural Language Query<br/>'Show me salinity anomalies below 200m near Bay of Bengal'] --> P[FastAPI Copilot Service]
    P --> LLM[NVIDIA NIM GPT-OSS Inference API]
    LLM --> Decision{Requires Platform Data / GIS Tool?}
    
    Decision -- Yes --> ToolCall[Trigger Function Call / Query]
    ToolCall --> DBQuery[Neon PostgreSQL Hydrographic Query]
    ToolCall --> CesiumAction[Generate Cesium 3D FlyTo & Layer Hook]
    DBQuery --> ContextInject[Inject Real Observation Records into Context]
    ContextInject --> Synthesis[LLM Generates Scientific Synthesis]
    
    Decision -- No --> DirectResponse[Direct Scientific Explanation]
    
    Synthesis --> Out[Structured Markdown Response + Map Entities]
    DirectResponse --> Out
    Out --> UIClient[BlueSphere Copilot UI Panel]
```

---

## 👥 Three Base Login Roles & Workspaces

The platform comes pre-configured with **3 Base Role Logins** stored on the live **Neon PostgreSQL Cloud Database**:

| Role Workspace | Base Account Email | Default Password | Workspace Capabilities & Modules |
| :--- | :--- | :--- | :--- |
| **🎓 Student Lab** | `student@bluesphere.org` | `student123` | • Interactive Argo vertical profile hydrography lessons<br/>• Virtual CTD Cast salinity/temperature labs<br/>• Sound Speed Minimum (SOFAR channel) simulations<br/>• Guided oceanographic quizzes & self-paced exercises |
| **🔬 Researcher Studio** | `researcher@incois.gov.in` | `researcher123` | • 4D Multi-Model Comparison (HYCOM 1/12° vs ROMS 1/24° vs NEMO)<br/>• Willmott Index of Agreement, RMSE & Taylor Diagram metrics<br/>• Biogeochemical (BGC) & Oxygen Minimum Zone (OMZ) analytics<br/>• Mesoscale Eddy Tracker & Lagrangian Particle Drift simulation |
| **🛡️ Admin Hub** | `admin@bluesphere.org` | `admin123` | • Automated ERDDAP telemetry harvest pipelines<br/>• Neon PostgreSQL database synchronization & active connections<br/>• Server latency, memory telemetry, and CPU utilization monitoring<br/>• Automated error hotspot logs & system audit trails |
| **🌐 Guest Explorer** | *Open Access* | *No Auth Required* | • Interactive 3D Cesium Digital Twin Globe<br/>• Live atmospheric wind & ocean current particle streamline canvas<br/>• Real-time Argo float locations & mooring array status |

---

## 🐘 Cloud Database Configuration (Neon PostgreSQL)

BlueSphere is connected to a dedicated **Neon PostgreSQL 18.6 Cloud Database** (AWS `ap-southeast-1` region):

- **Connection URL**: `postgresql://neondb_owner:npg_EiVGZQKh5N1l@ep-muddy-boat-aze0dnff-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require`
- **Driver**: `psycopg2-binary` (SQLAlchemy 2.0 ORM)
- **Database Status API Endpoint**: `GET http://localhost:8000/api/v1/auth/db-status`

### Key Database Tables

| Table Name | Description | Key Attributes |
| :--- | :--- | :--- |
| `users` | Role-based authentication & profile records | `id`, `email`, `hashed_password`, `role`, `organization`, `department` |
| `argo_floats` | In-situ Argo profiling telemetry records | `wmo_id`, `basin`, `latitude`, `longitude`, `profile_data`, `cycle_history` |
| `glider_missions` | Autonomous underwater glider transects | `id`, `platform_name`, `mission_name`, `dives_completed`, `sensors` |
| `moored_buoys` | OMNI / RAMA deep-sea met-ocean arrays | `station_id`, `sst`, `air_temp`, `wind_speed`, `wave_height`, `timeseries` |
| `ctd_casts` | Research vessel CTD cast profiles | `cast_id`, `vessel`, `max_depth`, `bottles_count`, `qc_status` |
| `adcp_stations` | Acoustic Doppler Current Profiler 3D vectors | `station_id`, `peak_current`, `max_shear`, `velocity_profile` |
| `numerical_models` | Hydrodynamic model configurations (4D) | `id`, `name`, `resolution`, `skill_score`, `levels_count` |
| `accuracy_metrics`| Model validation & statistical skill scores | `basin`, `model_name`, `willmott_index`, `rmse`, `r2_score` |
| `error_hotspots` | Identified discrepancy regions in hydro models | `region_name`, `coords_bounds`, `max_error`, `root_cause`, `severity` |
| `anomaly_alerts` | Real-time Marine Heatwaves (MHW) & anomalies | `alert_type`, `amplitude`, `depth_layer`, `sensor_origin`, `severity` |
| `ingestion_pipelines`| Automated background data ingestion jobs | `id`, `source_protocol`, `schedule`, `records_count`, `status` |

---

## 🛠️ Environment Variables Reference

### Backend (`backend/.env`)

```env
# Neon PostgreSQL Cloud Connection
DATABASE_URL=postgresql://neondb_owner:npg_EiVGZQKh5N1l@ep-muddy-boat-aze0dnff-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require

# CORS & Routing
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173
APP_ENV=development
API_V1_STR=/api/v1
PROJECT_NAME=Bluesphere Ocean Data Platform
VERSION=1.0.0

# NVIDIA NIM Agentic AI Copilot
LLM_PROVIDER=nvidia
NVIDIA_API_KEY=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
NVIDIA_API_BASE_URL=https://integrate.api.nvidia.com/v1
NVIDIA_MODEL=openai/gpt-oss-20b
LOCAL_LLM_BASE_URL=http://localhost:8000/v1
LOCAL_LLM_MODEL=gpt-oss-20b
```

---

## 🚀 Quick Start Guide

### 1. Start the Backend API Server

```powershell
# Navigate to backend directory
cd "d:\Sih 2026\backend"

# Install Python requirements
pip install -r requirements.txt

# Run the FastAPI server with Neon PostgreSQL
python run_server.py
```
- **Backend API Root**: `http://localhost:8000`
- **Swagger Interactive API Documentation**: `http://localhost:8000/docs`
- **Database Health Check**: `http://localhost:8000/api/v1/auth/db-status`

---

### 2. Start the Frontend Application

```powershell
# Navigate to frontend directory
cd "d:\Sih 2026\frontend"

# Install npm dependencies
npm install

# Start Vite Development Server
npm run dev
```
- **Welcome Landing & Role Gateway**: `http://localhost:3000/welcome`
- **3D Ocean Explorer**: `http://localhost:3000/explorer`
- **Student Lab**: `http://localhost:3000/student`
- **Researcher Studio**: `http://localhost:3000/researcher`
- **Admin Hub**: `http://localhost:3000/admin`

---

## 🧪 Verification & Automated Testing

The backend includes test verification scripts for data models, telemetry, and Neon cloud database synchronization:

```powershell
# Verify Neon DB Connection & 3 Base Roles
python -c "import urllib.request, json; print(json.loads(urllib.request.urlopen('http://localhost:8000/api/v1/auth/db-status').read().decode()))"

# Run Model Comparison & Skill Suite Verification
python verify_phase5.py
python verify_phase10.py
```

---

## 📄 License & Attribution

Developed for **Smart India Hackathon (SIH 2026)** • Under guidance of the **Ministry of Earth Sciences (MoES)** & **Indian National Centre for Ocean Information Services (INCOIS)**.
