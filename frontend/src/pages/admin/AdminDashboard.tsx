import { useQuery } from '@tanstack/react-query';
import { 
  Car, 
  CheckCircle2, 
  Star, 
  Package, 
  TrendingUp, 
  IndianRupee,
  Users,
  Eye,
  Clock,
  ArrowUp,
  ArrowDown,
  Calendar,
  BarChart3,
  PieChart,
  Settings,
  Sparkles,
  Crown,
  Medal,
  Zap,
  Heart,
  Shield,
  Gift,
  Target,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import { fetchDashboardStats } from '@/api/cars';
import { fetchAdminEnquiries } from '@/api/enquiries';
import { useMemo, useState } from 'react';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// ✅ UPDATED: Format full amount without "L" abbreviation
function formatFullAmount(amount: number) {
  if (!amount) return '₹0';
  return `₹${amount.toLocaleString('en-IN')}`;
}

// ✅ Keep this for backward compatibility if needed
function formatLakh(amount: number) {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
  return `₹${amount.toLocaleString('en-IN')}`;
}

function formatNumber(num: number) {
  if (num >= 10000000) return `${(num / 10000000).toFixed(1)}Cr`;
  if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

// ============================================
// STAT CARDS COMPONENT
// ============================================
const StatCard = ({ 
  label, 
  value, 
  icon: Icon, 
  color, 
  to, 
  isLoading,
  trend,
  trendValue,
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
      {/* Animated gradient background */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${color}/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
        initial={{ scale: 0 }}
        animate={{ scale: isHovered ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      />
      
      <Link to={to} className="relative flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl ${color} text-white flex items-center justify-center shrink-0 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
          <Icon size={22} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-2xl font-display font-bold text-ink">
              {isLoading ? (
                <motion.div 
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="h-8 w-16 bg-gray-200 rounded"
                />
              ) : (
                value ?? '—'
              )}
            </p>
            {trend && (
              <span className={`flex items-center gap-0.5 text-xs font-semibold ${trend > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {trend > 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                {Math.abs(trend)}%
              </span>
            )}
          </div>
          <p className="text-xs text-body/70 font-medium">{label}</p>
        </div>
      </Link>
      
      {/* Decorative dot */}
      <div className={`absolute top-3 right-3 w-1.5 h-1.5 rounded-full ${color} opacity-30`} />
    </motion.div>
  );
};

// ============================================
// REVENUE CARD - Updated to show full amount
// ============================================
const RevenueCard = ({ label, value, sub, icon: Icon, color }: any) => (
  <motion.div
    whileHover={{ y: -2, scale: 1.01 }}
    className="bg-white rounded-3xl shadow-card p-5 transition-all duration-300 hover:shadow-2xl border border-transparent hover:border-[#F4B400]/20 group"
  >
    <div className="flex items-start justify-between">
      <div>
        <div className="flex items-center gap-1.5 text-xs text-body/60">
          <Icon size={14} className={color} />
          {label}
        </div>
        {/* ✅ Updated to show full amount without "L" */}
        <p className="mt-2 text-xl font-display font-bold text-ink">
          {value ? formatFullAmount(value) : '—'}
        </p>
        <p className="text-xs text-body/50 mt-1">{sub}</p>
      </div>
      <div className={`w-10 h-10 rounded-xl ${color}/10 flex items-center justify-center group-hover:scale-110 transition-transform`}>
        <Icon size={18} className={color} />
      </div>
    </div>
  </motion.div>
);

// ============================================
// MAIN DASHBOARD
// ============================================
export default function AdminDashboard() {
  const { data, isLoading } = useQuery({ 
    queryKey: ['dashboard-stats'], 
    queryFn: fetchDashboardStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  const { data: enquiriesData } = useQuery({ 
    queryKey: ['recent-enquiries'], 
    queryFn: () => fetchAdminEnquiries(1, 5),
    staleTime: 2 * 60 * 1000,
  });

  const maxSales = Math.max(1, ...(data?.salesStats.map((s: any) => s.count) ?? [1]));

  const cards = [
    { label: 'Total Cars', value: data?.stats.totalCars, icon: Car, color: 'bg-gradient-to-br from-[#F4B400] to-[#F59E0B]', to: '/admin/cars', trend: 12 },
    { label: 'Available Cars', value: data?.stats.availableCars, icon: Package, color: 'bg-gradient-to-br from-emerald-500 to-emerald-600', to: '/admin/cars?status=Available', trend: 8 },
    { label: 'Sold Cars', value: data?.stats.soldCars, icon: CheckCircle2, color: 'bg-gradient-to-br from-blue-500 to-blue-600', to: '/admin/cars?status=Sold', trend: -3 },
    { label: 'Featured Cars', value: data?.stats.featuredCars, icon: Star, color: 'bg-gradient-to-br from-amber-500 to-amber-600', to: '/admin/cars?featuredOnly=true', trend: 5 },
  ];

  const revenueCards = [
    { 
      label: "Today's Revenue", 
      value: data?.revenue.today.revenue, 
      sub: `${data?.revenue.today.count ?? 0} vehicles sold today`,
      icon: Calendar,
      color: 'text-[#F4B400]'
    },
    { 
      label: "This Month", 
      value: data?.revenue.month.revenue, 
      sub: `${data?.revenue.month.count ?? 0} vehicles this month`,
      icon: TrendingUp,
      color: 'text-emerald-500'
    },
    { 
      label: 'Total Profit', 
      value: data?.revenue.lifetime.profit, 
      // ✅ Updated to show full amount without "L"
      sub: `Avg ${data ? formatFullAmount(data.revenue.averageProfit) : '—'}/vehicle`,
      icon: Medal,
      color: 'text-rose-500'
    },
  ];

  return (
    <AdminLayout title="Dashboard">
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
              <Sparkles size={18} className="text-[#F4B400]" />
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#F4B400]">Welcome Back</p>
            </div>
            <h1 className="mt-2 text-2xl font-bold text-ink">Admin Dashboard</h1>
            <p className="mt-1 text-sm text-body/70">
              Here's what's happening with your dealership today.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <Link
              to="/admin/upload"
              className="inline-flex items-center gap-2 rounded-full bg-[#F4B400] px-5 py-2.5 text-sm font-semibold text-black transition-all hover:scale-105 hover:shadow-xl hover:shadow-[#F4B400]/25 active:scale-95"
            >
              <Plus size={18} />
              Add Car
            </Link>
            <span className="flex items-center gap-1.5 text-xs text-emerald-500 bg-emerald-50 px-3 py-1.5 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
            <span className="text-xs text-body/50">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      >
        {cards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <StatCard {...card} isLoading={isLoading} />
          </motion.div>
        ))}
      </motion.div>

      {/* Revenue Cards - Shows full amount without "L" */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6"
      >
        {revenueCards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 + 0.1 }}
          >
            <RevenueCard {...card} />
          </motion.div>
        ))}
      </motion.div>

      {/* Charts & Recent Activity */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-4"
      >
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-card p-6 transition-all hover:shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display font-semibold text-ink flex items-center gap-2">
                <BarChart3 size={18} className="text-[#F4B400]" />
                Sales Statistics
              </h3>
              <p className="text-xs text-body/60 mt-0.5">Last 6 months performance</p>
            </div>
            <span className="text-xs bg-surface px-3 py-1.5 rounded-full text-body/60">6 months</span>
          </div>

          {data?.salesStats.length ? (
            <div className="flex items-end gap-3 h-52">
              {data.salesStats.map((stat: any, index: number) => {
                const height = (stat.count / maxSales) * 100;
                return (
                  <div key={`${stat._id.year}-${stat._id.month}`} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="relative w-full flex justify-center">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ duration: 0.8, delay: index * 0.05 }}
                        className="absolute bottom-0 w-full bg-gradient-to-t from-[#F4B400] to-[#F59E0B] rounded-t-lg transition-all group-hover:scale-105"
                        style={{ height: `${height}%`, minHeight: 4 }}
                      />
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-black/90 text-white text-xs font-semibold px-2 py-1 rounded whitespace-nowrap">
                        {stat.count} sales
                      </div>
                    </div>
                    <span className="text-xs text-body/50 mt-1">{MONTHS[stat._id.month - 1]}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-body/50">
              <PieChart size={40} className="mb-3 opacity-20" />
              <p className="text-sm">No sales recorded yet</p>
            </div>
          )}
        </div>

        {/* Recent Enquiries */}
        <div className="bg-white rounded-3xl shadow-card p-6 transition-all hover:shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold text-ink flex items-center gap-2">
                <Users size={18} className="text-[#F4B400]" />
                Recent Enquiries
              </h3>
              <p className="text-xs text-body/60 mt-0.5">Latest customer inquiries</p>
            </div>
            <Link to="/admin/enquiries" className="text-xs text-[#F4B400] font-medium hover:underline">
              View all
            </Link>
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
            {enquiriesData?.enquiries.length ? (
              <AnimatePresence>
                {enquiriesData.enquiries.map((e: any, index: number) => (
                  <motion.div
                    key={e._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group p-3 rounded-xl hover:bg-surface/50 transition-all border border-transparent hover:border-[#F4B400]/10"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-ink truncate">{e.customerName}</p>
                        <p className="text-xs text-body/70 truncate">
                          {e.carSnapshot ? `${e.carSnapshot.brand} ${e.carSnapshot.model}` : 'General enquiry'}
                        </p>
                        <p className="text-xs text-body/50 mt-1 flex items-center gap-1">
                          <Clock size={10} />
                          {new Date(e.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 mt-2" />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-body/50">
                <Users size={32} className="mb-2 opacity-20" />
                <p className="text-sm">No enquiries yet</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Recent Uploads */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-3xl shadow-card p-6 mt-4 transition-all hover:shadow-2xl"
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-display font-semibold text-ink flex items-center gap-2">
              <Zap size={18} className="text-[#F4B400]" />
              Recent Uploads
            </h3>
            <p className="text-xs text-body/60 mt-0.5">Latest vehicles added to inventory</p>
          </div>
          <Link to="/admin/cars" className="text-xs text-[#F4B400] font-medium hover:underline">
            Manage all
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {data?.recentUploads.map((car: any, index: number) => (
            <motion.div
              key={car._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -4, scale: 1.03 }}
            >
              <Link to={`/admin/edit/${car._id}`} className="group block">
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-surface/50 shadow-sm">
                  <img 
                    src={car.images?.[0]?.url || 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=300&auto=format&fit=crop'} 
                    alt={`${car.brand} ${car.model}`}
                    className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=300&auto=format&fit=crop';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-[10px] text-white font-medium bg-black/50 px-2 py-0.5 rounded-full">
                      {car.status || 'Available'}
                    </span>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-xs font-medium text-ink truncate">{car.brand} {car.model}</p>
                  <p className="text-xs text-emerald-500 font-semibold">
                    {car.price ? formatFullAmount(car.price) : '—'}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4"
      >
        <Link
          to="/admin/upload"
          className="flex items-center gap-3 bg-white rounded-2xl shadow-card p-4 transition-all hover:shadow-2xl hover:-translate-y-1 group"
        >
          <div className="bg-[#F4B400] text-white p-2.5 rounded-xl group-hover:scale-110 transition-transform">
            <Plus size={18} />
          </div>
          <span className="text-sm font-medium text-ink">Add Car</span>
        </Link>
        <Link
          to="/admin/enquiries"
          className="flex items-center gap-3 bg-white rounded-2xl shadow-card p-4 transition-all hover:shadow-2xl hover:-translate-y-1 group"
        >
          <div className="bg-blue-500 text-white p-2.5 rounded-xl group-hover:scale-110 transition-transform">
            <Users size={18} />
          </div>
          <span className="text-sm font-medium text-ink">Enquiries</span>
        </Link>
        <Link
          to="/admin/settings"
          className="flex items-center gap-3 bg-white rounded-2xl shadow-card p-4 transition-all hover:shadow-2xl hover:-translate-y-1 group"
        >
          <div className="bg-purple-500 text-white p-2.5 rounded-xl group-hover:scale-110 transition-transform">
            <Settings size={18} />
          </div>
          <span className="text-sm font-medium text-ink">Settings</span>
        </Link>
        <Link
          to="/admin/analytics"
          className="flex items-center gap-3 bg-white rounded-2xl shadow-card p-4 transition-all hover:shadow-2xl hover:-translate-y-1 group"
        >
          <div className="bg-rose-500 text-white p-2.5 rounded-xl group-hover:scale-110 transition-transform">
            <BarChart3 size={18} />
          </div>
          <span className="text-sm font-medium text-ink">Analytics</span>
        </Link>
      </motion.div>

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