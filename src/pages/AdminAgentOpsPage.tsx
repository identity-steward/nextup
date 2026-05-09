import React, { useEffect, useState, useCallback } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { StatCard } from '../components/StatCard';
import { DashboardCard } from '../components/DashboardCard';
import { Zap, AlertTriangle, CheckCircle, Clock, RefreshCw, Activity, Database, Shield } from 'lucide-react';
import { loadAdminFeedSnapshot } from '../agents/07_ADMIN/feed';
import { getRecentTriggerLogs } from '../agents/07_ADMIN/triggerLog';
import { loadPlatformScorecard } from '../agents/09_STRATEGY/metrics';
import { AgentRunner } from '../services/agentRunner';
import { TRIGGER_REGISTRY } from '../agents/08_AUTOMATION/triggerRegistry';
import type { AdminFeedSnapshot } from '../agents/07_ADMIN/feed';
import type { TriggerLogEntry } from '../agents/07_ADMIN/triggerLog';
import type { PlatformScorecard } from '../agents/09_STRATEGY/metrics';
import type { Task, NeedsManualReview } from '../types/agent';

const FOLDER_COLORS: Record<string, string> = {
  '01_INTAKE': 'bg-blue-100 text-blue-800',
  '02_PROFILES': 'bg-green-100 text-green-800',
  '03_CONTENT': 'bg-amber-100 text-amber-800',
  '04_SUPPORTERS': 'bg-emerald-100 text-emerald-800',
  '05_PARTNERS': 'bg-sky-100 text-sky-800',
  '06_EVENTS': 'bg-orange-100 text-orange-800',
  '07_ADMIN': 'bg-gray-100 text-gray-800',
};

const PRIORITY_COLORS: Record<string, string> = {
  urgent: 'bg-red-100 text-red-800',
  high: 'bg-orange-100 text-orange-800',
  normal: 'bg-blue-100 text-blue-800',
  low: 'bg-gray-100 text-gray-600',
};

