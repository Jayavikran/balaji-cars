const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../src/models/User');

async function createUserAtlas() {
  try {
    // Use the MONGO_URI from .env (Atlas)
    const uri = process.env.MONGO_URI;
    console.log('📡 Connecting to MongoDB Atlas...');
    console.log(`   Database: carconnect`);
    await mongoose.connect(uri);
    console.log('✅ Connected to Atlas!\n');

    // Check which database we're in
    const dbName = mongoose.connection.db.databaseName;
    console.log(`📊 Connected to database: ${dbName}`);

    // Delete existing user
    const deleted = await User.deleteMany({ email: 'balajicarstirunelveli@gmail.com' });
    console.log(`🗑️ Removed ${deleted.deletedCount} existing user(s)\n`);

    // Create new user
    console.log('🔄 Creating new user...');
    const user = new User({
      name: 'Balaji Cars Admin',
      email: 'balajicarstirunelveli@gmail.com',
      password: 'admin123',
      role: 'superadmin',
      isActive: true
    });

    await user.save();
    console.log('✅ User created successfully!\n');

    // Verify
    const saved = await User.findOne({ email: 'balajicarstirunelveli@gmail.com' }).select('+password');
    console.log('📋 USER IN ATLAS DATABASE:');
    console.log(`   Database: ${dbName}`);
    console.log(`   Name: ${saved.name}`);
    console.log(`   Email: ${saved.email}`);
    console.log(`   Role: ${saved.role}`);
    console.log(`   Password hash: ${saved.password}`);
    console.log(`   Hash length: ${saved.password.length}`);

    // Test password
    const isMatch = await bcrypt.compare('admin123', saved.password);
    console.log(`\n🔐 Password test: ${isMatch ? '✅ SUCCESS' : '❌ FAILED'}`);

    if (isMatch) {
      console.log('\n🎉 SUCCESS! Login with:');
      console.log('   Email: balajicarstirunelveli@gmail.com');
      console.log('   Password: admin123');
      console.log('\n📋 Test with curl:');
      console.log('curl -X POST http://localhost:5000/api/admin/auth/login -H "Content-Type: application/json" -d "{\\"email\\":\\"balajicarstirunelveli@gmail.com\\",\\"password\\":\\"admin123\\"}"');
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

createUserAtlas();