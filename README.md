# 🍱 The Last Bite

A food waste marketplace app connecting consumers with discounted surplus "surprise bags" from nearby vendors.

## 🎯 Project Status

**Demo-Ready React Native App** built with Expo Router for startup presentation.

### ✅ Implemented Features

**Consumer Features:**
- Sign up & login (accepts any credentials)
- Preference setup (food types, dietary)
- Discovery feed with curated sections
- Browse with filters (food type, dietary)
- Offer detail pages with reviews
- Vendor profile pages
- Complete reservation flow
- Mock payment (instant success)
- Order history (active & past)
- Review system (star rating + text)

**Vendor Features:**
- Vendor dashboard with stats
- Create surprise bag offers
- Manage offers (activate/deactivate)
- View incoming orders
- Verify collection with codes
- Earnings tracking (90% of sales)
- Payout schedule display

**System Features:**
- Unique reservation codes
- Stock management
- Smart collection time formatting
- Bag size standards (S/M/L)
- Trust Score display (hardcoded 4.8)
- In-memory data storage

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on specific platform
npm run ios      # iOS
npm run android  # Android
npm run web      # Web
```

## 📱 Demo Flow

1. **Login** with any credentials (e.g., demo@test.com / password)
2. **Set preferences** for food types and dietary needs
3. **Browse offers** on home screen or browse tab
4. **Reserve a bag** → checkout → mock payment
5. **Get reservation code** for pickup
6. **Switch to vendor mode** from profile
7. **Create offers** and manage orders
8. **Verify collections** with customer codes

## 🎨 Design System

- **Primary Color**: #2E7D32 (Warm Green)
- **Secondary Color**: #F59E0B (Amber)
- **Style**: Rounded cards (12px), food-forward, modern
- **Typography**: Bold headings, clear hierarchy
- **Icons**: Emoji-based for demo

## 📂 Project Structure

```
app/
├── (auth)/          # Login, signup, preferences
├── (consumer)/      # Consumer mode screens
├── (vendor)/        # Vendor mode screens
└── index.tsx        # Splash screen

components/          # Reusable UI components
services/           # Mock data & storage
types/              # TypeScript definitions
constants/          # Colors, config
utils/              # Formatting helpers
```

## 🎬 Demo Script

See [DEMO_SCRIPT.md](DEMO_SCRIPT.md) for detailed presentation flow.

**Key Talking Points:**
- Problem: 1/3 of food wasted globally
- Solution: Connect surplus food with consumers
- Business Model: 10% platform commission
- Impact: Reduce waste, save money, support local businesses

## 📚 Documentation

- **[PROJECT_GUIDE.md](PROJECT_GUIDE.md)** - Technical overview & features
- **[DEMO_SCRIPT.md](DEMO_SCRIPT.md)** - Presentation walkthrough
- **[BRANDING.md](BRANDING.md)** - Design guidelines & brand identity

## 🔧 Technical Stack

- **Framework**: React Native with Expo
- **Router**: Expo Router (file-based routing)
- **Language**: TypeScript
- **State**: In-memory storage (demo only)
- **Styling**: StyleSheet API

## 💡 Key Features for Demo

1. **Instant Login** - No validation required
2. **Mock Payment** - Immediate success
3. **Dual Modes** - Consumer ↔ Vendor switching
4. **Smart Formatting** - Collection times, prices, distances
5. **Trust Score** - Hardcoded at 4.8 (as requested)

## 🌟 What Makes This Special

- **Food-Forward Design** - Warm colors, appetizing presentation
- **Dual Marketplace** - Both sides in one app
- **Impact-Driven** - Clear sustainability message
- **Mobile-First** - Optimized for on-the-go use
- **Demo-Ready** - Works immediately, no setup needed

## 📊 Mock Data

The app includes:
- 4 vendors (Vietnamese food businesses)
- 4 active offers (various food types)
- Sample reviews and ratings
- All data resets on app restart

## 🚧 Not Implemented (As Requested)

- Cancel reservation with refunds
- Push notifications
- Dynamic Trust Score calculation

These can be added post-demo based on feedback.

## 🎯 Next Steps

1. **Pilot Program** - 10 vendors in District 1, HCMC
2. **User Testing** - Gather feedback from real users
3. **Backend Development** - Replace mock storage with API
4. **Payment Integration** - Real MoMo/ZaloPay/VNPay
5. **Location Services** - Real GPS and mapping
6. **Scale** - Expand to more districts and cities

## 💰 Business Model

- **Commission**: 10% per transaction
- **Vendor Earnings**: 90% of sale price
- **No Upfront Costs**: Free for vendors to join
- **Free for Consumers**: No subscription fees

## 🌍 Impact Potential

- **Food Waste Reduction**: Prevent tons of food from landfills
- **Cost Savings**: 50-70% discounts for consumers
- **Vendor Revenue**: New income stream from surplus
- **Sustainability**: Support circular economy

## 📞 Support

For questions or issues during demo:
- Check PROJECT_GUIDE.md for technical details
- Review DEMO_SCRIPT.md for presentation flow
- All features work offline (mock data)

## 📄 License

This is a demo project for startup presentation purposes.

---

**Built with ❤️ for reducing food waste and supporting local businesses**

🌱 Save Food, Save Money 🌱
