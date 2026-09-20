import React, { useMemo, useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  Line,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { BookingRecord, SystemSettings } from '../types';
import { TrendingUp, Activity, AlertCircle, CheckCircle2, Zap, BarChart2, RefreshCw, Layers } from 'lucide-react';

interface BookingTrendsChartProps {
  bookings: BookingRecord[];
  settings: SystemSettings;
  onSimulateCap?: () => void;
  theme?: 'light' | 'dark';
}

interface DayTrendData {
  date?: string;
  dayKey: string;
  dayLabel: string;
  fullDate: string;
  isToday: boolean;
  confirmed: number;
  pending: number;
  rejected: number;
  total: number;
  capacityLimit: number;
  utilizationRate: number;
  isCapped: boolean;
}

export const BookingTrendsChart: React.FC<BookingTrendsChartProps> = ({
  bookings,
  settings,
  onSimulateCap,
  theme = 'light',
}) => {
  const [chartView, setChartView] = useState<'volume' | 'utilization' | 'combined'>('volume');
  const [serverDays, setServerDays] = useState<DayTrendData[] | null>(null);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [lastFetched, setLastFetched] = useState<string | null>(null);

  // Fetch 7-day bookings and capacity utilization from backend API
  const fetch7DayAnalytics = async () => {
    setIsFetching(true);
    try {
      const res = await fetch('/api/analytics/7days');
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.days)) {
          setServerDays(data.days);
          setLastFetched(new Date().toLocaleTimeString());
        }
      }
    } catch (err) {
      console.warn('Could not fetch /api/analytics/7days, using local fallback:', err);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetch7DayAnalytics();
  }, [settings.daily_count, bookings.length]);

  // Compute fallback or merge with live client records
  const trendData = useMemo<DayTrendData[]>(() => {
    if (serverDays && serverDays.length > 0) {
      // Ensure Today entry reflects latest live bookings & settings
      return serverDays.map((d) => {
        if (d.isToday) {
          const todayConfirmed = bookings.filter((b) => b.status === 'booked').length;
          const todayPending = bookings.filter((b) => b.status === 'pending_approval').length;
          const activeCount = Math.max(settings.daily_count, todayConfirmed);
          const rate = Math.round((activeCount / settings.max_daily_limit) * 100);
          return {
            ...d,
            confirmed: activeCount,
            pending: todayPending,
            total: activeCount,
            capacityLimit: settings.max_daily_limit,
            utilizationRate: Math.min(100, rate),
            isCapped: activeCount >= settings.max_daily_limit,
          };
        }
        return d;
      });
    }

    // Compute strictly from actual database bookings (Zero mock or seed data)
    const days: DayTrendData[] = [];
    const now = new Date();

    for (let offset = 6; offset >= 0; offset--) {
      const d = new Date(now);
      d.setDate(now.getDate() - offset);
      const dateStr = d.toISOString().slice(0, 10);
      const isToday = offset === 0;

      const dayBookings = bookings.filter((b) => {
        const bDate = b.created_at ? b.created_at.slice(0, 10) : '';
        return bDate === dateStr;
      });

      const dayConfirmed = isToday
        ? Math.max(settings.daily_count, dayBookings.filter((b) => b.status === 'booked').length)
        : dayBookings.filter((b) => b.status === 'booked').length;
      const dayPending = dayBookings.filter((b) => b.status === 'pending_approval').length;
      const dayRejected = dayBookings.filter((b) => b.status === 'rejected').length;
      const dayTotal = dayConfirmed + dayPending;
      const rate = Math.round((dayConfirmed / settings.max_daily_limit) * 100);

      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });

      days.push({
        date: dateStr,
        dayKey: isToday ? 'day-today' : `day-${offset}`,
        dayLabel: isToday ? `Today (${dayName})` : `${dayName} ${dayNum}`,
        fullDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        isToday,
        confirmed: dayConfirmed,
        pending: dayPending,
        rejected: dayRejected,
        total: dayTotal,
        capacityLimit: settings.max_daily_limit,
        utilizationRate: Math.min(100, rate),
        isCapped: dayConfirmed >= settings.max_daily_limit,
      });
    }

    return days;
  }, [serverDays, bookings, settings.daily_count, settings.max_daily_limit]);

  // Aggregate stats
  const total7DayVolume = trendData.reduce((acc, d) => acc + d.confirmed, 0);
  const avgDailyUtilization = Math.round(
    trendData.reduce((acc, d) => acc + d.utilizationRate, 0) / trendData.length
  );
  const cappedDaysCount = trendData.filter((d) => d.isCapped).length;
  const remainingToday = Math.max(0, settings.max_daily_limit - settings.daily_count);

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data: DayTrendData = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs min-w-[210px]">
          <div className="flex items-center justify-between border-b border-slate-700 pb-1.5 mb-2">
            <span className="font-bold text-amber-400">{data.dayLabel}</span>
            {data.isToday && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500 text-slate-900 font-bold">
                LIVE TODAY
              </span>
            )}
          </div>

          <div className="space-y-1 text-slate-300">
            <div className="flex justify-between items-center">
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
                <span>Confirmed Bookings:</span>
              </span>
              <span className="font-bold text-white">{data.confirmed}</span>
            </div>

            {data.pending > 0 && (
              <div className="flex justify-between items-center">
                <span className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 inline-block" />
                  <span>Pending Approvals:</span>
                </span>
                <span className="font-bold text-amber-300">{data.pending}</span>
              </div>
            )}

            <div className="pt-2 mt-1 border-t border-slate-800 flex justify-between items-center font-bold">
              <span>Capacity Ceiling:</span>
              <span className="text-slate-400">15 / day</span>
            </div>

            <div className="flex justify-between items-center font-bold text-slate-200">
              <span>Capacity Utilization:</span>
              <span className={data.isCapped ? 'text-rose-400' : 'text-emerald-400'}>
                {data.utilizationRate}% {data.isCapped ? '(Cap Enforced)' : ''}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className={`rounded-3xl border p-6 shadow-xs mb-8 transition-colors ${
        theme === 'dark'
          ? 'bg-slate-900 border-slate-800 text-white'
          : 'bg-white border-slate-200 text-slate-900'
      }`}
    >
      {/* Header, Data Source Pill and View Toggle */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-amber-500" />
              <span
                className={`text-xs font-bold uppercase tracking-wider ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                Capacity & Demand Analytics
              </span>
            </div>
            <div
              className={`flex items-center space-x-1.5 px-2 py-0.5 rounded-full border text-[10px] font-mono ${
                theme === 'dark'
                  ? 'bg-slate-800 border-slate-700 text-slate-300'
                  : 'bg-slate-100 border-slate-200 text-slate-600'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isFetching ? 'bg-amber-500 animate-spin' : 'bg-emerald-500'
                }`}
              />
              <span>/api/analytics/7days</span>
              {lastFetched && <span className="text-slate-400">• {lastFetched}</span>}
            </div>
            <button
              onClick={fetch7DayAnalytics}
              disabled={isFetching}
              title="Refresh 7-day analytics from backend"
              className={`p-1 rounded-md transition-colors cursor-pointer ${
                theme === 'dark'
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
              }`}
            >
              <RefreshCw className={`w-3 h-3 ${isFetching ? 'animate-spin text-amber-500' : ''}`} />
            </button>
          </div>
          <h2
            className={`text-lg font-black mt-1 ${
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            }`}
          >
            7-Day Daily Booking Volume & Capacity Utilization
          </h2>
          <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
            Recharts visualization of daily order counts and capacity exhaustion against the 15-booking daily ceiling.
          </p>
        </div>

        {/* View Switcher: Bar Volume vs Capacity Utilization Bar vs Combined */}
        <div
          className={`flex items-center p-1 rounded-xl border self-start lg:self-auto text-xs font-semibold ${
            theme === 'dark'
              ? 'bg-slate-800 border-slate-700 text-slate-300'
              : 'bg-slate-100 border-slate-200 text-slate-600'
          }`}
        >
          <button
            id="chart-tab-volume"
            onClick={() => setChartView('volume')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer ${
              chartView === 'volume'
                ? theme === 'dark'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Order Volume (Bars)</span>
          </button>
          <button
            id="chart-tab-utilization"
            onClick={() => setChartView('utilization')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer ${
              chartView === 'utilization'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-amber-600" />
            <span>Utilization % (Bars)</span>
          </button>
          <button
            id="chart-tab-combined"
            onClick={() => setChartView('combined')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer ${
              chartView === 'combined'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>Dual Metrics</span>
          </button>
        </div>
      </div>

      {/* KPI Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            7-Day Confirmed
          </span>
          <div className="flex items-baseline space-x-1.5 mt-0.5">
            <span className="text-xl font-black text-slate-900">{total7DayVolume}</span>
            <span className="text-xs text-slate-500">Bookings</span>
          </div>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Avg Daily Utilization
          </span>
          <div className="flex items-baseline space-x-1.5 mt-0.5">
            <span className="text-xl font-black text-emerald-600">{avgDailyUtilization}%</span>
            <span className="text-xs text-slate-500">of 15 cap</span>
          </div>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Days Cap Enforced
          </span>
          <div className="flex items-baseline space-x-1.5 mt-0.5">
            <span className="text-xl font-black text-rose-600">{cappedDaysCount}</span>
            <span className="text-xs text-slate-500">of 7 days</span>
          </div>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Today's Headroom
          </span>
          <div className="flex items-baseline space-x-1.5 mt-0.5">
            <span className="text-xl font-black text-amber-600">{remainingToday}</span>
            <span className="text-xs text-slate-500">Slots Remaining</span>
          </div>
        </div>
      </div>

      {/* Chart Canvas: Recharts Bar Charts */}
      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartView === 'volume' ? (
            /* 1. Daily Order Volume (Recharts Bar Chart) */
            <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="dayLabel"
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 18]}
                ticks={[0, 5, 10, 15, 18]}
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: 12, fontSize: 11 }}
              />

              {/* Hard Cap Line at 15 */}
              <ReferenceLine
                y={15}
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray="4 4"
                label={{
                  value: '15 HARD CAP',
                  position: 'insideTopRight',
                  fill: '#ef4444',
                  fontSize: 10,
                  fontWeight: 'bold',
                }}
              />

              {/* Confirmed & Pending Bars */}
              <Bar
                dataKey="confirmed"
                name="Confirmed Bookings"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
                barSize={24}
              />
              <Bar
                dataKey="pending"
                name="Pending Approvals"
                fill="#f59e0b"
                radius={[4, 4, 0, 0]}
                barSize={24}
              />
            </BarChart>
          ) : chartView === 'utilization' ? (
            /* 2. Capacity Utilization (Recharts Bar Chart with dynamic color coding) */
            <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="dayLabel"
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 110]}
                ticks={[0, 25, 50, 75, 100]}
                tickFormatter={(v) => `${v}%`}
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: 12, fontSize: 11 }}
              />

              {/* 100% capacity ceiling reference */}
              <ReferenceLine
                y={100}
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray="4 4"
                label={{
                  value: '100% CAP CEILING',
                  position: 'insideTopRight',
                  fill: '#ef4444',
                  fontSize: 10,
                  fontWeight: 'bold',
                }}
              />

              <Bar
                dataKey="utilizationRate"
                name="Capacity Utilization (%)"
                radius={[4, 4, 0, 0]}
                barSize={28}
              >
                {trendData.map((entry, index) => {
                  const fillColor =
                    entry.utilizationRate >= 100
                      ? '#ef4444' // Rose if capped
                      : entry.utilizationRate >= 80
                      ? '#f59e0b' // Amber if nearing cap
                      : '#10b981'; // Emerald if healthy
                  return <Cell key={`cell-${index}`} fill={fillColor} />;
                })}
              </Bar>
            </BarChart>
          ) : (
            /* 3. Combined Dual-Axis Bar & Line Chart */
            <ComposedChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="dayLabel"
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
              />
              {/* Left Axis: Orders Volume */}
              <YAxis
                yAxisId="left"
                domain={[0, 18]}
                ticks={[0, 5, 10, 15, 18]}
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              {/* Right Axis: Utilization % */}
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, 110]}
                ticks={[0, 50, 100]}
                tickFormatter={(v) => `${v}%`}
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: 12, fontSize: 11 }}
              />

              <ReferenceLine
                yAxisId="left"
                y={15}
                stroke="#ef4444"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                label={{
                  value: '15 CAP',
                  position: 'insideTopRight',
                  fill: '#ef4444',
                  fontSize: 10,
                }}
              />

              <Bar
                yAxisId="left"
                dataKey="confirmed"
                name="Daily Orders (Bar)"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
                barSize={22}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="utilizationRate"
                name="Capacity Utilization (%)"
                stroke="#6366f1"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#6366f1' }}
              />
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Resource Planning & Capacity Analysis */}
      <div className="mt-6 pt-5 border-t border-slate-100">
        <div className="flex items-center space-x-2 mb-3">
          <Zap className="w-4 h-4 text-amber-500" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Resource Planning & Operational Recommendations
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="font-bold text-slate-900 block mb-1">Cap Predictability</span>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              System reached daily 15-limit on <strong className="text-slate-800">{cappedDaysCount} of last 7 days</strong>.
              Auto-mode switch saved admin team from fulfillment over-commitments.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="font-bold text-slate-900 block mb-1">Fulfillment Velocity</span>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Peak demand windows occur between <strong className="text-slate-800">11:00 AM – 2:30 PM</strong> and <strong className="text-slate-800">6:30 PM – 9:00 PM</strong> across DLF 5 and Noida.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="font-bold text-slate-900 block mb-1">Capacity Simulation</span>
            <p className="text-slate-500 text-[11px] leading-relaxed mb-2">
              Simulate high-volume traffic to test the automatic LangGraph Cap Controller switch.
            </p>
            {onSimulateCap && (
              <button
                type="button"
                onClick={onSimulateCap}
                className="w-full py-1.5 px-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[11px] transition-colors cursor-pointer"
              >
                Simulate 15/15 Hard Cap Now
              </button>
            )}
          </div>
        </div>
      </div>
      {/* Footer explanation */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 gap-2">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
          <span>Daily capacity automatically resets at 00:00 IST via scheduled agent cron.</span>
        </div>
        {settings.daily_count < 15 && onSimulateCap && (
          <button
            onClick={onSimulateCap}
            className="text-amber-700 hover:text-amber-800 font-semibold underline cursor-pointer self-start sm:self-auto"
          >
            Simulate 15 Cap Exhaustion Now
          </button>
        )}
      </div>
    </div>
  );
};
