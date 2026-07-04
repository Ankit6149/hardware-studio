import React, { useState } from 'react';
import { useProjectStore } from '../store/projectStore';
import { Button } from '../ui/Button';
import { StatCard } from '../ui/StatCard';
import { 
  Plus, 
  Trash2, 
  RefreshCw, 
  Code, 
  FileText, 
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { exportFirmwareSkeletonFile } from '../lib/exportFirmware';

export const FirmwarePlan: React.FC = () => {
  const {
    firmwareTasks,
    nodes,
    addFirmwareTask,
    updateFirmwareTask,
    deleteFirmwareTask,
    generateFirmwareTasksFromBlueprint
  } = useProjectStore();

  const [activeTab, setActiveTab] = useState<'all' | 'mvp' | 'later' | 'future'>('all');

  const handleAddTask = () => {
    addFirmwareTask({
      name: "New Firmware Controller Task",
      type: "Driver",
      linkedBlock: "",
      priority: "MVP",
      status: "Not Started",
      description: "Initialize and poll the target component.",
      acceptanceCriteria: "Register value returned matches datasheet spec.",
      notes: ""
    });
  };

  const handleUpdate = (id: string, key: string, val: string) => {
    updateFirmwareTask(id, { [key]: val });
  };

  // Filter tasks
  const filteredTasks = firmwareTasks.filter(task => {
    if (activeTab === 'all') return true;
    return task.priority.toLowerCase() === activeTab;
  });



  // Summary Metrics
  const totalTasks = firmwareTasks.length;
  const doneCount = firmwareTasks.filter(t => t.status === 'Done').length;
  const inProgressCount = firmwareTasks.filter(t => t.status === 'In Progress').length;
  const blockedCount = firmwareTasks.filter(t => t.status === 'Blocked').length;
  const progressPercent = totalTasks > 0 ? Math.round(((doneCount + inProgressCount * 0.5) / totalTasks) * 100) : 0;

  const taskTypes = ['State', 'Driver', 'BLE', 'Power', 'Safety', 'Test', 'Integration'];
  const taskPriorities = ['MVP', 'Later', 'Future'];
  const taskStatuses = ['Not Started', 'In Progress', 'Done', 'Blocked'];

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50 relative p-6 space-y-6 overflow-y-auto">
      
      {/* Control Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-4 rounded-lg shadow-sm">
        <div className="space-y-1">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
            Firmware Implementation Plan
          </h2>
          <p className="text-[11px] text-slate-500 leading-normal max-w-xl">
            Track logic drivers, state transitions, BLE communication tasks, and generate an Arduino/ESP32 C++ starter skeleton framework from your configurations.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 shrink-0">
          <Button 
            onClick={() => exportFirmwareSkeletonFile(useProjectStore.getState())} 
            variant="outline" 
            size="xs"
            className="border-emerald-300 hover:bg-emerald-50 text-emerald-800"
            icon={<Code className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />}
          >
            Export ESP32/C++ Skeleton
          </Button>
          <Button 
            onClick={generateFirmwareTasksFromBlueprint} 
            variant="outline" 
            size="xs"
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Sync Firmware Blocks
          </Button>
          <Button 
            onClick={handleAddTask} 
            variant="primary" 
            size="xs"
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Create Task
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          title="Total Tasks"
          value={totalTasks}
          status="info"
          icon={<FileText className="w-4 h-4 text-cyan-500" />}
        />
        <StatCard
          title="Completion Progress"
          value={progressPercent}
          unit="%"
          status={progressPercent === 100 ? 'success' : 'info'}
          icon={<CheckCircle className="w-4 h-4 text-emerald-500" />}
        />
        <StatCard
          title="In Progress / Done"
          value={`${inProgressCount} / ${doneCount}`}
          status="success"
          icon={<Clock className="w-4 h-4 text-blue-500" />}
        />
        <StatCard
          title="Blocked Tasks"
          value={blockedCount}
          status={blockedCount > 0 ? 'error' : 'success'}
          icon={<AlertTriangle className="w-4 h-4 text-rose-500" />}
        />
      </div>

      {/* Tabs Switchers */}
      <div className="flex border-b border-slate-200">
        {(['all', 'mvp', 'later', 'future'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-mono font-bold border-b-2 uppercase transition-all duration-150 ${
              activeTab === tab
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/20'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            {tab === 'all' ? 'All Tasks' : `${tab} Phase`}
          </button>
        ))}
      </div>

      {/* Task Rows Spreadsheet */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-550 uppercase text-[9px] tracking-wider">
                <th className="p-2.5 font-semibold pl-4">Task Name</th>
                <th className="p-2.5 font-semibold w-28">Type</th>
                <th className="p-2.5 font-semibold w-36">Linked Block</th>
                <th className="p-2.5 font-semibold w-24 text-center">Priority</th>
                <th className="p-2.5 font-semibold w-32 text-center">Status</th>
                <th className="p-2.5 font-semibold">Description / Goal</th>
                <th className="p-2.5 font-semibold">Acceptance Criteria</th>
                <th className="p-2.5 font-semibold w-10 text-center pr-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-slate-400">
                    No firmware tasks listed. Click &apos;Sync Firmware Blocks&apos; to auto-generate from architecture tags.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50/50">
                    <td className="p-1.5 pl-4">
                      <input
                        type="text"
                        value={task.name}
                        onChange={(e) => handleUpdate(task.id, 'name', e.target.value)}
                        className="w-full bg-transparent border-0 hover:bg-slate-100 focus:bg-white focus:ring-1 focus:ring-slate-300 rounded px-1.5 py-0.5 text-xs text-slate-850 font-bold"
                      />
                    </td>
                    <td className="p-1.5">
                      <select
                        value={task.type}
                        onChange={(e) => handleUpdate(task.id, 'type', e.target.value)}
                        className="w-full bg-transparent border-0 hover:bg-slate-100 focus:bg-white focus:ring-1 focus:ring-slate-300 rounded px-1.5 py-0.5 text-xs text-slate-700"
                      >
                        {taskTypes.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </td>
                    <td className="p-1.5">
                      <select
                        value={task.linkedBlock}
                        onChange={(e) => handleUpdate(task.id, 'linkedBlock', e.target.value)}
                        className="w-full bg-transparent border-0 hover:bg-slate-100 focus:bg-white focus:ring-1 focus:ring-slate-300 rounded px-1.5 py-0.5 text-xs text-slate-700 font-sans"
                      >
                        <option value="">-- No link --</option>
                        {nodes.filter(n => n.type === 'blockNode').map(n => (
                          <option key={n.id} value={n.id}>{n.data.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-1.5 text-center">
                      <select
                        value={task.priority}
                        onChange={(e) => handleUpdate(task.id, 'priority', e.target.value)}
                        className="bg-transparent border-0 hover:bg-slate-100 focus:bg-white text-xs px-1 text-center font-bold text-slate-750 uppercase"
                      >
                        {taskPriorities.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </td>
                    <td className="p-1.5 text-center">
                      <select
                        value={task.status}
                        onChange={(e) => handleUpdate(task.id, 'status', e.target.value)}
                        className="bg-transparent border-0 hover:bg-slate-100 focus:bg-white text-xs px-1 text-center font-bold text-slate-750"
                      >
                        {taskStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="p-1.5">
                      <input
                        type="text"
                        value={task.description}
                        onChange={(e) => handleUpdate(task.id, 'description', e.target.value)}
                        className="w-full bg-transparent border-0 hover:bg-slate-100 focus:bg-white focus:ring-1 focus:ring-slate-300 rounded px-1.5 py-0.5 text-xs text-slate-600 font-sans"
                        placeholder="Goal of code branch..."
                      />
                    </td>
                    <td className="p-1.5">
                      <input
                        type="text"
                        value={task.acceptanceCriteria}
                        onChange={(e) => handleUpdate(task.id, 'acceptanceCriteria', e.target.value)}
                        className="w-full bg-transparent border-0 hover:bg-slate-100 focus:bg-white focus:ring-1 focus:ring-slate-300 rounded px-1.5 py-0.5 text-xs text-slate-600 font-sans"
                        placeholder="Expected behavior validation..."
                      />
                    </td>
                    <td className="p-1.5 text-center pr-4">
                      <button
                        onClick={() => deleteFirmwareTask(task.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                        title="Delete Task"
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
