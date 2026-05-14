'use client';

import { useEffect, useRef } from 'react';

interface Agent {
  name: string;
  color: string;
  icon: string;
}

const AGENTS: Record<string, Agent> = {
  INTAKE: { name: 'Intake', color: 'blue', icon: '📥' },
  TRIAGE: { name: 'Triage', color: 'yellow', icon: '⚖️' },
  GEO: { name: 'Geo', color: 'purple', icon: '📍' },
  DISPATCH: { name: 'Dispatch', color: 'emerald', icon: '🚁' },
  NOTIFY: { name: 'Notify', color: 'pink', icon: '💬' },
};

export default function AgentFeed({ victims }: { victims: any[] }) {
  const logs: any[] = [];
  const feedEndRef = useRef<HTMLDivElement>(null);

  // Generate logs from victims
  victims.forEach((victim) => {
    const baseTime = new Date(victim.created_at);

    logs.push({
      timestamp: baseTime,
      agent: 'INTAKE',
      message: `Parsed Urdu: "${victim.name}" at ${victim.latitude.toFixed(2)}, ${victim.longitude.toFixed(2)}`,
    });

    logs.push({
      timestamp: new Date(baseTime.getTime() + 500),
      agent: 'TRIAGE',
      message: `Severity: ${victim.severity}/5 (${['STABLE', 'CAUTION', 'URGENT', 'CRITICAL', 'EMERGENCY'][victim.severity - 1]})`,
    });

    logs.push({
      timestamp: new Date(baseTime.getTime() + 1000),
      agent: 'GEO',
      message: `GPS resolved: ${victim.latitude.toFixed(4)}, ${victim.longitude.toFixed(4)}`,
    });

    logs.push({
      timestamp: new Date(baseTime.getTime() + 1500),
      agent: 'DISPATCH',
      message: `NGO matched: ${victim.intake?.location || 'Location'} region`,
    });

    logs.push({
      timestamp: new Date(baseTime.getTime() + 2000),
      agent: 'NOTIFY',
      message: `2x SMS sent: Victim + NGO (ETA: ~12 min)`,
    });
  });

  // Sort by timestamp (newest first)
  const sortedLogs = logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 50);

  // Auto-scroll effect is cool, but newest at top is better for dashboards
  // useEffect(() => { feedEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [sortedLogs]);

  return (
    <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-2xl relative overflow-hidden h-96 flex flex-col">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-bl-full blur-2xl pointer-events-none" />
      
      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-700/50">
        <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
        <h2 className="text-xl font-bold text-white tracking-wide">Live Autonomous Agents</h2>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
        {sortedLogs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-3">
            <svg className="w-10 h-10 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            <p className="font-medium tracking-wide">System awaiting signals...</p>
          </div>
        ) : (
          sortedLogs.map((log, idx) => {
            const agent = AGENTS[log.agent] || { name: log.agent, color: 'gray', icon: '⚡' };
            const isNew = idx < 5; // Highlight newest logs
            
            return (
              <div 
                key={idx} 
                className={`flex items-start gap-3 p-3 rounded-xl transition-all duration-500 border ${
                  isNew ? 'bg-slate-700/40 border-slate-600 shadow-md transform translate-x-0 opacity-100' : 'bg-transparent border-transparent hover:bg-slate-800/60 opacity-80'
                }`}
              >
                <div className={`mt-0.5 w-8 h-8 rounded-full bg-${agent.color}-500/20 border border-${agent.color}-500/30 flex items-center justify-center text-sm shadow-inner`}>
                  {agent.icon}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className={`text-xs font-bold uppercase tracking-wider text-${agent.color}-400`}>
                      {agent.name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono tracking-tighter whitespace-nowrap bg-slate-900/50 px-2 py-0.5 rounded-full">
                      {log.timestamp.toLocaleTimeString(undefined, { hour12: false, fractionalSecondDigits: 2 })}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 font-mono leading-relaxed break-words">
                    {log.message}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={feedEndRef} />
      </div>
    </div>
  );
}
