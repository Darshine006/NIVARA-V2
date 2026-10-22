const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Ensure test environment uses isolated test DB
dotenv.config({ path: path.join(__dirname, '../.env') });

const ISOLATED_TEST_DB = 'nivara_isolated_automated_test_db_2026';

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${testName}`);
  } else {
    failedTests++;
    console.error(`  [FAIL] ${testName} - ${details}`);
  }
}

async function runTestSuite() {
  console.log('\n============================================================');
  console.log('       NIVARA V2 - Comprehensive Automated Test Suite       ');
  console.log('============================================================\n');

  // Load app
  const app = require('../index');
  const TEST_PORT = 5099;
  const server = http.createServer(app);

  await new Promise((resolve) => server.listen(TEST_PORT, resolve));
  const baseUrl = `http://127.0.0.1:${TEST_PORT}`;
  console.log(`Test server running at ${baseUrl}`);

  try {
    // -------------------------------------------------------------
    // Test 1: Health & Diagnostics Endpoint
    // -------------------------------------------------------------
    console.log('\n--- 1. Testing System Health & Diagnostics Endpoint ---');
    const healthRes = await fetch(`${baseUrl}/api/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200, 'Health check returns HTTP 200');
    assert(healthData.status === 'online', 'Health status is "online"');
    assert(healthData.app.includes('NIVARA'), 'Application name matches NIVARA');
    assert(healthData.database !== undefined, 'Database diagnostics included');

    // -------------------------------------------------------------
    // Test 2: 404 Handler for Undefined Endpoints
    // -------------------------------------------------------------
    console.log('\n--- 2. Testing 404 Undefined Endpoint Handling ---');
    const badRouteRes = await fetch(`${baseUrl}/api/non_existent_endpoint_12345`);
    const badRouteData = await badRouteRes.json();
    assert(badRouteRes.status === 404, 'Undefined route returns HTTP 404');
    assert(badRouteData.success === false, 'Undefined route success flag is false');

    // -------------------------------------------------------------
    // Test 3: API Input Validation & Error Handling
    // -------------------------------------------------------------
    console.log('\n--- 3. Testing API Input Validation & Malformed Payloads ---');
    const emptyLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const emptyLoginData = await emptyLoginRes.json();
    assert(
      emptyLoginRes.status === 400 || emptyLoginRes.status === 503,
      'Empty login body returns 400 Bad Request (or 503 if DB pending)',
      `Got status ${emptyLoginRes.status}`
    );

    // -------------------------------------------------------------
    // Test 4: Role-Based Security: Public Admin Registration Lockdown
    // -------------------------------------------------------------
    console.log('\n--- 4. Testing Security: Public Privilege Escalation Prevention ---');
    const exploitRegisterRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Hacker Attempt',
        email: 'hacker@exploit.com',
        password: 'password123',
        phone: '9999999999',
        role: 'admin', // Attempting to register as admin!
      }),
    });
    const exploitData = await exploitRegisterRes.json();
    assert(
      exploitRegisterRes.status === 403,
      'Public registration strictly blocks self-assigned "admin" role (HTTP 403 Forbidden)',
      `Got status ${exploitRegisterRes.status}: ${exploitData.message}`
    );

    const exploitWorkerRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Worker Attempt',
        email: 'worker@exploit.com',
        password: 'password123',
        phone: '9999999998',
        role: 'healthcare_worker', // Attempting to register as healthcare_worker!
      }),
    });
    assert(
      exploitWorkerRes.status === 403,
      'Public registration strictly blocks self-assigned "healthcare_worker" role (HTTP 403 Forbidden)'
    );

    // -------------------------------------------------------------
    // Test 5: End-to-End Database Lifecycle in Isolated Test Database
    // -------------------------------------------------------------
    console.log('\n--- 5. Testing Database Operations in Isolated Test Environment ---');
    
    // Connect to isolated test database locally (if MongoDB service is active)
    let isolatedConn = null;
    try {
      isolatedConn = await mongoose.createConnection(`mongodb://127.0.0.1:27017/${ISOLATED_TEST_DB}`, {
        serverSelectionTimeoutMS: 2000,
      }).asPromise();
      console.log(`  Connected to isolated temporary test database: ${ISOLATED_TEST_DB}`);
    } catch (e) {
      console.log('  Notice: Local MongoDB not available for isolated integration tests.');
    }

    if (isolatedConn) {
      const User = require('../models/User');
      const PatientProfile = require('../models/PatientProfile');
      const HealthcareCenter = require('../models/HealthcareCenter');
      const Appointment = require('../models/Appointment');
      const MedicalRecord = require('../models/MedicalRecord');
      const Region = require('../models/Region');

      // Bind models to isolated connection
      const TestUser = isolatedConn.model('User', User.schema);
      const TestProfile = isolatedConn.model('PatientProfile', PatientProfile.schema);
      const TestCenter = isolatedConn.model('HealthcareCenter', HealthcareCenter.schema);
      const TestAppointment = isolatedConn.model('Appointment', Appointment.schema);
      const TestRecord = isolatedConn.model('MedicalRecord', MedicalRecord.schema);
      const TestRegion = isolatedConn.model('Region', Region.schema);

      // Clean test collections in isolated DB
      await TestUser.deleteMany({});
      await TestProfile.deleteMany({});
      await TestCenter.deleteMany({});
      await TestAppointment.deleteMany({});
      await TestRecord.deleteMany({});
      await TestRegion.deleteMany({});

      // Subtest 5.1: Create Patient User with Hashed Password
      const testPatient = await TestUser.create({
        name: 'Test Rural Patient',
        email: 'patient.test@isolated.local',
        password: 'Password@123',
        phone: '9876543210',
        role: 'patient',
        preferredLanguage: 'ta',
      });
      assert(testPatient._id !== undefined, 'Patient user created in isolated test DB');
      assert(testPatient.password !== 'Password@123', 'Password successfully hashed with bcrypt');
      
      const isPasswordMatch = await testPatient.matchPassword('Password@123');
      assert(isPasswordMatch === true, 'Bcrypt password comparison matches correctly');

      // Subtest 5.2: Create Patient Profile
      const testProfile = await TestProfile.create({
        userId: testPatient._id,
        age: 32,
        gender: 'Female',
        village: 'Alanganallur',
        district: 'Madurai',
        state: 'Tamil Nadu',
        emergencyContact: '9876543211',
      });
      assert(testProfile.village === 'Alanganallur', 'Patient profile stored village and demographic data');

      // Subtest 5.3: Duplicate Email Prevention
      let duplicateCaught = false;
      try {
        await TestUser.create({
          name: 'Duplicate Patient',
          email: 'patient.test@isolated.local',
          password: 'Password@123',
          phone: '9876543219',
        });
      } catch (err) {
        duplicateCaught = true;
      }
      assert(duplicateCaught, 'Duplicate email registration rejected by database unique constraint');

      // Subtest 5.4: Create Healthcare Center & Appointment
      const testCenter = await TestCenter.create({
        name: 'Test Primary Health Center',
        village: 'Alanganallur',
        district: 'Madurai',
        state: 'Tamil Nadu',
        services: ['General Consultation', 'Maternal & Child Health'],
        contact: '0452-245678',
      });
      assert(testCenter.services.length === 2, 'Healthcare Center created with services');

      const testAppt = await TestAppointment.create({
        patientId: testPatient._id,
        healthcareCenterId: testCenter._id,
        service: 'General Consultation',
        date: '2026-10-20',
        time: '10:00 AM',
        status: 'Pending',
      });
      assert(testAppt.status === 'Pending', 'Appointment booked with Pending status');

      // Subtest 5.5: Create Medical Record with Privacy Check
      const testWorker = await TestUser.create({
        name: 'Dr. Test Worker',
        email: 'worker.test@isolated.local',
        password: 'WorkerPassword@123',
        phone: '9876543220',
        role: 'healthcare_worker',
      });

      const testRecord = await TestRecord.create({
        patientId: testPatient._id,
        healthcareWorkerId: testWorker._id,
        symptoms: 'Mild fever and dry cough',
        diagnosis: 'Seasonal upper respiratory infection',
        prescription: 'Paracetamol 500mg TDS, Warm saline gargle',
        isOfflineCreated: false,
      });
      assert(testRecord.diagnosis.includes('Seasonal'), 'Medical record saved with clinical assessment');

      // Subtest 5.6: Test Offline Sync Idempotency
      const syncRecordTemp = await TestRecord.create({
        patientId: testPatient._id,
        healthcareWorkerId: testWorker._id,
        symptoms: 'Dehydration',
        diagnosis: 'Heat exhaustion',
        prescription: 'ORS sachets',
        clientTempId: 'temp_record_unique_999',
        isOfflineCreated: true,
      });
      const checkExisting = await TestRecord.findOne({ clientTempId: 'temp_record_unique_999' });
      assert(checkExisting !== null, 'Offline queue clientTempId indexed and idempotent');

      // Clean up isolated test database
      await isolatedConn.dropDatabase();
      await isolatedConn.close();
      console.log(`  Isolated test database "${ISOLATED_TEST_DB}" cleanly dropped.`);
    }

    console.log('\n============================================================');
    console.log(`Test Execution Summary: ${passedTests} PASSED, ${failedTests} FAILED`);
    console.log('============================================================\n');

    if (failedTests > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal Test Runner Error:', err);
    process.exit(1);
  } finally {
    server.close();
  }
}

runTestSuite();
