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
    <form onSubmit={handleSubmit(onSubmit)} className="rounded-[28px] border border-line bg-white p-5 shadow-card">
      <div className="rounded-2xl bg-[#0F0F10] px-4 py-4 text-white">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#F4B400]">Enquiry</p>
        <h4 className="mt-2 font-display text-lg font-bold">Interested in this car?</h4>
        <p className="mt-2 text-sm leading-6 text-white/70">Send your details and our team will get back to you shortly.</p>
      </div>

      <div className="mt-4 space-y-3">
      <input
        {...register('customerName', { required: true })}
        placeholder="Your name"
        className="input"
      />
      {errors.customerName && <p className="text-xs text-red-500">Name is required.</p>}
      <input
        {...register('phone', {
          required: 'Phone number is required',
          pattern: {
            value: /^[0-9]{10}$/,
            message: 'Please enter a valid 10-digit phone number',
          },
        })}
        placeholder="Phone number (10 digits)"
        className="input"
      />
      {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
      <input
        {...register('email', {
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Please enter a valid email address',
          },
        })}
        placeholder="Email (optional)"
        className="input"
      />
      {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
      <textarea
        {...register('message')}
        placeholder="Message (optional)"
        rows={3}
        className="input resize-none"
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex w-full items-center justify-center rounded-full bg-[#F4B400] px-5 py-3 text-sm font-semibold text-black transition-all hover:scale-[1.01] disabled:opacity-60"
      >
        {isSubmitting ? 'Sending...' : 'Send Enquiry'}
      </button>
      </div>
    </form>
  );
}
