import React from 'react';
import { useProjectStore } from '../store/projectStore';
import { BOMItem } from '../types';
import { Plus, Trash2, HelpCircle } from 'lucide-react';

export const BOMTable: React.FC = () => {
  const { bom, addBOMItem, updateBOMItem, deleteBOMItem } = useProjectStore();

  const handleAddField = (id: string, key: keyof BOMItem, value: string) => {
    updateBOMItem(id, { [key]: value });
  };

  const handleAddRow = () => {
    addBOMItem({
      blockName: "New Block",
      candidateComponent: "",
      stage: "Prototype",
      voltage: "",
      interface: "",
      sizeNotes: "",
      costEstimate: "",
      supplier: "",
      status: "Not Started",
      risk: "",
      alternative: ""
    });
  };

  const totalCost = bom.reduce((sum, item) => {
    if (!item.costEstimate) return sum;
    const val = parseFloat(item.costEstimate.replace(/[^\d.]/g, ''));
    return isNaN(val) ? sum : sum + val;
  }, 0);

  const procuredItemsCount = bom.filter(item => 
    ['Sourced', 'Ordered', 'Received', 'Tested'].includes(item.status)
  ).length;

  return (
    <div className="flex-1 bg-slate-50 flex flex-col overflow-hidden p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-bold text-slate-800 tracking-tight uppercase">Bill of Materials (BOM)</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage component specifications, interfaces, dimensions, costs, and risk mitigations.</p>
        </div>
        <button
          onClick={handleAddRow}
          className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white px-3.5 py-1.5 rounded-md text-xs font-semibold shadow-sm transition-all cursor-pointer border border-slate-950"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Component</span>
        </button>
      </div>

      {/* Stats Summary Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5 select-none">
        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Total Components</span>
          <span className="text-lg font-extrabold text-slate-850 mt-1 block">{bom.length} items</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Total Est. Cost</span>
          <span className="text-lg font-extrabold text-slate-850 mt-1 block">${totalCost.toFixed(2)} USD</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Procurement Ratio</span>
          <span className="text-lg font-extrabold text-slate-850 mt-1 block">
            {procuredItemsCount} / {bom.length} Sourced
          </span>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Average Unit Cost</span>
          <span className="text-lg font-extrabold text-slate-850 mt-1 block">
            ${bom.length > 0 ? (totalCost / bom.length).toFixed(2) : '0.00'}
          </span>
        </div>
      </div>

      <div className="flex-1 bg-white border border-slate-200 rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse min-w-[1250px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider sticky top-0 z-10">
                <th className="px-3.5 py-3 w-[180px]">Block / Name</th>
                <th className="px-3.5 py-3 w-[180px]">Candidate Component</th>
                <th className="px-3.5 py-3 w-[110px]">Stage</th>
                <th className="px-3.5 py-3 w-[90px] text-center">Voltage</th>
                <th className="px-3.5 py-3 w-[120px]">Interface</th>
                <th className="px-3.5 py-3 w-[140px]">Size Notes</th>
                <th className="px-3.5 py-3 w-[100px]">Cost Est.</th>
                <th className="px-3.5 py-3 w-[115px]">Supplier</th>
                <th className="px-3.5 py-3 w-[125px]">Status</th>
                <th className="px-3.5 py-3 w-[170px]">Risk Notes</th>
                <th className="px-3.5 py-3 w-[150px]">Alternative</th>
                <th className="px-3.5 py-3 w-[60px] text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {bom.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-6 py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                      <HelpCircle className="w-8 h-8 text-slate-350 mb-2" />
                      <p className="font-bold text-slate-500">No components listed</p>
                      <p className="text-[10px] text-slate-400 mt-1 max-w-sm">Click &quot;Add Component&quot; above to begin listing candidate hardware components for your project.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                bom.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-1">
                      <input
                        type="text"
                        value={item.blockName}
                        onChange={(e) => handleAddField(item.id, 'blockName', e.target.value)}
                        className="w-full bg-transparent border-0 focus:bg-white focus:ring-1 focus:ring-slate-900 rounded px-2.5 py-1.5 font-bold text-slate-800"
                        placeholder="Block Name"
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        value={item.candidateComponent}
                        onChange={(e) => handleAddField(item.id, 'candidateComponent', e.target.value)}
                        className="w-full bg-transparent border-0 focus:bg-white focus:ring-1 focus:ring-slate-900 rounded px-2.5 py-1.5 font-semibold text-slate-700"
                        placeholder="e.g. ESP32-C3"
                      />
                    </td>
                    <td className="p-1">
                      <select
                        value={item.stage}
                        onChange={(e) => handleAddField(item.id, 'stage', e.target.value as BOMItem['stage'])}
                        className="w-full bg-transparent border-0 focus:bg-white focus:ring-1 focus:ring-slate-900 rounded px-2 py-1.5 font-medium text-slate-700"
                      >
                        <option value="Prototype">Prototype</option>
                        <option value="Production">Production</option>
                        <option value="Future">Future</option>
                      </select>
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        value={item.voltage}
                        onChange={(e) => handleAddField(item.id, 'voltage', e.target.value)}
                        className="w-full bg-transparent border-0 focus:bg-white focus:ring-1 focus:ring-slate-900 rounded px-2 py-1.5 text-center text-slate-700 font-medium"
                        placeholder="3.3V"
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        value={item.interface}
                        onChange={(e) => handleAddField(item.id, 'interface', e.target.value)}
                        className="w-full bg-transparent border-0 focus:bg-white focus:ring-1 focus:ring-slate-900 rounded px-2 py-1.5 text-slate-700"
                        placeholder="GPIO, I2C"
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        value={item.sizeNotes}
                        onChange={(e) => handleAddField(item.id, 'sizeNotes', e.target.value)}
                        className="w-full bg-transparent border-0 focus:bg-white focus:ring-1 focus:ring-slate-900 rounded px-2 py-1.5 text-slate-700"
                        placeholder="Dimensions"
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        value={item.costEstimate}
                        onChange={(e) => handleAddField(item.id, 'costEstimate', e.target.value)}
                        className="w-full bg-transparent border-0 focus:bg-white focus:ring-1 focus:ring-slate-900 rounded px-2 py-1.5 text-slate-700 font-bold"
                        placeholder="$0.00"
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        value={item.supplier}
                        onChange={(e) => handleAddField(item.id, 'supplier', e.target.value)}
                        className="w-full bg-transparent border-0 focus:bg-white focus:ring-1 focus:ring-slate-900 rounded px-2 py-1.5 text-slate-700"
                        placeholder="Supplier"
                      />
                    </td>
                    <td className="p-1">
                      <select
                        value={item.status}
                        onChange={(e) => handleAddField(item.id, 'status', e.target.value as BOMItem['status'])}
                        className="w-full bg-transparent border-0 focus:bg-white focus:ring-1 focus:ring-slate-900 rounded px-2 py-1.5 text-slate-700 font-semibold"
                      >
                        <option value="Not Started">Not Started</option>
                        <option value="Sourced">Sourced</option>
                        <option value="Ordered">Ordered</option>
                        <option value="Received">Received</option>
                        <option value="Tested">Tested</option>
                      </select>
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        value={item.risk}
                        onChange={(e) => handleAddField(item.id, 'risk', e.target.value)}
                        className="w-full bg-transparent border-0 focus:bg-white focus:ring-1 focus:ring-slate-900 rounded px-2 py-1.5 text-slate-650"
                        placeholder="Risk note"
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        value={item.alternative}
                        onChange={(e) => handleAddField(item.id, 'alternative', e.target.value)}
                        className="w-full bg-transparent border-0 focus:bg-white focus:ring-1 focus:ring-slate-900 rounded px-2 py-1.5 text-slate-650"
                        placeholder="Alternate"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <button
                        onClick={() => deleteBOMItem(item.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded transition-colors cursor-pointer"
                        title="Delete Component"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
