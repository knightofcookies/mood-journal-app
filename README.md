# 📔 Mood Journal — Your Intelligent Wellness Companion

> Transform your mental wellness journey with AI-powered insights, sentiment analysis, and personalized guidance. A privacy-first, feature-rich Progressive Web App built with modern web technologies.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Built with SvelteKit](https://img.shields.io/badge/Built%20with-SvelteKit-FF3E00.svg)](https://kit.svelte.dev/)
[![Svelte 5](https://img.shields.io/badge/Svelte-5-FF3E00.svg)](https://svelte.dev/)
[![Progressive Web App](https://img.shields.io/badge/PWA-Ready-5A0FC8.svg)](https://web.dev/progressive-web-apps/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6.svg)](https://www.typescriptlang.org/)

<div align="center">

**[Features](#-features)** • **[Quick Start](#-quick-start)** • **[Documentation](#-documentation)** • **[Roadmap](#-development-roadmap)** • **[Contributing](#-contributing)**

</div>

---

## 📋 Table of Contents

- [Features](#-features)
- [Quick Start](#-quick-start)
- [Progressive Web App](#-progressive-web-app-pwa)
- [Technology Stack](#️-technology-stack)
- [Project Structure](#-project-structure)
- [Documentation](#-documentation)
- [Development Roadmap](#-development-roadmap)
- [Testing](#-testing)
- [Building for Production](#-building-for-production)
- [Contributing](#-contributing)
- [Troubleshooting](#-troubleshooting)
- [FAQ](#-faq)
- [License](#-license)
- [Acknowledgments](#-acknowledgments)
- [Support](#-support--community)

---

## 🖼️ Screenshots

> *Coming soon - Screenshots will showcase the dashboard, journal entry interface, mood analytics, AI companion chat, and achievements system.*

---

## ✨ Features

### 🧠 AI-Powered Intelligence

- **🆕 Cognitive Distortion Detection**: Automatically detect 10 types of unhelpful thinking patterns from Cognitive Behavioral Therapy (CBT) and receive evidence-based reframing suggestions
- **Sentiment Analysis**: Real-time mood detection powered by DistilBERT multilingual model (supports 7 languages)
- **Keyword Extraction**: Discover themes, patterns, and recurring topics in your journal entries
- **AI Companion Chat**: Supportive AI assistant that understands your journey (OpenAI GPT, Groq, Google Gemini, or Local Ollama)
- **Pattern Recognition**: Identify emotional cycles, triggers, and behavioral patterns over time
- **Positive Anchors**: Automatically extract and save positive moments to revisit during difficult times
- **Smart Context**: AI remembers your journal history for more personalized conversations

### 📊 Advanced Analytics & Insights

- **Mood Trends Visualization**: Interactive charts showing emotional patterns over days, weeks, and months
- **Streak Tracking**: Build consistency with daily journaling streaks and milestone celebrations
- **Comprehensive Dashboard**: Statistics on entry count, average sentiment, most active days, and more
- **Wellness Metrics**: Track anxiety, stress, and sadness patterns with actionable insights
- **Semantic Search**: Find past entries instantly using natural language queries
- **Similar Entries**: Discover related journal entries based on content similarity
- **Export Options**: Download your data in PDF, JSON, or Markdown formats

### 🎮 Gamification & Motivation

- **Achievement System**: Unlock 20+ achievements across 5 categories (First Steps, Consistency, Reflection, Wellness, Milestones)
- **XP & Leveling**: Earn experience points for journaling activities and level up your practice
- **Progress Tracking**: Visual progress bars showing completion status for each achievement category
- **Celebration Toasts**: Delightful animations when you unlock new achievements
- **Milestone Rewards**: Special badges for reaching significant milestones (7-day, 30-day, 100-day streaks, etc.)

### 🧘 Wellness & Self-Care Features

- **Smart Recommendations**: Personalized wellness suggestions based on your mood patterns and journal content
- **Guided Breathing Exercises**: Multiple breathing techniques for stress, anxiety, and relaxation
- **Journaling Prompts**: Access 1000+ curated prompts across 5 categories (Gratitude, Reflection, Goals, Creativity, Wellness)
- **Template Selector**: Quick-start templates for different journaling styles
- **Pattern Insights**: Automatic detection and explanation of anxiety, stress, and sadness patterns
- **Wellness Score**: Track your overall mental wellness trajectory

### 📱 Modern User Experience

- **Progressive Web App**: Install on any device (mobile, tablet, desktop), works offline
- **Beautiful UI**: Modern, clean design with shadcn-svelte components and smooth animations
- **Dark Mode**: Automatic theme switching based on system preferences or manual toggle
- **Mobile Optimized**: Touch-friendly interface with bottom navigation and swipe gestures
- **Voice Recording**: Record journal entries using voice input (experimental)
- **Pull-to-Refresh**: Native mobile app feel with refresh gestures
- **Responsive Design**: Seamlessly adapts to any screen size
- **Accessibility**: ARIA labels and keyboard navigation support

### 🔒 Privacy & Security

- **Local-First Architecture**: Your data stays on your device by default
- **Secure Authentication**: Production-grade session-based auth with Argon2 password hashing
- **Rate Limiting**: Protection against brute-force attacks and abuse
- **No Tracking**: Zero analytics, no cookies, no data mining, no third-party scripts
- **Optional OAuth**: Google Sign-In support for convenience (fully optional)
- **Data Ownership**: Export your data anytime in multiple formats
- **End-to-End Encryption**: Coming soon in Phase 9 of roadmap

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.0 or higher ([Download](https://nodejs.org/))
- **npm** (comes with Node.js) or **pnpm**
- **Python** 3.8 or higher ([Download](https://www.python.org/downloads/))
- **Git** ([Download](https://git-scm.com/downloads))

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/knightofcookies/mood-journal-app.git
cd mood-journal-app
```

#### 2. Install Node.js Dependencies

```bash
npm install
```

#### 3. Set Up Python Sentiment Analysis Server

The app uses a separate Python server for sentiment analysis using a machine learning model.

```bash
cd sentiment-server

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

cd ..
```

**Note**: The first time you run the sentiment server, it will download the DistilBERT model (~250MB), which may take a few minutes.

#### 4. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database (default is fine for local development)
DATABASE_URL=./data/app.db

# Sentiment Analysis Server
SENTIMENT_API_URL=http://localhost:5001

# AI Companion - Get a free API key from https://console.groq.com
GROQ_API_KEY=your_groq_api_key_here

# Optional: Google OAuth (for social login)
# GOOGLE_CLIENT_ID=your_google_client_id
# GOOGLE_CLIENT_SECRET=your_google_client_secret
# GOOGLE_REDIRECT_URI=http://localhost:5173/auth/google/callback

# Optional: Redis (for production rate limiting)
# REDIS_URL=redis://localhost:6379

# Environment
NODE_ENV=development
```

**Getting API Keys** (all optional except for AI chat):
- **Groq API** (Free, recommended): Sign up at [console.groq.com](https://console.groq.com)
- **OpenAI API**: Get key at [platform.openai.com](https://platform.openai.com)
- **Google Gemini**: Get key at [makersuite.google.com](https://makersuite.google.com)
- **Ollama** (Local): Install from [ollama.ai](https://ollama.ai) - no API key needed

#### 5. Initialize the Database

```bash
npm run db:push
```

This creates the SQLite database and all necessary tables.

#### 6. Start the Development Servers

You'll need to run **two servers** simultaneously:

**Terminal 1 - Sentiment Server:**
```bash
cd sentiment-server

# Windows:
start.bat
# or manually:
venv\Scripts\activate
python server.py

# Linux/Mac:
source venv/bin/activate
python server.py
```

The sentiment server will start on `http://localhost:5001`

**Terminal 2 - Main Application:**
```bash
npm run dev
```

The app will start on `http://localhost:5173`

#### 7. Open the App

Visit [http://localhost:5173](http://localhost:5173) in your browser and create an account to start journaling!

### 🎉 You're All Set!

Create your first journal entry, explore the AI companion, and discover insights about your mood patterns.

## 📱 Progressive Web App (PWA)

Mood Journal can be installed as a native-like app on any device:

### Installation Instructions

**📱 Mobile (iOS/Android):**
1. Open the app in Safari (iOS) or Chrome (Android)
2. Tap the **Share** button (iOS) or **Menu** (⋮) button (Android)
3. Select **"Add to Home Screen"**
4. Tap **"Add"** to install

**💻 Desktop (Windows/Mac/Linux):**
1. Open the app in Chrome, Edge, or another Chromium browser
2. Look for the **install icon** (⊕) in the address bar
3. Click **"Install"** in the prompt

### PWA Features
- ✅ **Offline Support**: Write journal entries without internet
- ✅ **Fast Loading**: Instant startup with service worker caching
- ✅ **Native Feel**: Full-screen experience without browser UI
- ✅ **Home Screen Icon**: Quick access like a native app
- 🔄 **Auto Updates**: Always get the latest features

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: [SvelteKit](https://kit.svelte.dev/) 2.43+ with [Svelte 5](https://svelte.dev/) (using modern runes API)
- **Language**: TypeScript 5.9+
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) 4.1+ with custom design system
- **UI Components**: [shadcn-svelte](https://www.shadcn-svelte.com/) + [bits-ui](https://bits-ui.com/)
- **Icons**: [@lucide/svelte](https://lucide.dev/) (500+ beautiful icons)
- **Charts**: [Chart.js](https://www.chartjs.org/) 4.5+ for data visualization
- **Markdown**: [marked](https://marked.js.org/) + [DOMPurify](https://github.com/cure53/DOMPurify) for safe rendering
- **Forms**: [Valibot](https://valibot.dev/) for schema validation
- **Date Handling**: [date-fns](https://date-fns.org/) for date manipulation

### Backend
- **Runtime**: Node.js 18+ with native Web APIs
- **Database**: [SQLite](https://www.sqlite.org/) with [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/) 0.44+ for type-safe database access
- **Authentication**: Custom session-based auth with [Argon2](https://github.com/ranisalt/node-argon2) password hashing
- **Session Management**: [@oslojs/crypto](https://oslo.js.org/) for secure session tokens
- **Rate Limiting**: In-memory with optional Redis support

### AI & NLP
- **Sentiment Analysis**: Python Flask server with [DistilBERT](https://huggingface.co/lxyuan/distilbert-base-multilingual-cased-sentiments-student)
- **ML Framework**: [PyTorch](https://pytorch.org/) + [Transformers](https://huggingface.co/transformers)
- **AI Providers**: 
  - [OpenAI GPT](https://openai.com/) (GPT-4, GPT-3.5)
  - [Groq](https://groq.com/) (Llama, Mixtral - ultra-fast inference)
  - [Google Gemini](https://deepmind.google/technologies/gemini/) (Gemini Pro)
  - [Ollama](https://ollama.ai/) (Local models)
- **Cognitive Distortion Detection**: Custom NLP patterns based on CBT principles

### Development Tools
- **Build Tool**: [Vite](https://vitejs.dev/) 7.1+ with esbuild
- **Testing**: 
  - [Vitest](https://vitest.dev/) for unit/integration tests
  - [Playwright](https://playwright.dev/) for E2E tests
- **Linting**: [ESLint](https://eslint.org/) 9+ with TypeScript support
- **Formatting**: [Prettier](https://prettier.io/) with Svelte & Tailwind plugins
- **Type Checking**: [svelte-check](https://github.com/sveltejs/language-tools) for Svelte + TS

### DevOps & Deployment
- **Adapter**: [@sveltejs/adapter-auto](https://kit.svelte.dev/docs/adapters) (supports Vercel, Netlify, Node, etc.)
- **Service Worker**: Custom offline-first strategy with cache management
- **Environment**: `.env` with runtime validation

---

## 📂 Project Structure

```
mood-journal-app/
├── src/
│   ├── routes/                 # SvelteKit routes (pages & API endpoints)
│   │   ├── +page.svelte       # Home/dashboard page
│   │   ├── auth/              # Authentication routes (login, register, OAuth)
│   │   ├── journal/           # Journal-related routes
│   │   │   ├── new/           # Create new entry
│   │   │   ├── [id]/          # View/edit specific entry
│   │   │   ├── analytics/     # Mood analytics and trends
│   │   │   ├── companion/     # AI chat companion
│   │   │   ├── insights/      # NLP insights and patterns
│   │   │   ├── search/        # Semantic search
│   │   │   └── export/        # Data export (PDF, JSON, MD)
│   │   ├── wellness/          # Wellness recommendations & exercises
│   │   ├── achievements/      # Achievements & gamification
│   │   ├── account/           # User account settings
│   │   └── api/               # API endpoints
│   ├── lib/
│   │   ├── components/        # Reusable Svelte components
│   │   │   ├── ui/            # shadcn-svelte UI components
│   │   │   ├── charts/        # Chart components
│   │   │   ├── BottomNav.svelte
│   │   │   ├── BreathingExercise.svelte
│   │   │   ├── VoiceRecorder.svelte
│   │   │   └── ...
│   │   ├── server/            # Server-side utilities
│   │   │   ├── db/            # Drizzle ORM schema & queries
│   │   │   ├── auth.ts        # Authentication logic
│   │   │   ├── session.ts     # Session management
│   │   │   ├── nlp.ts         # NLP integration
│   │   │   ├── ai.ts          # AI provider abstraction
│   │   │   ├── wellness.ts    # Wellness recommendations engine
│   │   │   ├── achievements.ts # Achievement tracking
│   │   │   └── ...
│   │   ├── stores/            # Svelte stores for state management
│   │   ├── utils.ts           # Utility functions
│   │   └── templates.ts       # Journaling prompts & templates
│   ├── app.html               # HTML template
│   ├── app.css                # Global styles
│   └── hooks.server.ts        # SvelteKit server hooks
├── sentiment-server/          # Python sentiment analysis microservice
│   ├── server.py              # Flask API server
│   ├── requirements.txt       # Python dependencies
│   ├── start.bat              # Windows startup script
│   └── README.md              # API documentation
├── static/                    # Static assets
│   ├── manifest.json          # PWA manifest
│   ├── sw.js                  # Service worker
│   ├── icons/                 # App icons
│   └── offline.html           # Offline fallback page
├── drizzle/                   # Database migrations
├── tests/                     # Test files
│   ├── e2e/                   # Playwright E2E tests
│   └── *.test.ts              # Vitest unit tests
├── .env.example               # Environment variables template
├── svelte.config.js           # SvelteKit configuration
├── vite.config.ts             # Vite configuration
├── drizzle.config.ts          # Drizzle ORM configuration
├── tailwind.config.ts         # Tailwind CSS configuration
└── package.json               # Node.js dependencies & scripts
```

---

##  Documentation

Comprehensive documentation is available in the repository:

- **[SENTIMENT_ARCHITECTURE.md](./SENTIMENT_ARCHITECTURE.md)** - Detailed architecture of the sentiment analysis system, model selection rationale, and API reference
- **[ENHANCEMENT_ROADMAP.md](./ENHANCEMENT_ROADMAP.md)** - Complete product vision with 11-phase development roadmap and feature specifications
- **[IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)** - Step-by-step technical implementation guide for contributors
- **[ENHANCEMENT_SUMMARY.md](./ENHANCEMENT_SUMMARY.md)** - Summary of latest feature additions and improvements
- **[APP_BLUEPRINT.md](./APP_BLUEPRINT.md)** - Core architecture decisions, design patterns, and technical philosophy
- **[IMPROVEMENTS_SUMMARY.md](./IMPROVEMENTS_SUMMARY.md)** - Production security enhancements and hardening measures
- **[sentiment-server/README.md](./sentiment-server/README.md)** - Python sentiment server API reference and troubleshooting

---

## 🎯 Development Roadmap

### ✅ Phase 1-4: Core Foundation (Completed)

- ✅ **Authentication System** - Secure login, registration, session management, OAuth support
- ✅ **Journal CRUD** - Create, read, update, delete journal entries with rich text
- ✅ **NLP Analysis** - Sentiment detection, keyword extraction, entity recognition
- ✅ **AI Companion** - Multi-provider chat assistant with context awareness
- ✅ **Analytics & Visualization** - Mood trends, charts, statistics dashboard
- ✅ **Search & Export** - Semantic search, similar entries, PDF/JSON/MD export
- ✅ **PWA Foundation** - Service worker, offline support, installable

### ✅ Phase 5-6: Engagement & Wellness (Completed)

- ✅ **Achievements System** - 20+ unlockable achievements, XP system, leveling
- ✅ **Wellness Engine** - Smart recommendations based on mood patterns
- ✅ **Breathing Exercises** - Multiple guided techniques for different needs
- ✅ **Journaling Prompts** - 1000+ curated prompts across 5 categories
- ✅ **Pattern Detection** - Automatic identification of anxiety, stress, sadness patterns
- ✅ **Cognitive Distortion Detection** - 10 CBT-based patterns with reframing suggestions

### 🔄 Phase 7: Polish & UX (In Progress)

- ✅ Achievements database integration
- ✅ Wellness recommendations UI
- 🔄 Voice journaling (Web Speech API) - Component created, needs integration
- 🔄 Enhanced install prompt - Component created, needs testing
- 🔄 Pull-to-refresh improvements
- 📋 Onboarding flow for new users
- 📋 Tutorial tooltips and guided tours

### 🚀 Phase 8-9: Mobile & Privacy (Upcoming)

- 📋 **Native Mobile Apps** - React Native or Capacitor wrappers for iOS/Android
- 📋 **Push Notifications** - Smart reminders and wellness check-ins
- 📋 **Biometric Auth** - Fingerprint/Face ID for mobile devices
- 📋 **End-to-End Encryption** - Optional E2EE for maximum privacy
- 📋 **Local-Only Mode** - Complete offline functionality without cloud sync
- 📋 **Data Sync** - Cross-device synchronization with conflict resolution

### 🌟 Phase 10-11: Advanced Features (Future)

- 📋 **Enhanced Visualizations** - Heatmaps, word clouds, emotion wheels, timeline view
- 📋 **Social Features** - Optional privacy-first sharing, accountability partners, communities
- 📋 **Integrations** - Spotify mood playlists, weather correlation, fitness tracker data
- 📋 **Advanced AI** - Therapist-style reflections, goal tracking, personalized insights
- 📋 **Accessibility** - Screen reader optimization, high contrast themes, voice navigation
- 📋 **Internationalization** - Multi-language support beyond English

See **[ENHANCEMENT_ROADMAP.md](./ENHANCEMENT_ROADMAP.md)** for complete specifications and implementation details.

---

## 🧪 Testing

The project includes comprehensive test coverage with unit, integration, and E2E tests.

### Run All Tests

```bash
# Run unit and integration tests
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Run E2E tests with Playwright
npm run test:e2e

# Generate coverage report
npm test -- --coverage
```

### Type Checking

```bash
# Check TypeScript types and Svelte components
npm run check

# Watch mode for continuous type checking
npm run check:watch
```

### Linting & Formatting

```bash
# Check code style
npm run lint

# Format code with Prettier
npm run format
```

### Database Commands

```bash
# Push schema changes to database (development)
npm run db:push

# Generate migrations
npm run db:generate

# Run migrations (production)
npm run db:migrate

# Open Drizzle Studio (database GUI)
npm run db:studio
```

---

## 📦 Building for Production

### Standard Build

```bash
# Build the application
npm run build

# Preview production build locally
npm run preview
```

The built files will be in the `build/` directory.

### Environment-Specific Builds

For production deployment, ensure your `.env` file has production values:

```env
NODE_ENV=production
DATABASE_URL=/path/to/production/database.db
SENTIMENT_API_URL=https://your-sentiment-server.com
# Add production API keys
```

### Deployment Platforms

The app uses `@sveltejs/adapter-auto`, which automatically detects and configures for:

- **Vercel** - Zero configuration
- **Netlify** - Zero configuration  
- **Cloudflare Pages** - Zero configuration
- **Node.js Server** - For VPS/bare metal
- **Static Hosting** - With adapter-static

For specific platform instructions, see the [SvelteKit deployment docs](https://kit.svelte.dev/docs/adapters).

### Deploying the Sentiment Server

The Python sentiment server needs to be deployed separately:

1. **Docker** (recommended):
   ```bash
   cd sentiment-server
   docker build -t mood-journal-sentiment .
   docker run -p 5001:5001 mood-journal-sentiment
   ```

2. **Heroku/Railway/Render**: Use the included `requirements.txt`

3. **VPS**: Run with gunicorn for production:
   ```bash
   pip install gunicorn
   gunicorn -w 4 -b 0.0.0.0:5001 server:app
   ```

Update `SENTIMENT_API_URL` in your `.env` to point to the deployed server.

---

## 🤝 Contributing

Contributions are welcome and appreciated! Whether it's bug fixes, new features, documentation improvements, or feedback, all contributions help make this project better.

### How to Contribute

1. **Fork the Repository**
   ```bash
   # Click the "Fork" button on GitHub, then:
   git clone https://github.com/YOUR_USERNAME/mood-journal-app.git
   cd mood-journal-app
   ```

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/bug-description
   ```

3. **Make Your Changes**
   - Write clean, documented code
   - Follow the existing code style (Prettier will help)
   - Add tests for new features
   - Update documentation if needed

4. **Test Your Changes**
   ```bash
   npm run check    # Type checking
   npm run lint     # Linting
   npm test         # Unit tests
   npm run test:e2e # E2E tests
   ```

5. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add amazing new feature"
   # Use conventional commits: feat, fix, docs, style, refactor, test, chore
   ```

6. **Push and Create a Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```
   Then open a Pull Request on GitHub with a clear description of your changes.

### Contribution Guidelines

- **Code Style**: Follow the existing patterns, use TypeScript, format with Prettier
- **Testing**: Add tests for new features and ensure existing tests pass
- **Documentation**: Update README or other docs for significant changes
- **Commit Messages**: Use [Conventional Commits](https://www.conventionalcommits.org/)
- **Pull Requests**: Provide clear description, link related issues

### Areas for Contribution

- 🐛 Bug fixes and error handling improvements
- ✨ New features from the roadmap
- 📝 Documentation and examples
- 🧪 Additional test coverage
- 🎨 UI/UX improvements
- 🌍 Internationalization (i18n)
- ♿ Accessibility enhancements
- 🚀 Performance optimizations

### Questions?

Feel free to open an issue for discussion before starting work on major changes!

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 Knight of Cookies

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🌟 Acknowledgments

This project stands on the shoulders of giants. Special thanks to:

### Frameworks & Tools
- **[SvelteKit](https://kit.svelte.dev/)** & **[Svelte](https://svelte.dev/)** - The best reactive framework for building web apps
- **[shadcn-svelte](https://www.shadcn-svelte.com/)** - Beautiful and accessible UI components
- **[Drizzle ORM](https://orm.drizzle.team/)** - Type-safe and intuitive database toolkit
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework

### AI & ML
- **[Hugging Face](https://huggingface.co/)** - DistilBERT model for sentiment analysis
- **[OpenAI](https://openai.com/)**, **[Groq](https://groq.com/)**, **[Google Gemini](https://deepmind.google/technologies/gemini/)** - AI companion providers
- **[Ollama](https://ollama.ai/)** - Local AI model hosting

### Inspiration
- **Mental wellness community** - For advocating the importance of journaling
- **CBT research** - For cognitive distortion detection patterns
- **Open-source contributors** - For making amazing tools freely available

### Icons & Design
- **[Lucide Icons](https://lucide.dev/)** - Beautiful consistent icon set
- **[Emoji](https://emojipedia.org/)** - Universal visual language

---

---

## 🔧 Troubleshooting

### Common Issues

#### Sentiment Server Won't Start

**Problem**: `ModuleNotFoundError: No module named 'flask'`

**Solution**: 
```bash
cd sentiment-server
# Make sure virtual environment is activated
venv\Scripts\activate  # Windows
# or: source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
```

#### Database Errors

**Problem**: `Database locked` or `SQLITE_BUSY` errors

**Solution**: 
- Make sure only one instance of the app is running
- Check that no other program is accessing the database file
- Delete `./data/app.db` and run `npm run db:push` to recreate

#### AI Companion Not Working

**Problem**: AI responses are empty or errors occur

**Solution**:
- Verify your API key is set correctly in `.env`
- For Groq: Get a free key at [console.groq.com](https://console.groq.com)
- For Ollama: Make sure Ollama is running (`ollama serve`)
- Check the browser console for specific error messages

#### Build Errors After Update

**Problem**: TypeScript or build errors after `git pull`

**Solution**:
```bash
# Clean install dependencies
rm -rf node_modules package-lock.json
npm install

# Regenerate types
npm run prepare
```

### Performance Tips

- **Slow sentiment analysis?** The first request downloads the model (~250MB). Subsequent requests are fast.
- **High memory usage?** The DistilBERT model uses ~500MB RAM. Use a machine with at least 2GB available.
- **PWA not updating?** Clear service worker cache: DevTools → Application → Clear Storage

### Need More Help?

Check the [GitHub Issues](https://github.com/knightofcookies/mood-journal-app/issues) or open a new one!

---

## ❓ FAQ

<details>
<summary><strong>Is my data private and secure?</strong></summary>

Yes! Your journal entries are stored locally in a SQLite database on your device. We don't send your data to any external servers except:
- Sentiment analysis (sent to your local Python server)
- AI chat (sent only to your chosen AI provider if you use that feature)

You have full control over your data and can export it anytime.
</details>

<details>
<summary><strong>Do I need an API key to use the app?</strong></summary>

No! The core journaling, sentiment analysis, and analytics features work without any API keys. API keys are only needed for:
- **AI Companion chat** (optional feature)
- **Google OAuth login** (optional, you can use email/password instead)
</details>

<details>
<summary><strong>Can I use this app offline?</strong></summary>

Yes! As a Progressive Web App, Mood Journal works offline after initial installation. You can write entries, view past entries, and use most features without internet. AI chat and sentiment analysis require internet.
</details>

<details>
<summary><strong>Which AI provider should I use?</strong></summary>

- **Groq** - Best for most users. Free tier, very fast, great models (Llama 3, Mixtral)
- **Ollama** - Best for privacy. Runs completely local, no API key needed, but requires powerful hardware
- **OpenAI** - Best quality responses, but costs money
- **Gemini** - Good middle ground, generous free tier
</details>

<details>
<summary><strong>How accurate is the sentiment analysis?</strong></summary>

The app uses DistilBERT, a state-of-the-art machine learning model with ~82% accuracy on sentiment classification. It supports 7 languages and detects positive, negative, and neutral sentiments. While very accurate, it's not perfect and may misinterpret sarcasm or complex emotions.
</details>

<details>
<summary><strong>Can I import data from other journaling apps?</strong></summary>

Not currently, but it's on the roadmap! For now, you can manually create entries or use the bulk import feature (coming in Phase 8).
</details>

<details>
<summary><strong>Is this a replacement for therapy?</strong></summary>

No! Mood Journal is a wellness tool to support your mental health journey, but it's not a replacement for professional mental health care. If you're struggling, please reach out to a qualified therapist or counselor.
</details>

<details>
<summary><strong>How can I contribute to the project?</strong></summary>

We welcome contributions! See the [Contributing](#-contributing) section for guidelines. You can contribute code, documentation, bug reports, feature ideas, or just star the repo to show support!
</details>

---

## 💬 Support & Community

### Get Help

- **📧 Email**: [Your Email or Support Email]
- **🐛 Bug Reports**: [GitHub Issues](https://github.com/knightofcookies/mood-journal-app/issues)
- **💡 Feature Requests**: [GitHub Discussions](https://github.com/knightofcookies/mood-journal-app/discussions)
- **📖 Documentation**: See the `/docs` folder and linked markdown files
- **💬 Discussions**: [GitHub Discussions](https://github.com/knightofcookies/mood-journal-app/discussions)

### Stay Updated

- ⭐ **Star this repository** to show support and stay updated
- 👀 **Watch releases** to get notified of new versions
- 🐦 **Follow on Twitter/X**: [Your Handle] (if applicable)

### Mental Health Resources

If you're struggling with your mental health, please reach out to professional help:

- **USA**: National Suicide Prevention Lifeline - 988
- **UK**: Samaritans - 116 123
- **International**: [Find a Helpline](https://findahelpline.com/)

**Remember**: This app is a wellness tool, not a replacement for professional mental health care.

---

## 🎉 Star History

If you find this project helpful, please consider giving it a star! ⭐

[![Star History Chart](https://api.star-history.com/svg?repos=knightofcookies/mood-journal-app&type=Date)](https://star-history.com/#knightofcookies/mood-journal-app&Date)

---

## 🙏 Thank You

Thank you for checking out Mood Journal! Whether you're using it for personal wellness, learning from the code, or contributing to the project, your interest means a lot.

**Happy journaling! 📔✨**

---

<div align="center">

**Made with ❤️ and ☕ for mindful journaling**

[⬆ Back to Top](#-mood-journal--your-intelligent-wellness-companion)

</div>
