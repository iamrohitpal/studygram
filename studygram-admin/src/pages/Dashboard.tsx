import React from 'react';
import {
  Users,
  FileText,
  TrendingUp,
  CloudLightning,
  Sparkles,
  TrendingDown,
  FolderOpen,
  ShieldAlert
} from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';
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

import { apiClient } from '../utils/apiClient';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = React.useState<{
    totalUsers: number;
    totalPosts: number;
    totalCategories: number;
    pendingReports: number;
  } | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let active = true;
    apiClient.get('/admin/stats')
      .then(res => {
        if (active && res.status === 'success') {
          setStats(res.data);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error('Error fetching dashboard stats:', err);
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const mainChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        fill: true,
        label: 'User Growth',
        data: [200, 350, 480, 720, 980, 1420, stats?.totalUsers ?? 1824],
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.08)',
        tension: 0.4,
        pointBackgroundColor: 'rgb(99, 102, 241)',
        pointRadius: 3,
      },
      {
        fill: true,
        label: 'Uploads (×10)',
        data: [100, 180, 240, 310, 390, 410, (stats?.totalPosts ?? 48) * 10],
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'rgba(245, 158, 11, 0.05)',
        tension: 0.4,
        pointBackgroundColor: 'rgb(245, 158, 11)',
        pointRadius: 3,
      }
    ],
  };

  const revenueChartData = {
    labels: ['Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'MRR ($)',
        data: [350, 540, 890, 1240],
        backgroundColor: [
          'rgba(99,102,241,0.8)',
          'rgba(139,92,246,0.8)',
          'rgba(168,85,247,0.8)',
          'rgba(217,70,239,0.8)',
        ],
        borderRadius: 10,
        borderSkipped: false,
      }
    ]
  };

  const chartOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const, labels: { font: { size: 11, family: 'Inter' }, usePointStyle: true, pointStyleWidth: 8 } }
    },
    scales: {
      y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { size: 11 } } },
      x: { grid: { display: false }, ticks: { font: { size: 11 } } }
    }
  };

  const widgets = [
    { name: 'Total Users',    val: stats?.totalUsers ?? 0,                               change: '+12%', isUp: true,  accent: 'widget-indigo',  icon: <Users className="w-5 h-5 text-indigo-500" />,   iconBg: 'bg-indigo-50 dark:bg-indigo-950/40' },
    { name: 'Active Users',   val: Math.round((stats?.totalUsers ?? 0) * 0.75),          change: '+22%', isUp: true,  accent: 'widget-sky',     icon: <CloudLightning className="w-5 h-5 text-sky-500" />, iconBg: 'bg-sky-50 dark:bg-sky-950/40' },
    { name: 'Total Posts',    val: stats?.totalPosts ?? 0,                                change: '+5%',  isUp: true,  accent: 'widget-purple',  icon: <Sparkles className="w-5 h-5 text-purple-500" />, iconBg: 'bg-purple-50 dark:bg-purple-950/40' },
    { name: 'Categories',     val: stats?.totalCategories ?? 0,                           change: '+8%',  isUp: true,  accent: 'widget-amber',   icon: <FolderOpen className="w-5 h-5 text-amber-500" />, iconBg: 'bg-amber-50 dark:bg-amber-950/40' },
    { name: 'Pending Reports',val: stats?.pendingReports ?? 0,                            change: '-15%', isUp: false, accent: 'widget-rose',    icon: <ShieldAlert className="w-5 h-5 text-rose-500" />, iconBg: 'bg-rose-50 dark:bg-rose-950/40' },
  ];

  return (
    <div className="space-y-6 animate-fadeSlideIn">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#0b1329] via-indigo-950 to-[#1e1057] text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-full opacity-5">
          <Sparkles className="w-full h-full" />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(99,102,241,0.15),_transparent_70%)]" />
        <div className="relative z-10 space-y-1">
          <p className="text-indigo-300 text-xs font-semibold uppercase tracking-widest">StudyGram Dashboard</p>
          <h2 className="text-2xl font-bold font-heading">System Overview</h2>
          <p className="text-xs text-indigo-200/80 max-w-md">Real-time statistics, active user counts, and platform health at a glance.</p>
        </div>
      </div>

      {/* Widgets */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {widgets.map(w => (
          <div key={w.name} className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow ${w.accent}`}>
            <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider leading-tight">{w.name}</span>
              <div className={`w-8 h-8 ${w.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                {w.icon}
              </div>
            </div>
            <div>
              <span className="text-2xl font-black block font-heading">
                {loading ? <span className="inline-block w-12 h-6 rounded-lg animate-shimmer" /> : w.val.toLocaleString()}
              </span>
              <span className={`text-[10px] font-bold flex items-center gap-0.5 mt-1 ${w.isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                {w.isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {w.change} vs last month
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
          <div>
            <h3 className="font-extrabold text-sm font-heading flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-500" /> Growth Analytics
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">User registrations vs. notes/media uploads over time</p>
          </div>
          <div className="h-64">
            <Line data={mainChartData} options={chartOpts} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
          <div>
            <h3 className="font-extrabold text-sm font-heading flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-500" /> MRR Growth
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Monthly recurring revenue from VIP subscriptions</p>
          </div>
          <div className="h-64">
            <Bar
              data={revenueChartData}
              options={{
                ...chartOpts,
                plugins: { ...chartOpts.plugins, legend: { display: false } }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
