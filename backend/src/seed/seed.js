require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Car = require('../models/Car');
const Settings = require('../models/Settings');

const sampleCars = [
  {
    brand: 'Mahindra', model: 'Thar', variant: 'LX 4WD', bodyType: 'SUV',
    manufacturingYear: 2023, registrationYear: 2023, price: 1650000,
    fuelType: 'Diesel', transmission: 'Automatic', engineCC: 2184, mileage: 15,
    kilometersDriven: 12500, owner: '1st Owner', seats: 4, color: 'Napoli Black',
    location: 'Chennai', branch: 'Chennai OMR', insuranceActive: true, fcValid: true,
    rcStatus: 'Clear', isFeatured: true, status: 'Available',
    features: ['ABS', 'Airbags', 'Touchscreen', 'Cruise Control', 'Parking Sensors'],
    description: 'Well maintained Thar with all service records. Single owner, showroom condition.',
    images: [],
  },
  {
    brand: 'Hyundai', model: 'Creta', variant: 'SX(O) Turbo', bodyType: 'SUV',
    manufacturingYear: 2022, registrationYear: 2022, price: 1780000,
    fuelType: 'Petrol', transmission: 'Automatic', engineCC: 1353, mileage: 16.8,
    kilometersDriven: 21000, owner: '1st Owner', seats: 5, color: 'Phantom Black',
    location: 'Bengaluru', branch: 'Bengaluru Whitefield', insuranceActive: true, fcValid: true,
    rcStatus: 'Clear', isFeatured: true, status: 'Available',
    features: ['Sunroof', 'Navigation', 'Reverse Camera', 'Bluetooth', 'ABS', 'Airbags'],
    description: 'Top-end Creta turbo with panoramic sunroof and ventilated seats.',
    images: [],
  },
  {
    brand: 'Maruti Suzuki', model: 'Swift', variant: 'ZXi', bodyType: 'Hatchback',
    manufacturingYear: 2021, registrationYear: 2021, price: 620000,
    fuelType: 'Petrol', transmission: 'Manual', engineCC: 1197, mileage: 22.5,
    kilometersDriven: 34500, owner: '2nd Owner', seats: 5, color: 'Pearl White',
    location: 'Chennai', branch: 'Chennai OMR', insuranceActive: true, fcValid: true,
    rcStatus: 'Clear', isFeatured: false, status: 'Available',
    features: ['ABS', 'Airbags', 'Bluetooth', 'Power Steering'],
    description: 'Fuel efficient city hatchback, second owner, clean history.',
    images: [],
  },
  {
    brand: 'Toyota', model: 'Fortuner', variant: 'Legender 4x4', bodyType: 'SUV',
    manufacturingYear: 2023, registrationYear: 2023, price: 4650000,
    fuelType: 'Diesel', transmission: 'Automatic', engineCC: 2755, mileage: 12.5,
    kilometersDriven: 8000, owner: '1st Owner', seats: 7, color: 'Attitude Black',
    location: 'Hyderabad', branch: 'Hyderabad Gachibowli', insuranceActive: true, fcValid: true,
    rcStatus: 'Clear', isFeatured: true, status: 'Available',
    features: ['Sunroof', 'Navigation', 'Cruise Control', 'Reverse Camera', 'Airbags', 'ABS'],
    description: 'Flagship Fortuner Legender, almost new, extended warranty active.',
    images: [],
  },
  {
    brand: 'Honda', model: 'City', variant: 'ZX CVT', bodyType: 'Sedan',
    manufacturingYear: 2022, registrationYear: 2022, price: 1395000,
    fuelType: 'Petrol', transmission: 'Automatic', engineCC: 1498, mileage: 18.4,
    kilometersDriven: 17500, owner: '1st Owner', seats: 5, color: 'Radiant Red',
    location: 'Bengaluru', branch: 'Bengaluru Whitefield', insuranceActive: true, fcValid: true,
    rcStatus: 'Clear', isFeatured: false, status: 'Available',
    features: ['Sunroof', 'Touchscreen', 'Cruise Control', 'ABS', 'Airbags'],
    description: 'Top variant City CVT, single owner, dealer serviced.',
    images: [],
  },
  {
    brand: 'Kia', model: 'Seltos', variant: 'GTX+', bodyType: 'SUV',
    manufacturingYear: 2021, registrationYear: 2021, price: 1495000,
    fuelType: 'Diesel', transmission: 'Manual', engineCC: 1493, mileage: 20.8,
    kilometersDriven: 28000, owner: '1st Owner', seats: 5, color: 'Gravity Grey',
    location: 'Chennai', branch: 'Chennai OMR', insuranceActive: true, fcValid: true,
    rcStatus: 'Clear', isFeatured: false, status: 'Reserved',
    features: ['Sunroof', 'Navigation', 'Bluetooth', 'ABS', 'Airbags', 'Parking Sensors'],
    description: 'GTX+ top model with BOSE sound system and ventilated seats.',
    images: [],
  },
  {
    brand: 'MG', model: 'ZS EV', variant: 'Exclusive', bodyType: 'EV',
    manufacturingYear: 2023, registrationYear: 2023, price: 1895000,
    fuelType: 'Electric', transmission: 'Automatic', engineCC: 0, mileage: 461,
    kilometersDriven: 6000, owner: '1st Owner', seats: 5, color: 'Glaze Red',
    location: 'Hyderabad', branch: 'Hyderabad Gachibowli', insuranceActive: true, fcValid: true,
    rcStatus: 'Clear', isFeatured: true, status: 'Available',
    features: ['Sunroof', 'Navigation', 'Cruise Control', 'Touchscreen', 'Airbags'],
    description: 'Nearly new electric SUV, 461km range, home charger included.',
    images: [],
  },
  {
    brand: 'Volkswagen', model: 'Virtus', variant: 'GT Plus DSG', bodyType: 'Sedan',
    manufacturingYear: 2022, registrationYear: 2022, price: 1590000,
    fuelType: 'Petrol', transmission: 'Automatic', engineCC: 1498, mileage: 19.4,
    kilometersDriven: 15000, owner: '1st Owner', seats: 5, color: 'Curcuma Yellow',
    location: 'Bengaluru', branch: 'Bengaluru Whitefield', insuranceActive: true, fcValid: true,
    rcStatus: 'Clear', isFeatured: false, status: 'Available',
    features: ['Sunroof', 'Cruise Control', 'Touchscreen', 'ABS', 'Airbags'],
    description: 'TSI DSG performance sedan, single owner, showroom maintained.',
    images: [],
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB for seeding...');

  const adminEmail = (process.env.SEED_ADMIN_EMAIL || 'admin@BALAJI CARS.com').toLowerCase();
  const existingAdmin = await User.findOne({ email: adminEmail });

  if (!existingAdmin) {
    await User.create({
      name: process.env.SEED_ADMIN_NAME || 'Super Admin',
      email: adminEmail,
      password: process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!',
      role: 'superadmin',
    });
    console.log(`Admin created: ${adminEmail} / ${process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!'}`);
  } else {
    console.log('Admin already exists, skipping.');
  }

  const carCount = await Car.countDocuments();
  if (carCount === 0) {
    await Car.insertMany(sampleCars);
    console.log(`Seeded ${sampleCars.length} sample cars.`);
  } else {
    console.log('Cars already exist, skipping car seed.');
  }

  await Settings.getSingleton();
  console.log('Settings singleton ensured.');

  console.log('Seeding complete.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
