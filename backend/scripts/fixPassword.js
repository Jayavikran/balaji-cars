const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../src/models/User');

async function fixPassword() {
  try {
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/carconnect');
    console.log('✅ Connected\n');

    const email = 'balajicarstirunelveli@gmail.com';
    const plainPassword = 'admin123';

    // Find the user
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log('❌ User not found! Creating new user...');
      
      // Create user using the model - this will trigger the pre-save hook
      const newUser = new User({
        name: 'Balaji Cars Admin',
        email: email,
        password: plainPassword,
        role: 'superadmin',
        isActive: true
      });
      
      await newUser.save();
      console.log('✅ New user created with hashed password!');
      
      // Verify
      const verified = await User.findOne({ email }).select('+password');
      const isMatch = await bcrypt.compare(plainPassword, verified.password);
      console.log(`\n🧪 Password test: ${isMatch ? '✅ SUCCESS' : '❌ FAILED'}`);
      
      if (isMatch) {
        console.log('\n🎉 SUCCESS! Login with:');
        console.log('   Email: balajicarstirunelveli@gmail.com');
        console.log('   Password: admin123');
      }
      
      await mongoose.disconnect();
      process.exit(0);
    }

    console.log('👤 User found, fixing password...\n');

    // Option 1: Use the model's pre-save hook (Recommended)
    user.password = plainPassword; // This triggers the pre-save hook
    await user.save();
    console.log('✅ Password updated using model pre-save hook!');

    // Verify
    const verified = await User.findOne({ email }).select('+password');
    const isMatch = await bcrypt.compare(plainPassword, verified.password);
    
    console.log(`\n🧪 Verification: ${isMatch ? '✅ SUCCESS - Password works!' : '❌ FAILED'}`);
    
    if (isMatch) {
      console.log('\n🎉 SUCCESS! You can now login with:');
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

fixPassword();