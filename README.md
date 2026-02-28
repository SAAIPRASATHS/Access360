# JanAccess AI – Inclusive AI for Campus Resilience

JanAccess AI is a full-stack, accessibility-first AI platform designed to improve inclusion, wellbeing, and crisis resilience on college campuses.

## 🚀 The Problem
College campuses often lack centralized, accessible, and inclusive systems for crisis management and student wellbeing. Information is scattered, and accessibility tools (like simplification or translation) are rarely integrated into core campus services.

## 💡 The Solution
JanAccess AI provides a unified dashboard that combines:
- **Adaptive AI Assistance**: Simplifies complex forms, translates notices, and offers neurodiverse-friendly UI modes.
- **Verified Health Companion**: Provides educational health information with mandatory disclaimers, preventing misinformation.
- **Crisis Intelligence Engine**: A geo-tagged reporting system with an interactive map and SOS broadcast capability.
- **Admin Intelligence**: Data-driven insights into campus wellbeing and safety trends.

## 🛠️ Tech Stack
- **Frontend**: Next.js 16 (App Router), Tailwind CSS
- **Backend**: Next.js API Routes (Node.js)
- **Database**: MongoDB Atlas (Mongoose)
- **AI Engine**: Groq API (Llama 3 8B)
- **Intelligence**: Leaflet.js (Maps), Recharts (Analytics)
- **Auth**: NextAuth.js (Google Login)

## 🌍 Social Impact
JanAccess AI scales resilience by:
1. **Bridging the Accessibility Gap**: Ensuring every student, regardless of neurodiversity or language, can navigate campus life.
2. **Strengthening Safety**: Providing real-time, verified crisis mapping that empowers campus security and volunteers.
3. **Promoting Wellbeing**: Destigmatizing mental health through gentle mood logging and educational support.

## ⚙️ Setup Instructions
1. Clone the repository.
2. Create a `.env.local` file with the following variables:
   ```env
   MONGODB_URI=your_mongodb_uri
   NEXTAUTH_SECRET=your_secret
   GOOGLE_CLIENT_ID=your_google_id
   GOOGLE_CLIENT_SECRET=your_google_secret
   GROQ_API_KEY=your_groq_key
   ```
3. Run `npm install`.
4. Run `npm run dev`.

## 📜 Architecture
- `src/app`: Page routes and API handlers.
- `src/components`: Modular UI components (Accessibility, Crisis, Health).
- `src/models`: Mongoose database schemas.
- `src/lib`: Shared utilities for AI and Database.

---
Built with ❤️ for a more resilient campus community.
