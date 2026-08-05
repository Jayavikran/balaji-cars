import { useCallback, useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { 
  UploadCloud, 
  X, 
  Image as ImageIcon,
  Car,
  Fuel,
  Gauge,
  Calendar,
  MapPin,
  DollarSign,
  Settings,
  Users,
  Phone,
  Instagram,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Plus,
  Trash2,
  Save,
  RefreshCw,
  Shield,
  Award,
  Clock,
  Zap,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from '@/components/admin/AdminLayout';
import { fetchCarByIdOrSlug, updateCar } from '@/api/cars';
import type { CarImage } from '@/types';

const FEATURES = [
  'ABS', 'Airbags', 'Power Steering', 'Reverse Camera', 'Touchscreen',
  'Bluetooth', 'Sunroof', 'Cruise Control', 'Navigation', 'Parking Sensors',
  'Keyless Entry', 'Push Start', 'Leather Seats', 'Climate Control', 'Rear AC',
  'Fog Lights', 'Alloy Wheels', 'Rain Sensor', 'Auto Headlamps', 'Hill Assist',
];

const BODY_TYPES = ['SUV', 'Sedan', 'Hatchback', 'Luxury', 'EV', 'MUV', 'Coupe', 'Convertible', 'Pickup'];
const FUEL_TYPES = ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'];
const TRANSMISSIONS = ['Manual', 'Automatic', 'CVT', 'DCT', 'AMT'];
const OWNER_OPTIONS = ['1st Owner', '2nd Owner', '3rd Owner', '4th+ Owner'];
const RC_STATUS = ['Clear', 'Pending', 'Hypothecated'];
const CAR_STATUS = ['Available', 'Sold', 'Reserved'];

interface CarFormValues {
  brand: string; model: string; variant: string; bodyType: string;
  manufacturingYear: number; registrationYear: number; price: number;
  fuelType: string; transmission: string; engineCC?: number; mileage?: number;
  kilometersDriven: number; owner: string; seats: number; color: string;
  location: string; branch?: string; rcStatus: string;
  description?: string; status: string; isFeatured: boolean;
  whatsappNumber?: string; phoneNumber?: string; instagramUrl?: string;
}

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
  type?: 'warning' | 'danger' | 'info';
}) => {
  const colors = {
    warning: { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'text-amber-500', button: 'bg-amber-500 hover:bg-amber-600' },
    danger: { bg: 'bg-red-50', border: 'border-red-200', icon: 'text-red-500', button: 'bg-red-500 hover:bg-red-600' },
    info: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-500', button: 'bg-blue-500 hover:bg-blue-600' },
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
      <span className="ml-auto text-xs text-body/50">Required fields marked *</span>
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

const ImagePreview = ({ 
  src, 
  onRemove, 
  isNew = false,
  index 
}: { 
  src: string; 
  onRemove: () => void; 
  isNew?: boolean;
  index?: number;
}) => (
  <motion.div 
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    exit={{ scale: 0.8, opacity: 0 }}
    whileHover={{ scale: 1.05 }}
    className="relative aspect-square rounded-2xl overflow-hidden group shadow-md"
  >
    <img src={src} alt={`Preview ${index || ''}`} className="w-full h-full object-cover" />
    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
    {isNew && (
      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-semibold">
        New
      </div>
    )}
    <button 
      type="button" 
      onClick={onRemove} 
      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500"
    >
      <X size={14} />
    </button>
    <span className="absolute bottom-2 left-2 text-[10px] text-white bg-black/50 px-2 py-0.5 rounded-full">
      {index ? `${index + 1}` : ''}
    </span>
  </motion.div>
);

// ============================================
// MAIN COMPONENT
// ============================================
export default function EditCar() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [saveProgress, setSaveProgress] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const { data: car, isLoading, refetch } = useQuery({ 
    queryKey: ['car-edit', id], 
    queryFn: () => fetchCarByIdOrSlug(id),
    staleTime: 30 * 1000,
  });

  const [existingImages, setExistingImages] = useState<CarImage[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isLoadingComplete, setIsLoadingComplete] = useState(false);
  const [initialFormValues, setInitialFormValues] = useState<CarFormValues | null>(null);

  const { register, handleSubmit, reset, watch, formState: { isSubmitting, errors, dirtyFields } } = useForm<CarFormValues>();

  const watchStatus = watch('status');

  // Check for unsaved changes
  useEffect(() => {
    if (initialFormValues && car) {
      const currentValues = watch();
      const hasChanges = JSON.stringify(currentValues) !== JSON.stringify(initialFormValues);
      setHasUnsavedChanges(hasChanges);
    }
  }, [watch, initialFormValues, car]);

  useEffect(() => {
    if (car) {
      const values = {
        brand: car.brand, model: car.model, variant: car.variant, bodyType: car.bodyType,
        manufacturingYear: car.manufacturingYear, registrationYear: car.registrationYear, price: car.price,
        fuelType: car.fuelType, transmission: car.transmission, engineCC: car.engineCC, mileage: car.mileage,
        kilometersDriven: car.kilometersDriven, owner: car.owner, seats: car.seats, color: car.color,
        location: car.location, branch: car.branch, rcStatus: car.rcStatus,
        description: car.description, status: car.status, isFeatured: car.isFeatured,
        whatsappNumber: car.whatsappNumber, phoneNumber: car.phoneNumber, instagramUrl: car.instagramUrl,
      } as CarFormValues;
      
      reset(values);
      setInitialFormValues(values);
      setExistingImages(car.images || []);
      setSelectedFeatures(car.features || []);
      setIsLoadingComplete(true);
    }
  }, [car, reset]);

  // Cleanup previews on unmount
  useEffect(() => {
    return () => {
      newPreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

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

  const addFiles = useCallback((files: FileList | File[]) => {
    const arr = Array.from(files);
    const validImages = arr.filter(f => f.type.startsWith('image/'));
    if (validImages.length === 0) {
      toast.error('Please upload valid image files.');
      return;
    }
    setNewFiles((prev) => [...prev, ...validImages]);
    setNewPreviews((prev) => [...prev, ...validImages.map((f) => URL.createObjectURL(f))]);
    toast.success(`${validImages.length} image(s) added`);
    setHasUnsavedChanges(true);
  }, []);

  const removeExisting = (url: string) => {
    setExistingImages((prev) => prev.filter((img) => img.url !== url));
    toast.success('Image removed');
    setHasUnsavedChanges(true);
  };

  const removeNew = (index: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    setNewPreviews((prev) => prev.filter((_, i) => i !== index));
    setHasUnsavedChanges(true);
  };

  const toggleFeature = (f: string) => {
    setSelectedFeatures((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));
    setHasUnsavedChanges(true);
  };

  const handleSave = async (values: CarFormValues) => {
    if (!hasUnsavedChanges) {
      toast('No changes to save');
      return;
    }
    setShowSaveConfirm(true);
  };

  const confirmSave = async (values: CarFormValues) => {
    setShowSaveConfirm(false);
    setIsSaving(true);
    setSaveProgress(0);

    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, val]) => {
        if (val !== undefined && val !== '') formData.append(key, String(val));
      });
      formData.append('features', JSON.stringify(selectedFeatures));
      formData.append('keepImages', JSON.stringify(existingImages.map((i) => i.url)));
      newFiles.forEach((f) => formData.append('images', f));

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

      await updateCar(id, formData);
      clearInterval(progressInterval);
      setSaveProgress(100);
      
      toast.success('Car updated successfully! 🎉');
      setHasUnsavedChanges(false);
      
      // Update initial values after save
      const updatedValues = { ...values };
      setInitialFormValues(updatedValues);
      
      setTimeout(() => navigate('/admin/cars'), 500);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Update failed. Please try again.');
      setSaveProgress(0);
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    if (hasUnsavedChanges) {
      setShowDiscardConfirm(true);
    } else {
      navigate('/admin/cars');
    }
  };

  const confirmDiscard = () => {
    setShowDiscardConfirm(false);
    setHasUnsavedChanges(false);
    navigate('/admin/cars');
  };

  if (isLoading || !car) {
    return (
      <AdminLayout title="Edit Car">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#F4B400] border-t-transparent mx-auto mb-4" />
            <p className="text-body">Loading car details...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const totalImages = existingImages.length + newFiles.length;

  return (
    <AdminLayout title={`Edit: ${car.brand} ${car.model}`}>
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
                  onClick={() => setShowSaveConfirm(true)}
                  className="rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-amber-600 hover:scale-105"
                >
                  Save Now
                </button>
                <button
                  onClick={handleDiscard}
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
          className="mb-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl p-6 border border-blue-500/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Settings size={18} className="text-blue-500" />
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-500">Edit Vehicle</p>
                {hasUnsavedChanges && (
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                    Unsaved changes
                  </span>
                )}
              </div>
              <h1 className="mt-2 text-2xl font-bold text-ink">
                {car.brand} {car.model} {car.variant}
              </h1>
              <p className="mt-1 text-sm text-body/70">
                Update the details of this vehicle. Changes will be reflected immediately.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-body/50">
              <span className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${car.status === 'Available' ? 'bg-emerald-500' : car.status === 'Sold' ? 'bg-red-500' : 'bg-amber-500'}`} />
                {car.status}
              </span>
              <span className="w-px h-3 bg-line" />
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {car.manufacturingYear}
              </span>
              <span className="w-px h-3 bg-line" />
              <span className="flex items-center gap-1">
                <Gauge size={12} />
                {car.kilometersDriven.toLocaleString()} km
              </span>
            </div>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit(handleSave)} className="space-y-6">
          {/* Images Section */}
          <Section title="Vehicle Images" icon={ImageIcon}>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-4">
              <AnimatePresence>
                {existingImages.map((img) => (
                  <ImagePreview 
                    key={img.url} 
                    src={img.url} 
                    onRemove={() => removeExisting(img.url)} 
                  />
                ))}
                {newPreviews.map((src, i) => (
                  <ImagePreview 
                    key={`new-${i}`} 
                    src={src} 
                    isNew 
                    index={i}
                    onRemove={() => removeNew(i)} 
                  />
                ))}
              </AnimatePresence>
            </div>
            
            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => { e.preventDefault(); setDragActive(false); if (e.dataTransfer.files) addFiles(e.dataTransfer.files); }}
              className={`relative border-2 border-dashed rounded-3xl p-6 text-center transition-all duration-300 ${
                dragActive ? 'border-[#F4B400] bg-[#F4B400]/5 shadow-lg shadow-[#F4B400]/10' : 'border-line hover:border-[#F4B400]/30'
              }`}
            >
              <motion.div
                animate={{ scale: dragActive ? 1.05 : 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center transition-all duration-300 ${
                  dragActive ? 'bg-[#F4B400]/20 text-[#F4B400]' : 'bg-surface text-body/40'
                }`}>
                  <UploadCloud size={26} />
                </div>
                <p className="mt-3 text-sm font-medium text-ink">
                  {dragActive ? 'Drop your images here' : 'Drag & drop to add more images'}
                </p>
                <p className="text-xs text-body/50 mt-1">or</p>
                <label className="inline-block mt-2 text-sm font-semibold text-[#F4B400] cursor-pointer hover:underline">
                  <span className="inline-block py-1 px-3 rounded-full bg-[#F4B400]/10 hover:bg-[#F4B400]/20 transition-colors">
                    Browse files
                  </span>
                  <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => e.target.files && addFiles(e.target.files)} />
                </label>
                <p className="text-xs text-body/30 mt-2">
                  {totalImages} image(s) total • Supports JPG, PNG, WebP
                </p>
              </motion.div>
            </div>
          </Section>

          {/* Basic Details - Same as before */}
          <Section title="Basic Details" icon={Car}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Brand" required>
                <input {...register('brand', { required: 'Brand is required' })} className="input" />
                {errors.brand && <p className="text-xs text-red-500 mt-1">{errors.brand.message}</p>}
              </Field>
              <Field label="Model" required>
                <input {...register('model', { required: 'Model is required' })} className="input" />
                {errors.model && <p className="text-xs text-red-500 mt-1">{errors.model.message}</p>}
              </Field>
              <Field label="Variant">
                <input {...register('variant')} className="input" />
              </Field>
              <Field label="Body Type" required>
                <select {...register('bodyType', { required: 'Body type is required' })} className="input">
                  {BODY_TYPES.map((b) => <option key={b}>{b}</option>)}
                </select>
                {errors.bodyType && <p className="text-xs text-red-500 mt-1">{errors.bodyType.message}</p>}
              </Field>
              <Field label="Manufacturing Year" required>
                <input type="number" {...register('manufacturingYear', { required: 'Year is required' })} className="input" />
                {errors.manufacturingYear && <p className="text-xs text-red-500 mt-1">{errors.manufacturingYear.message}</p>}
              </Field>
              <Field label="Registration Year" required>
                <input type="number" {...register('registrationYear', { required: 'Year is required' })} className="input" />
                {errors.registrationYear && <p className="text-xs text-red-500 mt-1">{errors.registrationYear.message}</p>}
              </Field>
              <Field label="Price (₹)" required>
                <input type="number" {...register('price', { required: 'Price is required' })} className="input" />
                {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price.message}</p>}
              </Field>
              <Field label="Fuel Type" required>
                <select {...register('fuelType', { required: 'Fuel type is required' })} className="input">
                  {FUEL_TYPES.map((f) => <option key={f}>{f}</option>)}
                </select>
                {errors.fuelType && <p className="text-xs text-red-500 mt-1">{errors.fuelType.message}</p>}
              </Field>
              <Field label="Transmission" required>
                <select {...register('transmission', { required: 'Transmission is required' })} className="input">
                  {TRANSMISSIONS.map((t) => <option key={t}>{t}</option>)}
                </select>
                {errors.transmission && <p className="text-xs text-red-500 mt-1">{errors.transmission.message}</p>}
              </Field>
              <Field label="Engine CC">
                <input type="number" {...register('engineCC')} className="input" />
              </Field>
              <Field label="Mileage (km/l)">
                <input type="number" {...register('mileage')} className="input" step="0.1" />
              </Field>
              <Field label="Kilometers Driven" required>
                <input type="number" {...register('kilometersDriven', { required: 'Kilometers is required' })} className="input" />
                {errors.kilometersDriven && <p className="text-xs text-red-500 mt-1">{errors.kilometersDriven.message}</p>}
              </Field>
              <Field label="Owner" required>
                <select {...register('owner', { required: 'Owner is required' })} className="input">
                  {OWNER_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                </select>
                {errors.owner && <p className="text-xs text-red-500 mt-1">{errors.owner.message}</p>}
              </Field>
              <Field label="Seats">
                <input type="number" {...register('seats')} className="input" />
              </Field>
              <Field label="Color">
                <input {...register('color')} className="input" />
              </Field>
              <Field label="Location" required>
                <input {...register('location', { required: 'Location is required' })} className="input" />
                {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location.message}</p>}
              </Field>
              <Field label="RC Status">
                <select {...register('rcStatus')} className="input">
                  {RC_STATUS.map((r) => <option key={r}>{r}</option>)}
                </select>
              </Field>
            </div>
          </Section>

          {/* Description */}
          <Section title="Description" icon={Settings}>
            <textarea 
              {...register('description')} 
              rows={4} 
              className="input resize-none" 
              placeholder="Describe the vehicle condition, service history, highlights, and any additional details..."
            />
          </Section>

          {/* Features */}
          <Section title="Features" icon={Sparkles}>
            <div className="flex flex-wrap gap-2">
              {FEATURES.map((f) => (
                <motion.button
                  key={f}
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleFeature(f)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-300 ${
                    selectedFeatures.includes(f) 
                      ? 'bg-[#F4B400] text-black border-[#F4B400] shadow-lg shadow-[#F4B400]/25' 
                      : 'bg-white text-ink border-line hover:border-[#F4B400]/30'
                  }`}
                >
                  {f}
                </motion.button>
              ))}
            </div>
            <p className="text-xs text-body/40 mt-3">
              {selectedFeatures.length} feature(s) selected
            </p>
          </Section>

          {/* Contact Options */}
          <Section title="Contact Options" icon={Phone}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="WhatsApp Number">
                <input {...register('whatsappNumber')} placeholder="+91XXXXXXXXXX" className="input" />
              </Field>
              <Field label="Phone Number">
                <input {...register('phoneNumber')} placeholder="+91XXXXXXXXXX" className="input" />
              </Field>
              <Field label="Instagram URL">
                <input {...register('instagramUrl')} placeholder="https://instagram.com/..." className="input" />
              </Field>
            </div>
          </Section>

          {/* Status */}
          <Section title="Status & Visibility" icon={AlertCircle}>
            <div className="flex flex-wrap items-center gap-4">
              <Field label="Status">
                <select {...register('status')} className="input w-full sm:w-48">
                  {CAR_STATUS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </Field>
              <label className="flex items-center gap-2 text-sm text-ink cursor-pointer mt-4 sm:mt-0">
                <input type="checkbox" {...register('isFeatured')} className="w-4 h-4 rounded border-line text-[#F4B400] focus:ring-[#F4B400]/20" />
                <span className="flex items-center gap-1">
                  <Sparkles size={14} className="text-[#F4B400]" />
                  Mark as Featured Car
                </span>
              </label>
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
                <span className="text-sm font-medium text-ink">Saving changes...</span>
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
                  {hasUnsavedChanges ? 'Save Changes' : 'No Changes'}
                </>
              )}
            </button>
            
            <button 
              type="button" 
              onClick={handleDiscard}
              className="inline-flex items-center rounded-full border border-line bg-white px-6 py-4 text-sm font-medium text-ink transition-all hover:border-red-400 hover:text-red-500 hover:scale-105 active:scale-95"
            >
              Discard Changes
            </button>
            
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm text-body/50 transition-all hover:text-body hover:bg-surface"
            >
              <RefreshCw size={16} />
              Reset
            </button>
          </motion.div>
        </form>

        {/* Save Confirmation Modal */}
        <ConfirmModal
          isOpen={showSaveConfirm}
          onClose={() => setShowSaveConfirm(false)}
          onConfirm={() => {
            const values = watch();
            confirmSave(values);
          }}
          title="Save Changes?"
          message="Are you sure you want to save all the changes you've made to this vehicle?"
          confirmText="Save Changes"
          cancelText="Continue Editing"
          type="info"
        />

        {/* Discard Confirmation Modal */}
        <ConfirmModal
          isOpen={showDiscardConfirm}
          onClose={() => setShowDiscardConfirm(false)}
          onConfirm={confirmDiscard}
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