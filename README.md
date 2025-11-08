# MoodScape - AI Wallpaper Generator

A modern, full-stack Next.js 16 application for generating and editing AI-powered wallpapers.

## Features

- 🎨 **AI-Powered Generation**: Generate unique wallpapers from text prompts using Gemini API
- ✏️ **Manual Editing**: Adjust brightness, contrast, saturation, blur, sharpness, and warmth
- 🤖 **AI Restyle**: Transform existing wallpapers with AI-powered style modifications
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- 🔐 **Authentication**: Google OAuth integration with NextAuth.js
- 💳 **Credit System**: Guest users get 2 free generations, logged-in users get 15 credits
- 🚀 **SSR Optimized**: Built with Next.js 16 for optimal performance and SEO

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS + ShadCN UI + Framer Motion
- **State Management**: Zustand
- **AI API**: Google Gemini (for prompt enhancement)
- **Database**: MongoDB (via Mongoose)
- **Image Storage**: Cloudinary
- **Authentication**: NextAuth.js (Google OAuth)
- **Image Editing**: Canvas API + Sharp (server-side)

## Prerequisites

- Node.js 18+ 
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account
- Google OAuth credentials
- Gemini API key

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd ai-wallpaper
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory:

```env
# Gemini API Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/moodscape?retryWrites=true&w=majority

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# NextAuth Configuration
NEXTAUTH_SECRET=your_nextauth_secret_here_generate_with_openssl_rand_base64_32
NEXTAUTH_URL=http://localhost:3000

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Node Environment
NODE_ENV=development
```

### 4. Generate NextAuth secret

```bash
openssl rand -base64 32
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── generate/           # Generator page
│   ├── editor/            # Editor page
│   └── dashboard/         # Dashboard page
├── components/
│   ├── server/            # Server Components
│   ├── client/            # Client Components
│   └── ui/                # ShadCN UI components
├── lib/                   # Utility libraries
├── models/                # Mongoose models
├── store/                 # Zustand stores
├── types/                 # TypeScript types
└── utils/                 # Utility functions
```

## Important Notes

### Image Generation

**Note**: The Gemini API may not support direct image generation. The current implementation includes a placeholder that will need to be configured with an actual image generation service. Options include:

- **Stability AI** (Stable Diffusion)
- **OpenAI DALL-E**
- **Replicate API** (for various models)
- **Google Imagen API** (if available)

Update the `generateImage` function in `src/lib/gemini.ts` with your chosen service.

### MongoDB Adapter

The NextAuth MongoDB adapter requires the `@auth/mongodb-adapter` package. Make sure to install it:

```bash
npm install @auth/mongodb-adapter
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The app uses Next.js 16's standalone output, making it compatible with most Node.js hosting platforms.

## Security Features

- ✅ Input validation with Zod
- ✅ Rate limiting on API routes
- ✅ Security headers (CSP, HSTS, etc.)
- ✅ Server-side only API keys
- ✅ CSRF protection via NextAuth.js
- ✅ Secure cookie handling

## Performance Optimizations

- ✅ Server-Side Rendering (SSR)
- ✅ Image optimization with Next.js Image component
- ✅ Code splitting and lazy loading
- ✅ React Compiler for automatic memoization
- ✅ Turbopack for faster builds
- ✅ Cloudinary CDN for image delivery

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.

