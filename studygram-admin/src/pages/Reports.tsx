import React, { useState, useEffect } from 'react';
import { ShieldAlert, Trash, Check, UserX } from 'lucide-react';
import { Button } from '@mui/material';
import { apiClient } from '../utils/apiClient';

export const Reports: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'content' | 'user'>('content');

  const fetchReports = async () => {
    try {
      const res = await apiClient.get('/admin/reports');
      if (res.status === 'success') {
        const mapped = res.data.map((r: any) => ({
          id: String(r.id),
          targetId: String(r.targetId),
          targetType: r.targetType || 'content',
          reportedBy: String(r.reportedById || '1'),
          reason: r.reason || 'Flagged Content',
          evidence: r.evidence || 'No details provided.',
          createdAt: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'recent',
          status: r.status || 'pending'
        }));
        setReports(mapped);
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filteredReports = reports.filter(
    r => r.status === 'pending' && r.targetType === activeTab
  );

  const handleDismiss = async (reportId: string) => {
    try {
      await apiClient.post(`/admin/reports/${reportId}/resolve`, { action: 'keep' });
      alert('Report dismissed.');
      fetchReports();
    } catch (err: any) {
      alert(err.message || 'Failed to dismiss report.');
    }
  };

  const handleAction = async (report: any) => {
    try {
      await apiClient.post(`/admin/reports/${report.id}/resolve`, { action: 'remove' });
      if (report.targetType === 'user') {
        await apiClient.delete(`/admin/users/${report.targetId}`);
        alert('User successfully deleted.');
      } else {
        alert('Content successfully removed.');
      }
      fetchReports();
    } catch (err: any) {
      alert(err.message || 'Failed to resolve report.');
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-sm font-semibold text-slate-500">Loading reports...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm">
        <h3 className="font-extrabold text-sm font-heading flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-indigo-500" />
          Reports Management Queue
        </h3>
        <p className="text-xs text-slate-500 mt-1">Review allegations submitted by community members regarding behavior or content violations.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('content')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 font-semibold text-sm border-b-2 transition-all cursor-pointer ${
            activeTab === 'content'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Content Reports ({reports.filter(r => r.status === 'pending' && r.targetType === 'content').length})
        </button>
        <button
          onClick={() => setActiveTab('user')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 font-semibold text-sm border-b-2 transition-all cursor-pointer ${
            activeTab === 'user'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          User Reports ({reports.filter(r => r.status === 'pending' && r.targetType === 'user').length})
        </button>
      </div>

      {/* Reports Queue */}
      <div className="space-y-6">
        {filteredReports.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-sm">
            <Check className="w-12 h-12 text-emerald-500 mx-auto mb-3 animate-bounce" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">All clear! No pending reports in this queue.</p>
          </div>
        ) : (
          filteredReports.map(report => (
            <div key={report.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 bg-rose-50 dark:bg-rose-950/20 px-2 py-0.5 rounded-full">
                    {report.reason}
                  </span>
                  <span className="text-xs text-slate-400 block mt-2">Reported by: <strong>@{report.reportedBy}</strong> • {report.createdAt}</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800/40">
                <span className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Evidence / Notes</span>
                <p className="text-xs text-slate-700 dark:text-slate-350 leading-relaxed italic">
                  "{report.evidence}"
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 justify-end border-t border-slate-100 dark:border-slate-800/40 pt-3">
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  onClick={() => handleAction(report)}
                  startIcon={report.targetType === 'content' ? <Trash className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                  sx={{ borderRadius: '10px' }}
                >
                  {report.targetType === 'content' ? 'Remove Content' : 'Delete User'}
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleDismiss(report.id)}
                  startIcon={<Check className="w-4 h-4" />}
                  sx={{ borderRadius: '10px' }}
                >
                  Dismiss Report
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
