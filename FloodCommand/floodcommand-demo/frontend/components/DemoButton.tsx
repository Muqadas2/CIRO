'use client';

import { useState } from 'react';

const DEMO_MESSAGES = [
  {
    text: "Bacha aa gaya, ghar mein pani bhar gaya, 4 log phanse hain, Gulshan Iqbal",
    translation: "Child at home, water rising, 4 people trapped, Gulshan Iqbal",
  },
  {
    text: "Buzurg zaakham hain, Edhi center ke paas Lahore, do bachay bhee",
    translation: "Elderly injured, near Edhi center Lahore, 2 children also",
  },
  {
    text: "Family chhath pe phanse, pani aa gaya, Hayatabad Peshawar, 3 log",
    translation: "Family trapped on roof, water rising, Hayatabad Peshawar, 3 people",
  },
];

export default function DemoButton({ onVictimAdded }: any) {
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);

  const sendMessage = async (message: string, idx: number) => {
    setLoadingIndex(idx);
    try {
      const apiUrl = 'https://floodcommand-backend-540448741613.us-central1.run.app';
      const response = await fetch(`${apiUrl}/intake`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message,
          phone: "whatsapp:+923496563463", // Your exact Sandbox verified phone number
        }),
      });

      await response.json();
      
      // Refresh UI quickly
      setTimeout(() => {
        onVictimAdded();
      }, 500);

    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoadingIndex(null);
    }
  };

  return (
    <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-400"></div>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <span>📱</span> Live Simulation Mode
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Click to simulate raw WhatsApp messages hitting the intake webhook
          </p>
        </div>
        <div className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-lg flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          Zero API Keys Required
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {DEMO_MESSAGES.map((msg, idx) => (
          <div key={idx} className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-4 flex flex-col justify-between hover:border-slate-600 transition-colors group">
            <div className="mb-4">
              <p className="font-semibold text-slate-200 text-sm leading-snug">"{msg.text}"</p>
              <p className="text-xs text-slate-500 mt-2 italic font-mono">{msg.translation}</p>
            </div>
            <button
              onClick={() => sendMessage(msg.text, idx)}
              disabled={loadingIndex !== null}
              className={`w-full py-2.5 rounded-lg text-sm font-bold transition-all ${
                loadingIndex === idx 
                  ? 'bg-blue-600/50 text-blue-200 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:shadow-[0_0_20px_rgba(59,130,246,0.6)]'
              }`}
            >
              {loadingIndex === idx ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Processing...
                </span>
              ) : 'Send Simulation'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
