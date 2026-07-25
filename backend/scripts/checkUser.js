const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');

async function checkUser() {
  try {
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/carconnect');
    console.log('✅ Connected\n');

    // Find the user
    const user = await User.findOne({ email: 'balajicarstirunelveli@gmail.com' }).select('+password');
    
    if (!user) {
      console.log('❌ User NOT found in database!');
      console.log('\n📋 All users in database:');
      const allUsers = await User.find({}).select('email name');
      allUsers.forEach(u => {
        console.log(`   - ${u.email} (${u.name})`);
      });
      process.exit(0);
    }

    console.log('👤 USER FOUND:');
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Active: ${user.isActive}`);
    console.log(`   Password field exists: ${user.password ? '✅ Yes' : '❌ No'}`);
    console.log(`   Password length: ${user.password ? user.password.length : 0}`);
    console.log(`   Password starts with '$2a$': ${user.password && user.password.startsWith('$2a$') ? '✅ Yes' : '❌ No'}`);
    console.log(`   Full password hash: ${user.password}`);

    // Test the password
    const testPassword = 'admin123';
    console.log(`\n🔐 Testing password: "${testPassword}"`);
    
    try {
      const isMatch = await bcrypt.compare(testPassword, user.password);
      console.log(`   Result: ${isMatch ? '✅ MATCHES' : '❌ DOES NOT MATCH'}`);
      
      if (!isMatch) {
        console.log('\n💡 The password hash doesn\'t match. Let\'s generate a new one.');
        
        // Generate a new hash
        const salt = await bcrypt.genSalt(12);
        const newHash = await bcrypt.hash(testPassword, salt);
        console.log(`\n📝 New hash for "${testPassword}":`);
        console.log(newHash);
        console.log(`\n📋 Update the user with this hash using MongoDB Compass`);
      }
    } catch (error) {
      console.log('❌ Error testing password:', error.message);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

checkUser();