from fastapi import FastAPI, WebSocket, Request, Form, Response
from twilio.rest import Client
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import json
import asyncio
import sqlite3
from pydantic import BaseModel
import random

# ============================================================================
# DATABASE SETUP (SQLite - zero cloud needed)
# ============================================================================

def init_db():
    conn = sqlite3.connect("victims.db")
    c = conn.cursor()
    
    c.execute('''CREATE TABLE IF NOT EXISTS victims (
        id TEXT PRIMARY KEY,
        name TEXT,
        phone TEXT,
        location_text TEXT,
        latitude REAL,
        longitude REAL,
        severity INTEGER,
        injuries TEXT,
        children INTEGER,
        status TEXT,
        created_at TEXT,
        intake_response TEXT,
        triage_response TEXT,
        geo_response TEXT,
        dispatch_response TEXT
    )''')
    
    c.execute('''CREATE TABLE IF NOT EXISTS ngos (
        id TEXT PRIMARY KEY,
        name TEXT,
        phone TEXT,
        latitude REAL,
        longitude REAL,
        capacity INTEGER,
        max_capacity INTEGER
    )''')
    
    conn.commit()
    conn.close()

init_db()

# ============================================================================
# MOCK DATA: 20 NGOs ACROSS PAKISTAN
# ============================================================================

MOCK_NGOS = [
    {"id": "ngo_01", "name": "Edhi Foundation", "phone": "+923001111111", "latitude": 24.8607, "longitude": 67.0104, "capacity": 0, "max_capacity": 5},  # Karachi
    {"id": "ngo_02", "name": "Aman Welfare", "phone": "+923002222222", "latitude": 24.9, "longitude": 67.05, "capacity": 0, "max_capacity": 3},
    {"id": "ngo_03", "name": "Red Crescent", "phone": "+923003333333", "latitude": 31.5204, "longitude": 74.3587, "capacity": 0, "max_capacity": 4},  # Lahore
    {"id": "ngo_04", "name": "Islamic Relief", "phone": "+923004444444", "latitude": 31.5, "longitude": 74.4, "capacity": 0, "max_capacity": 5},
    {"id": "ngo_05", "name": "Save the Children", "phone": "+923005555555", "latitude": 33.6844, "longitude": 73.1566, "capacity": 0, "max_capacity": 3},  # Islamabad
    {"id": "ngo_06", "name": "Caritas Pakistan", "phone": "+923006666666", "latitude": 34.0151, "longitude": 71.5787, "capacity": 0, "max_capacity": 4},  # Peshawar
    {"id": "ngo_07", "name": "Handicap International", "phone": "+923007777777", "latitude": 33.5898, "longitude": 73.4682, "capacity": 0, "max_capacity": 3},  # Rawalpindi
    {"id": "ngo_08", "name": "Help the Aged", "phone": "+923008888888", "latitude": 25.3548, "longitude": 68.3711, "capacity": 0, "max_capacity": 2},  # Hyderabad
    {"id": "ngo_09", "name": "Benazir Income Support", "phone": "+923009999999", "latitude": 29.1917, "longitude": 71.4734, "capacity": 0, "max_capacity": 5},  # Sukkur
    {"id": "ngo_10", "name": "Oxfam Pakistan", "phone": "+923010101010", "latitude": 34.76, "longitude": 72.34, "capacity": 0, "max_capacity": 4},  # Swat
    {"id": "ngo_11", "name": "ACF Pakistan", "phone": "+923011111111", "latitude": 24.7, "longitude": 67.1, "capacity": 0, "max_capacity": 3},  # Karachi
    {"id": "ngo_12", "name": "World Vision", "phone": "+923012121212", "latitude": 31.4, "longitude": 74.3, "capacity": 0, "max_capacity": 5},  # Lahore
    {"id": "ngo_13", "name": "MERCY Pakistan", "phone": "+923013131313", "latitude": 33.7, "longitude": 73.2, "capacity": 0, "max_capacity": 3},  # Islamabad
    {"id": "ngo_14", "name": "Smile Again Trust", "phone": "+923014141414", "latitude": 34.0, "longitude": 71.6, "capacity": 0, "max_capacity": 2},  # Peshawar
    {"id": "ngo_15", "name": "JDC Pakistan", "phone": "+923015151515", "latitude": 33.6, "longitude": 73.1, "capacity": 0, "max_capacity": 4},  # Islamabad
    {"id": "ngo_16", "name": "PODA", "phone": "+923016161616", "latitude": 31.5, "longitude": 74.35, "capacity": 0, "max_capacity": 3},  # Lahore
    {"id": "ngo_17", "name": "SKMH Trust", "phone": "+923017171717", "latitude": 24.9, "longitude": 67.0, "capacity": 0, "max_capacity": 4},  # Karachi
    {"id": "ngo_18", "name": "Fazaia Welfare", "phone": "+923018181818", "latitude": 31.4, "longitude": 74.4, "capacity": 0, "max_capacity": 2},  # Lahore
    {"id": "ngo_19", "name": "FJWU Relief", "phone": "+923019191919", "latitude": 33.68, "longitude": 73.15, "capacity": 0, "max_capacity": 5},  # Islamabad
    {"id": "ngo_20", "name": "ARY Welfare", "phone": "+923020202020", "latitude": 25.0, "longitude": 67.1, "capacity": 0, "max_capacity": 3},  # Karachi
]