function Badge({ label, className }: { label: string; className: string }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${className}`}>{label}</span>
  );
}

function FolderBadge({ folder }: { folder: string }) {
  const cls = FOLDER_COLORS[folder] ?? 'bg-gray-100 text-gray-700';
  return <Badge label={folder} className={cls} />;
}

function PriorityBadge({ priority }: { priority: string }) {
  return <Badge label={priority} className={PRIORITY_COLORS[priority] ?? 'bg-gray-100 text-gray-600'} />;
}

interface AdminAgentOpsPageProps {
  onNavigate?: (page: string) => void;
}

export function AdminAgentOpsPage({ onNavigate }: AdminAgentOpsPageProps) {
  const [snapshot, setSnapshot] = useState<AdminFeedSnapshot | null>(null);
  const [scorecard, setScorecard] = useState<PlatformScorecard | null>(null);
  const [triggerLogs, setTriggerLogs] = useState<TriggerLogEntry[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [lastRun, setLastRun] = useState<string | null>(null);
  const [runError, setRunError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'tasks' | 'flags' | 'logs' | 'registry'>('tasks');

  const loadData = useCallback(async () => {
    const [snap, sc, logs] = await Promise.all([
      loadAdminFeedSnapshot(),
      loadPlatformScorecard(),
      getRecentTriggerLogs(50),
    ]);
    setSnapshot(snap);
    setScorecard(sc);
    setTriggerLogs(logs);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleRunAll() {
    setIsRunning(true);
    setRunError(null);
    try {
      await AgentRunner.runAll();
      setLastRun(new Date().toLocaleTimeString());
      await loadData();
    } catch (e) {
      setRunError('Agent run failed. Check console for details.');
    } finally {
      setIsRunning(false);
    }
  }

  const openTasks = snapshot?.openTasks ?? [];
  const pendingFlags = snapshot?.pendingFlags ?? [];
  const taskByTable = snapshot?.taskCountByTable ?? {};
  const flagByTable = snapshot?.flagCountByTable ?? {};

  const tabs = [
    { id: 'tasks', label: 'Open Tasks', count: openTasks.length },
    { id: 'flags', label: 'Review Flags', count: pendingFlags.length },
    { id: 'logs', label: 'Trigger Logs', count: triggerLogs.length },
    { id: 'registry', label: 'Trigger Registry', count: TRIGGER_REGISTRY.length },
  ] as const;

  return (
    <DashboardLayout title="Agent Ops" onNavigate={onNavigate}>
      <div className="space-y-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Agent Operations</h1>
            <p className="text-sm text-gray-500 mt-1">
              Live view of all agent tasks, review flags, trigger logs, and platform scorecard.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {lastRun && (
              <span className="text-xs text-gray-500">Last run: {lastRun}</span>
            )}
            {runError && (
              <span className="text-xs text-red-600">{runError}</span>
            )}
            <button
              onClick={loadData}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={handleRunAll}
              disabled={isRunning}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              <Zap className="w-4 h-4" />
              {isRunning ? 'Running...' : 'Run All Agents'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {scorecard && [
            { label: 'Active Athletes', value: scorecard.activeAthletes, icon: Activity, color: 'blue' as const },
            { label: 'Creators', value: scorecard.totalCreators, icon: Database, color: 'green' as const },
            { label: 'Supporters', value: scorecard.totalSupporters, icon: CheckCircle, color: 'green' as const },
            { label: 'Open Tasks', value: scorecard.openTasks, icon: Clock, color: 'orange' as const },
            { label: 'Review Flags', value: scorecard.pendingReviewFlags, icon: AlertTriangle, color: 'gold' as const },
            { label: 'Pending Intakes', value: scorecard.pendingIntakes, icon: Shield, color: 'blue' as const },
            { label: 'Testimonials', value: scorecard.approvedTestimonials, icon: CheckCircle, color: 'green' as const },
          ].map(({ label, value, icon: Icon, color }) => (
            <StatCard key={label} title={label} value={String(value)} icon={Icon} color={color} />
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.entries(taskByTable).map(([table, count]) => (
            <div key={table} className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
              <p className="text-xs text-gray-500 truncate">{table}</p>
              <p className="text-xl font-bold text-gray-900">{count}</p>
              <p className="text-xs text-gray-400">open tasks</p>
            </div>
          ))}
          {Object.entries(flagByTable).map(([table, count]) => (
            <div key={`flag_${table}`} className="bg-red-50 border border-red-100 rounded-xl p-3 shadow-sm">
              <p className="text-xs text-red-500 truncate">{table}</p>
              <p className="text-xl font-bold text-red-700">{count}</p>
              <p className="text-xs text-red-400">pending flags</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-100 px-6 flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'tasks' && (
              <OpenTasksTab tasks={openTasks} />
            )}
            {activeTab === 'flags' && (
              <ReviewFlagsTab flags={pendingFlags} />
            )}
            {activeTab === 'logs' && (
              <TriggerLogsTab logs={triggerLogs} />
            )}
            {activeTab === 'registry' && (
              <TriggerRegistryTab />
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function OpenTasksTab({ tasks }: { tasks: Task[] }) {
  if (tasks.length === 0) {
    return <p className="text-sm text-gray-500 text-center py-8">No open tasks.</p>;
  }
  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <div key={task.id} className="flex items-start justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <PriorityBadge priority={task.priority} />
              {task.related_table && (
                <span className="text-xs text-gray-400 font-mono">{task.related_table}</span>
              )}
            </div>
            <p className="text-sm font-semibold text-gray-900 truncate">{task.title}</p>
            {task.description && (
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{task.description}</p>
            )}
          </div>
          <div className="ml-4 text-right shrink-0">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {task.status}
            </span>
            <p className="text-xs text-gray-400 mt-1">{new Date(task.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ReviewFlagsTab({ flags }: { flags: NeedsManualReview[] }) {
  if (flags.length === 0) {
    return <p className="text-sm text-gray-500 text-center py-8">No pending review flags.</p>;
  }
  return (
    <div className="space-y-2">
      {flags.map((flag) => (
        <div key={flag.id} className="flex items-start justify-between p-4 bg-red-50 rounded-xl border border-red-100">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <span className="text-xs font-mono text-red-500">{flag.related_table}</span>
            </div>
            <p className="text-sm text-gray-900 font-medium">{flag.reason}</p>
            <p className="text-xs text-gray-400 mt-0.5 font-mono truncate">{flag.related_id}</p>
          </div>
          <p className="ml-4 text-xs text-gray-400 shrink-0">{new Date(flag.created_at).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );
}

function TriggerLogsTab({ logs }: { logs: TriggerLogEntry[] }) {
  if (logs.length === 0) {
    return <p className="text-sm text-gray-500 text-center py-8">No trigger logs yet. Run agents to populate.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
            <th className="pb-3 pr-4 font-semibold">Folder</th>
            <th className="pb-3 pr-4 font-semibold">Source</th>
            <th className="pb-3 pr-4 font-semibold">Event</th>
            <th className="pb-3 pr-4 font-semibold">Result</th>
            <th className="pb-3 font-semibold">Time</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {logs.map((log) => (
            <tr key={log.id} className="hover:bg-gray-50">
              <td className="py-2.5 pr-4"><FolderBadge folder={log.folder} /></td>
              <td className="py-2.5 pr-4 font-mono text-xs text-gray-700">{log.source_table}</td>
              <td className="py-2.5 pr-4">
                <span className="text-xs px-1.5 py-0.5 bg-gray-100 rounded font-mono">{log.event_type}</span>
              </td>
              <td className="py-2.5 pr-4">
                <span className={`text-xs font-semibold ${log.result_success ? 'text-green-700' : 'text-red-600'}`}>
                  {log.result_success ? 'ok' : 'fail'}
                </span>
                {log.flagged_for_review && (
                  <AlertTriangle className="inline-block w-3 h-3 text-amber-500 ml-1" />
                )}
              </td>
              <td className="py-2.5 text-xs text-gray-400">
                {new Date(log.triggered_at).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TriggerRegistryTab() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
            <th className="pb-3 pr-4 font-semibold">Folder</th>
            <th className="pb-3 pr-4 font-semibold">Table</th>
            <th className="pb-3 pr-4 font-semibold">Event</th>
            <th className="pb-3 pr-4 font-semibold">Agent</th>
            <th className="pb-3 font-semibold">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {TRIGGER_REGISTRY.map((spec, i) => (
            <tr key={i} className="hover:bg-gray-50">
              <td className="py-2.5 pr-4"><FolderBadge folder={spec.folder} /></td>
              <td className="py-2.5 pr-4 font-mono text-xs text-gray-700">{spec.table}</td>
              <td className="py-2.5 pr-4">
                <span className="text-xs px-1.5 py-0.5 bg-gray-100 rounded font-mono">{spec.event}</span>
              </td>
              <td className="py-2.5 pr-4 text-xs text-gray-600 max-w-[160px] truncate">{spec.agent}</td>
              <td className="py-2.5 text-xs text-gray-500 max-w-[260px]">{spec.action}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
