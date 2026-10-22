const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const readline = require('readline');

// Load environment variables from server/.env
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

const askQuestion = (query) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans.trim());
    })
  );
};

const parseArgs = () => {
  const args = {};
  process.argv.slice(2).forEach((arg) => {
    if (arg.startsWith('--')) {
      const [key, val] = arg.slice(2).split('=');
      args[key] = val || true;
    }
  });
  return args;
};

const createAdmin = async () => {
  console.log('============================================================');
  console.log('       NIVARA V2 - Secure Administrator Provisioning        ');
  console.log('============================================================\n');

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri || mongoUri.includes('<username>')) {
    console.error('Error: MONGODB_URI is not configured in server/.env.');
    console.error('Please configure your Atlas connection string before running this script.');
    process.exit(1);
  }

  const cliArgs = parseArgs();

  let name = cliArgs.name || process.env.ADMIN_NAME;
  let email = cliArgs.email || process.env.ADMIN_EMAIL;
  let password = cliArgs.password || process.env.ADMIN_PASSWORD;
  let phone = cliArgs.phone || process.env.ADMIN_PHONE;

  // If interactive terminal and parameters missing, prompt user
  if (process.stdin.isTTY && (!email || !password)) {
    if (!name) name = await askQuestion('Enter Administrator Full Name (e.g. Lead Administrator): ');
    if (!email) email = await askQuestion('Enter Administrator Email Address: ');
    if (!password) password = await askQuestion('Enter Secure Password (min 6 chars): ');
    if (!phone) phone = await askQuestion('Enter Phone Number: ');
  }

  // Fallback defaults if automated/scripted without TTY
  name = name || 'NIVARA Lead Administrator';
  email = email || 'admin@nivara-health.in';
  password = password || 'Admin@Secure2026';
  phone = phone || '9876543210';

  if (password.length < 6) {
    console.error('Error: Password must be at least 6 characters long.');
    process.exit(1);
  }

  try {
    console.log(`Connecting to MongoDB Atlas at ${mongoUri.replace(/:([^@]+)@/, ':****@')}...`);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 8000,
      dbName: process.env.MONGODB_DB_NAME || 'nivara',
    });
    console.log('Connected to Atlas database successfully.\n');

    // Check if admin user already exists
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      if (existing.role === 'admin') {
        console.log(`Notice: An administrator account with email "${email}" already exists.`);
        console.log('Account is active and ready for login.');
      } else {
        console.log(`Notice: Account with email "${email}" exists with role "${existing.role}". Promoting to administrator...`);
        existing.role = 'admin';
        await existing.save();
        console.log('User promoted to administrator successfully.');
      }
    } else {
      console.log(`Creating new administrator account for "${email}"...`);
      const user = await User.create({
        name,
        email: email.toLowerCase(),
        password,
        phone,
        role: 'admin',
        preferredLanguage: 'en',
        region: 'Tamil Nadu',
        isActive: true,
      });

      console.log('Administrator account provisioned successfully!');
      console.log(`  Name:  ${user.name}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Role:  ${user.role}`);
      console.log(`  ID:    ${user._id}\n`);
    }

    console.log('You can now log in at http://localhost:3000/login using these credentials.');
    console.log('============================================================');
  } catch (error) {
    console.error('Failed to provision administrator:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

createAdmin();
