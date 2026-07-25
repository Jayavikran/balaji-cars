import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { submitEnquiry } from '@/api/enquiries';

interface EnquiryFormValues {
  customerName: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  message?: string;
}

export default function EnquiryForm({ carId }: { carId: string }) {
  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm<EnquiryFormValues>();

  const onSubmit = async (values: EnquiryFormValues) => {
    try {
      await submitEnquiry({ ...values, carId });
      toast.success('Enquiry sent! Our team will contact you shortly.');
      reset();
    } catch {
      toast.error('Something went wrong. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-line rounded-card p-5 space-y-3">
      <h4 className="font-display font-semibold text-ink">Interested in this car?</h4>
      <input
        {...register('customerName', { required: true })}
        placeholder="Your name"
        className="w-full border border-line rounded-xl px-3 py-2.5 text-sm"
      />
      {errors.customerName && <p className="text-xs text-red-500">Name is required.</p>}
      <input
        {...register('phone', { required: true })}
        placeholder="Phone number"
        className="w-full border border-line rounded-xl px-3 py-2.5 text-sm"
      />
      {errors.phone && <p className="text-xs text-red-500">Phone number is required.</p>}
      <input {...register('email')} placeholder="Email (optional)" className="w-full border border-line rounded-xl px-3 py-2.5 text-sm" />
      <textarea
        {...register('message')}
        placeholder="Message (optional)"
        rows={3}
        className="w-full border border-line rounded-xl px-3 py-2.5 text-sm resize-none"
      />
      <button type="submit" disabled={isSubmitting} className="btn-primary w-full bg-emerald hover:bg-emerald-dark disabled:opacity-60">
        {isSubmitting ? 'Sending...' : 'Send Enquiry'}
      </button>
    </form>
  );
}
