'use client';

export default function StatsPanel({ stats }: { stats: any }) {
  const cards = [
    { label: 'Total Victims', value: stats.totalVictims || 0, color: 'blue', icon: '👤' },
    { label: 'Dispatched', value: stats.totalDispatched || 0, color: 'emerald', icon: '🚑' },
    { label: 'Avg ETA (min)', value: stats.averageETA || 0, color: 'amber', icon: '⏱️' },
    { label: 'Active NGOs', value: stats.activeNGOs || 15, color: 'purple', icon: '🛡️' },
  ];

  return (
    <div className="space-y-4 h-full flex flex-col">
      {cards.map((card) => (
        <div
          key={card.label}
          className="flex-1 bg-slate-800/40 backdrop-blur-lg border border-slate-700/50 rounded-xl p-5 hover:bg-slate-800/60 transition-all duration-300 group relative overflow-hidden"
        >
          <div className={`absolute top-0 right-0 w-24 h-24 bg-${card.color}-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110`} />
          <div className="flex justify-between items-start mb-2 relative z-10">
            <p className="text-slate-400 text-sm font-medium tracking-wide uppercase">
              {card.label}
            </p>
            <span className="text-xl opacity-80">{card.icon}</span>
          </div>
          <p className="text-4xl font-black text-white tracking-tight relative z-10 mt-2 flex items-baseline gap-1">
            {card.value}
            {card.label === 'Avg ETA (min)' && <span className="text-sm font-medium text-slate-500">m</span>}
          </p>
        </div>
      ))}
    </div>
  );
}
