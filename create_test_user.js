const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://srrzoywtgkpvodfbpjqz.supabase.co';
const supabaseAnonKey = 'sb_publishable_DsM75EGKRPrMP_76r8N7Zg_AmCTMSnu';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function create() {
  console.log("Signing up user...");
  const { data, error } = await supabase.auth.signUp({
    email: 'skalp8750@gmail.com',
    password: 'Password123!',
    options: {
      data: {
        business_type: 'Chemist',
        shop_firm_name: 'Test Pharmacy',
        owner_name: 'Kalp Shah',
        shop_address: '123 Test St',
        pincode: '400001',
        area: 'Test Area',
        city: 'Mumbai',
        state: 'Maharashtra',
        email_verified: true,
        approval_status: 'approved', // Force approved to bypass pending screen
      }
    }
  });

  if (error) {
    console.error("Error signing up:", error.message);
  } else {
    console.log("\n✅ SUCCESS! User created.");
    console.log("Email: skalp8750@gmail.com");
    console.log("Password: Password123!");
    if (data.session === null) {
      console.log("\n⚠️ NOTE: Email confirmations are enabled in Supabase! You MUST check your email inbox and click the confirmation link before you can log in on the app.");
    }
  }
}

create();
