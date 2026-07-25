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
  const { data: settings, isLoading } = useQuery({ queryKey: ['settings'], queryFn: fetchPublicSettings });
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<SiteSettings>();

  useEffect(() => {
    if (settings) reset(settings);
  }, [settings, reset]);

  const onSubmit = async (values: SiteSettings) => {
    try {
      await updateSettings(values);
      toast.success('Settings saved.');
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    } catch {
      toast.error('Failed to save settings.');
    }
  };

  if (isLoading) {
    return <AdminLayout title="Settings"><p className="text-body">Loading...</p></AdminLayout>;
  }

  return (
    <AdminLayout title="Settings">
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-6">
        <Section title="Company Information">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Company Name"><input {...register('companyName')} className="input" /></Field>
            <Field label="Company Logo URL"><input {...register('companyLogo')} className="input" placeholder="https://..." /></Field>
          </div>
        </Section>

        <Section title="Contact Details">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="WhatsApp Number"><input {...register('whatsappNumber')} className="input" placeholder="+91XXXXXXXXXX" /></Field>
            <Field label="Phone Number"><input {...register('phoneNumber')} className="input" /></Field>
            <Field label="Email"><input type="email" {...register('email')} className="input" /></Field>
            <Field label="Google Maps Link"><input {...register('googleMapsLink')} className="input" /></Field>
          </div>
          <div className="mt-4">
            <Field label="Address"><textarea {...register('address')} rows={2} className="input resize-none" /></Field>
          </div>
        </Section>

        <Section title="Social Media">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Facebook"><input {...register('facebookUrl')} className="input" /></Field>
            <Field label="Instagram"><input {...register('instagramUrl')} className="input" /></Field>
            <Field label="YouTube"><input {...register('youtubeUrl')} className="input" /></Field>
          </div>
        </Section>

        <Section title="SEO Settings">
          <div className="space-y-4">
            <Field label="SEO Title"><input {...register('seoTitle')} className="input" /></Field>
            <Field label="SEO Description"><textarea {...register('seoDescription')} rows={2} className="input resize-none" /></Field>
          </div>
        </Section>

        <button type="submit" disabled={isSubmitting} className="btn-primary bg-emerald hover:bg-emerald-dark disabled:opacity-60">
          {isSubmitting ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </AdminLayout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-card shadow-card p-6">
      <h3 className="font-display font-semibold text-ink mb-4">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-body block mb-1.5">{label}</label>
      {children}
    </div>
  );
}
