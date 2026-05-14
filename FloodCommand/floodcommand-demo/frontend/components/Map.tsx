'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const orangeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

export default function MapComponent({ victims }: { victims: any[] }) {
  return (
    <div className="w-full h-[600px] bg-white rounded-lg shadow-xl overflow-hidden relative z-0">
      <MapContainer center={[30.1575, 71.5897]} zoom={5} className="w-full h-full">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap'
        />

        {victims.map((victim) => (
          <Marker
            key={victim.id}
            position={[victim.latitude, victim.longitude]}
            icon={victim.severity >= 4 ? redIcon : orangeIcon}
          >
            <Popup>
              <div className="p-2 text-sm">
                <h3 className="font-bold">{victim.name}</h3>
                <p>Severity: {victim.severity}/5</p>
                <p>Status: {victim.status}</p>
                <p className="text-xs text-gray-500">
                  {new Date(victim.created_at).toLocaleTimeString()}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
