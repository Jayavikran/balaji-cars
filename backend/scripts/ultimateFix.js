const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Use the correct path
const User = require('../src/models/User');

async function ultimateFix() {
  try {
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/carconnect');
    console.log('✅ Connected\n');

    const email = 'balajicarstirunelveli@gmail.com';
    const plainPassword = 'admin123';

    // 1. Delete ALL users with this email
    const deleted = await User.deleteMany({ email });
    console.log(`🗑️ Deleted ${deleted.deletedCount} user(s)\n`);

    // 2. Create a new user using the model (this triggers the pre-save hook)
    console.log('🔄 Creating new user with model...');
    const user = new User({
      name: 'Balaji Cars Admin',
      email: email,
      password: plainPassword,
      role: 'superadmin',
      isActive: true
    });

    await user.save();
    console.log('✅ User saved successfully!\n');

    // 3. Retrieve the user with password
    const savedUser = await User.findOne({ email }).select('+password');
    
    console.log('📋 USER IN DATABASE:');
    console.log(`   ID: ${savedUser._id}`);
    console.log(`   Name: ${savedUser.name}`);
    console.log(`   Email: ${savedUser.email}`);
    console.log(`   Role: ${savedUser.role}`);
    console.log(`   Active: ${savedUser.isActive}`);
    console.log(`   Password hash: ${savedUser.password}`);
    console.log(`   Hash length: ${savedUser.password.length}`);
    console.log(`   Starts with $2a$: ${savedUser.password.startsWith('$2a$') ? '✅ YES' : '❌ NO'}`);

    // 4. Test bcrypt directly
    console.log('\n🔐 Testing bcrypt.compare directly:');
    const isMatch = await bcrypt.compare(plainPassword, savedUser.password);
    console.log(`   Password: "${plainPassword}"`);
    console.log(`   Result: ${isMatch ? '✅ MATCHES' : '❌ DOES NOT MATCH'}`);

    // 5. Test the comparePassword method
    console.log('\n🔐 Testing comparePassword method:');
    const methodResult = await savedUser.comparePassword(plainPassword);
    console.log(`   Result: ${methodResult ? '✅ MATCHES' : '❌ DOES NOT MATCH'}`);

    if (isMatch && methodResult) {
      console.log('\n🎉🎉🎉 SUCCESS! Everything works!');
      console.log('\n📋 Login credentials:');
      console.log(`   Email: ${email}`);
      console.log(`   Password: ${plainPassword}`);
      console.log('\n🧪 Test with curl:');
      console.log(`curl -X POST http://localhost:5000/api/admin/auth/login -H "Content-Type: application/json" -d "{\\"email\\":\\"${email}\\",\\"password\\":\\"${plainPassword}\\"}"`);
    } else {
      console.log('\n❌ Still having issues. Let\'s try a manual hash.');
      
      // Generate a known working hash
      const salt = await bcrypt.genSalt(12);
      const knownHash = await bcrypt.hash(plainPassword, salt);
      console.log(`\n📝 Use this hash in MongoDB Compass:`);
      console.log(knownHash);
      
      // Update the user with this hash
      savedUser.password = knownHash;
      await savedUser.save();
      console.log('\n✅ Updated with manual hash. Testing again...');
      
      const testAgain = await bcrypt.compare(plainPassword, knownHash);
      console.log(`   Manual hash test: ${testAgain ? '✅ WORKS' : '❌ FAILS'}`);
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

ultimateFix();
