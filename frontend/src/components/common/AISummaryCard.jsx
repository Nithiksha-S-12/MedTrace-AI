import React, { useState } from 'react';

export default function AISummaryCard({ summary, compact = false }) {
  const [minorExpanded, setMinorExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!summary) {
    return (
      <div className="card p-6 text-center text-gray-400">
        <span className="text-4xl mb-2 block">🧠</span>
        <p className="font-medium">AI Summary not yet generated</p>
        <p className="text-sm mt-1">Click "Generate AI Summary" to analyze your records</p>
      </div>
    );
  }

  const { criticalAlerts = [], chronicConditions = [], minorHistory = [], snapshot } = summary;

  return (
    <div className="space-y-4">
      {/* 50-Word ER Snapshot */}
      {snapshot && (
        <div className="card p-4 border-l-4 border-navy-800">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">📄</span>
            <h3 className="font-bold text-navy-800 text-sm">Emergency Room Snapshot (50 Words)</h3>
          </div>
          <p className="text-sm text-gray-700 italic leading-relaxed">"{snapshot}"</p>
        </div>
      )}

      {/* 🔴 Critical Alerts */}
      <div className={`rounded-card border-2 ${criticalAlerts.length > 0 ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'} overflow-hidden`}>
        <div className={`px-4 py-3 flex items-center gap-2 ${criticalAlerts.length > 0 ? 'bg-red-500' : 'bg-gray-300'}`}>
          <span className="text-white text-lg">🔴</span>
          <h3 className="font-bold text-white text-sm">
            Critical Alerts — Life-Threatening
            {criticalAlerts.length > 0 && (
              <span className="ml-2 bg-white text-red-600 text-xs px-2 py-0.5 rounded-full font-bold">
                {criticalAlerts.length} Alert{criticalAlerts.length !== 1 ? 's' : ''}
              </span>
            )}
          </h3>
        </div>
        <div className="p-4">
          {criticalAlerts.length > 0 ? (
            <ul className="space-y-2">
              {criticalAlerts.map((alert, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-red-500 font-bold mt-0.5 flex-shrink-0">⚠</span>
                  <span className="text-sm font-semibold text-red-800">{alert}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 italic">✅ No critical alerts found.</p>
          )}
        </div>
      </div>

      {/* 🟠 Chronic Conditions */}
      <div className={`rounded-card border-2 ${chronicConditions.length > 0 ? 'border-amber-400 bg-amber-50' : 'border-gray-200 bg-gray-50'} overflow-hidden`}>
        <div className={`px-4 py-3 flex items-center gap-2 ${chronicConditions.length > 0 ? 'bg-amber-500' : 'bg-gray-300'}`}>
          <span className="text-white text-lg">🟠</span>
          <h3 className="font-bold text-white text-sm">
            Chronic Conditions — Active
            {chronicConditions.length > 0 && (
              <span className="ml-2 bg-white text-amber-700 text-xs px-2 py-0.5 rounded-full font-bold">
                {chronicConditions.length}
              </span>
            )}
          </h3>
        </div>
        <div className="p-4">
          {chronicConditions.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {chronicConditions.map((cond, i) => (
                <div key={i} className="flex items-start gap-2 bg-white border border-amber-200 rounded-md p-2.5">
                  <span className="text-amber-500 mt-0.5 flex-shrink-0">●</span>
                  <span className="text-sm text-amber-900">{cond}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">✅ No chronic conditions reported.</p>
          )}
        </div>
      </div>

      {/* 🟢 Past Minor Issues (Collapsible) */}
      {!compact && (
        <div className={`rounded-card border-2 ${minorHistory.length > 0 ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-gray-50'} overflow-hidden`}>
          <button
            onClick={() => setMinorExpanded(!minorExpanded)}
            className={`w-full px-4 py-3 flex items-center justify-between gap-2 ${minorHistory.length > 0 ? 'bg-forest-800 hover:bg-forest-700' : 'bg-gray-300'} transition-colors`}
          >
            <div className="flex items-center gap-2">
              <span className="text-white text-lg">🟢</span>
              <h3 className="font-bold text-white text-sm">
                Past Minor Issues — Resolved
                {minorHistory.length > 0 && (
                  <span className="ml-2 bg-white text-green-800 text-xs px-2 py-0.5 rounded-full font-bold">
                    {minorHistory.length}
                  </span>
                )}
              </h3>
            </div>
            <span className="text-white text-lg">{minorExpanded ? '▲' : '▼'}</span>
          </button>

          {minorExpanded && (
            <div className="p-4">
              {minorHistory.length > 0 ? (
                <ul className="space-y-1.5">
                  {minorHistory.map((issue, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-green-800">
                      <span className="text-green-500">✓</span>
                      {issue}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 italic">No minor issues recorded.</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Generated timestamp */}
      {summary.generatedAt && (
        <p className="text-xs text-gray-400 text-center">
          🤖 AI Summary generated: {new Date(summary.generatedAt).toLocaleString('en-IN')}
        </p>
      )}
    </div>
  );
}
