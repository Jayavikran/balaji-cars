const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    companyName: { type: String, default: 'BALAJI CARS' },
    companyLogo: { type: String, default: '' },
    whatsappNumber: { type: String, default: '' },
    phoneNumber: { type: String, default: '' },
    email: { type: String, default: '' },
    address: { type: String, default: '' },
    googleMapsLink: { type: String, default: '' },
    facebookUrl: { type: String, default: '' },
    instagramUrl: { type: String, default: '' },
    youtubeUrl: { type: String, default: '' },
    seoTitle: { type: String, default: 'BALAJI CARS - Premium Used Cars' },
    seoDescription: { type: String, default: '' },
    seoKeywords: { type: String, default: '' },
  },
  { timestamps: true }
);

// Enforce a single settings document via a fixed singleton id.
settingsSchema.statics.getSingleton = async function getSingleton() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);
