# Retro App

A modern, real-time retrospective meeting management application built with Next.js 15, Supabase, and TypeScript.

[![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-green)](https://supabase.com/)
[![Bun](https://img.shields.io/badge/Bun-1.x-orange)](https://bun.sh/)

## 🚀 Features

- **Real-Time Collaboration**: Multiple team members can add and move comments simultaneously
- **Template-Based Workflow**: Pre-defined templates (e.g., Start/Stop/Continue) guide retrospective structure
- **Drag & Drop Interface**: Intuitive comment organization with drag-and-drop
- **Team Management**: Secure team-based access with invite token system
- **Modern Tech Stack**: Built with the latest web technologies
- **Server Components**: Optimized performance with React Server Components
- **Type-Safe**: Full TypeScript coverage for reliability

## 📸 Screenshots

> Add screenshots of your application here

## 🎯 Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd retro-app

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run development server
bun run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your app.

## 📚 Documentation

Comprehensive documentation is available in both English and Turkish.

### For Developers (Technical Documentation)

Learn how to build, customize, and deploy the application.

#### English

1. [📖 Overview](docs/technical/en/01-overview.md) - Project vision, features, and technology stack
2. [🚀 Getting Started](docs/technical/en/02-getting-started.md) - Setup, installation, and development workflow
3. [🏗️ Architecture](docs/technical/en/03-architecture.md) - System design, rendering strategy, and data flow
4. [🔐 Authentication](docs/technical/en/04-authentication.md) - Auth flow, team management, and security
5. [💾 Data Layer](docs/technical/en/05-data-layer.md) - Supabase clients, queries, and real-time sync
6. [🧩 Components](docs/technical/en/06-components.md) - Component patterns, styling, and best practices
7. [🚢 Deployment](docs/technical/en/07-deployment.md) - Production deployment and optimization

#### Türkçe

1. [📖 Genel Bakış](docs/technical/tr/01-genel-bakis.md) - Proje vizyonu, özellikler ve teknoloji yığını
2. [🚀 Başlangıç](docs/technical/tr/02-baslangic.md) - Kurulum, yükleme ve geliştirme iş akışı

### For End Users (User Documentation)

Learn how to use the application effectively.

#### English

1. [👋 Getting Started](docs/user/en/01-getting-started.md) - Account creation, login, and dashboard overview
2. [✨ Creating Retros](docs/user/en/02-creating-retro.md) - How to create and set up retrospectives
3. [📝 Managing Retros](docs/user/en/03-managing-retro.md) - Working with comments and organizing feedback
4. [👥 Team Management](docs/user/en/04-teams.md) - Inviting members and collaboration

#### Türkçe

1. [👋 Başlangıç](docs/user/tr/01-baslangic.md) - Hesap oluşturma, giriş ve kontrol paneline genel bakış
2. [✨ Retro Oluşturma](docs/user/tr/02-retro-olusturma.md) - Retrospektiflerin nasıl oluşturulacağı ve kurulacağı
3. [📝 Retro Yönetimi](docs/user/tr/03-retro-yonetimi.md) - Yorumlarla çalışma ve geri bildirimleri organize etme
4. [👥 Takım Yönetimi](docs/user/tr/04-takim-yonetimi.md) - Üye davet etme ve işbirliği

## 🛠️ Tech Stack

### Frontend

- **Next.js 15.5.2** - React framework with App Router
- **React 19.1.0** - UI library with Server Components
- **TypeScript** - Type-safe development
- **TailwindCSS 4** - Utility-first CSS framework
- **shadcn/ui** - High-quality React components
- **React Hook Form** - Form state management
- **TanStack Query** - Server state management
- **React DnD** - Drag-and-drop functionality

### Backend & Infrastructure

- **Supabase** - Backend-as-a-Service
    - PostgreSQL database
    - Real-time subscriptions
    - Authentication
    - Row Level Security
- **Bun** - JavaScript runtime and package manager

### Developer Tools

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking

## 🗂️ Project Structure

```
retro-app/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Authentication pages
│   │   └── (main)/            # Main application
│   ├── actions/                # Server Actions
│   ├── queries/                # Client-side queries
│   ├── components/             # React components
│   ├── contexts/               # Context providers
│   ├── lib/                    # Utilities and configs
│   └── middleware.ts           # Route protection
├── public/                     # Static assets
├── docs/                       # Documentation
└── .cursor/                    # Cursor AI rules
```

## 🔑 Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 🧪 Development

```bash
# Install dependencies
bun install

# Run development server
bun run dev

# Build for production
bun run build

# Start production server
bun run start

# Run linter
bun run lint
```

## 🗄️ Database Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL migrations from [Getting Started Guide](docs/technical/en/02-getting-started.md#set-up-database-tables)
3. Enable Row Level Security and create policies
4. Enable Realtime for `retro_comments` table

## 🚢 Deployment

### Netlify with GitHub Actions

The application is deployed using Netlify CLI in GitHub Actions workflow.

1. Set up Netlify site and get your site ID
2. Generate a Netlify auth token
3. Add secrets to your GitHub repository:
    - `NETLIFY_AUTH_TOKEN`
    - `NETLIFY_SITE_ID`
    - `NEXT_PUBLIC_SUPABASE_URL`
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Push to main branch to trigger automatic deployment

See [Deployment Guide](docs/technical/en/07-deployment.md) for detailed instructions.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Next.js** - For the amazing React framework
- **Supabase** - For the powerful backend platform
- **shadcn/ui** - For beautiful UI components
- **Netlify** - For hosting and deployment
- **Bun** - For fast JavaScript runtime

## 🗺️ Roadmap

- [ ] Additional retrospective templates
- [ ] Export retro results to PDF/CSV
- [ ] Voting system for comments
- [ ] Action item tracking
- [ ] Multi-team support
- [ ] Mobile app (React Native)
- [ ] Integration with Slack/Teams
- [ ] AI-powered insights

## 📊 Status

- **Version**: 0.1.0
- **Status**: In Active Development
- **Last Updated**: October 2025

---

Made with ❤️ using Next.js and Supabase

**[Documentation](#-documentation)** · **[Features](#-features)** · **[Tech Stack](#-tech-stack)** · **[Quick Start](#-quick-start)**
