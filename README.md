# 🚀 Propeer  AI - Next-Generation Educational Platform

**Transform your learning experience with AI-powered tools, social collaboration, and gamified education.**

![Propeer  AI](https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400&q=80)

## ✨ What is Propeer  AI?

Propeer  AI is a comprehensive educational platform that revolutionizes how students learn, collaborate, and grow. By combining cutting-edge AI technology with social learning features, we create an engaging ecosystem where knowledge flows naturally between peers and AI tutors.

### 🎯 Core Features

#### 🤖 **AI-Powered Learning Tools**
- **Smart Notes Generator**: Convert YouTube lectures into structured, comprehensive study notes using Google Gemini AI
- **Personal AI Tutor**: Get instant, detailed explanations and personalized learning guidance with Groq-powered conversations
- **Intelligent Quiz Creator**: Generate custom quizzes tailored to your course, topic, and skill level

#### 🎮 **Gamified Learning Experience**
- **Quiz Battles**: Challenge friends to real-time competitive quizzes
- **Credit System**: Earn rewards for active learning and engagement
- **Achievement Tracking**: Monitor your progress and celebrate milestones
- **Leaderboards**: Compete with peers and climb the rankings

#### 👥 **Social Learning Network**
- **Friends System**: Connect with classmates and study partners
- **Real-time Chat**: Collaborate and discuss topics instantly
- **Study Groups**: Form communities around shared interests
- **Peer Challenges**: Motivate each other through friendly competition

#### 📚 **Curated Content Library**
- **Lecture Finder**: Access thousands of educational YouTube videos
- **Smart Matching**: AI-powered content recommendations based on your learning goals
- **Multi-Subject Support**: Mathematics, Physics, Computer Science, Biology, Chemistry, History, and more

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- Firebase account for backend services
- API keys for Google Gemini and Groq

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/your-username/Propeer -ai.git
   cd Propeer -ai
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up environment variables**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`
   
   Add your API keys:
   \`\`\`env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
   NEXT_PUBLIC_GROQ_API_KEY=your_groq_api_key
   \`\`\`

4. **Start the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 14, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Firebase (Firestore, Authentication)
- **AI Integration**: Google Gemini API, Groq API
- **Real-time Features**: Firebase Realtime Database
- **Animations**: Framer Motion

### Project Structure
\`\`\`
Propeer -ai/
├── src/
│   ├── components/          # Reusable UI components
│   ├── pages/              # Main application pages
│   │   ├── LandingPage.tsx # Welcome and onboarding
│   │   ├── NotesPage.tsx   # AI notes generation
│   │   ├── TutorPage.tsx   # AI tutoring interface
│   │   ├── QuizPage.tsx    # Quiz creation and taking
│   │   ├── LecturesPage.tsx# Curated video content
│   │   ├── FriendsPage.tsx # Social networking
│   │   └── QuizBattlePage.tsx # Competitive quizzes
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Utility functions
│   └── types/              # TypeScript definitions
├── public/                 # Static assets
└── docs/                   # Documentation
\`\`\`

## 🎨 Design System

Propeer  AI features a modern, clean design inspired by healthcare and professional applications:

- **Color Palette**: Clean whites with emerald accents (#10b981)
- **Typography**: DM Sans for clarity and readability
- **Layout**: Card-based design with subtle shadows and rounded corners
- **Responsive**: Mobile-first approach with adaptive layouts

## 🔮 Future Roadmap

### Phase 1: Enhanced AI Features (Q2 2024)
- [ ] Voice-to-text note taking
- [ ] AI-powered study schedules
- [ ] Personalized learning paths
- [ ] Advanced analytics dashboard

### Phase 2: Collaboration Tools (Q3 2024)
- [ ] Virtual study rooms
- [ ] Screen sharing for group study
- [ ] Collaborative note editing
- [ ] Mentor-student matching

### Phase 3: Advanced Gamification (Q4 2024)
- [ ] Achievement badges system
- [ ] Study streaks and habits
- [ ] Team-based challenges
- [ ] Seasonal tournaments

### Phase 4: Mobile & Offline (Q1 2025)
- [ ] Native mobile apps (iOS/Android)
- [ ] Offline note access
- [ ] Push notifications
- [ ] Sync across devices

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Use semantic commit messages
- Add tests for new features
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini AI** for powerful natural language processing
- **Groq** for fast AI inference capabilities
- **Firebase** for reliable backend infrastructure
- **shadcn/ui** for beautiful, accessible components
- **Tailwind CSS** for rapid UI development

## 📞 Support

- 📧 Email: support@Propeer -ai.com
- 💬 Discord: [Join our community](https://discord.gg/Propeer )
- 📖 Documentation: [docs.Propeer -ai.com](https://docs.Propeer -ai.com)
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/Propeer -ai/issues)

---

**Made with ❤️ by the Propeer  AI Team**

*Empowering the next generation of learners through AI and community.*
