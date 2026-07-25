const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');

async function createFreshAdmin() {
  try {
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/carconnect');
    console.log('✅ Connected\n');

    // Delete ALL existing users with this email
    const deleted = await User.deleteMany({ email: 'balajicarstirunelveli@gmail.com' });
    console.log(`🗑️ Removed ${deleted.deletedCount} existing user(s)\n`);

    // Generate a fresh bcrypt hash
    const plainPassword = 'admin123';
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);
    
    console.log('🔑 Generated new hash:');
    console.log(`   ${hashedPassword}\n`);

    // Create admin user
    const admin = await User.create({
      name: 'Balaji Cars Admin',
      email: 'balajicarstirunelveli@gmail.com',
      password: hashedPassword,
      role: 'superadmin',
      isActive: true
    });

    console.log('✅ Admin user created!');
    console.log(`   Name: ${admin.name}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   Active: ${admin.isActive}`);
    console.log(`   ID: ${admin._id}`);
    console.log(`   Password hash: ${admin.password}`);

    // Verify it works
    const found = await User.findOne({ email: 'balajicarstirunelveli@gmail.com' }).select('+password');
    const isMatch = await bcrypt.compare(plainPassword, found.password);
    
    console.log(`\n🧪 Verification: ${isMatch ? '✅ SUCCESS - Password works!' : '❌ FAILED'}`);

    if (isMatch) {
      console.log('\n🎉 You can now login with:');
      console.log('   Email: balajicarstirunelveli@gmail.com');
      console.log('   Password: admin123');
    }

    await mongoose.disconnect();
    console.log('\n✅ Done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

createFreshAdmin();