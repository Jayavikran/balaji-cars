import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Trash2, Phone, MessageCircle } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { fetchAdminEnquiries, updateEnquiryStatus, deleteEnquiry } from '@/api/enquiries';
import type { Enquiry } from '@/types';

const STATUS_OPTIONS: Enquiry['status'][] = ['New', 'Contacted', 'In Progress', 'Closed'];

export default function Enquiries() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-enquiries', page, statusFilter],
    queryFn: () => fetchAdminEnquiries(page, 20, statusFilter || undefined),
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['admin-enquiries'] });

  const handleStatusChange = async (id: string, status: Enquiry['status']) => {
    try {
      await updateEnquiryStatus(id, status);
      toast.success('Status updated successfully');
      refresh();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this enquiry?')) return;
    try {
      await deleteEnquiry(id);
      toast.success('Enquiry deleted successfully');
      refresh();
    } catch {
      toast.error('Failed to delete enquiry');
    }
  };

  const statusSelectClasses = (status: Enquiry['status']) =>
    `text-xs border rounded-full px-2.5 py-1 ${
      status === 'New' ? 'border-blue-400 bg-blue-50 text-blue-700' :
      status === 'Contacted' ? 'border-yellow-400 bg-yellow-50 text-yellow-700' :
      status === 'In Progress' ? 'border-purple-400 bg-purple-50 text-purple-700' :
      'border-green-400 bg-green-50 text-green-700'
    }`;

  return (
    <AdminLayout title="Customer Enquiries">
      <div className="bg-white rounded-2xl md:rounded-card shadow-card">
        <div className="p-3 sm:p-4 border-b border-line flex flex-wrap items-center gap-3">
          <select 
            value={statusFilter} 
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }} 
            className="input !w-full sm:!w-auto text-sm"
          >
            <option value="">All Status</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <span className="text-sm text-body sm:ml-auto">
            Total: {data?.pagination?.total || 0} enquiries
          </span>
        </div>

        {/* Desktop / tablet: table, unchanged */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-body uppercase tracking-wide border-b border-line">
                <th className="p-4">Customer</th>
                <th className="p-4">Phone</th>
                <th className="p-4">WhatsApp</th>
                <th className="p-4">Interested Car</th>
                <th className="p-4">Message</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} className="p-8 text-center text-body">Loading...</td></tr>
              ) : data && data.enquiries.length > 0 ? (
                data.enquiries.map((e) => (
                  <tr key={e._id} className="border-b border-line last:border-0 hover:bg-surface/50">
                    <td className="p-4 font-medium text-ink">{e.customerName}</td>
                    <td className="p-4">
                      <a href={`tel:${e.phone}`} className="flex items-center gap-1.5 text-navy hover:underline">
                        <Phone size={13} /> {e.phone}
                      </a>
                    </td>
                    <td className="p-4">
                      {e.whatsapp ? (
                        <a 
                          href={`https://wa.me/${e.whatsapp.replace(/\D/g, '')}`} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="flex items-center gap-1.5 text-emerald-dark hover:underline"
                        >
                          <MessageCircle size={13} /> Chat
                        </a>
                      ) : '—'}
                    </td>
                    <td className="p-4 text-body">
                      {e.car ? `${e.car.brand} ${e.car.model}${e.car.variant ? ` ${e.car.variant}` : ''}` : 
                       e.carSnapshot ? `${e.carSnapshot.brand} ${e.carSnapshot.model}` : 'General'}
                    </td>
                    <td className="p-4 text-body max-w-[200px] truncate" title={e.message || ''}>
                      {e.message || '—'}
                    </td>
                    <td className="p-4 text-body">
                      {new Date(e.createdAt).toLocaleDateString('en-IN', { 
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </td>
                    <td className="p-4">
                      <select
                        value={e.status}
                        onChange={(ev) => handleStatusChange(e._id, ev.target.value as Enquiry['status'])}
                        className={statusSelectClasses(e.status)}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4">
                      <button 
                        onClick={() => handleDelete(e._id)} 
                        className="text-body hover:text-red-500 transition-colors"
                        title="Delete enquiry"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={8} className="p-10 text-center text-body">No enquiries yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile: one card per enquiry */}
        <div className="md:hidden">
          {isLoading ? (
            <p className="p-8 text-center text-body text-sm">Loading...</p>
          ) : data && data.enquiries.length > 0 ? (
            <div className="p-3 space-y-3">
              {data.enquiries.map((e) => (
                <div key={e._id} className="border border-line rounded-2xl p-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-ink truncate">{e.customerName}</p>
                      <p className="text-xs text-body mt-0.5">
                        {e.car ? `${e.car.brand} ${e.car.model}${e.car.variant ? ` ${e.car.variant}` : ''}` :
                         e.carSnapshot ? `${e.carSnapshot.brand} ${e.carSnapshot.model}` : 'General enquiry'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(e._id)}
                      className="text-body hover:text-red-500 transition-colors shrink-0 w-8 h-8 flex items-center justify-center -mr-1 -mt-1"
                      title="Delete enquiry"
                      aria-label="Delete enquiry"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  {e.message && <p className="text-xs text-body mt-2 line-clamp-2">{e.message}</p>}

                  <p className="text-[11px] text-body mt-2">
                    {new Date(e.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>

                  <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-line">
                    <div className="flex items-center gap-2">
                      <a href={`tel:${e.phone}`} className="flex items-center justify-center gap-1.5 h-9 px-3 rounded-full bg-navy text-white text-xs font-medium">
                        <Phone size={13} /> Call
                      </a>
                      {e.whatsapp && (
                        <a
                          href={`https://wa.me/${e.whatsapp.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center gap-1.5 h-9 px-3 rounded-full bg-green-100 text-green-700 text-xs font-medium"
                        >
                          <MessageCircle size={13} /> Chat
                        </a>
                      )}
                    </div>
                    <select
                      value={e.status}
                      onChange={(ev) => handleStatusChange(e._id, ev.target.value as Enquiry['status'])}
                      className={statusSelectClasses(e.status)}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="p-10 text-center text-body text-sm">No enquiries yet.</p>
          )}
        </div>

        {data && data.pagination && data.pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t border-line flex-wrap">
            {Array.from({ length: data.pagination.totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-8 h-8 rounded-full text-xs font-medium transition-colors ${
                  page === i + 1 ? 'bg-navy text-white' : 'bg-surface text-ink hover:bg-line'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}