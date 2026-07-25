const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// ✅ CORRECT PATH - User model is at backend/src/models/User.js
const User = require('../src/models/User');

async function fixLogin() {
  try {
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/carconnect');
    console.log('✅ Connected\n');

    const email = 'balajicarstirunelveli@gmail.com';
    const plainPassword = 'admin123';

    // Step 1: Check if user exists
    let user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log('❌ User not found. Creating new user...');
      
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(plainPassword, salt);
      
      user = await User.create({
        name: 'Balaji Cars Admin',
        email: email,
        password: hashedPassword,
        role: 'superadmin',
        isActive: true
      });
      
      console.log('✅ New user created!');
    } else {
      console.log('👤 Existing user found:');
      console.log(`   Name: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Password stored: ${user.password}`);
      console.log(`   Is bcrypt hash? ${user.password.startsWith('$2a$') ? '✅ Yes' : '❌ No'}`);
      
      console.log('\n🔄 Updating password with correct bcrypt hash...');
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(plainPassword, salt);
      
      user.password = hashedPassword;
      user.isActive = true;
      await user.save();
      console.log('✅ Password updated!');
    }

    // Step 2: Verify the password works
    const verified = await User.findOne({ email }).select('+password');
    const isMatch = await bcrypt.compare(plainPassword, verified.password);
    
    console.log('\n🧪 FINAL VERIFICATION:');
    console.log(`   Email: ${verified.email}`);
    console.log(`   Password: ${plainPassword}`);
    console.log(`   Hash: ${verified.password}`);
    console.log(`   Password matches: ${isMatch ? '✅ YES' : '❌ NO'}`);
    
    if (isMatch) {
      console.log('\n🎉 SUCCESS! You can now login!');
      console.log('\n📋 Login with:');
      console.log(`   curl -X POST http://localhost:5000/api/admin/auth/login -H "Content-Type: application/json" -d "{\\"email\\":\\"${email}\\",\\"password\\":\\"${plainPassword}\\"}"`);
    } else {
      console.log('\n❌ Still failing. Please check your authController.js');
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

fixLogin();