import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import AdminLayout from '@/components/admin/AdminLayout';
import { fetchPublicSettings } from '@/api/enquiries';
import { updateSettings } from '@/api/settings';
import type { SiteSettings } from '@/types';

export default function Settings() {
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useQuery({ 
    queryKey: ['settings'], 
    queryFn: fetchPublicSettings 
  });
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<SiteSettings>();

  useEffect(() => {
    if (settings) reset(settings);
  }, [settings, reset]);

  const onSubmit = async (values: SiteSettings) => {
    try {
      await updateSettings(values);
      toast.success('Settings saved successfully!');
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    } catch {
      toast.error('Failed to save settings. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Settings">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-line border-t-navy rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Settings">
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-4 sm:space-y-6">
        {/* Company Information */}
        <Section title="Company Information">
          <div className="settings-grid grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Field label="Company Name">
              <input 
                {...register('companyName')} 
                className="input h-12 sm:h-auto" 
                placeholder="BALAJI CARS"
              />
            </Field>
            <Field label="Company Logo URL">
              <input 
                {...register('companyLogo')} 
                className="input h-12 sm:h-auto" 
                placeholder="https://example.com/logo.png"
              />
            </Field>
          </div>
        </Section>

        {/* Contact Details */}
        <Section title="Contact Details">
          <div className="settings-grid grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Field label="WhatsApp Number">
              <input 
                {...register('whatsappNumber')} 
                className="input h-12 sm:h-auto" 
                placeholder="+91XXXXXXXXXX"
              />
            </Field>
            <Field label="Phone Number">
              <input 
                {...register('phoneNumber')} 
                className="input h-12 sm:h-auto" 
                placeholder="+91XXXXXXXXXX"
              />
            </Field>
            <Field label="Email">
              <input 
                type="email" 
                {...register('email')} 
                className="input h-12 sm:h-auto" 
                placeholder="admin@balajicars.com"
              />
            </Field>
            <Field label="Google Maps Link">
              <input 
                {...register('googleMapsLink')} 
                className="input h-12 sm:h-auto" 
                placeholder="https://maps.google.com/..."
              />
            </Field>
          </div>
          <div className="mt-3 sm:mt-4">
            <Field label="Address">
              <textarea 
                {...register('address')} 
                rows={2} 
                className="input resize-none min-h-[60px] sm:min-h-[80px]" 
                placeholder="123, Main Road, City, State - PIN"
              />
            </Field>
          </div>
        </Section>

        {/* Social Media */}
        <Section title="Social Media">
          <div className="settings-grid grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <Field label="Facebook">
              <input 
                {...register('facebookUrl')} 
                className="input h-12 sm:h-auto" 
                placeholder="https://facebook.com/..."
              />
            </Field>
            <Field label="Instagram">
              <input 
                {...register('instagramUrl')} 
                className="input h-12 sm:h-auto" 
                placeholder="https://instagram.com/..."
              />
            </Field>
            <Field label="YouTube">
              <input 
                {...register('youtubeUrl')} 
                className="input h-12 sm:h-auto" 
                placeholder="https://youtube.com/..."
              />
            </Field>
          </div>
        </Section>

        {/* SEO Settings */}
        <Section title="SEO Settings">
          <div className="space-y-3 sm:space-y-4">
            <Field label="SEO Title">
              <input 
                {...register('seoTitle')} 
                className="input h-12 sm:h-auto" 
                placeholder="BALAJI CARS | Premium Used Cars"
              />
            </Field>
            <Field label="SEO Description">
              <textarea 
                {...register('seoDescription')} 
                rows={2} 
                className="input resize-none min-h-[60px] sm:min-h-[80px]" 
                placeholder="Discover premium certified used cars at BALAJI CARS..."
              />
            </Field>
          </div>
        </Section>

        {/* Submit Button - Full width on mobile */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="btn-primary bg-emerald hover:bg-emerald-dark disabled:opacity-60 w-full sm:w-auto min-h-[48px] sm:min-h-[44px] text-sm sm:text-base"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              'Save Settings'
            )}
          </button>
          <button 
            type="button" 
            onClick={() => {
              if (settings) reset(settings);
              toast('Settings reset to saved values.');
            }} 
            className="btn-outline w-full sm:w-auto min-h-[48px] sm:min-h-[44px] text-sm sm:text-base"
          >
            Reset Changes
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="settings-card bg-white dark:bg-[#111a2c] rounded-2xl shadow-card p-4 sm:p-6 transition-all hover:shadow-lg">
      <h3 className="font-display font-semibold text-ink dark:text-white text-sm sm:text-base mb-3 sm:mb-4 flex items-center gap-2">
        <span className="w-1 h-6 bg-emerald rounded-full" />
        {title}
      </h3>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1 sm:space-y-1.5">
      <label className="text-[11px] sm:text-xs font-medium text-body dark:text-white/70 block">
        {label}
      </label>
      {children}
    </div>
  );
}