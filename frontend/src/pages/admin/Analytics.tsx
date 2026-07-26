import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import AdminLayout from '@/components/admin/AdminLayout';
import { fetchAnalytics } from '@/api/cars';

const COLORS = ['#0B2545', '#0E9F6E', '#F0B429', '#0EA5E9', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

function formatLakh(amount: number) {
  return `₹${(amount / 100000).toFixed(2)}L`;
}

function EmptyState({ label }: { label: string }) {
  return <p className="text-sm text-body py-16 text-center">{label}</p>;
}

export default function Analytics() {
  const { data, isLoading } = useQuery({ queryKey: ['analytics'], queryFn: fetchAnalytics });

  return (
    <AdminLayout title="Analytics">
      {isLoading ? (
        <p className="text-sm text-body">Loading analytics...</p>
      ) : (
        <div className="space-y-3 sm:space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-5">
            {/* Revenue by Brand */}
            <div className="bg-white rounded-2xl sm:rounded-card shadow-card p-4 sm:p-6">
              <h3 className="font-display font-semibold text-ink mb-3 sm:mb-5 text-sm sm:text-base">Revenue by Brand</h3>
              {data?.revenueByBrand.length ? (
                <div style={{ height: 280 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.revenueByBrand} margin={{ left: -10 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E9F0" />
                      <XAxis dataKey="brand" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={50} />
                      <YAxis tickFormatter={(v) => formatLakh(v)} tick={{ fontSize: 11 }} width={60} />
                      <Tooltip formatter={(v: number) => formatLakh(v)} />
                      <Bar dataKey="revenue" fill="#0E9F6E" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyState label="No completed sales yet." />
              )}
            </div>

            {/* Vehicle Status Distribution */}
            <div className="bg-white rounded-2xl sm:rounded-card shadow-card p-4 sm:p-6">
              <h3 className="font-display font-semibold text-ink mb-3 sm:mb-5 text-sm sm:text-base">Inventory by Status</h3>
              {data?.statusDistribution.length ? (
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
                        {data.statusDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 shrink-0 pl-2">
                    {data.statusDistribution.map((s, i) => (
                      <div key={s.status} className="flex items-center gap-2 text-xs text-ink">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                        {s.status} <span className="text-body">({s.count})</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <EmptyState label="No inventory yet." />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-5">
            {/* Fuel Distribution */}
            <div className="bg-white rounded-2xl sm:rounded-card shadow-card p-4 sm:p-6">
              <h3 className="font-display font-semibold text-ink mb-3 sm:mb-5 text-sm sm:text-base">Fuel Type Distribution</h3>
              {data?.fuelDistribution.length ? (
                <div style={{ height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.fuelDistribution} layout="vertical" margin={{ left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E9F0" />
                      <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                      <YAxis type="category" dataKey="fuelType" tick={{ fontSize: 12 }} width={70} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#0B2545" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyState label="No inventory yet." />
              )}
            </div>

            {/* Top Selling Models */}
            <div className="bg-white rounded-2xl sm:rounded-card shadow-card p-4 sm:p-6">
              <h3 className="font-display font-semibold text-ink mb-3 sm:mb-5 text-sm sm:text-base">Top Selling Models</h3>
              {data?.topSellingModels.length ? (
                <div className="space-y-3">
                  {data.topSellingModels.map((m, i) => (
                    <div key={`${m.brand}-${m.model}`} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-surface text-xs font-semibold text-ink flex items-center justify-center">{i + 1}</span>
                        <span className="font-medium text-ink">{m.brand} {m.model}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-ink">{m.unitsSold} sold</p>
                        <p className="text-xs text-body">{formatLakh(m.revenue)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState label="No completed sales yet." />
              )}
            </div>
          </div>

          {/* Revenue by Sales Executive */}
          <div className="bg-white rounded-2xl sm:rounded-card shadow-card p-4 sm:p-6">
            <h3 className="font-display font-semibold text-ink mb-3 sm:mb-5 text-sm sm:text-base">Revenue by Sales Executive</h3>
            {data?.revenueByExecutive.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-body uppercase tracking-wide border-b border-line">
                      <th className="py-2 pr-4">Executive</th>
                      <th className="py-2 pr-4">Units Sold</th>
                      <th className="py-2">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.revenueByExecutive.map((r) => (
                      <tr key={r.salesExecutive} className="border-b border-line last:border-0">
                        <td className="py-2.5 pr-4 font-medium text-ink">{r.salesExecutive}</td>
                        <td className="py-2.5 pr-4 text-body">{r.unitsSold}</td>
                        <td className="py-2.5 font-semibold text-emerald-dark">{formatLakh(r.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState label="No sales with a sales executive recorded yet." />
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
