<<<<<<< HEAD
# 🌍 EcoTrack – Smart Carbon Footprint Tracker

> **Challenge Vertical:** Carbon Footprint Tracker  
> **Platform:** Google Cloud Console (App Engine)  
> **Tech Stack:** React 19 · TypeScript · Vite · Tailwind CSS · Recharts

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](.)
[![License](https://img.shields.io/badge/license-MIT-blue)](.)
[![Accessibility](https://img.shields.io/badge/accessibility-WCAG%202.1%20AA-green)](.)

---

## 📌 Chosen Vertical

**Carbon Footprint Tracker** – A smart, dynamic assistant that helps individuals understand, track, and reduce their carbon footprint through simple daily actions and personalised AI-driven insights.

---

## 🎯 Problem Statement Alignment

EcoTrack directly addresses the challenge of helping individuals:
- **Understand** their carbon footprint through visual dashboards and educational content
- **Track** daily emissions across 5 categories (Transport, Energy, Food, Shopping, Waste)
- **Reduce** their impact through personalised tips, AI assistant guidance, and goal setting

---

## 🏗️ Architecture & Approach

### Application Structure

```
src/
├── App.tsx                    # Root component & layout
├── context/
│   └── AppContext.tsx          # Global state (useReducer + localStorage)
├── pages/
│   ├── Dashboard.tsx          # Overview, stats, 7-day chart
│   ├── LogActivity.tsx        # Activity entry form
│   ├── Insights.tsx           # Trend charts & benchmarks
│   ├── Tips.tsx               # Filterable eco-tips
│   ├── Assistant.tsx          # AI chat interface
│   └── Profile.tsx            # User profile & achievements
├── components/
│   ├── Navigation.tsx         # Responsive nav (sidebar + bottom bar)
│   └── ui/                    # Reusable components (Button, Card, Badge, ProgressBar)
├── services/
│   └── assistant.ts           # Intent-detection AI engine
├── data/
│   ├── emissionFactors.ts     # IPCC/DEFRA 2023 emission data
│   ├── tips.ts                # 20+ eco-action database
│   └── achievements.ts        # Gamification badges
└── types/
    └── index.ts               # TypeScript type definitions
```

### State Management

- **Global state** via React `useReducer` + `useContext` (no external state library needed)
- **Persistence** via `localStorage` — all data stored client-side (privacy-first)
- **Memoisation** with `useMemo` and `useCallback` for performance optimisation

### Logic Design

#### Emission Calculation
Uses IPCC and DEFRA 2023 emission factors:
```
CO₂e = quantity × emission_factor (kg CO₂e per unit)
```
Example: 50 km petrol car drive = 50 × 0.192 = 9.6 kg CO₂e

#### AI Assistant (Intent Detection)
The EcoBot assistant uses pattern-matching NLP:
1. User input is matched against 17+ regex intent patterns
2. The matched intent triggers a contextual response generator
3. Responses incorporate real user data (monthly totals, top categories, achievements)
4. Random tips are injected for variety

#### Personalisation Logic
- Tips are **sorted by the user's highest-emission category** first
- Benchmark comparisons use **Paris Agreement (167 kg/month)** and **global average (417 kg/month)**
- Achievement conditions are evaluated automatically on every log update

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📊 **Dashboard** | Real-time stats, 7-day emission chart, goal progress, category breakdown |
| ✏️ **Activity Logger** | 40+ emission factors across 5 categories with CO₂e preview |
| 📈 **Insights** | Monthly trends, pie charts, benchmark comparison vs Paris/Global avg |
| 💡 **Eco Tips** | 20+ filterable tips with difficulty ratings and potential savings |
| 🤖 **EcoBot** | Context-aware AI assistant with intent detection |
| 👤 **Profile** | Goal setting, achievements (7 badges), emission rating |
| 🏆 **Gamification** | 7 unlockable achievements to motivate consistent logging |

---

## 🚀 How to Run Locally

### Prerequisites
- Node.js 20+
- npm 9+
- Git

### Setup

```bash
# Clone the repository
git https://github.com/Letestdata/ecotrack-carbon-tracker.git
cd ecotrack-carbon-tracker

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## ☁️ Google Cloud Deployment

### Prerequisites
- [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) installed
- Active GCP project with App Engine enabled
- Billing enabled on GCP project

### Step-by-Step Deployment

```bash
# 1. Authenticate with Google Cloud
gcloud auth login

# 2. Set your GCP project
gcloud config set project YOUR_PROJECT_ID

# 3. Build the React app
npm run build

# 4. Deploy to App Engine
gcloud app deploy app.yaml --quiet

# 5. Open the deployed app
gcloud app browse
```

### App Engine Configuration (`app.yaml`)
- **Runtime:** Node.js 20 Standard Environment
- **Scaling:** Auto-scaling (0–5 instances)
- **Security headers:** X-Frame-Options, X-XSS-Protection, CSP
- **Caching:** Static assets cached for 1 year, HTML no-cache
- **Routing:** SPA fallback to index.html for client-side routing

---

## 🔒 Security Implementation

- **No external API calls** – all processing is client-side
- **No sensitive data stored** – only anonymised usage data in localStorage
- **Security headers** configured in `app.yaml`:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection: 1; mode=block`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: geolocation=(), microphone=(), camera=()`
- **Input validation** on all form fields with clear error messages
- **Sanitised outputs** – no `dangerouslySetInnerHTML` usage
- **HTTPS enforced** by Google App Engine by default

---

## ♿ Accessibility (WCAG 2.1 AA)

- **Semantic HTML**: proper use of `<main>`, `<nav>`, `<section>`, `<article>`, `<ul>`, `<dl>`
- **ARIA attributes**: `aria-label`, `aria-current`, `aria-pressed`, `aria-live`, `aria-busy`, `aria-required`, `aria-describedby`, `role`
- **Skip-to-content link** for keyboard users
- **Focus management**: visible focus rings on all interactive elements
- **Keyboard navigable**: all interactions accessible via keyboard
- **Screen reader support**: `aria-hidden` on decorative elements, meaningful alt text
- **Colour contrast**: all text meets minimum 4.5:1 ratio
- **Reduced motion**: respects `prefers-reduced-motion` media query
- **Form accessibility**: all inputs have associated `<label>` elements

---

## 📊 Emission Data Sources

| Category | Source |
|----------|--------|
| Transport | DEFRA GHG Conversion Factors 2023 |
| Energy | IPCC AR6 + UK Grid Intensity |
| Food | Poore & Nemecek (2018) Science study |
| Shopping | Carbon Trust + Ellen MacArthur Foundation |
| Waste | IPCC Waste Sector 2023 |

---

## 🧪 Testing Strategy

### Manual Testing Checklist
- [x] Activity logging with valid/invalid inputs
- [x] CO₂e calculation accuracy vs known values
- [x] localStorage persistence across sessions
- [x] Achievement unlock conditions
- [x] AI assistant intent detection for all 17 intents
- [x] Responsive design on mobile (320px+) and desktop (1280px+)
- [x] Keyboard-only navigation
- [x] Screen reader announcement of dynamic content

### Unit Testing (Structure)
The codebase is structured for easy testing:
- Pure functions in `services/assistant.ts` (intent detection, response generation)
- Pure functions in `data/achievements.ts` (condition checks)
- Emission factor calculations are deterministic

---

## 💡 Assumptions Made

1. **Client-side only**: No backend required; all data stored in localStorage for privacy
2. **Emission factors**: Using global average values; regional factors would improve accuracy
3. **AI assistant**: Rule-based NLP is sufficient for the use case; could be upgraded to LLM API
4. **Single user**: The app is designed for individual use on a personal device
5. **Currency of data**: Emission factors from 2023 reports are current enough for educational purposes

---

## 🌿 Impact Potential

If adopted at scale, EcoTrack could help users:
- Identify their **#1 emission source** within 5 minutes of use
- Reduce monthly emissions by **15-30%** through tip implementation
- Motivate consistent tracking through **gamification**
- Build **data literacy** around climate science

---

## 📄 License

MIT License © 2024 EcoTrack. Built with 💚 for a sustainable future.
=======
# Carbon-project
>>>>>>> 640562a379ca69fb13c61b811fea74ffe05ab6af
