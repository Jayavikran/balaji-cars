import { useQuery } from '@tanstack/react-query';
import { Car, CheckCircle2, Star, Package, TrendingUp, IndianRupee } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { fetchDashboardStats } from '@/api/cars';
import { fetchAdminEnquiries } from '@/api/enquiries';
import { Link } from 'react-router-dom';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatLakh(amount: number) {
  return `₹${(amount / 100000).toFixed(2)}L`;
}

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({ queryKey: ['dashboard-stats'], queryFn: fetchDashboardStats });
  const { data: enquiriesData } = useQuery({ queryKey: ['recent-enquiries'], queryFn: () => fetchAdminEnquiries(1, 5) });

  const cards = [
    { label: 'Total Cars', value: data?.stats.totalCars ?? '—', icon: Car, color: 'bg-navy', to: '/admin/cars' },
    { label: 'Available Cars', value: data?.stats.availableCars ?? '—', icon: Package, color: 'bg-emerald', to: '/admin/cars?status=Available' },
    { label: 'Sold Cars', value: data?.stats.soldCars ?? '—', icon: CheckCircle2, color: 'bg-sky-600', to: '/admin/cars?status=Sold' },
    { label: 'Featured Cars', value: data?.stats.featuredCars ?? '—', icon: Star, color: 'bg-amber', to: '/admin/cars?featuredOnly=true' },
  ];

  const maxSales = Math.max(1, ...(data?.salesStats.map((s) => s.count) ?? [1]));

  return (
    <AdminLayout title="Dashboard">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {cards.map((c) => (
          <Link
            key={c.label}
            to={c.to}
            className="bg-white rounded-card shadow-card p-5 flex items-center gap-4 transition-shadow hover:shadow-lg cursor-pointer"
          >
            <div className={`w-12 h-12 rounded-2xl ${c.color} text-white flex items-center justify-center`}>
              <c.icon size={20} />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-ink">{isLoading ? '—' : c.value}</p>
              <p className="text-xs text-body">{c.label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {[
          { label: "Today's Revenue", value: data?.revenue.today.revenue, sub: `${data?.revenue.today.count ?? 0} sold` },
          { label: "This Month's Revenue", value: data?.revenue.month.revenue, sub: `${data?.revenue.month.count ?? 0} sold` },
          { label: 'Lifetime Revenue', value: data?.revenue.lifetime.revenue, sub: `Avg ${data ? formatLakh(data.revenue.averageSellingPrice) : '—'}/car` },
          { label: 'Lifetime Profit', value: data?.revenue.lifetime.profit, sub: `Avg ${data ? formatLakh(data.revenue.averageProfit) : '—'}/car` },
        ].map((r) => (
          <div key={r.label} className="bg-white rounded-card shadow-card p-5">
            <p className="flex items-center gap-1.5 text-xs text-body mb-1"><IndianRupee size={12} /> {r.label}</p>
            <p className="text-xl font-display font-bold text-ink">{data ? formatLakh(r.value ?? 0) : '—'}</p>
            <p className="text-xs text-body mt-1">{r.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-card shadow-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display font-semibold text-ink flex items-center gap-2"><TrendingUp size={17} /> Sales Statistics</h3>
            <span className="text-xs text-body">Last 6 months</span>
          </div>
          {data?.salesStats.length ? (
            <div className="flex items-end gap-4 h-48">
              {data.salesStats.map((s) => (
                <div key={`${s._id.year}-${s._id.month}`} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-emerald/80 rounded-t-lg transition-all"
                    style={{ height: `${(s.count / maxSales) * 100}%`, minHeight: 6 }}
                  />
                  <span className="text-[11px] text-body">{MONTHS[s._id.month - 1]}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-body py-10 text-center">No sales recorded in the last 6 months yet.</p>
          )}
        </div>

        <div className="bg-white rounded-card shadow-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-ink">Recent Enquiries</h3>
            <Link to="/admin/enquiries" className="text-xs text-navy font-medium hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {enquiriesData?.enquiries.length ? (
              enquiriesData.enquiries.map((e) => (
                <div key={e._id} className="border-b border-line pb-3 last:border-0 last:pb-0">
                  <p className="text-sm font-medium text-ink">{e.customerName}</p>
                  <p className="text-xs text-body">{e.carSnapshot ? `${e.carSnapshot.brand} ${e.carSnapshot.model}` : 'General enquiry'}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-body">No enquiries yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-card shadow-card p-6 mt-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-ink">Recent Uploads</h3>
          <Link to="/admin/cars" className="text-xs text-navy font-medium hover:underline">Manage all cars</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {data?.recentUploads.map((car) => (
            <Link key={car._id} to={`/admin/edit/${car._id}`} className="group">
              <div className="aspect-square rounded-xl overflow-hidden bg-surface mb-2">
                <img src={car.images?.[0]?.url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              </div>
              <p className="text-xs font-medium text-ink truncate">{car.brand} {car.model}</p>
              <p className="text-xs text-emerald font-semibold">₹{(car.price / 100000).toFixed(2)}L</p>
            </Link>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
