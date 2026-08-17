# MedConnect

MedConnect is a mobile application built with React Native (Expo) and Supabase.

## Features
- Secure Authentication with Email OTP
- Multi-step Retailer Registration (General Info, Security, License Uploads)
- Secure Document Uploads for Verification
- Dynamic Form Validation
- Application Review Process

## Setup & Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the local development server:**
   ```bash
   npx expo start
   ```

3. **Environment Variables:**
   You must set up your local `.env` file pointing to your Supabase instance, and deploy the required Supabase Edge Functions (e.g. `send-email-otp` and `verify-email-otp`) along with the database migrations.

## Build for Production
Use EAS to build for Android or iOS:
```bash
eas build -p android --profile production
```
