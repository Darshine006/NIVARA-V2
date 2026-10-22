const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Region = require('../models/Region');
const HealthcareCenter = require('../models/HealthcareCenter');
const HealthArticle = require('../models/HealthArticle');

const initMasterCatalog = async () => {
  console.log('============================================================');
  console.log('     NIVARA V2 - Master Catalog & Regional Setup Tool      ');
  console.log('  (Initializes Regions, Health Centers, & Education Guides) ');
  console.log('        * ZERO Demo Accounts or Fake Users Inserted *       ');
  console.log('============================================================\n');

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri || mongoUri.includes('<username>')) {
    console.error('Error: MONGODB_URI is not configured in server/.env.');
    console.error('Please configure your Atlas connection string before running this script.');
    process.exit(1);
  }

  try {
    console.log(`Connecting to MongoDB Atlas...`);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 8000,
      dbName: process.env.MONGODB_DB_NAME || 'nivara',
    });
    console.log('Connected to Atlas.\n');

    // 1. Seed Modular Regional Configurations
    console.log('1. Initializing Regional Configurations...');
    const existingRegions = await Region.countDocuments();
    if (existingRegions === 0) {
      await Region.insertMany([
        {
          name: 'Tamil Nadu',
          defaultLanguage: 'ta',
          supportedLanguages: ['ta', 'en'],
          services: [
            'General Consultation',
            'Maternal & Child Health',
            'Anemia & Nutrition Care',
            'Vaccination',
            'Diabetes & BP Clinic',
            'Tele-Specialist Consult',
            'Basic Diagnostic Tests',
            'Essential Medicine Dispensing',
          ],
          districts: ['Madurai', 'Dindigul', 'Thanjavur', 'Salem', 'Theni'],
          description:
            'Tamil Nadu Rural Health Mission regional configuration with Tamil and English support.',
          isActive: true,
        },
        {
          name: 'Uttar Pradesh',
          defaultLanguage: 'hi',
          supportedLanguages: ['hi', 'en'],
          services: [
            'General Consultation',
            'Maternal Care & Safe Delivery',
            'Child Immunization',
            'Respiratory & Seasonal Fever',
            'Hypertension & Diabetes Screening',
            'Emergency First Aid',
            'Generic Pharmacy',
          ],
          districts: ['Varanasi', 'Gorakhpur', 'Mirzapur', 'Ayodhya', 'Basti'],
          description:
            'Northern Plains deployment emphasizing Hindi localization and mobile health units.',
          isActive: true,
        },
        {
          name: 'Karnataka',
          defaultLanguage: 'kn',
          supportedLanguages: ['kn', 'en'],
          services: [
            'General Consultation',
            'Women Health & Antenatal',
            'Malnutrition Intervention',
            'Vaccination',
            'Cardiovascular Screening',
            'Tele-Health Hub',
          ],
          districts: ['Mysuru', 'Hassan', 'Mandya', 'Chamarajanagar'],
          description:
            'Southern Deccan regional setup with bilingual regional priority.',
          isActive: true,
        },
      ]);
      console.log('   Initialized 3 Modular Regional deployments.');
    } else {
      console.log(`   ${existingRegions} regions already exist. Skipping.`);
    }

    // 2. Seed Healthcare Centers
    console.log('2. Initializing Primary Healthcare Centers (PHCs)...');
    const existingCenters = await HealthcareCenter.countDocuments();
    if (existingCenters === 0) {
      await HealthcareCenter.insertMany([
        {
          name: 'Alanganallur Primary Health Center',
          village: 'Alanganallur',
          district: 'Madurai',
          state: 'Tamil Nadu',
          services: [
            'General Consultation',
            'Maternal & Child Health',
            'Vaccination',
            'Basic Diagnostics',
            'Emergency First Aid',
          ],
          contact: '+91 452 2456781',
          workingHours: '08:00 AM - 04:00 PM (Mon-Sat)',
          isActive: true,
        },
        {
          name: 'Thirumangalam Community Health Center',
          village: 'Thirumangalam',
          district: 'Madurai',
          state: 'Tamil Nadu',
          services: [
            'General Consultation',
            'Maternal & Child Health',
            'Diabetes & BP Clinic',
            'Vaccination',
            'Tele-Specialist Consult',
          ],
          contact: '+91 452 2891234',
          workingHours: '24 Hours Emergency & 08:00 AM - 05:00 PM OPD',
          isActive: true,
        },
        {
          name: 'Pindra Community Health Center',
          village: 'Pindra',
          district: 'Varanasi',
          state: 'Uttar Pradesh',
          services: [
            'General Consultation',
            'Maternal Care & Safe Delivery',
            'Child Immunization',
            'Emergency First Aid',
          ],
          contact: '+91 542 2678901',
          workingHours: '08:00 AM - 04:00 PM (Mon-Sat)',
          isActive: true,
        },
        {
          name: 'Nanjangud Rural Health Center',
          village: 'Nanjangud',
          district: 'Mysuru',
          state: 'Karnataka',
          services: [
            'General Consultation',
            'Women Health & Antenatal',
            'Vaccination',
            'Basic Diagnostics',
          ],
          contact: '+91 821 2345678',
          workingHours: '08:30 AM - 04:30 PM (Mon-Sat)',
          isActive: true,
        },
      ]);
      console.log('   Initialized Primary Healthcare Centers.');
    } else {
      console.log(`   ${existingCenters} centers already exist. Skipping.`);
    }

    // 3. Seed Verified Educational Health Articles
    console.log('3. Initializing Health Educational Articles across 8 categories...');
    const existingArticles = await HealthArticle.countDocuments();
    if (existingArticles === 0) {
      await HealthArticle.insertMany([
        {
          title: 'Essential Antenatal Care for Expecting Mothers',
          category: 'Maternal Health',
          content:
            'Regular prenatal checkups monitor maternal hemoglobin, blood pressure, and fetal development. At least four antenatal checkups are recommended alongside iron and folic acid supplementation.',
          symptoms: 'Swelling of feet, excessive fatigue, severe headache, blurred vision.',
          prevention: 'Balanced diet rich in leafy vegetables, adequate hydration, iron-folic acid tablets as advised.',
          whenToSeekHelp: 'Seek immediate medical attention if vaginal bleeding, severe abdominal pain, or sudden high fever occurs.',
          language: 'en',
          region: 'All',
        },
        {
          title: 'கர்ப்பிணித் தாய்மார்களுக்கான அத்தியாவசிய பராமரிப்பு',
          category: 'Maternal Health',
          content:
            'கர்ப்ப காலத்தில் இரத்த சோகை ஏற்படாமல் தடுக்க இரும்புச்சத்து மற்றும் போலிக் அமில மாத்திரைகளை தவறாமல் உட்கொள்ள வேண்டும். குறைந்தது நான்கு மருத்துவ பரிசோதனைகள் அவசியமாகும்.',
          symptoms: 'கடுமையான தலைவலி, பார்வை மங்குதல், கால்களில் திடீர் வீக்கம்.',
          prevention: 'சத்துணவு, கீரைகள், போதிய தூக்கம் மற்றும் சுத்தமான குடிநீர்.',
          whenToSeekHelp: 'இரத்தப்போக்கு அல்லது கடுமையான அடிவயிற்று வலி ஏற்பட்டால் உடனடியாக மருத்துவமனை செல்லவும்.',
          language: 'ta',
          region: 'Tamil Nadu',
        },
        {
          title: 'गर्भावस्था के दौरान आवश्यक देखभाल',
          category: 'Maternal Health',
          content:
            'गर्भावस्था में नियमित प्रसव पूर्व जांच (ANC) बहुत जरूरी है। आयरन और फोलिक एसिड की गोलियां नियमित रूप से लें और संतुलित पोषण युक्त आहार का सेवन करें।',
          symptoms: 'अत्यधिक थकान, चक्कर आना, पैरों में सूजन, तेज सिरदर्द।',
          prevention: 'हरी पत्तेदार सब्जियां, दालें, दूध और साफ उबला हुआ पानी पिएं।',
          whenToSeekHelp: 'रक्तस्राव या तेज पेट दर्द होने पर तुरंत नजदीकी स्वास्थ्य केंद्र पहुंचे।',
          language: 'hi',
          region: 'Uttar Pradesh',
        },
        {
          title: 'Managing Infant Nutrition and Weaning',
          category: 'Child Health',
          content:
            'Exclusive breastfeeding is recommended for the first 6 months. After 6 months, introduce soft, nutrient-dense complementary foods like mashed lentils, khichdi, and boiled vegetables.',
          symptoms: 'Poor weight gain, lethargy, persistent diarrhea, sunken eyes.',
          prevention: 'Continue breastfeeding while gradually adding mashed local grains and pulses.',
          whenToSeekHelp: 'Consult a healthcare worker if the child refuses feeds or becomes unresponsive.',
          language: 'en',
          region: 'All',
        },
        {
          title: 'Preventing Malnutrition with Local Affordable Foods',
          category: 'Nutrition',
          content:
            'Nutritious meals can be prepared using locally available millets (ragi, bajra), pulses, green leafy vegetables, and seasonal fruits to prevent micronutrient deficiencies.',
          symptoms: 'Stunted growth, brittle hair, pale skin, frequent infections.',
          prevention: 'Incorporate diversified food groups including legumes, sprouted seeds, and eggs.',
          whenToSeekHelp: 'Visit the Primary Health Center if severe weakness or visible wasting is observed.',
          language: 'en',
          region: 'All',
        },
        {
          title: 'Clean Water and Handwashing: Safe Sanitation Practices',
          category: 'Hygiene',
          content:
            'Washing hands with soap before meals and after using the toilet dramatically reduces diarrheal illnesses and intestinal parasites.',
          symptoms: 'Frequent loose stools, vomiting, stomach cramps, mild fever.',
          prevention: 'Drink boiled or filtered water, store food covered, and wash hands thoroughly.',
          whenToSeekHelp: 'Seek medical care immediately if dehydration signs (dry mouth, no urination) appear.',
          language: 'en',
          region: 'All',
        },
        {
          title: 'Managing Blood Sugar Levels in Rural Communities',
          category: 'Diabetes',
          content:
            'Type 2 diabetes can be managed through diet control, daily physical exercise like brisk walking, reducing refined sugars, and adhering to prescribed medications.',
          symptoms: 'Frequent urination, excessive thirst, unexplained weight loss, slow-healing sores.',
          prevention: 'Engage in 30 minutes of physical activity daily, eat whole grains, limit sugary tea and sweets.',
          whenToSeekHelp: 'Seek prompt care if feeling dizzy, confused, or suffering from a non-healing foot wound.',
          language: 'en',
          region: 'All',
        },
        {
          title: 'Controlling High Blood Pressure (Hypertension)',
          category: 'Blood Pressure',
          content:
            'Hypertension is often symptomless but strains the heart and kidneys. Reducing dietary salt and avoiding tobacco helps maintain safe blood pressure levels.',
          symptoms: 'Dizziness, morning headaches, chest tightness, palpitations.',
          prevention: 'Reduce salt intake (less than 1 teaspoon per day), manage stress, walk regularly.',
          whenToSeekHelp: 'Seek emergency care for sudden chest pain, numbness in face/arms, or severe shortness of breath.',
          language: 'en',
          region: 'All',
        },
        {
          title: 'National Immunization Schedule for Children and Adults',
          category: 'Vaccination',
          content:
            'Timely vaccination protects children against tuberculosis, polio, hepatitis B, diphtheria, pertussis, tetanus, measles, and rubella as per the Universal Immunization Program.',
          symptoms: 'Fever and minor swelling at injection site are normal mild reactions.',
          prevention: 'Keep immunization card updated and attend village VHND sessions on schedule.',
          whenToSeekHelp: 'Contact the ANM/worker if high fever persists for more than 48 hours.',
          language: 'en',
          region: 'All',
        },
        {
          title: 'Recognizing and Treating Seasonal Fevers and Dengue',
          category: 'Common Diseases',
          content:
            'Vector-borne diseases like dengue and malaria peak after monsoons. Preventing standing water around homes prevents mosquito breeding.',
          symptoms: 'High fever, severe joint and muscle pain, pain behind eyes, rash.',
          prevention: 'Use mosquito nets, empty stagnant water containers, wear protective clothing.',
          whenToSeekHelp: 'Urgent medical care required if bleeding gums, continuous vomiting, or severe abdominal pain occurs.',
          language: 'en',
          region: 'All',
        },
      ]);
      console.log('   Initialized Health Educational Articles.');
    } else {
      console.log(`   ${existingArticles} articles already exist. Skipping.`);
    }

    console.log('\n============================================================');
    console.log('  Master Catalog Initialization Complete!                   ');
    console.log('  Application is ready for real user registration & usage.  ');
    console.log('============================================================');
  } catch (error) {
    console.error('Catalog initialization failed:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

initMasterCatalog();
