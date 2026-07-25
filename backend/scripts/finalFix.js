const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../src/models/User');

async function finalFix() {
  try {
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/carconnect');
    console.log('✅ Connected\n');

    const email = 'balajicarstirunelveli@gmail.com';
    const plainPassword = 'admin123';

    // Delete existing user
    await User.deleteMany({ email });
    console.log('🗑️ Removed existing user\n');

    // Create new user with fresh hash
    const user = new User({
      name: 'Balaji Cars Admin',
      email: email,
      password: plainPassword,
      role: 'superadmin',
      isActive: true
    });

    await user.save();
    console.log('✅ New user created with proper hash!\n');

    // Verify
    const verified = await User.findOne({ email }).select('+password');
    console.log('📋 User details:');
    console.log(`   Name: ${verified.name}`);
    console.log(`   Email: ${verified.email}`);
    console.log(`   Password hash: ${verified.password}`);
    console.log(`   Hash length: ${verified.password.length}`);
    console.log(`   Valid bcrypt hash: ${verified.password.startsWith('$2a$') ? '✅ Yes' : '❌ No'}`);

    // Test compare
    const isMatch = await bcrypt.compare(plainPassword, verified.password);
    console.log(`\n🔐 Password test: ${isMatch ? '✅ SUCCESS' : '❌ FAILED'}`);

    if (isMatch) {
      console.log('\n🎉 SUCCESS! Login with:');
      console.log('   Email: balajicarstirunelveli@gmail.com');
      console.log('   Password: admin123');
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

finalFix();