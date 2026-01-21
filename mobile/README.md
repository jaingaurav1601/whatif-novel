# What If Novel AI - Mobile

## Setup

1. **Install Dependencies**
   ```bash
   cd mobile
   npm install
   ```

2. **Configure API URL**
   By default, the app uses `localhost:8000` for iOS and `10.0.2.2:8000` for Android.
   To target a specific server (e.g. deployed backend), set `EXPO_PUBLIC_API_URL` in `.env` (create if needed).
   
   Example `.env`:
   ```
   EXPO_PUBLIC_API_URL=https://your-railway-app.app
   ```

3. **Run App**
   ```bash
   npx expo start
   ```
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan QR code with Expo Go app on physical device

## Features
- Choose from 8+ Universes
- Create Custom Universes
- Generate "What If" Stories
- View History
- Share Stories
