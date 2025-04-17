<h1 align="center">
  <br>
  <a href="#"><img src="/public/icon.png" alt="Atlas" width="200"></a>
  <br>
  Atlas
  <br>
</h1>

<h4 align="center">A powerful platform that connects students with meaningful research opportunities.</h4>

<p align="center">
  <a href="#">
    <img src="https://img.shields.io/badge/Next.js-14-black?style=flat-square" alt="Next.js">
  </a>
  <a href="#">
    <img src="https://img.shields.io/badge/Clerk-Auth-purple?style=flat-square" alt="Clerk">
  </a>
  <a href="#">
    <img src="https://img.shields.io/badge/Supabase-Database-green?style=flat-square" alt="Supabase">
  </a>
  <a href="#">
    <img src="https://img.shields.io/badge/Tailwind-CSS-blue?style=flat-square" alt="Tailwind CSS">
  </a>
</p>

<p align="center">
  <a href="#key-features">Key Features</a> •
  <a href="#how-it-works">How It Works</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#environment-variables">Environment Variables</a> •
  <a href="#deployment">Deployment</a> •
  <a href="#roadmap">Roadmap</a>
</p>

<p align="center">
  <video width="100%" autoplay loop muted playsinline>
    <source src="/public/videos/landing.mp4" type="video/mp4">
    Your browser does not support the video tag.
  </video>
</p>

## Key Features

* **One-Profile Application System** - Create a profile once and apply to multiple research opportunities with just a few clicks
* **Personalized Recommendations** - Get matched with research opportunities based on your skills, interests, and experience
* **Simple Application Tracking** - Keep track of all your applications in one place with status updates
* **Last-Minute Opportunities** - Discover time-sensitive research openings that match your profile
* **Institutional Partnerships** - Exclusive research opportunities from partner universities and research institutions
* **Dark/Light Mode** - Customizable interface to suit your preference
* **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
* **Secure Authentication** - Powered by Clerk for secure and easy sign-in options

## How It Works

Atlas simplifies the research application process for students:

1. **Create Your Profile** - Build a comprehensive profile with your academic background, skills, and research interests
2. **Discover Opportunities** - Browse personalized research recommendations tailored to your profile
3. **Apply Easily** - Submit applications with one click using your pre-filled profile information
4. **Track Progress** - Monitor application status and get updates on your research applications
5. **Connect** - Communicate directly with research programs and professors through the platform

## Tech Stack

Atlas is built using modern technologies for the best performance and user experience:

* **Frontend**: Next.js 14, React, Tailwind CSS, Framer Motion
* **Authentication**: Clerk
* **Database**: Supabase
* **Styling**: Tailwind CSS, shadcn/ui components
* **State Management**: React Hooks
* **Deployment**: Vercel

## Getting Started

To run Atlas locally, follow these steps:

```bash
# Clone this repository
git clone https://github.com/yourusername/atlas.git

# Navigate to the project directory
cd atlas

# Install dependencies
npm install

# Set up environment variables
# Create a .env.local file with required variables (see Environment Variables section)

# Start the development server
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/profile-completion
OPENAI_API_KEY=your_openai_api_key
```

## Deployment

Atlas can be easily deployed to Vercel:

1. Fork or clone this repository
2. Set up the environment variables in your Vercel project
3. Connect your GitHub repository to Vercel
4. Deploy!

## Roadmap

Future features planned for Atlas:

- [ ] Advanced filtering options for research opportunities
- [ ] AI-powered application improvement suggestions
- [ ] Mentorship matching with researchers
- [ ] Research paper recommendation system
- [ ] Conference and event discovery
- [ ] Mobile app for on-the-go application tracking

---

> [https://atlas.meriedith.com](https://atlas.meriedith.com)