# Load NGOs into database
conn = sqlite3.connect("victims.db")
c = conn.cursor()
for ngo in MOCK_NGOS:
    c.execute("DELETE FROM ngos WHERE id = ?", (ngo["id"],))
    c.execute("""INSERT INTO ngos VALUES (?, ?, ?, ?, ?, ?, ?)""",
              (ngo["id"], ngo["name"], ngo["phone"], ngo["latitude"], ngo["longitude"], ngo["capacity"], ngo["max_capacity"]))
conn.commit()
conn.close()

# ============================================================================
# MOCK LOCATION DATABASE
# ============================================================================

LOCATION_MAP = {
    "karachi": {"lat": 24.8607, "lon": 67.0104},
    "lahore": {"lat": 31.5204, "lon": 74.3587},
    "islamabad": {"lat": 33.6844, "lon": 73.1566},
    "peshawar": {"lat": 34.0151, "lon": 71.5787},
    "rawalpindi": {"lat": 33.5898, "lon": 73.4682},
    "gulshan iqbal": {"lat": 31.4501, "lon": 74.3237},
    "clifton": {"lat": 24.7761, "lon": 67.0054},
    "hayatabad": {"lat": 34.0, "lon": 71.5},
    "gulberg": {"lat": 31.5497, "lon": 74.3564},
    "pir wadhai": {"lat": 33.6, "lon": 73.25},
    "edhi center": {"lat": 24.8, "lon": 67.0},
    "6th": {"lat": 31.43, "lon": 74.36},
}

# ============================================================================
# PYDANTIC MODELS
# ============================================================================

class IntakeRequest(BaseModel):
    message: str
    phone: str = "+923491234567"

class VictimResponse(BaseModel):
    id: str
    name: str
    latitude: float
    longitude: float
    severity: int
    status: str
    created_at: str

# ============================================================================
# FASTAPI SETUP
# ============================================================================

