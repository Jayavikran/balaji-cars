import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, IndianRupee } from 'lucide-react';
import toast from 'react-hot-toast';
import { completeSale, type CompleteSalePayload } from '@/api/cars';
import type { Car } from '@/types';

const PAYMENT_METHODS = ['Cash', 'Bank Transfer', 'UPI', 'Cheque', 'Finance/Loan', 'Other'];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function CompleteSaleModal({
  car,
  onClose,
  onComplete,
}: {
  car: Car | null;
  onClose: () => void;
  onComplete: () => void;
}) {
  const [form, setForm] = useState<CompleteSalePayload>({
    soldPrice: car?.price ?? 0,
    purchasePrice: undefined,
    buyerName: '',
    buyerPhone: '',
    saleDate: todayISO(),
    paymentMethod: 'Cash',
    financeCompany: '',
    salesExecutive: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  // Reset the form whenever a new car is opened (each car has its own listed price).
  const carId = car?._id;
  const [lastCarId, setLastCarId] = useState(carId);
  if (carId && carId !== lastCarId) {
    setLastCarId(carId);
    setForm({
      soldPrice: car!.price,
      purchasePrice: undefined,
      buyerName: '',
      buyerPhone: '',
      saleDate: todayISO(),
      paymentMethod: 'Cash',
      financeCompany: '',
      salesExecutive: '',
      notes: '',
    });
  }

  if (!car) return null;

  const profit =
    form.soldPrice !== undefined && form.purchasePrice !== undefined && form.purchasePrice !== ('' as any)
      ? Number(form.soldPrice) - Number(form.purchasePrice)
      : undefined;

  const set = <K extends keyof CompleteSalePayload>(key: K, value: CompleteSalePayload[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async () => {
    if (!form.soldPrice || Number(form.soldPrice) <= 0) {
      toast.error('Enter a valid selling price.');
      return;
    }
    if (!form.buyerName.trim()) {
      toast.error('Buyer name is required.');
      return;
    }

    setSaving(true);
    try {
      await completeSale(car._id, {
        ...form,
        soldPrice: Number(form.soldPrice),
        purchasePrice: form.purchasePrice !== undefined && (form.purchasePrice as any) !== '' ? Number(form.purchasePrice) : undefined,
      });
      toast.success('Sale completed.');
      onComplete();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not complete the sale.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" role="dialog" aria-modal="true" aria-label="Complete Sale">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60" onClick={saving ? undefined : onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.2 }}
          className="relative bg-white rounded-t-3xl sm:rounded-card w-full max-w-lg max-h-[92vh] sm:max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-line sticky top-0 bg-white z-10">
            <div>
              <h3 className="font-display text-lg font-bold text-ink">Complete Sale</h3>
              <p className="text-xs text-body">{car.brand} {car.model} {car.variant}</p>
            </div>
            <button onClick={onClose} disabled={saving} aria-label="Cancel" className="w-8 h-8 rounded-full hover:bg-surface flex items-center justify-center text-body">
              <X size={16} />
            </button>
          </div>

          <div className="p-4 sm:p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="text-sm">
                <span className="block mb-1.5 font-medium text-ink">Selling Price *</span>
                <input
                  type="number" min={0} className="input" value={form.soldPrice ?? ''}
                  onChange={(e) => set('soldPrice', Number(e.target.value))}
                />
              </label>
              <label className="text-sm">
                <span className="block mb-1.5 font-medium text-ink">Purchase Price</span>
                <input
                  type="number" min={0} className="input" value={form.purchasePrice ?? ''}
                  onChange={(e) => set('purchasePrice', e.target.value === '' ? undefined : Number(e.target.value))}
                />
              </label>
            </div>

            {profit !== undefined && (
              <div className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold ${profit >= 0 ? 'bg-emerald/10 text-emerald-dark' : 'bg-red-50 text-red-600'}`}>
                <IndianRupee size={15} />
                {profit >= 0 ? 'Profit' : 'Loss'}: ₹{Math.abs(profit).toLocaleString('en-IN')}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="text-sm">
                <span className="block mb-1.5 font-medium text-ink">Buyer Name *</span>
                <input className="input" value={form.buyerName} onChange={(e) => set('buyerName', e.target.value)} />
              </label>
              <label className="text-sm">
                <span className="block mb-1.5 font-medium text-ink">Buyer Phone</span>
                <input className="input" value={form.buyerPhone} onChange={(e) => set('buyerPhone', e.target.value)} />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="text-sm">
                <span className="block mb-1.5 font-medium text-ink">Sale Date</span>
                <input type="date" className="input" value={form.saleDate} onChange={(e) => set('saleDate', e.target.value)} />
              </label>
              <label className="text-sm">
                <span className="block mb-1.5 font-medium text-ink">Payment Method</span>
                <select className="input" value={form.paymentMethod} onChange={(e) => set('paymentMethod', e.target.value)}>
                  {PAYMENT_METHODS.map((m) => <option key={m}>{m}</option>)}
                </select>
              </label>
            </div>

            {form.paymentMethod === 'Finance/Loan' && (
              <label className="text-sm block">
                <span className="block mb-1.5 font-medium text-ink">Finance Company</span>
                <input className="input" value={form.financeCompany} onChange={(e) => set('financeCompany', e.target.value)} />
              </label>
            )}

            <label className="text-sm block">
              <span className="block mb-1.5 font-medium text-ink">Sales Executive</span>
              <input className="input" value={form.salesExecutive} onChange={(e) => set('salesExecutive', e.target.value)} />
            </label>

            <label className="text-sm block">
              <span className="block mb-1.5 font-medium text-ink">Notes</span>
              <textarea rows={2} className="input resize-none" value={form.notes} onChange={(e) => set('notes', e.target.value)} />
            </label>
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 sm:gap-3 px-4 sm:px-6 py-3.5 sm:py-4 border-t border-line sticky bottom-0 bg-white">
            <button onClick={onClose} disabled={saving} className="btn-outline w-full sm:w-auto !h-12 sm:!h-auto">Cancel</button>
            <button onClick={handleSubmit} disabled={saving} className="btn-primary w-full sm:w-auto !h-12 sm:!h-auto">
              {saving ? 'Saving...' : 'Complete Sale'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
