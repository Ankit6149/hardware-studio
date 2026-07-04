import React from 'react';
import { useProjectStore } from '../store/projectStore';
import { Button } from '../ui/Button';
import { StatCard } from '../ui/StatCard';
import { 
  Battery, 
  Cpu, 
  Clock, 
  Plus, 
  Trash2, 
  Zap, 
  AlertTriangle, 
  RefreshCw, 
  Download 
} from 'lucide-react';
import { exportToCSV } from '../lib/exportCsv';

export const PowerBudgetTable: React.FC = () => {
  const {
    powerBudget,
    batteryCapacityMah = 100,
    nodes,
    addPowerItem,
    updatePowerItem,
    deletePowerItem,
    setBatteryCapacity,
    generatePowerFromBlueprint
  } = useProjectStore();

  const handleAddRow = () => {
    addPowerItem({
      blockName: "New Rail Component",
      voltage: "3.3",
      activeCurrentMa: 1.0,
      sleepCurrentUa: 10.0,
      dutyCyclePercent: 5.0,
      quantity: 1,
      notes: ""
    });
  };

  const handleUpdate = (id: string, key: string, val: string | number) => {
    let parsedVal: string | number = val;
    if (['activeCurrentMa', 'sleepCurrentUa', 'dutyCyclePercent', 'quantity'].includes(key)) {
      parsedVal = val === '' ? 0 : Number(val);
    }
    updatePowerItem(id, { [key]: parsedVal });
  };

  // Summaries Calculations
  let totalActiveCurrent = 0;
  let totalAverageCurrent = 0;

  powerBudget.forEach(item => {
    const active = Number(item.activeCurrentMa) || 0;
    const sleep = Number(item.sleepCurrentUa) || 0;
    const duty = Number(item.dutyCyclePercent) || 0;
    const qty = Number(item.quantity) || 1;

    // Formula: active * duty/100 + (sleep/1000) * (1 - duty/100)
    const avg = (active * (duty / 100) + (sleep / 1000) * (1 - duty / 100)) * qty;

    totalActiveCurrent += active * qty;
    totalAverageCurrent += avg;
  });

  const batteryCapacity = batteryCapacityMah || 100;
  const runtimeHours = totalAverageCurrent > 0 ? batteryCapacity / totalAverageCurrent : 0;
  const runtimeDays = runtimeHours / 24;

  // Warnings Engine
  const powerWarnings: string[] = [];
  const hasBattery = nodes.some(n => n.data?.name.toLowerCase().includes('battery') || n.id.includes('battery'));
  
  if (!hasBattery) {
    powerWarnings.push("No physical battery or lithium energy cell block detected in the architecture canvas.");
  }
  if (totalActiveCurrent > 200) {
    powerWarnings.push("High active current draw (> 200mA) detected. This will limit pocket wearable lifetimes.");
  }
  const missingSleep = powerBudget.some(item => Number(item.sleepCurrentUa) === 0 && item.blockName.toLowerCase().includes('mcu'));
  if (missingSleep) {
    powerWarnings.push("Sleep current not configured for core MCU block. Quiescent sleep rates are vital for wearables.");
  }
  if (runtimeHours > 0 && runtimeHours < 24) {
    powerWarnings.push(`Critical Runtime: Estimated lifetime (${runtimeHours.toFixed(1)} hrs) is under the 24-hour baseline standard.`);
  }

  const handleExportCSV = () => {
    const headers = ["Component Block", "Voltage (V)", "Active Current (mA)", "Sleep Current (uA)", "Duty Cycle (%)", "Quantity", "Avg Current (mA)", "Notes"];
    const rows = powerBudget.map(item => {
      const active = Number(item.activeCurrentMa) || 0;
      const sleep = Number(item.sleepCurrentUa) || 0;
      const duty = Number(item.dutyCyclePercent) || 0;
      const qty = Number(item.quantity) || 1;
      const avg = (active * (duty / 100) + (sleep / 1000) * (1 - duty / 100)) * qty;
      return [
        item.blockName,
        item.voltage,
        active,
        sleep,
        duty,
        qty,
        avg.toFixed(4),
        item.notes
      ];
    });
    exportToCSV(`${projectNameSafe()}_power_budget.csv`, headers, rows);
  };

  const projectNameSafe = () => {
    return useProjectStore.getState().projectName.toLowerCase().replace(/\s+/g, '_');
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50 relative p-6 space-y-6 overflow-y-auto">
      
      {/* Top Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-4 rounded-lg shadow-sm">
        <div className="space-y-1">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
            System Power Budgeting
          </h2>
          <p className="text-[11px] text-slate-500 leading-normal max-w-xl">
            Configure estimated voltage, currents, and operational duty-cycle percentages to analyze battery depletion cycles and simulate runtime curves.
          </p>
        </div>

        {/* Battery Capacity configuration Input */}
        <div className="flex items-center space-x-2.5 shrink-0 bg-slate-50 px-3 py-2 border border-slate-200 rounded">
          <Battery className="w-4 h-4 text-emerald-500" />
          <div className="flex flex-col space-y-0.5">
            <span className="text-[9px] font-bold text-slate-450 uppercase tracking-widest font-mono leading-none">
              Battery Capacity
            </span>
            <div className="flex items-center space-x-1">
              <input
                type="number"
                value={batteryCapacityMah === 0 ? '' : batteryCapacityMah}
                onChange={(e) => setBatteryCapacity(e.target.value === '' ? 0 : Number(e.target.value))}
                className="w-16 bg-white border border-slate-250 text-xs px-1.5 py-0.5 rounded font-mono text-right focus:outline-none"
                min="1"
              />
              <span className="text-[10px] text-slate-600 font-mono font-semibold">
                mAh
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Active Draw"
          value={totalActiveCurrent.toFixed(1)}
          unit="mA"
          status={totalActiveCurrent > 200 ? 'warning' : 'info'}
          icon={<Zap className="w-4 h-4 text-cyan-500" />}
        />
        <StatCard
          title="Total Avg Draw"
          value={totalAverageCurrent.toFixed(4)}
          unit="mA"
          status="success"
          icon={<Cpu className="w-4 h-4 text-emerald-500" />}
        />
        <StatCard
          title="Battery Capacity"
          value={batteryCapacity}
          unit="mAh"
          status="info"
          icon={<Battery className="w-4 h-4 text-blue-500" />}
        />
        <StatCard
          title="Est. Runtime"
          value={runtimeHours > 0 ? (runtimeHours > 72 ? runtimeDays.toFixed(1) : runtimeHours.toFixed(1)) : '0.0'}
          unit={runtimeHours > 72 ? 'days' : 'hours'}
          status={runtimeHours < 24 && runtimeHours > 0 ? 'error' : 'success'}
          icon={<Clock className="w-4 h-4 text-purple-500" />}
        />
      </div>

      {/* Main Budget Spreadsheet */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
        <div className="p-3 bg-slate-50/50 border-b border-slate-150 flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-650 uppercase tracking-wider font-mono">
            Load Line Estimate Sheet
          </span>
          <div className="flex items-center space-x-2">
            <Button 
              onClick={generatePowerFromBlueprint} 
              variant="outline" 
              size="xs"
              icon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Sync Power Blocks
            </Button>
            <Button 
              onClick={handleAddRow} 
              variant="primary" 
              size="xs"
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Line Item
            </Button>
            <Button 
              onClick={handleExportCSV} 
              variant="outline" 
              size="xs"
              icon={<Download className="w-3.5 h-3.5" />}
            >
              Export CSV
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-550 uppercase text-[9px] tracking-wider">
                <th className="p-2.5 font-semibold pl-4">Component Block</th>
                <th className="p-2.5 font-semibold w-20">Volt (V)</th>
                <th className="p-2.5 font-semibold w-24">Active (mA)</th>
                <th className="p-2.5 font-semibold w-24">Sleep (uA)</th>
                <th className="p-2.5 font-semibold w-24">Duty (%)</th>
                <th className="p-2.5 font-semibold w-20">Qty</th>
                <th className="p-2.5 font-semibold w-28">Avg (mA)</th>
                <th className="p-2.5 font-semibold">Description / Notes</th>
                <th className="p-2.5 font-semibold w-10 text-center pr-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
              {powerBudget.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-6 text-center text-slate-400">
                    No active loads configured. Click &apos;Sync Power Blocks&apos; or add lines manually to build budget.
                  </td>
                </tr>
              ) : (
                powerBudget.map((item) => {
                  const active = Number(item.activeCurrentMa) || 0;
                  const sleep = Number(item.sleepCurrentUa) || 0;
                  const duty = Number(item.dutyCyclePercent) || 0;
                  const qty = Number(item.quantity) || 1;
                  const itemAvg = (active * (duty / 100) + (sleep / 1000) * (1 - duty / 100)) * qty;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="p-1.5 pl-4">
                        <input
                          type="text"
                          value={item.blockName}
                          onChange={(e) => handleUpdate(item.id, 'blockName', e.target.value)}
                          className="w-full bg-transparent border-0 hover:bg-slate-100 focus:bg-white focus:ring-1 focus:ring-slate-300 rounded px-1.5 py-0.5 text-xs text-slate-800 font-semibold"
                        />
                      </td>
                      <td className="p-1.5">
                        <input
                          type="text"
                          value={item.voltage}
                          onChange={(e) => handleUpdate(item.id, 'voltage', e.target.value)}
                          className="w-full bg-transparent border-0 hover:bg-slate-100 focus:bg-white focus:ring-1 focus:ring-slate-300 rounded px-1.5 py-0.5 text-xs text-slate-700 text-right"
                          placeholder="3.3"
                        />
                      </td>
                      <td className="p-1.5">
                        <input
                          type="number"
                          value={item.activeCurrentMa === 0 ? '' : item.activeCurrentMa}
                          onChange={(e) => handleUpdate(item.id, 'activeCurrentMa', e.target.value)}
                          className="w-full bg-transparent border-0 hover:bg-slate-100 focus:bg-white focus:ring-1 focus:ring-slate-300 rounded px-1.5 py-0.5 text-xs text-slate-700 text-right"
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td className="p-1.5">
                        <input
                          type="number"
                          value={item.sleepCurrentUa === 0 ? '' : item.sleepCurrentUa}
                          onChange={(e) => handleUpdate(item.id, 'sleepCurrentUa', e.target.value)}
                          className="w-full bg-transparent border-0 hover:bg-slate-100 focus:bg-white focus:ring-1 focus:ring-slate-300 rounded px-1.5 py-0.5 text-xs text-slate-700 text-right"
                          min="0"
                        />
                      </td>
                      <td className="p-1.5">
                        <input
                          type="number"
                          value={item.dutyCyclePercent === 0 ? '' : item.dutyCyclePercent}
                          onChange={(e) => handleUpdate(item.id, 'dutyCyclePercent', e.target.value)}
                          className="w-full bg-transparent border-0 hover:bg-slate-100 focus:bg-white focus:ring-1 focus:ring-slate-300 rounded px-1.5 py-0.5 text-xs text-slate-700 text-right"
                          min="0"
                          max="100"
                        />
                      </td>
                      <td className="p-1.5">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleUpdate(item.id, 'quantity', e.target.value)}
                          className="w-full bg-transparent border-0 hover:bg-slate-100 focus:bg-white focus:ring-1 focus:ring-slate-300 rounded px-1.5 py-0.5 text-xs text-slate-700 text-center"
                          min="1"
                        />
                      </td>
                      <td className="p-2.5 font-bold text-slate-800 text-right">
                        {itemAvg.toFixed(4)} mA
                      </td>
                      <td className="p-1.5">
                        <input
                          type="text"
                          value={item.notes}
                          onChange={(e) => handleUpdate(item.id, 'notes', e.target.value)}
                          className="w-full bg-transparent border-0 hover:bg-slate-100 focus:bg-white focus:ring-1 focus:ring-slate-300 rounded px-1.5 py-0.5 text-xs text-slate-600 font-sans"
                          placeholder="Rail notes or operational assumptions..."
                        />
                      </td>
                      <td className="p-1.5 text-center pr-4">
                        <button
                          onClick={() => deletePowerItem(item.id)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Warnings & Constraints Panel */}
      {powerWarnings.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2">
          <div className="flex items-center space-x-2 text-amber-800 font-bold text-xs uppercase tracking-wider font-mono">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Power Budgeting Warnings</span>
          </div>
          <ul className="list-disc pl-5 text-xs text-amber-700 space-y-1 font-sans">
            {powerWarnings.map((warn, i) => (
              <li key={i}>{warn}</li>
            ))}
          </ul>
        </div>
      )}
      
    </div>
  );
};
