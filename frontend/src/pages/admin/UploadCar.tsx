import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { UploadCloud, X } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { createCar } from '@/api/cars';

const FEATURES = [
  'ABS', 'Airbags', 'Power Steering', 'Reverse Camera', 'Touchscreen',
  'Bluetooth', 'Sunroof', 'Cruise Control', 'Navigation', 'Parking Sensors',
];

interface CarFormValues {
  brand: string; model: string; variant: string; bodyType: string;
  manufacturingYear: number; registrationYear: number; price: number;
  fuelType: string; transmission: string; engineCC?: number; mileage?: number;
  kilometersDriven: number; owner: string; seats: number; color: string;
  location: string; branch?: string; insuranceValidity?: string; rcStatus: string;
  description?: string; status: string; isFeatured: boolean;
  whatsappNumber?: string; phoneNumber?: string; instagramUrl?: string;
}

export default function UploadCar() {
  const navigate = useNavigate();
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<CarFormValues>({
    defaultValues: { status: 'Available', rcStatus: 'Clear', seats: 5 },
  });

  const addFiles = useCallback((files: FileList | File[]) => {
    const arr = Array.from(files);
    setImages((prev) => [...prev, ...arr]);
    setPreviews((prev) => [...prev, ...arr.map((f) => URL.createObjectURL(f))]);
  }, []);

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleFeature = (f: string) =>
    setSelectedFeatures((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));

  const onSubmit = async (values: CarFormValues) => {
    if (images.length === 0) {
      toast.error('Please add at least one image.');
      return;
    }
    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, val]) => {
        if (val !== undefined && val !== '') formData.append(key, String(val));
      });
      formData.append('features', JSON.stringify(selectedFeatures));
      images.forEach((img) => formData.append('images', img));

      await createCar(formData);
      toast.success('Car uploaded successfully!');
      navigate('/admin/cars');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Upload failed. Please try again.');
    }
  };

  return (
    <AdminLayout title="Upload Car">
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl space-y-4 sm:space-y-6">
        {/* Drag & drop images */}
        <Section title="Images">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => { e.preventDefault(); setDragActive(false); if (e.dataTransfer.files) addFiles(e.dataTransfer.files); }}
            className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-colors ${dragActive ? 'border-emerald bg-emerald/5' : 'border-line'}`}
          >
            <UploadCloud size={26} className="mx-auto text-body mb-2" />
            <p className="text-sm text-body">Drag & drop images here, or</p>
            <label className="inline-block mt-2 text-sm font-medium text-navy cursor-pointer hover:underline">
              <span className="inline-block py-1">browse files</span>
              <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => e.target.files && addFiles(e.target.files)} />
            </label>
          </div>
          {previews.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 sm:gap-3 mt-4">
              {previews.map((src, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center">
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section title="Basic Details">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Brand"><input {...register('brand', { required: true })} className="input" /></Field>
            <Field label="Model"><input {...register('model', { required: true })} className="input" /></Field>
            <Field label="Variant"><input {...register('variant')} className="input" /></Field>
            <Field label="Body Type">
              <select {...register('bodyType', { required: true })} className="input">
                {['SUV', 'Sedan', 'Hatchback', 'Luxury', 'EV', 'MUV', 'Coupe', 'Convertible', 'Pickup'].map((b) => <option key={b}>{b}</option>)}
              </select>
            </Field>
            <Field label="Manufacturing Year"><input type="number" {...register('manufacturingYear', { required: true })} className="input" /></Field>
            <Field label="Registration Year"><input type="number" {...register('registrationYear', { required: true })} className="input" /></Field>
            <Field label="Price (₹)"><input type="number" {...register('price', { required: true })} className="input" /></Field>
            <Field label="Fuel Type">
              <select {...register('fuelType', { required: true })} className="input">
                {['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'].map((f) => <option key={f}>{f}</option>)}
              </select>
            </Field>
            <Field label="Transmission">
              <select {...register('transmission', { required: true })} className="input">
                {['Manual', 'Automatic'].map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Engine CC"><input type="number" {...register('engineCC')} className="input" /></Field>
            <Field label="Mileage"><input type="number" {...register('mileage')} className="input" /></Field>
            <Field label="Kilometers Driven"><input type="number" {...register('kilometersDriven', { required: true })} className="input" /></Field>
            <Field label="Owner">
              <select {...register('owner', { required: true })} className="input">
                {['1st Owner', '2nd Owner', '3rd Owner', '4th+ Owner'].map((o) => <option key={o}>{o}</option>)}
              </select>
            </Field>
            <Field label="Seats"><input type="number" {...register('seats')} className="input" /></Field>
            <Field label="Color"><input {...register('color')} className="input" /></Field>
            <Field label="Location"><input {...register('location', { required: true })} className="input" /></Field>
            <Field label="Insurance Validity"><input type="date" {...register('insuranceValidity')} className="input" /></Field>
            <Field label="RC Status">
              <select {...register('rcStatus')} className="input">
                {['Clear', 'Pending', 'Hypothecated'].map((r) => <option key={r}>{r}</option>)}
              </select>
            </Field>
          </div>
        </Section>

        <Section title="Description">
          <textarea {...register('description')} rows={4} className="input resize-none" placeholder="Condition, service history, highlights..." />
        </Section>

        <Section title="Features">
          <div className="flex flex-wrap gap-2">
            {FEATURES.map((f) => (
              <button
                key={f} type="button" onClick={() => toggleFeature(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${selectedFeatures.includes(f) ? 'bg-navy text-white border-navy' : 'bg-white text-ink border-line'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </Section>

        <Section title="Public Contact Options">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-4">
            <Field label="WhatsApp Number"><input {...register('whatsappNumber')} placeholder="+91XXXXXXXXXX" className="input" /></Field>
            <Field label="Phone Number"><input {...register('phoneNumber')} className="input" /></Field>
            <Field label="Instagram URL"><input {...register('instagramUrl')} className="input" /></Field>
          </div>
        </Section>

        <Section title="Status">
          <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
            <select {...register('status')} className="input w-full sm:max-w-xs">
              {['Available', 'Sold', 'Reserved'].map((s) => <option key={s}>{s}</option>)}
            </select>
            <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
              <input type="checkbox" {...register('isFeatured')} className="accent-emerald w-4 h-4" />
              Mark as Featured Car
            </label>
          </div>
        </Section>

        <button type="submit" disabled={isSubmitting} className="btn-primary bg-emerald hover:bg-emerald-dark disabled:opacity-60 w-full sm:w-auto !h-12 sm:!h-auto">
          {isSubmitting ? 'Uploading...' : 'Upload Car'}
        </button>
      </form>
    </AdminLayout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl sm:rounded-card shadow-card p-4 sm:p-6">
      <h3 className="font-display font-semibold text-ink mb-3 sm:mb-4 text-sm sm:text-base">{title}</h3>
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
