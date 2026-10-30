import React, { useState } from 'react';
import {
  Shield,
  Search,
  Clock,
  User,
  Filter,
  CheckCircle2,
  FileSpreadsheet,
  X,
  Lock,
  Layers,
  ArrowDownUp,
  Package,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AuditLogsList({ logs = [] }) {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const ACTION_TYPES = ['ALL', 'CREATE', 'UPDATE', 'DELETE', 'STATUS_CHANGE', 'LOGIN'];

  const filteredLogs = logs.filter((log) => {
    const matchesAction = actionFilter === 'ALL' ? true : log.action === actionFilter;
    const q = search.toLowerCase().trim();
    const matchesSearch = !q
      ? true
      : (log.actorEmail || '').toLowerCase().includes(q) ||
        (log.actorName || '').toLowerCase().includes(q) ||
        (log.details || '').toLowerCase().includes(q) ||
        (log.module || '').toLowerCase().includes(q) ||
        (log.resourceId || '').toLowerCase().includes(q);
    return matchesAction && matchesSearch;
  });

  const handleExportCSV = () => {
    const csvRows = [
      ['Timestamp', 'Action', 'Module', 'Resource ID', 'Actor Name', 'Actor Email', 'Role', 'Details', 'IP Address'],
      ...logs.map((l) => [
        l.timestamp,
        l.action,
        l.module,
        l.resourceId,
        `"${(l.actorName || '').replace(/"/g, '""')}"`,
        l.actorEmail,
        l.actorRole,
        `"${(l.details || '').replace(/"/g, '""')}"`,
        l.ipAddress || '127.0.0.1',
      ]),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map((r) => r.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `dhanvikk_audit_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Downloaded Security Audit Log CSV.');
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Controls Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative w-full sm:w-auto sm:min-w-[280px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by staff, action, or resource ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9.5 pl-9 pr-3 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 shadow-xs"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Action Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-slate-200 text-xs shadow-xs overflow-x-auto max-w-full">
            {ACTION_TYPES.map((act) => (
              <button
                key={act}
                onClick={() => setActionFilter(act)}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer font-medium shrink-0 ${
                  actionFilter === act
                    ? 'bg-rose-600 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {act}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
          <span>Export Audit Log</span>
        </button>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Module</th>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Details</th>
                <th className="py-3 px-4 text-right">IP / Host</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Shield className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="font-medium text-slate-600">No audit log records match filter</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Every administrative modification is tracked permanently.</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const actionColors = {
                    CREATE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    UPDATE: 'bg-blue-50 text-blue-700 border-blue-200',
                    DELETE: 'bg-rose-50 text-rose-700 border-rose-200',
                    STATUS_CHANGE: 'bg-amber-50 text-amber-700 border-amber-200',
                    LOGIN: 'bg-purple-50 text-purple-700 border-purple-200',
                  };

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-slate-500">
                        {new Date(log.timestamp).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}{' '}
                        <span className="text-slate-400">
                          {new Date(log.timestamp).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: true,
                          })}
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            actionColors[log.action] || 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-800 text-[11px]">
                          {log.module}
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div>
                          <p className="font-semibold text-slate-900">{log.actorName}</p>
                          <p className="font-mono text-[10px] text-slate-400">{log.actorEmail}</p>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-800 max-w-sm truncate" title={log.details}>
                        {log.details}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap font-mono text-[11px] text-slate-400">
                        {log.ipAddress || '127.0.0.1'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

