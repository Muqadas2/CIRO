// CIRO API Service - Connects to the FastAPI backend
// Change this to your backend's IP address on the network
const BASE_URL = 'http://192.168.1.100:8000';

/**
 * Set the base URL dynamically (useful when configuring from settings)
 */
let currentBaseUrl = BASE_URL;

export function setBaseUrl(url) {
  currentBaseUrl = url;
}

export function getBaseUrl() {
  return currentBaseUrl;
}

/**
 * Check if backend is reachable
 */
export async function checkHealth() {
  try {
    const response = await fetch(`${currentBaseUrl}/`, { 
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await response.json();
    return { connected: true, data };
  } catch (error) {
    return { connected: false, error: error.message };
  }
}

/**
 * Submit crisis signals to the CIRO orchestrator
 * POST /orchestrate
 */
export async function submitCrisisReport(signals, resources = null) {
  const defaultResources = {
    ambulances: { total: 8, available: 8 },
    police_units: { total: 12, available: 12 },
    rescue_teams: { total: 2, available: 2 },
    water_tankers: { total: 4, available: 4 },
    fire_trucks: { total: 3, available: 3 },
  };

  const body = {
    signals: signals,
    resources: resources || defaultResources,
  };

  const response = await fetch(`${currentBaseUrl}/orchestrate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Server error ${response.status}: ${errorData}`);
  }

  return await response.json();
}

/**
 * Get all past incidents
 * GET /incidents
 */
export async function getIncidents() {
  const response = await fetch(`${currentBaseUrl}/incidents`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Server error ${response.status}`);
  }

  return await response.json();
}
