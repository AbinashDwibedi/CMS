import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboard } from '../api/admin';
import toast from 'react-hot-toast';
import Plot from 'react-plotly.js';
import { Users, CalendarDays, Building2, Loader2, TrendingUp } from 'lucide-react';

export default function AdminHomePage() {
  const navigate = useNavigate();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then((res) => setData(res.data.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="events-loading" style={{ minHeight: 'calc(100vh - 60px)' }}>
        <Loader2 size={36} className="spin-icon" />
        <span>Loading dashboard…</span>
      </div>
    );
  }

  const trends = data?.registrationTrends ?? [];
  const chartDates  = trends.map((t) => t.date);
  const chartCounts = trends.map((t) => t.registrationCount);

  return (
    <div className="w-full max-w-6xl mx-auto p-5 pb-10 xl:p-8 animate-[fadeUp_0.4s_ease_both]">
      <div className="flex justify-between items-end mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-[2rem] font-extrabold m-0 text-transparent bg-clip-text bg-[image:var(--gradient-brand)] tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-text-muted mt-1 m-0 font-medium">Platform overview and activity</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <MetricCard
          id="metric-clubs"
          icon={<Building2 size={22} />}
          label="Total Clubs"
          value={data?.totalClubs ?? 0}
          colorClass="hover:border-info-500/40 text-info-400"
          onClick={() => navigate('/admin/clubs')}
        />
        <MetricCard
          id="metric-events"
          icon={<CalendarDays size={22} />}
          label="Total Events"
          value={data?.totalEvents ?? 0}
          colorClass="hover:border-success-500/40 text-success-400"
          onClick={() => navigate('/admin/events')}
        />
        <MetricCard
          id="metric-students"
          icon={<Users size={22} />}
          label="Total Students"
          value={data?.totalStudentsJoined ?? 0}
          colorClass="hover:border-primary-500/40 text-primary-400"
          onClick={() => navigate('/admin/students')}
        />
      </div>

      <div className="bg-surface-raised border border-surface-border rounded-2xl p-6 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-surface-border">
          <TrendingUp size={18} className="text-primary-400" />
          <h2 className="font-bold text-lg text-text-primary m-0">Registration Activity</h2>
          <span className="text-[0.8rem] text-text-muted">Daily event registrations</span>
        </div>

        {trends.length === 0 ? (
          <div className="text-center p-12 bg-surface-raised border border-surface-border rounded-2xl text-text-muted shadow-[var(--shadow-card)]" style={{ padding: '3rem 0' }}>No registration data yet.</div>
        ) : (
          <Plot
            data={[
              {
                x: chartDates,
                y: chartCounts,
                type: 'scatter',
                mode: 'lines+markers',
                line: { color: '#818cf8', width: 3, shape: 'linear' },
                marker: {
                  color: '#818cf8',
                  size: 8,
                  line: { color: '#fff', width: 2 },
                },
                fill: 'tozeroy',
                fillcolor: 'rgba(129,140,248,0.12)',
                hovertemplate: '<b>%{x}</b><br>Registrations: %{y}<extra></extra>',
              },
            ]}
            layout={{
              paper_bgcolor: 'transparent',
              plot_bgcolor: 'transparent',
              margin: { t: 10, r: 20, b: 40, l: 45 },
              xaxis: {
                color: '#94a3b8',
                gridcolor: 'rgba(148,163,184,0.08)',
                tickfont: { size: 11 },
                range: [
                  chartDates[0],
                  new Date().toISOString().slice(0, 10),
                ],
                type: 'date',
              },
              yaxis: {
                color: '#94a3b8',
                gridcolor: 'rgba(148,163,184,0.08)',
                tickfont: { size: 11 },
                rangemode: 'tozero',
              },
              font: { family: 'Inter, sans-serif' },
              showlegend: false,
              autosize: true,
            }}
            config={{ displayModeBar: false, responsive: true }}
            style={{ width: '100%', height: '320px' }}
          />
        )}
      </div>
    </div>
  );
}

function MetricCard({ id, icon, label, value, colorClass, onClick }) {
  return (
    <button id={id} className={`flex items-center gap-4 p-5 rounded-2xl border border-surface-border transition-all duration-200 cursor-pointer text-left hover:-translate-y-1 hover:shadow-lg bg-surface-raised ${colorClass}`} onClick={onClick}>
      <div className="w-14 h-14 shrink-0 rounded-[0.85rem] flex items-center justify-center bg-surface-overlay border border-surface-border text-current">{icon}</div>
      <div className="flex flex-col gap-1">
        <span className="text-2xl font-extrabold text-text-primary tracking-tight">{value.toLocaleString()}</span>
        <span className="text-[0.8rem] uppercase font-bold tracking-wider text-text-secondary">{label}</span>
      </div>
    </button>
  );
}
