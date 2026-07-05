import React from 'react';
import { Project } from '../../../types';
import { ReadinessReport } from '../../../lib/readinessScore';

interface SheetProps {
  project: Project;
  report: ReadinessReport;
}

// ----------------------------------------------------
// SH 13: FIRMWARE ARCHITECTURE BLUEPRINT
// ----------------------------------------------------
export const FirmwareArchitectureSheet: React.FC<SheetProps> = ({ project }) => {
  const firmwareTasks = project.firmwareTasks || [];

  return (
    <div className="space-y-6 flex-grow flex flex-col justify-between font-mono text-xs text-slate-800">
      <div className="text-[10px] text-slate-550 border-b border-slate-200 pb-2">
        DRAWING TITLE: SCHEMATIC STATE MACHINE LOOPS & INTERRUPTS DIAGRAM
      </div>

      <div className="w-full border border-slate-250 bg-slate-50/20 rounded flex items-center justify-center p-6 min-h-[350px]">
        <svg className="w-full max-w-2xl h-80 bg-white border border-slate-200" viewBox="0 0 600 280">
          <rect width="100%" height="100%" fill="url(#arch-grid)" />

          {/* State bubbles */}
          {/* Boot */}
          <g transform="translate(30, 110)">
            <rect x="0" y="0" width="80" height="40" rx="2" fill="#fff" stroke="#0f172a" strokeWidth="1.5" />
            <text x="40" y="18" textAnchor="middle" className="text-[7px] font-black fill-slate-800">01. BOOT INIT</text>
            <text x="40" y="29" textAnchor="middle" className="text-[5.5px] fill-slate-450">setup()</text>
            <line x1="80" y1="20" x2="110" y2="20" stroke="#cbd5e1" strokeWidth="1" />
          </g>

          {/* System Loop */}
          <g transform="translate(145, 110)">
            <rect x="0" y="0" width="90" height="40" rx="2.5" fill="#fff" stroke="#3b82f6" strokeWidth="2" />
            <text x="45" y="18" textAnchor="middle" className="text-[7.5px] font-black fill-blue-800">02. SYSTEM LOOP</text>
            <text x="45" y="29" textAnchor="middle" className="text-[5.5px] fill-slate-450">low power idle</text>
            <line x1="90" y1="20" x2="120" y2="20" stroke="#cbd5e1" strokeWidth="1" />
            
            {/* Loop Arrow */}
            <path d="M 45 40 L 45 55 L -45 55 L -45 20 L 0 20" fill="none" stroke="#cbd5e1" strokeWidth="0.8" strokeDasharray="2,2" />
          </g>

          {/* Input Detect */}
          <g transform="translate(270, 110)">
            <rect x="0" y="0" width="90" height="40" rx="2" fill="#fff" stroke="#10b981" strokeWidth="1.5" />
            <text x="45" y="18" textAnchor="middle" className="text-[7px] font-black fill-emerald-800">03. INPUT SENSE</text>
            <text x="45" y="29" textAnchor="middle" className="text-[5.5px] fill-slate-450">interrupt poll</text>
            <line x1="90" y1="20" x2="120" y2="20" stroke="#cbd5e1" strokeWidth="1" />
          </g>

          {/* BLE command dispatch */}
          <g transform="translate(395, 110)">
            <rect x="0" y="0" width="90" height="40" rx="2" fill="#fff" stroke="#6366f1" strokeWidth="1.5" />
            <text x="45" y="18" textAnchor="middle" className="text-[7px] font-black fill-indigo-850">04. BLE DISPATCH</text>
            <text x="45" y="29" textAnchor="middle" className="text-[5.5px] fill-slate-450">packet publish</text>
            <line x1="90" y1="20" x2="120" y2="20" stroke="#cbd5e1" strokeWidth="1" />
          </g>

          {/* Output feedback */}
          <g transform="translate(520, 110)">
            <rect x="-10" y="0" width="80" height="40" rx="2" fill="#fff" stroke="#eab308" strokeWidth="1.5" />
            <text x="30" y="18" textAnchor="middle" className="text-[7px] font-black fill-amber-800">05. FEEDBACK</text>
            <text x="30" y="29" textAnchor="middle" className="text-[5.5px] fill-slate-450">vibe / led driver</text>
          </g>

          {/* Fault Trap */}
          <g transform="translate(145, 30)">
            <rect x="0" y="0" width="90" height="35" rx="2" fill="#fef2f2" stroke="#ef4444" strokeWidth="1.2" />
            <text x="45" y="16" textAnchor="middle" className="text-[7px] font-black fill-red-800">06. FAULT INTERRUPT</text>
            <text x="45" y="26" textAnchor="middle" className="text-[5.5px] fill-red-650">watchdog handler</text>
            <line x1="45" y1="35" x2="45" y2="80" stroke="#ef4444" strokeWidth="0.8" strokeDasharray="2,2" />
          </g>
        </svg>
      </div>

      {/* Firmware Tasks Registry Table */}
      <div className="border p-2 bg-white space-y-1">
        <span className="font-bold text-slate-700 block border-b pb-1">Firmware Driver Tasks Registry</span>
        <div className="overflow-y-auto max-h-36">
          <table className="w-full text-[9px] text-left">
            <thead>
              <tr className="text-slate-400 border-b">
                <th className="pb-1">Task identifier</th>
                <th className="pb-1">Task Type</th>
                <th className="pb-1">Priority</th>
                <th className="pb-1">Linked Block</th>
                <th className="pb-1">Task Status</th>
                <th className="pb-1 font-bold">Acceptance Code Criteria</th>
              </tr>
            </thead>
            <tbody>
              {firmwareTasks.map(t => (
                <tr key={t.id} className="border-b border-slate-100">
                  <td className="py-1 font-bold">{t.name}</td>
                  <td className="font-bold text-indigo-700">{t.type}</td>
                  <td>{t.priority}</td>
                  <td className="font-mono text-slate-400">{t.linkedBlock || "Controller Core"}</td>
                  <td className="font-bold">{t.status}</td>
                  <td className="text-slate-500 font-mono text-[8px]">{t.acceptanceCriteria || "CRITERIA REQUIRED"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// SH 14: TESTING & VALIDATION BLUEPRINT
// ----------------------------------------------------
export const TestingValidationSheet: React.FC<SheetProps> = ({ project }) => {
  const testing = project.testing || [];

  return (
    <div className="space-y-6 flex-grow flex flex-col justify-between font-mono text-xs text-slate-800">
      <div className="text-[10px] text-slate-550 border-b border-slate-200 pb-2">
        DRAWING TITLE: HORIZONTAL TIMELINE TESTING STAGES & COMPLIANCE SIGNATURES
      </div>

      <div className="w-full border border-slate-250 bg-slate-50/20 rounded flex items-center justify-center p-6 min-h-[350px]">
        {testing.length === 0 ? (
          <div className="text-[10px] text-rose-500 font-black border-2 border-dashed border-rose-300 p-4">
            [ STAMP: NO VALIDATION TESTS DEFINED ]
          </div>
        ) : (
          <svg className="w-full max-w-2xl h-80 bg-white border border-slate-200" viewBox="0 0 600 280">
            <rect width="100%" height="100%" fill="url(#arch-grid)" />

            {/* EVT, DVT, PVT, QA lanes */}
            {['EVT', 'DVT', 'PVT', 'QA'].map((lane, idx) => {
              const x = 30 + idx * 135;
              const testsInLane = testing.filter(t => (t.category || 'EVT').toUpperCase() === lane);

              return (
                <g key={lane}>
                  <rect x={x} y={25} width={125} height={230} rx="1.5" fill="none" stroke="#cbd5e1" strokeWidth="1" />
                  <rect x={x} y={25} width={125} height={20} fill="#f1f5f9" stroke="#cbd5e1" />
                  <text x={x + 10} y={38} className="text-[7.5px] font-black fill-slate-800 uppercase tracking-widest">{lane} TIMELINE</text>

                  {testsInLane.slice(0, 3).map((t, j) => {
                    let borderCol = "#94a3b8";
                    let fillCol = "#fafafa";
                    if (t.status === 'Passed') {
                      borderCol = "#10b981";
                      fillCol = "#ecfdf5";
                    } else if (t.status === 'Failed') {
                      borderCol = "#ef4444";
                      fillCol = "#fef2f2";
                    }

                    return (
                      <g key={t.id || j}>
                        <rect x={x + 5} y={55 + j * 55} width={115} height={45} rx="1" fill={fillCol} stroke={borderCol} />
                        <text x={x + 10} y={67} className="text-[7px] font-bold fill-slate-900 truncate w-100">{t.name.slice(0, 18)}</text>
                        <text x={x + 10} y={76} className="text-[5.5px] fill-slate-450 truncate w-100">Goal: {t.goal.slice(0, 22)}</text>
                        <rect x={x + 10} y={82} width={38} height={10} rx="0.5" fill="#fff" stroke={borderCol} />
                        <text x={x + 29} y={89} textAnchor="middle" className="text-[5px] font-bold fill-slate-700 uppercase">{t.status}</text>
                      </g>
                    );
                  })}

                  {testsInLane.length === 0 && (
                    <text x={x + 62} y={120} textAnchor="middle" className="text-[6.5px] font-bold fill-rose-500 uppercase tracking-wider">[ REQUIRED TEST ]</text>
                  )}
                </g>
              );
            })}
          </svg>
        )}
      </div>

      {/* Tests checklist table */}
      <div className="border p-2 bg-white space-y-1">
        <span className="font-bold text-slate-700 block border-b pb-1">Validation Verification Matrix Table</span>
        <div className="overflow-y-auto max-h-36">
          <table className="w-full text-[9px] text-left">
            <thead>
              <tr className="text-slate-400 border-b">
                <th className="pb-1">Test Name</th>
                <th className="pb-1">Category</th>
                <th className="pb-1">Steps</th>
                <th className="pb-1">Pass Criteria Required</th>
                <th className="pb-1">Status</th>
                <th className="pb-1 font-bold">Evidence Log Link</th>
              </tr>
            </thead>
            <tbody>
              {testing.map(t => (
                <tr key={t.id} className="border-b border-slate-100">
                  <td className="py-1 font-bold">{t.name}</td>
                  <td>{t.category || "EVT"}</td>
                  <td className="text-slate-550 truncate max-w-xs">{t.steps}</td>
                  <td className="text-slate-500 font-bold">{t.passCriteria}</td>
                  <td>{t.status}</td>
                  <td className="text-slate-400 font-mono text-[8px]">{t.evidenceLink || "EVIDENCE REQUIRED"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