app = FastAPI(title="FloodCommand Demo MVP", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://localhost:3001", 
        "https://flood-command-cortexium-atom-camp.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

connected_clients = []

import os

# ============================================================================
# TWILIO SETUP (Fallback Support)
# ============================================================================
TWILIO_ACCOUNTS_ENV = os.getenv("TWILIO_ACCOUNTS", "")
twilio_accounts = []

if TWILIO_ACCOUNTS_ENV:
    # Format: "SID|TOKEN|SENDER,SID2|TOKEN2|SENDER2"
    for acc in TWILIO_ACCOUNTS_ENV.split(","):
        parts = acc.split("|")
        if len(parts) == 3:
            twilio_accounts.append({
                "sid": parts[0].strip(),
                "token": parts[1].strip(),
                "sender": parts[2].strip()
            })

# ============================================================================
# MOCK AGENTS (Rule-based, no API calls)
# ============================================================================

class IntakeAgent:
    """Parse Urdu/English text → extract fields"""
    
    @staticmethod
    def process(message: str, phone: str) -> dict:
        # Simulate parsing
        import uuid
        
        # Mock parsing (pretend we're using Claude)
        words = message.lower()
        
        # Extract name (mock)
        name = "Unknown" if "ali" not in words else "Ali"
        
        # Extract location
        location = "Karachi"
        for loc_key in LOCATION_MAP.keys():
            if loc_key in words:
                location = loc_key.title()
                break
        
        # Extract count
        count = 1
        if "2" in message or "do" in words:
            count = 2
        elif "3" in message or "teen" in words:
            count = 3
        elif "4" in message or "char" in words:
            count = 4
        
        # Extract children
        children = 0
        if "bacha" in words or "child" in words or "kids" in words:
            children = 1
        
        # Extract injuries
        injuries = "no"
        if "zaakham" in words or "injured" in words or "hurt" in words:
            injuries = "yes"
        
        # Extract danger
        rising_water = "pani" in words or "water" in words
        
        return {
            "name": name,
            "location": location,
            "count": count,
            "children": children,
            "injuries": injuries,
            "rising_water": rising_water,
            "confidence": 0.85,
            "raw_message": message
        }

class TriageAgent:
    """Score severity 1-5"""
    
    @staticmethod
    def process(intake: dict) -> dict:
        score = 1
        
        if intake["injuries"] == "yes":
            score += 2
        
        if intake["children"] > 0:
            score += 1
        
        if intake["rising_water"]:
            score += 1
        
        if intake["count"] > 5:
            score += 1
        
        score = min(score, 5)
        
        descriptions = {
            1: "STABLE",
            2: "CAUTION",
            3: "URGENT",
            4: "CRITICAL",
            5: "EMERGENCY"
        }
        
        return {
            "score": score,
            "description": descriptions[score],
            "factors": [
                "injuries" if intake["injuries"] == "yes" else None,
                "children" if intake["children"] > 0 else None,
                "rising_water" if intake["rising_water"] else None,
            ]
        }

class GeoAgent:
    """Resolve location → GPS"""
    
    @staticmethod
    def process(location_text: str) -> dict:
        location_lower = location_text.lower()
        
        # Check exact match
        if location_lower in LOCATION_MAP:
            coords = LOCATION_MAP[location_lower]
            return {
                "latitude": coords["lat"],
                "longitude": coords["lon"],
                "resolved_name": location_text,
                "confidence": 0.95,
                "method": "exact_match"
            }
        
        # Check partial match
        for key in LOCATION_MAP.keys():
            if key in location_lower:
                coords = LOCATION_MAP[key]
                return {
                    "latitude": coords["lat"],
                    "longitude": coords["lon"],
                    "resolved_name": key.title(),
                    "confidence": 0.70,
                    "method": "partial_match"
                }
        
        # Default to Karachi (fallback)
        return {
            "latitude": 24.8607,
            "longitude": 67.0104,
            "resolved_name": "Karachi (Default)",
            "confidence": 0.3,
            "method": "fallback"
        }

class DispatchAgent:
    """Find nearest NGO"""
    
    @staticmethod
    def haversine(lon1, lat1, lon2, lat2):
        from math import radians, cos, sin, asin, sqrt
        lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
        dlon = lon2 - lon1
        dlat = lat2 - lat1
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * asin(sqrt(a))
        km = 6371 * c
        return km
    
    @staticmethod
    def process(victim_lat: float, victim_lon: float, severity: int) -> dict:
        # Get all NGOs
        conn = sqlite3.connect("victims.db")
        c = conn.cursor()
        c.execute("SELECT * FROM ngos")
        ngos_raw = c.fetchall()
        conn.close()
        
        candidates = []
        for ngo in ngos_raw:
            ngo_id, ngo_name, ngo_phone, ngo_lat, ngo_lon, capacity, max_cap = ngo
            
            # Skip if at capacity
            if capacity >= max_cap:
                continue
            
            # Calculate distance
            distance = DispatchAgent.haversine(victim_lon, victim_lat, ngo_lon, ngo_lat)
            
            # ETA (assume 40 km/h in flood)
            eta = int((distance / 40) * 60)
            
            # Score: closer + less busy = better
            score = (100 / (distance + 1)) + (max_cap - capacity) * 10
            
            candidates.append({
                "ngo_id": ngo_id,
                "ngo_name": ngo_name,
                "ngo_phone": ngo_phone,
                "distance_km": round(distance, 2),
                "eta_minutes": eta,
                "score": score
            })
        
        if not candidates:
            return {"ngo_assigned": False}
        
        # Select best
        best = sorted(candidates, key=lambda x: x["score"], reverse=True)[0]
        
        return {
            "ngo_assigned": True,
            "ngo_id": best["ngo_id"],
            "ngo_name": best["ngo_name"],
            "ngo_phone": best["ngo_phone"],
            "distance_km": best["distance_km"],
            "eta_minutes": best["eta_minutes"]
        }

class NotifyAgent:
    """Simulate SMS notification"""
    
    @staticmethod
    def process(victim_phone: str, victim_name: str, ngo_name: str, eta: int, lat: float, lon: float, severity: int) -> dict:
        # Simulate SMS
        victim_msg = f"""
🚨 EMERGENCY DISPATCH CONFIRMED
Name: {victim_name}
Severity: {severity}/5
Help: {ngo_name}
ETA: {eta} minutes
Stay safe!
        """
        
        ngo_msg = f"""
URGENT DISPATCH
Victim GPS: {lat:.4f}N {lon:.4f}E
Severity: {severity}/5
ETA: {eta} minutes
Dispatch immediately!
        """
        
        print(f"\n[SMS TO VICTIM] {victim_msg}")
        print(f"\n[SMS TO NGO] {ngo_msg}")
        
        if twilio_accounts:
            for acc in twilio_accounts:
                try:
                    twilio_client = Client(acc['sid'], acc['token'])
                    
                    # Twilio requires the sender to have the "whatsapp:" prefix if the receiver has it
                    clean_sender = acc['sender'].replace("whatsapp:", "")
                    sender = f"whatsapp:{clean_sender}" if victim_phone.startswith("whatsapp:") else clean_sender
                    
                    twilio_client.messages.create(
                        from_=sender,
                        body=victim_msg,
                        to=victim_phone
                    )
                    print(f"[Twilio] Message sent to victim successfully using account {acc['sid'][:6]}")
                    break # Success! Exit the fallback loop
                except Exception as e:
                    print(f"[Twilio Fallback] Account {acc['sid'][:6]} failed: {e}. Trying next account...")
        
        return {
            "messages_sent": 2,
            "victim_sms": victim_msg,
            "ngo_sms": ngo_msg
        }

# ============================================================================
# ENDPOINTS
# ============================================================================

@app.post("/intake")
async def handle_intake(request: IntakeRequest):
    """Receive WhatsApp message (simulated)"""
    import uuid
    
    victim_id = str(uuid.uuid4())[:8]
    
    # Agent 1: Intake
    intake = IntakeAgent.process(request.message, request.phone)
    
    # Agent 2: Triage
    triage = TriageAgent.process(intake)
    
    # Agent 3: Geo
    geo = GeoAgent.process(intake["location"])
    
    # Agent 4: Dispatch
    dispatch = DispatchAgent.process(geo["latitude"], geo["longitude"], triage["score"])
    
    # Agent 5: Notify
    if dispatch["ngo_assigned"]:
        notify = NotifyAgent.process(
            request.phone,
            intake["name"],
            dispatch["ngo_name"],
            dispatch["eta_minutes"],
            geo["latitude"],
            geo["longitude"],
            triage["score"]
        )
    else:
        notify = {"messages_sent": 0}
    
    # Store in database
    conn = sqlite3.connect("victims.db")
    c = conn.cursor()
    c.execute("""INSERT INTO victims VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
              (victim_id, intake["name"], request.phone, intake["location"],
               geo["latitude"], geo["longitude"], triage["score"], intake["injuries"],
               intake["children"], "DISPATCHED" if dispatch["ngo_assigned"] else "PENDING",
               datetime.now().isoformat(), json.dumps(intake), json.dumps(triage),
               json.dumps(geo), json.dumps(dispatch)))
    conn.commit()
    conn.close()
    
    # Broadcast to all connected WebSocket clients
    result = {
        "victim_id": victim_id,
        "name": intake["name"],
        "latitude": geo["latitude"],
        "longitude": geo["longitude"],
        "severity": triage["score"],
        "status": "DISPATCHED" if dispatch["ngo_assigned"] else "PENDING",
        "created_at": datetime.now().isoformat(),
        "intake": intake,
        "triage": triage,
        "geo": geo,
        "dispatch": dispatch,
        "notify": notify
    }
    
    # Send to all WebSocket clients
    for client in connected_clients:
        try:
            await client.send_json({
                "type": "victim_added",
                "data": result
            })
        except:
            pass
    
    return result

@app.get("/api/victims")
async def get_victims():
    """Get all victims for map display"""
    conn = sqlite3.connect("victims.db")
    c = conn.cursor()
    c.execute("SELECT id, name, latitude, longitude, severity, status, created_at FROM victims ORDER BY created_at DESC")
    rows = c.fetchall()
    conn.close()
    
    victims = []
    for row in rows:
        victims.append({
            "id": row[0],
            "name": row[1],
            "latitude": row[2],
            "longitude": row[3],
            "severity": row[4],
            "status": row[5],
            "created_at": row[6]
        })
    
    return victims

@app.get("/api/stats")
async def get_stats():
    """Dashboard statistics"""
    conn = sqlite3.connect("victims.db")
    c = conn.cursor()
    
    c.execute("SELECT COUNT(*) FROM victims")
    total = c.fetchone()[0]
    
    c.execute("SELECT COUNT(*) FROM victims WHERE status = 'DISPATCHED'")
    dispatched = c.fetchone()[0]
    
    c.execute("SELECT AVG(CAST(severity AS FLOAT)) FROM victims")
    avg_severity = c.fetchone()[0] or 0
    
    conn.close()
    
    return {
        "totalVictims": total,
        "totalDispatched": dispatched,
        "averageETA": 12,  # Mock
        "activeNGOs": 15  # Mock
    }

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket for real-time updates"""
    await websocket.accept()
    connected_clients.append(websocket)
    
    try:
        while True:
            data = await websocket.receive_text()
            # Echo to all clients
            for client in connected_clients:
                try:
                    await client.send_text(data)
                except:
                    pass
    except:
        connected_clients.remove(websocket)

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.post("/twilio/webhook")
async def twilio_webhook(From: str = Form(...), Body: str = Form(...)):
    """Receive incoming WhatsApp from Twilio and trigger workflow"""
    req = IntakeRequest(message=Body, phone=From)
    await handle_intake(req)
    return Response(content="<Response></Response>", media_type="text/xml")

if __name__ == "__main__":
    import uvicorn
    print("\n" + "="*60)
    print("🚨 FLOODCOMMAND DEMO MVP - BACKEND")
    print("="*60)
    print("✓ Backend running on: http://localhost:8000")
    print("✓ Database: SQLite (victims.db)")
    print("✓ Mock NGOs loaded: 20 across Pakistan")
    print("="*60 + "\n")
    uvicorn.run(app, host="0.0.0.0", port=8000)
