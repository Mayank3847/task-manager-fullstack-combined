import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

/**
 * Tests MongoDB Atlas connection with detailed diagnostics
 */
const testAtlasConnection = async () => {
  console.log('🧪 Testing MongoDB Atlas Connection...\n');
  console.log('═══════════════════════════════════════════════════════\n');

  // Check if MONGODB_URI exists
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error('❌ ERROR: MONGODB_URI not found in .env file\n');
    console.error('📋 Please ensure you have a .env file with:');
    console.error('   MONGODB_URI=mongodb+srv://...\n');
    process.exit(1);
  }

  // Display connection details (hide password)
  console.log('📋 Connection Configuration:');
  const maskedUri = mongoUri.replace(/:[^:@]+@/, ':****@');
  console.log(`   URI: ${maskedUri}`);
  console.log('');

  try {
    console.log('⏳ Attempting to connect to MongoDB Atlas...\n');
    
    // Connection options with timeout
    const options = {
      serverSelectionTimeoutMS: 10000, // 10 second timeout
      socketTimeoutMS: 45000,
    };

    // Connect to MongoDB
    const conn = await mongoose.connect(mongoUri, options);

    console.log('✅ CONNECTION SUCCESSFUL!\n');
    console.log('═══════════════════════════════════════════════════════\n');
    
    // Display cluster information
    console.log('📊 Cluster Information:');
    console.log(`   Host: ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}`);
    console.log(`   Port: ${conn.connection.port}`);
    console.log(`   Ready State: ${conn.connection.readyState} (1 = connected)`);
    console.log('');

    // Test write operation
    console.log('⏳ Testing WRITE operation...');
    const TestCollection = conn.connection.collection('connection_test');
    const testDoc = {
      test: true,
      timestamp: new Date(),
      message: 'Atlas connection test successful',
      from: 'test-atlas-connection.ts',
    };
    
    await TestCollection.insertOne(testDoc);
    console.log('✅ Write operation successful\n');

    // Test read operation
    console.log('⏳ Testing READ operation...');
    const doc = await TestCollection.findOne({ test: true });
    console.log('✅ Read operation successful');
    console.log(`   Retrieved Document ID: ${doc?._id}\n`);

    // Test update operation
    console.log('⏳ Testing UPDATE operation...');
    await TestCollection.updateOne(
      { test: true },
      { $set: { updated: true, updateTime: new Date() } }
    );
    console.log('✅ Update operation successful\n');

    // Test delete operation
    console.log('⏳ Testing DELETE operation...');
    await TestCollection.deleteOne({ test: true });
    console.log('✅ Delete operation successful\n');

    console.log('🧹 Cleanup completed');
    console.log('');

    // Close connection
    await mongoose.connection.close();
    console.log('✅ Connection closed successfully\n');
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('🎉 ALL TESTS PASSED!');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
    console.log('✨ Your MongoDB Atlas is configured correctly and ready to use!');
    console.log('');
    console.log('Next steps:');
    console.log('  1. Run: npm run dev');
    console.log('  2. Test your API endpoints');
    console.log('  3. Check Atlas dashboard to see your data');
    console.log('');

    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ CONNECTION FAILED!\n');
    console.error('═══════════════════════════════════════════════════════\n');
    console.error('Error Details:', error.message);
    console.error('');

    // Provide specific troubleshooting based on error type
    if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      console.error('🔍 Issue: DNS/Network Error\n');
      console.error('💡 Troubleshooting Steps:');
      console.error('   1. Check your internet connection');
      console.error('   2. Verify the cluster hostname in your connection string');
      console.error('   3. Make sure your cluster is active in Atlas dashboard');
      console.error('   4. Try pinging the hostname to verify connectivity');
    } else if (error.message.includes('authentication failed') || error.message.includes('bad auth')) {
      console.error('🔍 Issue: Authentication Error\n');
      console.error('💡 Troubleshooting Steps:');
      console.error('   1. Verify username in Atlas → Database Access');
      console.error('   2. Check if password is correct');
      console.error('   3. If password has special characters (@, $, %, etc.),');
      console.error('      make sure they are URL-encoded:');
      console.error('      @ → %40, $ → %24, % → %25, etc.');
      console.error('   4. Try generating a new password without special characters');
    } else if (error.message.includes('IP') || error.message.includes('not authorized')) {
      console.error('🔍 Issue: IP Whitelist Error\n');
      console.error('💡 Troubleshooting Steps:');
      console.error('   1. Go to Atlas → Network Access');
      console.error('   2. Add your IP address or use 0.0.0.0/0 for development');
      console.error('   3. Wait 2-3 minutes for changes to take effect');
      console.error('   4. Your current IP: Check at https://whatismyip.com');
    } else if (error.message.includes('timeout') || error.message.includes('timed out')) {
      console.error('🔍 Issue: Connection Timeout\n');
      console.error('💡 Troubleshooting Steps:');
      console.error('   1. Check if your cluster is paused in Atlas');
      console.error('   2. Verify your firewall allows MongoDB connections');
      console.error('   3. Try connecting from a different network');
      console.error('   4. Check cluster status in Atlas dashboard');
    } else {
      console.error('🔍 Issue: Unknown Error\n');
      console.error('💡 General Troubleshooting:');
      console.error('   1. Check .env file exists and has MONGODB_URI');
      console.error('   2. Verify connection string format is correct');
      console.error('   3. Check Atlas dashboard for cluster status');
      console.error('   4. Review full error details below');
    }

    console.error('\n📚 Full Error Details:');
    console.error(error);
    console.error('\n═══════════════════════════════════════════════════════\n');

    process.exit(1);
  }
};

// Run the test
testAtlasConnection();
