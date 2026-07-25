const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String },
  },
  { _id: false }
);

const carSchema = new mongoose.Schema(
  {
    brand: { type: String, required: true, trim: true, index: true },
    model: { type: String, required: true, trim: true, index: true },
    variant: { type: String, trim: true },
    bodyType: {
      type: String,
      enum: ['SUV', 'Sedan', 'Hatchback', 'Luxury', 'EV', 'MUV', 'Coupe', 'Convertible', 'Pickup'],
      default: 'Hatchback',
      index: true,
    },
    manufacturingYear: { type: Number, required: true, index: true },
    registrationYear: { type: Number, required: true },
    price: { type: Number, required: true, index: true },
    previousPrice: { type: Number }, // optional — set when price is reduced, powers the "Price Dropped" badge
    fuelType: {
      type: String,
      enum: ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'],
      required: true,
      index: true,
    },
    transmission: {
      type: String,
      enum: ['Manual', 'Automatic'],
      required: true,
      index: true,
    },
    engineCC: { type: Number },
    mileage: { type: Number }, // km/l or km/kWh
    kilometersDriven: { type: Number, required: true, index: true },
    owner: {
      type: String,
      enum: ['1st Owner', '2nd Owner', '3rd Owner', '4th+ Owner'],
      default: '1st Owner',
    },
    seats: { type: Number, default: 5 },
    color: { type: String, trim: true },
    location: { type: String, trim: true, index: true },
    branch: { type: String, trim: true },
    insuranceValidity: { type: Date },
    insuranceActive: { type: Boolean, default: true },
    fcValid: { type: Boolean, default: true }, // Fitness Certificate
    rcStatus: {
      type: String,
      enum: ['Clear', 'Pending', 'Hypothecated'],
      default: 'Clear',
    },
    description: { type: String, trim: true },
    features: [
      {
        type: String,
        enum: [
          'ABS',
          'Airbags',
          'Power Steering',
          'Reverse Camera',
          'Touchscreen',
          'Bluetooth',
          'Sunroof',
          'Cruise Control',
          'Navigation',
          'Parking Sensors',
        ],
      },
    ],
    images: [imageSchema],
    status: {
      type: String,
      enum: ['Available', 'Sold', 'Reserved'],
      default: 'Available',
      index: true,
    },
    isFeatured: { type: Boolean, default: false, index: true },
    views: { type: Number, default: 0 },

    // Public contact overrides (optional; falls back to global Settings)
    whatsappNumber: { type: String, trim: true },
    phoneNumber: { type: String, trim: true },
    instagramUrl: { type: String, trim: true },

    // SEO
    slug: { type: String, unique: true, sparse: true, index: true },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    priceReducedAt: { type: Date },

    // Populated only once a sale is completed via the "Complete Sale" flow
    // (never set by a plain status change) — powers revenue/profit analytics.
    sale: {
      soldPrice: { type: Number },
      purchasePrice: { type: Number },
      profit: { type: Number }, // soldPrice - purchasePrice, computed server-side
      buyerName: { type: String, trim: true },
      buyerPhone: { type: String, trim: true },
      saleDate: { type: Date, index: true },
      paymentMethod: {
        type: String,
        enum: ['Cash', 'Bank Transfer', 'UPI', 'Cheque', 'Finance/Loan', 'Other'],
      },
      financeCompany: { type: String, trim: true },
      salesExecutive: { type: String, trim: true },
      notes: { type: String, trim: true },
    },
  },
  { timestamps: true }
);

// Compound text index for instant search across brand/model/variant/location
carSchema.index({
  brand: 'text',
  model: 'text',
  variant: 'text',
  location: 'text',
});

carSchema.pre('save', function generateSlug(next) {
  if (this.isModified('brand') || this.isModified('model') || this.isModified('variant') || !this.slug) {
    const base = `${this.brand}-${this.model}-${this.variant || ''}-${this.manufacturingYear}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    this.slug = `${base}-${this._id.toString().slice(-6)}`;
  }
  next();
});

module.exports = mongoose.model('Car', carSchema);
