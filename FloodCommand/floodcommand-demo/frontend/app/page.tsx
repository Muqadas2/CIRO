'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import AgentFeed from '@/components/AgentFeed';
import StatsPanel from '@/components/StatsPanel';
import DemoButton from '@/components/DemoButton';
import io from 'socket.io-client';

// Map must be dynamically imported because it relies on the window object
const MapComponent = dynamic(() => import('@/components/Map'), { ssr: false });

export default function Dashboard() {
  const [socket, setSocket] = useState<any>(null);
  const [victims, setVictims] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalVictims: 0,
    totalDispatched: 0,
    averageETA: 0,
  });

  useEffect(() => {
    // Connect to backend API directly to bypass Vercel env var errors
    const apiUrl = 'https://floodcommand-backend-540448741613.us-central1.run.app';
    const newSocket = io(apiUrl, {
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('✓ Connected to backend');
    });

    newSocket.on('victim_added', (message: any) => {
      if (message.data) {
        setVictims((prev) => [message.data, ...prev]);
      }
    });

    setSocket(newSocket);

    // Fetch initial victims
    fetchVictims(apiUrl);
    const interval = setInterval(() => fetchVictims(apiUrl), 5000);

    return () => {
      clearInterval(interval);
      newSocket.disconnect();
    };
  }, []);

  const fetchVictims = async (apiUrl: string) => {
    try {
      const res = await fetch(`${apiUrl}/api/victims`);
      const data = await res.json();
      setVictims(data);

      const statsRes = await fetch(`${apiUrl}/api/stats`);
      const statsData = await statsRes.json();
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching API:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F1C] text-slate-200 p-6 font-sans relative overflow-hidden">
      {/* Dynamic Background Blurs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="mb-8 flex items-center justify-between border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 mb-2">
              FloodCommand
            </h1>
            <p className="text-slate-400 font-medium">
              Autonomous Disaster Response System
            </p>
          </div>
          <div className="flex items-center gap-3 bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700/50 backdrop-blur-md">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-sm font-semibold text-emerald-400 tracking-wide">SYSTEM ACTIVE</span>
          </div>
        </header>

        {/* Demo Controls */}
        <DemoButton onVictimAdded={() => fetchVictims('https://floodcommand-backend-540448741613.us-central1.run.app')} />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-8">
          {/* Stats - Left Col */}
          <div className="lg:col-span-1">
            <StatsPanel stats={stats} />
          </div>

          {/* Map - Middle Col */}
          <div className="lg:col-span-3">
            <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/60 rounded-2xl p-1 shadow-2xl h-full min-h-[600px] relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none z-10" />
               <MapComponent victims={victims} />
            </div>
          </div>
        </div>

        {/* Feed - Bottom */}
        <div className="mt-6">
          <AgentFeed victims={victims} />
        </div>
      </div>
    </div>
  );
}
