# AvideTravel Mobile App

Native mobile app for AvideTravel built with Expo + React Native + TypeScript.

## What is included

- Native Home, Deals, Explore, and Contact tabs
- Live travel offers loaded from `https://avide.travel/api/services`
- Agent data loaded from `https://avide.travel/api/agents`
- Destination filtering
- Native deal details modal
- Call/email/contact actions
- Links to hotels, flights, cruises, car rentals, tours, events, and travel tips
- Pull-to-refresh for live offers
- EAS Build configuration for Android APK/internal builds and production iOS/Android builds

## Local development

```bash
npm install
npx expo start
```

Then open the project in Expo Go or a simulator.

## Type check

```bash
npm run typecheck
```

## EAS builds

Install/login to EAS once:

```bash
npx eas-cli login
npx eas-cli build:configure
```

Preview Android APK:

```bash
npx eas-cli build --platform android --profile preview
```

Production builds:

```bash
npx eas-cli build --platform android --profile production
npx eas-cli build --platform ios --profile production
```

> App Store / Google Play signing credentials and store accounts are required for production submission.

## Web backend

The mobile app is intentionally separate from the `Avi` Next.js web repository. It consumes the public AvideTravel API over HTTPS and links to web booking pages when a native checkout flow is not available.
