# Boletrics Auth

The **Auth** application is the authentication frontend for Boletrics, built with [Next.js](https://nextjs.org/) and deployed on [Cloudflare Workers](https://workers.cloudflare.com/) via [OpenNext](https://opennext.js.org/).

## Overview

This application handles all user authentication flows for the Boletrics platform:

- **Login** - Email/password authentication with remember me option
- **Sign Up** - New user registration with email verification
- **Email Verification** - OTP-based email verification flow
- **Password Recovery** - Forgot password and reset functionality
- **Account Management** - View and manage user session/profile
- **OAuth Support** - Social login integration (via Better Auth)
- **Turnstile Protection** - Cloudflare Turnstile bot protection

## Tech Stack

- **Framework**: Next.js 16 with React 19
- **Styling**: Tailwind CSS 4 with shadcn/ui components
- **Form Handling**: React Hook Form + Zod validation (v4)
- **Animation**: GSAP + Three.js for visual effects
- **Authentication**: Better Auth client
- **Bot Protection**: Cloudflare Turnstile (@marsidev/react-turnstile)
- **Testing**: Vitest + React Testing Library
- **Visual Testing**: Storybook
- **Deployment**: Cloudflare Workers via OpenNext

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 10+

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Available Scripts

| Command             | Description                                    |
| :------------------ | :--------------------------------------------- |
| `pnpm dev`          | Start development server on port 3000          |
| `pnpm build`        | Build for production                           |
| `pnpm preview`      | Preview production build locally               |
| `pnpm deploy`       | Build and deploy to Cloudflare Workers         |
| `pnpm lint`         | Run ESLint                                     |
| `pnpm format`       | Format code with Prettier                      |
| `pnpm format:check` | Check code formatting                          |
| `pnpm typecheck`    | Run TypeScript type checking                   |
| `pnpm test`         | Run tests with coverage                        |
| `pnpm test:watch`   | Run tests in watch mode                        |
| `pnpm storybook`    | Start Storybook on port 6006                   |
| `pnpm ci:check`     | Run all CI checks (format, lint, types, tests) |

## Project Structure

```
auth/
├── src/
│   ├── app/
│   │   ├── page.tsx            # Redirects to /login
│   │   ├── login/              # Login page
│   │   ├── signup/             # Registration page
│   │   ├── verify/             # Email verification
│   │   ├── recover/            # Password recovery
│   │   └── account/            # Account management
│   ├── components/
│   │   ├── views/              # Page view components (login, signup, etc.)
│   │   ├── forms/              # Form components
│   │   └── ui/                 # shadcn/ui components
│   ├── hooks/                  # Custom React hooks
│   ├── lib/
│   │   ├── auth/               # Better Auth client configuration
│   │   └── utils.ts            # Utility functions
│   ├── stories/                # Storybook stories
│   └── test/                   # Test utilities
├── public/                     # Static assets
└── wrangler.jsonc              # Cloudflare Workers configuration
```

## Authentication Flow

1. User navigates to `/login` or `/signup`
2. Turnstile verification (bot protection)
3. Credentials submitted to `auth-svc` via Better Auth
4. On success, user is redirected to the originating application
5. Session is managed via cookies across all Boletrics applications

## Related Services

- **auth-svc** - Authentication backend service (Better Auth server)
- **tickets** - Customer-facing ticketing portal
- **partner** - Organization dashboard
- **admin** - Platform administration dashboard
