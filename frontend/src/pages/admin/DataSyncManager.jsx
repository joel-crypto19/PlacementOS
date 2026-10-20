import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import {
  Database, RefreshCw, CheckCircle2, AlertTriangle, ShieldAlert,
  Clock, ArrowUpRight, Check, Sparkles, ExternalLink, Info
} from 'lucide-react';
import toast from 'react-hot-toast';

export const DataSyncManager = () => {
  const [sources, setSources] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncingProvider, setSyncingProvider] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sourcesRes, logsRes] = await Promise.all([
        adminService.getDataSources(),
        adminService.getSyncLogs({ limit: 25 })
      ]);
      if (sourcesRes.success) setSources(sourcesRes.sources || []);
      if (logsRes.success) setLogs(logsRes.logs || []);
    } catch (err) {
      toast.error('Could not load data sync status.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTriggerSync = async (providerKey, providerName) => {
    try {
      setSyncingProvider(providerKey);
      const res = await adminService.triggerSync(providerKey);
      if (res.success) {
        toast.success(res.message || `Successfully synchronized opportunities from ${providerName}!`);
      } else {
        toast.error(res.message || `Sync failed for ${providerName}.`);
      }
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Synchronization failed.';
      toast.error(msg);
      fetchData();
    } finally {
      setSyncingProvider(null);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-brand-50 text-brand-600">
              <Database className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Real-World Data Source Integrations
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Maintain live, verified job feeds from external sources (Adzuna, USAJobs) with deduplication and error recovery.
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center space-x-1.5 self-start sm:self-auto transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* Provider Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sources.map((src) => {
          const isSyncing = syncingProvider === src.providerKey;

          return (
            <div
              key={src._id}
              className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-subtle flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{src.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{src.description}</p>
                  </div>
                  <div>
                    {src.isConfigured ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Configured & Ready</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center space-x-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Credentials Missing</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Status Message */}
                <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px] font-semibold">Latest Status:</span>
                    <span className="font-bold capitalize text-slate-800">{src.lastSyncStatus}</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed pt-1">
                    {src.lastSyncMessage || 'No synchronization executed yet.'}
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[10px] text-slate-400">
                    <span>Imported Records: <strong>{src.totalImportedCount || 0}</strong></span>
                    <span>Last run: {src.lastSyncAt ? new Date(src.lastSyncAt).toLocaleString() : 'Never'}</span>
                  </div>
                </div>

                {/* Setup guidance when not configured */}
                {!src.isConfigured && (
                  <div className="mt-3 p-3 rounded-xl bg-blue-50/60 border border-blue-200 text-blue-900 text-xs space-y-1">
                    <p className="font-bold flex items-center">
                      <Info className="w-3.5 h-3.5 mr-1 text-blue-600" />
                      <span>Setup Instructions:</span>
                    </p>
                    <p className="text-[11px] text-blue-800 leading-relaxed">
                      {src.providerKey === 'adzuna' ? (
                        <>
                          Obtain free API credentials at <a href="https://developer.adzuna.com/" target="_blank" rel="noreferrer" className="underline font-bold">developer.adzuna.com</a> and add <code>ADZUNA_APP_ID</code> & <code>ADZUNA_API_KEY</code> to your backend <code>.env</code> file.
                        </>
                      ) : (
                        <>
                          Obtain public developer credentials at <a href="https://developer.usajobs.gov/" target="_blank" rel="noreferrer" className="underline font-bold">developer.usajobs.gov</a> and add <code>USAJOBS_API_KEY</code> to <code>.env</code>.
                        </>
                      )}
                    </p>
                  </div>
                )}
              </div>

              {/* Trigger Button */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Interval: Every {src.syncIntervalHours || 24} hours</span>
                <button
                  onClick={() => handleTriggerSync(src.providerKey, src.name)}
                  disabled={isSyncing}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-bold text-xs rounded-xl shadow-sm flex items-center space-x-1.5 transition-all"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Historical Sync Logs */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Synchronization Audit History
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Audit log of all manual and scheduled data pipeline jobs</p>
          </div>
          <Clock className="w-4 h-4 text-slate-400" />
        </div>

        {logs.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No synchronization logs recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Provider</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Fetched</th>
                  <th className="py-2.5 px-3">Imported</th>
                  <th className="py-2.5 px-3">Updated</th>
                  <th className="py-2.5 px-3">Triggered By</th>
                  <th className="py-2.5 px-3">Duration</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-bold text-slate-800 capitalize">{log.providerKey}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.status === 'success'
                          ? 'bg-emerald-50 text-emerald-700'
                          : log.status === 'not_configured'
                          ? 'bg-amber-50 text-amber-800'
                          : 'bg-rose-50 text-rose-700'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-700">{log.itemsFetched}</td>
                    <td className="py-2.5 px-3 font-bold text-emerald-600">{log.itemsImported}</td>
                    <td className="py-2.5 px-3 font-bold text-blue-600">{log.itemsUpdated}</td>
                    <td className="py-2.5 px-3 capitalize text-slate-500 text-[11px]">{log.triggeredBy}</td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">{log.executionDurationMs}ms</td>
                    <td className="py-2.5 px-3 text-slate-400 text-[11px]">{new Date(log.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
