from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from orchestrator import MasterOrchestrator
from database.db_setup import init_db, DB_PATH
import sqlite3
import json
import os

# Initialize Database
init_db()

app = FastAPI(title="CIRO: Crisis Intelligence & Response Orchestrator")

# Allow the dashboard (served from browser) to call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

orchestrator = MasterOrchestrator()

# ---- REQUEST MODEL ----
class OrchestrationRequest(BaseModel):
    signals: List[Dict[str, Any]]
    resources: Dict[str, Any]

# ---- ROUTES ----
@app.get("/")
async def root():
    return {"status": "CIRO Backend is running", "version": "1.0.0"}

@app.get("/dashboard", include_in_schema=False)
async def serve_dashboard():
    return FileResponse(os.path.join("static", "index.html"))

@app.post("/orchestrate")
async def orchestrate_crisis(request: OrchestrationRequest):
    try:
        # 1. Run the AI Orchestration
        result = orchestrator.run_crisis_orchestration(request.signals, request.resources)

        # 2. Extract key data for the database
        classification = result.get("classification", {})
        allocation_plan = result.get("allocation", {})
        if isinstance(allocation_plan, dict):
            first_alloc = allocation_plan.get("allocation_plan", [{}])
            first_alloc = first_alloc[0] if first_alloc else {}
        else:
            first_alloc = {}

        # 3. Save to database
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        incident_id = classification.get("incident_id", "INC-" + os.urandom(4).hex())

        cursor.execute("""
            INSERT OR REPLACE INTO incidents (id, type, severity, confidence, affected_population, status)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            incident_id,
            classification.get("crisis_type"),
            classification.get("severity"),
            classification.get("confidence", {}).get("overall_confidence"),
            classification.get("affected_zone", {}).get("affected_population"),
            "ACTIVE"
        ))

        for sig in request.signals:
            sig_id = "SIG-" + os.urandom(4).hex()
            cursor.execute(
                "INSERT INTO signals (id, incident_id, source, content) VALUES (?, ?, ?, ?)",
                (sig_id, incident_id, sig.get("source"), sig.get("text"))
            )

        res_alloc = first_alloc.get("allocated_resources", {})
        for res_type, qty in res_alloc.items():
            if qty and qty > 0:
                cursor.execute(
                    "INSERT INTO resource_allocations (id, incident_id, resource_type, quantity) VALUES (?, ?, ?, ?)",
                    ("RES-" + os.urandom(4).hex(), incident_id, res_type, qty)
                )

        conn.commit()
        conn.close()

        return result

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/incidents")
async def get_incidents():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM incidents ORDER BY created_at DESC")
    incidents = [dict(row) for row in cursor.fetchall()]
    for inc in incidents:
        cursor.execute("SELECT resource_type, quantity FROM resource_allocations WHERE incident_id = ?", (inc["id"],))
        inc["allocations"] = [dict(row) for row in cursor.fetchall()]
        cursor.execute("SELECT source, content FROM signals WHERE incident_id = ?", (inc["id"],))
        inc["signals"] = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return incidents


# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=False)
