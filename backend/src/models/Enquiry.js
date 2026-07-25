const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    whatsapp: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    car: { type: mongoose.Schema.Types.ObjectId, ref: 'Car' },
    carSnapshot: {
      brand: String,
      model: String,
      variant: String,
      price: Number,
    },
    message: { type: String, trim: true },
    status: {
      type: String,
      enum: ['New', 'Contacted', 'In Progress', 'Closed'],
      default: 'New',
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Enquiry', enquirySchema);
