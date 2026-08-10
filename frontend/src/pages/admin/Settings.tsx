import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { 
  Save, 
  RefreshCw, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  Globe, 
  Facebook, 
  Instagram, 
  Youtube,
  Settings as SettingsIcon,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  Shield,
  Award,
  Clock,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from '@/components/admin/AdminLayout';
import { fetchPublicSettings, updateSettings } from '@/api/enquiries';
import type { SiteSettings } from '@/types';

// ============================================
// CONFIRMATION MODAL
// ============================================
const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning'
}: { 
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info' | 'success';
}) => {
  const colors = {
    warning: { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'text-amber-500', button: 'bg-amber-500 hover:bg-amber-600' },
    danger: { bg: 'bg-red-50', border: 'border-red-200', icon: 'text-red-500', button: 'bg-red-500 hover:bg-red-600' },
    info: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-500', button: 'bg-blue-500 hover:bg-blue-600' },
    success: { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: 'text-emerald-500', button: 'bg-emerald-500 hover:bg-emerald-600' },
  };

  const color = colors[type];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`max-w-md w-full rounded-3xl ${color.bg} border ${color.border} p-6 shadow-2xl`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-full ${color.bg} border ${color.border} flex items-center justify-center shrink-0`}>
                <AlertTriangle size={24} className={color.icon} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-ink">{title}</h3>
                <p className="mt-2 text-sm text-body">{message}</p>
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={onConfirm}
                    className={`flex-1 rounded-full ${color.button} px-4 py-2.5 text-sm font-semibold text-white transition-all hover:scale-105 active:scale-95`}
                  >
                    {confirmText}
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 rounded-full border border-line bg-white px-4 py-2.5 text-sm font-medium text-ink transition-all hover:border-[#F4B400] hover:scale-105 active:scale-95"
                  >
                    {cancelText}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// ============================================
// SUB-COMPONENTS
// ============================================

const Section = ({ title, icon: Icon, children }: { title: string; icon?: any; children: React.ReactNode }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-3xl shadow-card p-6 transition-all hover:shadow-2xl border border-transparent hover:border-[#F4B400]/10"
  >
    <div className="flex items-center gap-2 mb-4">
      {Icon && <Icon size={18} className="text-[#F4B400]" />}
      <h3 className="font-display font-semibold text-ink">{title}</h3>
      <span className="ml-auto text-xs text-body/50">All fields are optional</span>
    </div>
    {children}
  </motion.div>
);

const Field = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
  <div>
    <label className="text-xs font-medium text-body/70 block mb-1.5">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

// ============================================
// MAIN COMPONENT
// ============================================
export default function Settings() {
  const queryClient = useQueryClient();
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveProgress, setSaveProgress] = useState(0);
  const [initialValues, setInitialValues] = useState<SiteSettings | null>(null);
  
  const { data: settings, isLoading } = useQuery({ 
    queryKey: ['settings'], 
    queryFn: fetchPublicSettings,
    staleTime: 60 * 1000,
  });
  
  const { register, handleSubmit, reset, watch, formState: { isSubmitting, dirtyFields } } = useForm<SiteSettings>();

  const watchedValues = watch();

  // Detect unsaved changes
  useEffect(() => {
    if (initialValues && settings) {
      const hasChanges = JSON.stringify(watchedValues) !== JSON.stringify(initialValues);
      setHasUnsavedChanges(hasChanges);
    }
  }, [watchedValues, initialValues, settings]);

  useEffect(() => {
    if (settings) {
      reset(settings);
      setInitialValues(settings);
    }
  }, [settings, reset]);

  // Handle browser back/refresh with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const onSubmit = async (values: SiteSettings) => {
    if (!hasUnsavedChanges) {
      toast('No changes to save');
      return;
    }
    setShowSaveConfirm(true);
  };

  const confirmSave = async (values: SiteSettings) => {
    setShowSaveConfirm(false);
    setIsSaving(true);
    setSaveProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setSaveProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 150);

      const savedSettings = await updateSettings(values);
      clearInterval(progressInterval);
      setSaveProgress(100);
      
      queryClient.setQueryData(['settings'], savedSettings);
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      
      toast.success('Settings saved successfully! 🎉');
      setHasUnsavedChanges(false);
      setInitialValues(values);
      setSaveProgress(0);
      setIsSaving(false);
    } catch {
      toast.error('Failed to save settings.');
      setIsSaving(false);
      setSaveProgress(0);
    }
  };

  const handleReset = () => {
    if (hasUnsavedChanges) {
      setShowResetConfirm(true);
    } else {
      reset(initialValues || {});
      toast('Settings reset to saved values');
    }
  };

  const confirmReset = () => {
    setShowResetConfirm(false);
    if (initialValues) {
      reset(initialValues);
      setHasUnsavedChanges(false);
      toast.success('Settings reset to saved values');
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Settings">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#F4B400] border-t-transparent mx-auto mb-4" />
            <p className="text-body">Loading settings...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Settings">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Unsaved Changes Bar */}
        <AnimatePresence>
          {hasUnsavedChanges && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-4 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2 text-sm text-amber-700">
                <AlertTriangle size={18} />
                <span className="font-medium">You have unsaved changes</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowSaveConfirm(true)}
                  className="rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-amber-600 hover:scale-105"
                >
                  Save Now
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-full border border-amber-300 bg-white px-4 py-2 text-sm font-medium text-amber-700 transition-all hover:bg-amber-50 hover:scale-105"
                >
                  Discard
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-gradient-to-r from-[#F4B400]/10 to-[#F59E0B]/10 rounded-3xl p-6 border border-[#F4B400]/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <SettingsIcon size={18} className="text-[#F4B400]" />
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#F4B400]">Site Settings</p>
                {hasUnsavedChanges && (
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                    Unsaved changes
                  </span>
                )}
              </div>
              <h1 className="mt-2 text-2xl font-bold text-ink">General Settings</h1>
              <p className="mt-1 text-sm text-body/70">
                Configure your dealership's information, contact details, and social media links.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-body/50">
              <span className="flex items-center gap-1">
                <Shield size={14} className="text-emerald-500" />
                All settings are secure
              </span>
            </div>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Company Information */}
          <Section title="Company Information" icon={Building2}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Company Name">
                <input {...register('companyName')} className="input" placeholder="Your dealership name" />
              </Field>
              <Field label="Company Logo URL">
                <input {...register('companyLogo')} className="input" placeholder="https://example.com/logo.png" />
              </Field>
            </div>
          </Section>

          {/* Contact Details */}
          <Section title="Contact Details" icon={Phone}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="WhatsApp Number">
                <input {...register('whatsappNumber')} className="input" placeholder="+91XXXXXXXXXX" />
              </Field>
              <Field label="Phone Number">
                <input {...register('phoneNumber')} className="input" placeholder="+91XXXXXXXXXX" />
              </Field>
              <Field label="Email">
                <input type="email" {...register('email')} className="input" placeholder="info@dealership.com" />
              </Field>
              <Field label="Google Maps Link">
                <input {...register('googleMapsLink')} className="input" placeholder="https://maps.google.com/..." />
              </Field>
            </div>
            <div className="mt-4">
              <Field label="Address">
                <textarea {...register('address')} rows={2} className="input resize-none" placeholder="Full address of your dealership" />
              </Field>
            </div>
          </Section>

          {/* Social Media */}
          <Section title="Social Media" icon={Globe}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Facebook URL">
                <input {...register('facebookUrl')} className="input" placeholder="https://facebook.com/..." />
              </Field>
              <Field label="Instagram URL">
                <input {...register('instagramUrl')} className="input" placeholder="https://instagram.com/..." />
              </Field>
              <Field label="YouTube URL">
                <input {...register('youtubeUrl')} className="input" placeholder="https://youtube.com/..." />
              </Field>
            </div>
          </Section>

          {/* SEO Settings */}
          <Section title="SEO Settings" icon={Sparkles}>
            <div className="space-y-4">
              <Field label="SEO Title">
                <input {...register('seoTitle')} className="input" placeholder="Your site's SEO title" />
              </Field>
              <Field label="SEO Description">
                <textarea {...register('seoDescription')} rows={2} className="input resize-none" placeholder="Your site's SEO description" />
              </Field>
            </div>
          </Section>

          {/* Save Progress */}
          {isSaving && saveProgress > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-card p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-ink">Saving settings...</span>
                <span className="text-sm font-semibold text-[#F4B400]">{saveProgress}%</span>
              </div>
              <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#F4B400] to-[#F59E0B] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${saveProgress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </motion.div>
          )}

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap items-center gap-3 pt-4 border-t border-line"
          >
            <button 
              type="submit" 
              disabled={isSubmitting || isSaving || !hasUnsavedChanges}
              className={`group inline-flex items-center gap-3 rounded-full px-8 py-4 text-sm font-semibold transition-all duration-300 ${
                hasUnsavedChanges
                  ? 'bg-[#F4B400] text-black hover:scale-105 hover:shadow-2xl hover:shadow-[#F4B400]/25'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              } disabled:opacity-60 disabled:hover:scale-100`}
            >
              {isSubmitting || isSaving ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  {hasUnsavedChanges ? 'Save Settings' : 'No Changes'}
                </>
              )}
            </button>
            
            <button 
              type="button" 
              onClick={handleReset}
              className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-6 py-4 text-sm font-medium text-ink transition-all hover:border-red-400 hover:text-red-500 hover:scale-105 active:scale-95"
            >
              <RefreshCw size={18} />
              Discard Changes
            </button>
          </motion.div>

          {/* Last Saved Indicator */}
          {!hasUnsavedChanges && initialValues && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-xs text-body/40 pt-2"
            >
              <CheckCircle size={14} className="text-emerald-500" />
              All settings are up to date
            </motion.div>
          )}
        </form>

        {/* Save Confirmation Modal */}
        <ConfirmModal
          isOpen={showSaveConfirm}
          onClose={() => setShowSaveConfirm(false)}
          onConfirm={() => {
            const values = watch();
            confirmSave(values);
          }}
          title="Save Settings?"
          message="Are you sure you want to save all the changes you've made to the site settings?"
          confirmText="Save Changes"
          cancelText="Continue Editing"
          type="info"
        />

        {/* Reset Confirmation Modal */}
        <ConfirmModal
          isOpen={showResetConfirm}
          onClose={() => setShowResetConfirm(false)}
          onConfirm={confirmReset}
          title="Discard Changes?"
          message="You have unsaved changes. Are you sure you want to discard them? This action cannot be undone."
          confirmText="Discard Changes"
          cancelText="Keep Editing"
          type="danger"
        />
      </motion.div>
    </AdminLayout>
  );
}