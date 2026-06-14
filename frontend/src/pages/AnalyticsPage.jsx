import { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend,
  LineChart, Line,
} from 'recharts';
import { analyticsApi } from '../api';
import Spinner from '../components/common/Spinner';

// ─── Colour palette (matches dark theme) ─────────────────────────────────────
const STATUS_COLORS = {
  Applied:   '#60a5fa', // blue-400
  Interview: '#fbbf24', // amber-400
  Accepted:  '#34d399', // emerald-400
  Rejected:  '#f87171', // red-400
};

const CHART_COLORS = ['#818cf8', '#60a5fa', '#34d399', '#fbbf24', '#f87171', '#c084fc', '#fb923c', '#a3e635'];

// ─── Shared styles ────────────────────────────────────────────────────────────
const TOOLTIP_STYLE = {
  backgroundColor: '#16162a',
  border: '1px solid #1e1e3f',
  borderRadius: '8px',
  color: '#e2e8f0',
  fontSize: '13px',
};

const AXIS_STYLE = { fill: '#64748b', fontSize: 11 };

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, color }) {
  return (
    <div className="card p-5">
      <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-3xl font-bold ${color || 'text-white'} tabular-nums`}>{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
  );
}

// ─── Chart wrapper card ───────────────────────────────────────────────────────
function ChartCard({ title, children, className = '' }) {
  return (
    <div className={`card p-5 ${className}`}>
      <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-5">{title}</h3>
      {children}
    </div>
  );
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={TOOLTIP_STYLE} className="px-3 py-2 shadow-xl">
      <p className="text-slate-400 text-xs mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    analyticsApi.get()
      .then(({ data }) => setData(data.data))
      .catch(() => setError('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex justify-center py-24"><Spinner size="lg" className="text-brand-500" /></div>
  );

  if (error) return (
    <div className="text-center py-24 text-slate-400">{error}</div>
  );

  const { kpis, statusBreakdown, applicationsPerMonth, topCompanies } = data;

  // Pie data
  const pieData = statusBreakdown.map(({ status, count }) => ({
    name: status,
    value: count,
    color: STATUS_COLORS[status] || '#94a3b8',
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-slate-400 text-sm mt-1">Insights across your entire job search</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <KpiCard label="Total Apps"     value={kpis.total}         color="text-white" />
        <KpiCard label="In Pipeline"    value={kpis.applied}       color="text-blue-400"
          sub={`${kpis.total ? Math.round((kpis.applied / kpis.total) * 100) : 0}% of total`} />
        <KpiCard label="Interviews"     value={kpis.interview}     color="text-amber-400"
          sub={`${kpis.interviewRate}% rate`} />
        <KpiCard label="Offers"         value={kpis.accepted}      color="text-emerald-400"
          sub={`${kpis.successRate}% success`} />
        <KpiCard label="Rejected"       value={kpis.rejected}      color="text-red-400"
          sub={`${kpis.total ? Math.round((kpis.rejected / kpis.total) * 100) : 0}% of total`} />
      </div>

      {/* Success rate highlight */}
      <div className="card p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Overall Success Rate</p>
          <div className="flex items-end gap-3">
            <span className="text-5xl font-bold text-emerald-400">{kpis.successRate}%</span>
            <span className="text-slate-500 text-sm mb-1.5">offers / total apps</span>
          </div>
        </div>
        <div className="flex-1">
          <div className="flex justify-between text-xs text-slate-500 mb-1.5">
            <span>Progress to first offer</span>
            <span>{kpis.accepted} / {kpis.total}</span>
          </div>
          <div className="h-2 bg-surface-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-600 to-emerald-500 rounded-full transition-all duration-700"
              style={{ width: `${Math.min(kpis.successRate * 3, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-600 mt-1">
            <span>Interview rate: {kpis.interviewRate}%</span>
          </div>
        </div>
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Applications per month — spans 2 cols */}
        <ChartCard title="Applications Per Month" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={applicationsPerMonth} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e3f" vertical={false} />
              <XAxis dataKey="label" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
              <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1e1e3f' }} />
              <Bar dataKey="count" name="Applications" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Status breakdown — pie */}
          <ChartCard title="By Status">
            {pieData.length === 0 ? (
              <div className="h-[260px] flex items-center justify-center text-slate-500 text-sm">
                No data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {pieData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={entry.color}
                        stroke="transparent"
                      />
                    ))}
                  </Pie>

                  <text
                    x="50%"
                    y="46%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#ffffff"
                    fontSize="22"
                    fontWeight="700"
                  >
                    {pieData.reduce((sum, item) => sum + item.value, 0)}
                  </text>

                  <text
                    x="50%"
                    y="58%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#94a3b8"
                    fontSize="11"
                  >
                    Total
                  </text>

                  <Tooltip content={<CustomTooltip />} />

                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => {
                      const item = pieData.find(
                        (p) => p.name === value
                      );

                      return (
                        <span
                          style={{
                            color: '#94a3b8',
                            fontSize: 12,
                          }}
                        >
                          {value} ({item?.value || 0})
                        </span>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top companies */}
        <ChartCard title="Most Applied Companies">
          {topCompanies.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center text-slate-500 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topCompanies} layout="vertical" barSize={14}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e3f" horizontal={false} />
                <XAxis type="number" tick={AXIS_STYLE} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="company" tick={{ ...AXIS_STYLE, fontSize: 11 }}
                  axisLine={false} tickLine={false} width={90} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1e1e3f' }} />
                <Bar dataKey="count" name="Applications" radius={[0, 4, 4, 0]}>
                  {topCompanies.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Cumulative trend */}
        <ChartCard title="Cumulative Applications Trend">
          {(() => {
            let cum = 0;
            const cumulativeData = applicationsPerMonth.map(d => {
              cum += d.count;
              return { label: d.label, total: cum };
            });
            return (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={cumulativeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e1e3f" vertical={false} />
                  <XAxis dataKey="label" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
                  <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="total" name="Total" stroke="#818cf8"
                    strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#818cf8' }} />
                </LineChart>
              </ResponsiveContainer>
            );
          })()}
        </ChartCard>
      </div>
    </div>
  );
}