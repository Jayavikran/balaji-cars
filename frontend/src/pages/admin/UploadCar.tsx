import { useCallback, useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from '@/components/admin/AdminLayout';
import { createCar } from '@/api/cars';

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
  location: string; branch?: string; insuranceValidity?: string; rcStatus: string;
  description?: string; status: string; isFeatured: boolean;
  whatsappNumber?: string; phoneNumber?: string; instagramUrl?: string;
}

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

const ImageUploadZone = ({ 
  onDrop, 
  onBrowse, 
  isDragActive, 
  setIsDragActive 
}: { 
  onDrop: (files: FileList) => void;
  onBrowse: (files: FileList) => void;
  isDragActive: boolean;
  setIsDragActive: (active: boolean) => void;
}) => (
  <div
    onDragOver={(e) => { e.preventDefault(); setIsDragActive(true); }}
    onDragLeave={() => setIsDragActive(false)}
    onDrop={(e) => { e.preventDefault(); setIsDragActive(false); if (e.dataTransfer.files) onDrop(e.dataTransfer.files); }}
    className={`relative border-2 border-dashed rounded-3xl p-8 text-center transition-all duration-300 ${
      isDragActive ? 'border-[#F4B400] bg-[#F4B400]/5 shadow-lg shadow-[#F4B400]/10' : 'border-line hover:border-[#F4B400]/30'
    }`}
  >
    <motion.div
      animate={{ scale: isDragActive ? 1.05 : 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center transition-all duration-300 ${
        isDragActive ? 'bg-[#F4B400]/20 text-[#F4B400]' : 'bg-surface text-body/40'
      }`}>
        <UploadCloud size={28} />
      </div>
      <p className="mt-3 text-sm font-medium text-ink">
        {isDragActive ? 'Drop your images here' : 'Drag & drop images here'}
      </p>
      <p className="text-xs text-body/50 mt-1">or</p>
      <label className="inline-block mt-2 text-sm font-semibold text-[#F4B400] cursor-pointer hover:underline">
        <span className="inline-block py-1 px-3 rounded-full bg-[#F4B400]/10 hover:bg-[#F4B400]/20 transition-colors">
          Browse files
        </span>
        <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => e.target.files && onBrowse(e.target.files)} />
      </label>
      <p className="text-xs text-body/30 mt-2">Supports JPG, PNG, WebP • Max 5MB each</p>
    </motion.div>
  </div>
);

// ============================================
// MAIN COMPONENT
// ============================================
export default function UploadCar() {
  const navigate = useNavigate();
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  const { register, handleSubmit, watch, formState: { isSubmitting, errors } } = useForm<CarFormValues>({
    defaultValues: { 
      status: 'Available', 
      rcStatus: 'Clear', 
      seats: 5,
      isFeatured: false,
    },
  });

  const watchStatus = watch('status');

  const addFiles = useCallback((files: FileList | File[]) => {
    const arr = Array.from(files);
    const validImages = arr.filter(f => f.type.startsWith('image/'));
    if (validImages.length === 0) {
      toast.error('Please upload valid image files.');
      return;
    }
    setImages((prev) => [...prev, ...validImages]);
    setPreviews((prev) => [...prev, ...validImages.map((f) => URL.createObjectURL(f))]);
    toast.success(`${validImages.length} image(s) added`);
  }, []);

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleFeature = (f: string) =>
    setSelectedFeatures((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));

  // Cleanup previews on unmount
  useEffect(() => {
    return () => {
      previews.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  const onSubmit = async (values: CarFormValues) => {
    if (images.length === 0) {
      toast.error('Please add at least one image.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, val]) => {
        if (val !== undefined && val !== '') formData.append(key, String(val));
      });
      formData.append('features', JSON.stringify(selectedFeatures));
      images.forEach((img) => formData.append('images', img));

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      await createCar(formData);
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      toast.success('Car uploaded successfully! 🎉');
      setTimeout(() => navigate('/admin/cars'), 500);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Upload failed. Please try again.');
      setUploadProgress(0);
      setIsUploading(false);
    }
  };

  return (
    <AdminLayout title="Upload Car">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-gradient-to-r from-[#F4B400]/10 to-[#F4B400]/5 rounded-3xl p-6 border border-[#F4B400]/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-[#F4B400]" />
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#F4B400]">Add New Vehicle</p>
              </div>
              <h1 className="mt-2 text-2xl font-bold text-ink">Upload a Car</h1>
              <p className="mt-1 text-sm text-body/70">
                Fill in the details below to add a new vehicle to your inventory.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-body/50">
              <span className="flex items-center gap-1">
                <CheckCircle size={14} className="text-emerald-500" />
                All fields marked * are required
              </span>
            </div>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Images Section */}
          <Section title="Vehicle Images" icon={ImageIcon}>
            <ImageUploadZone 
              onDrop={addFiles}
              onBrowse={addFiles}
              isDragActive={dragActive}
              setIsDragActive={setDragActive}
            />
            
            {previews.length > 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-3 sm:grid-cols-6 gap-3 mt-4"
              >
                <AnimatePresence>
                  {previews.map((src, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      whileHover={{ scale: 1.05 }}
                      className="relative aspect-square rounded-2xl overflow-hidden group shadow-md"
                    >
                      <img src={src} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <button 
                        type="button" 
                        onClick={() => removeImage(i)} 
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500"
                      >
                        <X size={14} />
                      </button>
                      <span className="absolute bottom-2 left-2 text-[10px] text-white bg-black/50 px-2 py-0.5 rounded-full">
                        {i + 1}
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
            
            <p className="text-xs text-body/40 mt-3">
              {images.length} image(s) uploaded • {images.length === 0 && 'Upload at least 1 image'}
            </p>
          </Section>

          {/* Basic Details */}
          <Section title="Basic Details" icon={Car}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Brand" required>
                <input {...register('brand', { required: 'Brand is required' })} className="input" placeholder="e.g., Toyota" />
                {errors.brand && <p className="text-xs text-red-500 mt-1">{errors.brand.message}</p>}
              </Field>
              <Field label="Model" required>
                <input {...register('model', { required: 'Model is required' })} className="input" placeholder="e.g., Camry" />
                {errors.model && <p className="text-xs text-red-500 mt-1">{errors.model.message}</p>}
              </Field>
              <Field label="Variant">
                <input {...register('variant')} className="input" placeholder="e.g., VXI" />
              </Field>
              <Field label="Body Type" required>
                <select {...register('bodyType', { required: 'Body type is required' })} className="input">
                  <option value="">Select body type</option>
                  {BODY_TYPES.map((b) => <option key={b}>{b}</option>)}
                </select>
                {errors.bodyType && <p className="text-xs text-red-500 mt-1">{errors.bodyType.message}</p>}
              </Field>
              <Field label="Manufacturing Year" required>
                <input type="number" {...register('manufacturingYear', { required: 'Year is required', min: 1990, max: new Date().getFullYear() })} className="input" placeholder="YYYY" />
                {errors.manufacturingYear && <p className="text-xs text-red-500 mt-1">{errors.manufacturingYear.message}</p>}
              </Field>
              <Field label="Registration Year" required>
                <input type="number" {...register('registrationYear', { required: 'Year is required' })} className="input" placeholder="YYYY" />
                {errors.registrationYear && <p className="text-xs text-red-500 mt-1">{errors.registrationYear.message}</p>}
              </Field>
              <Field label="Price (₹)" required>
                <input type="number" {...register('price', { required: 'Price is required', min: 1 })} className="input" placeholder="Enter price in rupees" />
                {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price.message}</p>}
              </Field>
              <Field label="Fuel Type" required>
                <select {...register('fuelType', { required: 'Fuel type is required' })} className="input">
                  <option value="">Select fuel type</option>
                  {FUEL_TYPES.map((f) => <option key={f}>{f}</option>)}
                </select>
                {errors.fuelType && <p className="text-xs text-red-500 mt-1">{errors.fuelType.message}</p>}
              </Field>
              <Field label="Transmission" required>
                <select {...register('transmission', { required: 'Transmission is required' })} className="input">
                  <option value="">Select transmission</option>
                  {TRANSMISSIONS.map((t) => <option key={t}>{t}</option>)}
                </select>
                {errors.transmission && <p className="text-xs text-red-500 mt-1">{errors.transmission.message}</p>}
              </Field>
              <Field label="Engine CC">
                <input type="number" {...register('engineCC')} className="input" placeholder="e.g., 1500" />
              </Field>
              <Field label="Mileage (km/l)">
                <input type="number" {...register('mileage')} className="input" placeholder="e.g., 18.5" step="0.1" />
              </Field>
              <Field label="Kilometers Driven" required>
                <input type="number" {...register('kilometersDriven', { required: 'Kilometers is required' })} className="input" placeholder="e.g., 25000" />
                {errors.kilometersDriven && <p className="text-xs text-red-500 mt-1">{errors.kilometersDriven.message}</p>}
              </Field>
              <Field label="Owner" required>
                <select {...register('owner', { required: 'Owner is required' })} className="input">
                  <option value="">Select owner</option>
                  {OWNER_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                </select>
                {errors.owner && <p className="text-xs text-red-500 mt-1">{errors.owner.message}</p>}
              </Field>
              <Field label="Seats">
                <input type="number" {...register('seats')} className="input" placeholder="5" />
              </Field>
              <Field label="Color">
                <input {...register('color')} className="input" placeholder="e.g., Red" />
              </Field>
              <Field label="Location" required>
                <input {...register('location', { required: 'Location is required' })} className="input" placeholder="City, State" />
                {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location.message}</p>}
              </Field>
              <Field label="Insurance Validity">
                <input type="date" {...register('insuranceValidity')} className="input" />
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

          {/* Upload Progress */}
          {isUploading && uploadProgress > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-card p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-ink">Uploading...</span>
                <span className="text-sm font-semibold text-[#F4B400]">{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#F4B400] to-[#F59E0B] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </motion.div>
          )}

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap items-center gap-4 pt-4"
          >
            <button 
              type="submit" 
              disabled={isSubmitting || isUploading} 
              className="group inline-flex items-center gap-3 rounded-full bg-[#F4B400] px-8 py-4 text-sm font-semibold text-black transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#F4B400]/25 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
            >
              {isSubmitting || isUploading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                  Uploading...
                </>
              ) : (
                <>
                  <UploadCloud size={18} />
                  Upload Car
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
            <button 
              type="button" 
              onClick={() => navigate('/admin/cars')}
              className="inline-flex items-center rounded-full border border-line bg-white px-6 py-4 text-sm font-medium text-ink transition-all hover:border-[#F4B400] hover:scale-105 active:scale-95"
            >
              Cancel
            </button>
          </motion.div>
        </form>
      </motion.div>
    </AdminLayout>
  );
}