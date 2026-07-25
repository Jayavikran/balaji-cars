export type FuelType = 'Petrol' | 'Diesel' | 'CNG' | 'Electric' | 'Hybrid';
export type Transmission = 'Manual' | 'Automatic';
export type BodyType = 'SUV' | 'Sedan' | 'Hatchback' | 'Luxury' | 'EV' | 'MUV' | 'Coupe' | 'Convertible' | 'Pickup';
export type CarStatus = 'Available' | 'Sold' | 'Reserved';
export type Feature =
  | 'ABS' | 'Airbags' | 'Power Steering' | 'Reverse Camera' | 'Touchscreen'
  | 'Bluetooth' | 'Sunroof' | 'Cruise Control' | 'Navigation' | 'Parking Sensors';

export interface CarImage {
  url: string;
  publicId?: string;
}

export interface CarSale {
  soldPrice: number;
  purchasePrice?: number;
  profit?: number;
  buyerName: string;
  buyerPhone?: string;
  saleDate: string;
  paymentMethod?: 'Cash' | 'Bank Transfer' | 'UPI' | 'Cheque' | 'Finance/Loan' | 'Other';
  financeCompany?: string;
  salesExecutive?: string;
  notes?: string;
}

export interface Car {
  _id: string;
  brand: string;
  model: string;
  variant?: string;
  bodyType: BodyType;
  manufacturingYear: number;
  registrationYear: number;
  price: number;
  previousPrice?: number;
  priceReducedAt?: string;
  fuelType: FuelType;
  transmission: Transmission;
  engineCC?: number;
  mileage?: number;
  kilometersDriven: number;
  owner: string;
  seats: number;
  color?: string;
  location: string;
  branch?: string;
  insuranceValidity?: string;
  insuranceActive: boolean;
  fcValid: boolean;
  rcStatus: 'Clear' | 'Pending' | 'Hypothecated';
  description?: string;
  features: Feature[];
  images: CarImage[];
  status: CarStatus;
  isFeatured: boolean;
  views: number;
  whatsappNumber?: string;
  phoneNumber?: string;
  instagramUrl?: string;
  slug: string;
  sale?: CarSale;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'superadmin';
  avatar?: string;
  lastLoginAt?: string;
}

export interface Enquiry {
  _id: string;
  customerName: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  car?: Pick<Car, '_id' | 'brand' | 'model' | 'variant' | 'price' | 'images'>;
  carSnapshot?: { brand: string; model: string; variant?: string; price: number };
  message?: string;
  status: 'New' | 'Contacted' | 'In Progress' | 'Closed';
  createdAt: string;
}

export interface SiteSettings {
  companyName: string;
  companyLogo: string;
  whatsappNumber: string;
  phoneNumber: string;
  email: string;
  address: string;
  googleMapsLink: string;
  facebookUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
  seoTitle: string;
  seoDescription: string;
}

export interface RevenueBucket {
  revenue: number;
  profit: number;
  count: number;
}

export interface DashboardStats {
  totalCars: number;
  availableCars: number;
  soldCars: number;
  reservedCars: number;
  featuredCars: number;
}
