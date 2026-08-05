import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, Legend, Area, AreaChart,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Car,
  DollarSign,
  BarChart3,
  PieChart as PieChartIcon,
  Zap,
  Crown,
  Medal,
  Award,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Clock,
  Calendar,
  Activity,
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { fetchAnalytics } from '@/api/cars';
import { useMemo, useState } from 'react';

const COLORS = ['#F4B400', '#0E9F6E', '#0B2545', '#0EA5E9', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];
const CHART_COLORS = ['#F4B400', '#0E9F6E', '#0EA5E9', '#8B5CF6', '#EF4444', '#14B8A6'];

function formatLakh(amount: number) {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
  return `₹${amount.toLocaleString('en-IN')}`;
}

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString('en-IN')}`;
}

function EmptyState({ label, icon: Icon }: { label: string; icon?: any }) {
  const IconComponent = Icon || PieChartIcon;
  return (
    <div className="flex flex-col items-center justify-center py-16 text-body/50">
      <IconComponent size={40} className="mb-3 opacity-20" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

// ============================================
// STAT CARD COMPONENT
// ============================================
const StatCard = ({ 
  label, 
  value, 
  icon: Icon, 
  color, 
  trend,
  trendLabel,
  isLoading,
}: any) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative bg-white rounded-3xl shadow-card p-5 transition-all duration-300 hover:shadow-2xl overflow-hidden group"
    >
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${color}/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
        initial={{ scale: 0 }}
        animate={{ scale: isHovered ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      />
      
      <div className="relative flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-body/60">
            <Icon size={14} className={color} />
            {label}
          </div>
          <p className="mt-2 text-2xl font-display font-bold text-ink">
            {isLoading ? (
              <motion.div 
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="h-8 w-24 bg-gray-200 rounded"
              />
            ) : (
              value ?? '—'
            )}
          </p>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${trend >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {trend >= 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
              {Math.abs(trend)}% {trendLabel || 'vs last month'}
            </div>
          )}
        </div>
        <div className={`w-11 h-11 rounded-2xl ${color}/10 flex items-center justify-center group-hover:scale-110 transition-transform`}>
          <Icon size={20} className={color} />
        </div>
      </div>
    </motion.div>
  );
};

// ============================================
// CHART CARD COMPONENT
// ============================================
const ChartCard = ({ 
  title, 
  icon: Icon, 
  children, 
  className = '',
  action,
}: any) => (
  <motion.div 
    whileHover={{ y: -2 }}
    className={`bg-white rounded-3xl shadow-card p-6 transition-all hover:shadow-2xl ${className}`}
  >
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={18} className="text-[#F4B400]" />}
        <h3 className="font-display font-semibold text-ink">{title}</h3>
      </div>
      {action && (
        <span className="text-xs text-body/60 bg-surface px-3 py-1.5 rounded-full">{action}</span>
      )}
    </div>
    {children}
  </motion.div>
);

// ============================================
// MAIN ANALYTICS PAGE
// ============================================
export default function Analytics() {
  const { data, isLoading } = useQuery({ 
    queryKey: ['analytics'], 
    queryFn: fetchAnalytics,
    staleTime: 5 * 60 * 1000,
  });

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    if (!data) return null;
    
    const totalRevenue = data.revenueByBrand?.reduce((sum: number, b: any) => sum + b.revenue, 0) || 0;
    const totalSales = data.revenueByExecutive?.reduce((sum: number, e: any) => sum + e.unitsSold, 0) || 0;
    const avgPrice = totalSales > 0 ? totalRevenue / totalSales : 0;
    
    return {
      totalRevenue,
      totalSales,
      avgPrice,
      topBrand: data.revenueByBrand?.[0]?.brand || 'N/A',
      topBrandRevenue: data.revenueByBrand?.[0]?.revenue || 0,
    };
  }, [data]);

  // Container variants for animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.215, 0.61, 0.355, 1],
      },
    },
  };

  return (
    <AdminLayout title="Analytics">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-6 bg-gradient-to-r from-[#F4B400]/10 to-[#F4B400]/5 rounded-3xl p-6 border border-[#F4B400]/20"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Activity size={18} className="text-[#F4B400]" />
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#F4B400]">Analytics Overview</p>
            </div>
            <h1 className="mt-2 text-2xl font-bold text-ink">Performance Analytics</h1>
            <p className="mt-1 text-sm text-body/70">
              Track your dealership's performance with real-time insights and metrics.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <span className="text-xs bg-emerald-50 text-emerald-500 px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
            <span className="text-xs text-body/50">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#F4B400] border-t-transparent" />
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {/* Summary Stats */}
          {summaryStats && (
            <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Total Revenue"
                value={formatLakh(summaryStats.totalRevenue)}
                icon={DollarSign}
                color="text-[#F4B400]"
                trend={12}
                isLoading={isLoading}
              />
              <StatCard
                label="Total Sales"
                value={summaryStats.totalSales}
                icon={Car}
                color="text-emerald-500"
                trend={8}
                isLoading={isLoading}
              />
              <StatCard
                label="Average Price"
                value={formatLakh(summaryStats.avgPrice)}
                icon={TrendingUp}
                color="text-blue-500"
                trend={-3}
                isLoading={isLoading}
              />
              <StatCard
                label="Top Brand"
                value={summaryStats.topBrand}
                icon={Crown}
                color="text-purple-500"
                trendLabel={`${formatLakh(summaryStats.topBrandRevenue)} revenue`}
                isLoading={isLoading}
              />
            </motion.div>
          )}

          {/* Charts Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Revenue by Brand */}
            <ChartCard 
              title="Revenue by Brand" 
              icon={BarChart3}
              action="Last 6 months"
            >
              {data?.revenueByBrand?.length ? (
                <div style={{ height: 280 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.revenueByBrand} margin={{ left: -10 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E9F0" />
                      <XAxis dataKey="brand" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={50} />
                      <YAxis tickFormatter={(v) => formatLakh(v)} tick={{ fontSize: 11 }} width={60} />
                      <Tooltip 
                        formatter={(v: number) => formatLakh(v)}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}
                      />
                      <Bar dataKey="revenue" fill="#F4B400" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyState label="No completed sales yet." icon={BarChart3} />
              )}
            </ChartCard>

            {/* Inventory by Status */}
            <ChartCard 
              title="Inventory by Status" 
              icon={PieChartIcon}
              action="Current"
            >
              {data?.statusDistribution?.length ? (
                <div style={{ height: 280 }} className="flex items-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.statusDistribution}
                        dataKey="count"
                        nameKey="status"
                        innerRadius={60}
                        outerRadius={95}
                        paddingAngle={3}
                      >
                        {data.statusDistribution.map((_: any, i: number) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 shrink-0 pl-3">
                    {data.statusDistribution.map((s: any, i: number) => (
                      <div key={s.status} className="flex items-center gap-2 text-xs text-ink">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                        <span className="font-medium">{s.status}</span>
                        <span className="text-body/60">({s.count})</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <EmptyState label="No inventory yet." icon={PieChartIcon} />
              )}
            </ChartCard>
          </motion.div>

          {/* Second Row */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Fuel Distribution */}
            <ChartCard 
              title="Fuel Type Distribution" 
              icon={Zap}
              action="Inventory"
            >
              {data?.fuelDistribution?.length ? (
                <div style={{ height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.fuelDistribution} layout="vertical" margin={{ left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E9F0" />
                      <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                      <YAxis type="category" dataKey="fuelType" tick={{ fontSize: 12 }} width={80} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}
                      />
                      <Bar dataKey="count" fill="#0B2545" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyState label="No inventory yet." icon={Zap} />
              )}
            </ChartCard>

            {/* Top Selling Models */}
            <ChartCard 
              title="Top Selling Models" 
              icon={Medal}
              action="Best sellers"
            >
              {data?.topSellingModels?.length ? (
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {data.topSellingModels.map((m: any, i: number) => (
                    <motion.div
                      key={`${m.brand}-${m.model}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-surface/50 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                          i === 0 ? 'bg-[#F4B400]' : 
                          i === 1 ? 'bg-gray-400' : 
                          i === 2 ? 'bg-amber-600' : 'bg-surface'
                        }`}>
                          {i + 1}
                        </span>
                        <div>
                          <p className="font-medium text-ink text-sm">{m.brand} {m.model}</p>
                          <p className="text-xs text-body/60">{m.unitsSold} units sold</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-emerald-500 text-sm">{formatLakh(m.revenue)}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <EmptyState label="No completed sales yet." icon={Medal} />
              )}
            </ChartCard>
          </motion.div>

          {/* Revenue by Sales Executive */}
          <motion.div variants={itemVariants}>
            <ChartCard 
              title="Revenue by Sales Executive" 
              icon={Users}
              action="Team performance"
            >
              {data?.revenueByExecutive?.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-body/60 uppercase tracking-wider border-b border-line">
                        <th className="py-3 pr-4 font-semibold">Executive</th>
                        <th className="py-3 pr-4 font-semibold">Units Sold</th>
                        <th className="py-3 pr-4 font-semibold">Revenue</th>
                        <th className="py-3 font-semibold">Avg Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.revenueByExecutive.map((r: any, i: number) => (
                        <motion.tr
                          key={r.salesExecutive}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="border-b border-line last:border-0 hover:bg-surface/30 transition-colors"
                        >
                          <td className="py-3 pr-4 font-medium text-ink">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-[#F4B400]' : 'bg-gray-300'}`} />
                              {r.salesExecutive}
                              {i === 0 && (
                                <span className="text-[10px] bg-[#F4B400]/10 text-[#F4B400] px-2 py-0.5 rounded-full font-semibold">Top</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 pr-4 text-body">{r.unitsSold}</td>
                          <td className="py-3 pr-4 font-semibold text-emerald-500">{formatLakh(r.revenue)}</td>
                          <td className="py-3 text-body">{formatLakh(r.revenue / r.unitsSold)}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState label="No sales with a sales executive recorded yet." icon={Users} />
              )}
            </ChartCard>
          </motion.div>

          {/* Quick Insights */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: Award, label: 'Best Seller', value: data?.topSellingModels?.[0]?.model || '—', color: 'text-[#F4B400]' },
              { icon: TrendingUp, label: 'Top Revenue', value: data?.topSellingModels?.[0]?.brand || '—', color: 'text-emerald-500' },
              { icon: Users, label: 'Top Executive', value: data?.revenueByExecutive?.[0]?.salesExecutive || '—', color: 'text-blue-500' },
              { icon: Sparkles, label: 'Total Models', value: data?.topSellingModels?.length || 0, color: 'text-purple-500' },
            ].map((insight, index) => (
              <motion.div
                key={insight.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 + 0.3 }}
                className="bg-white rounded-2xl shadow-card p-4 text-center hover:shadow-2xl transition-all hover:-translate-y-1"
              >
                <insight.icon size={20} className={`mx-auto ${insight.color}`} />
                <p className="mt-2 text-lg font-bold text-ink">{insight.value}</p>
                <p className="text-xs text-body/60">{insight.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E5E7EB;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #D1D5DB;
        }
      `}</style>
    </AdminLayout>
  );
}