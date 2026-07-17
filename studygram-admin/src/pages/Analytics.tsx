import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Activity, BookOpen, Users } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { apiClient } from '../utils/apiClient';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const Analytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    apiClient.get('/admin/analytics')
      .then(res => {
        if (active && res.status === 'success') {
          setAnalyticsData(res.data);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error('Error fetching analytics:', err);
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  // Chart Data definitions
  const uploadAnalyticsData = {
    labels: ['Notes Uploads', 'Video Uploads', 'Image Uploads'],
    datasets: [
      {
        label: 'Uploaded Count',
        data: [
          analyticsData?.postsByType?.notes ?? 0,
          analyticsData?.postsByType?.videos ?? 0,
          analyticsData?.postsByType?.images ?? 0
        ],
        backgroundColor: [
          'rgba(79, 70, 229, 0.85)',
          'rgba(245, 158, 11, 0.85)',
          'rgba(16, 185, 129, 0.85)'
        ],
        borderRadius: 8,
      }
    ]
  };

  const roleDistributionData = {
    labels: ['Students', 'Super Admins'],
    datasets: [
      {
        label: 'User Count',
        data: [
          analyticsData?.usersByRole?.user ?? 0,
          analyticsData?.usersByRole?.superadmin ?? 0
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.85)',
          'rgba(236, 72, 153, 0.85)'
        ],
        borderRadius: 8,
      }
    ]
  };

  if (loading) {
    return <div className="text-center py-12 text-sm font-semibold text-slate-500">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm">
        <h3 className="font-extrabold text-sm font-heading flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-500" />
          Analytics Dashboard
        </h3>
        <p className="text-xs text-slate-500 mt-1">Review community growth indicators, upload distribution, and user interaction analytics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upload Analytics */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
          <div>
            <h4 className="font-extrabold text-xs font-heading flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              Content Upload Analytics
            </h4>
            <p className="text-[10px] text-slate-500">Distribution of notes & media uploads on the platform</p>
          </div>
          <div className="h-64">
            <Bar
              data={uploadAnalyticsData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { grid: { color: 'rgba(0,0,0,0.03)' } },
                  x: { grid: { display: false } }
                }
              }}
            />
          </div>
        </div>

        {/* User Role Distribution */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
          <div>
            <h4 className="font-extrabold text-xs font-heading flex items-center gap-1.5">
              <Users className="w-4 h-4 text-rose-500" />
              User Role Distribution
            </h4>
            <p className="text-[10px] text-slate-500">Breakdown of platform users by assigned systems roles</p>
          </div>
          <div className="h-64">
            <Bar
              data={roleDistributionData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { grid: { color: 'rgba(0,0,0,0.03)' } },
                  x: { grid: { display: false } }
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
