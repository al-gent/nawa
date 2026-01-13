# NawaConnect

**The Premier Service Marketplace for Africa**

A two-sided marketplace connecting local service professionals with clients in Namibia. Starting in Windhoek and Swakopmund.

## Overview

NawaConnect solves the problem of fragmented, word-of-mouth service discovery in Namibia. Instead of relying on WhatsApp groups and Facebook posts, clients can find trusted professionals (braiders, barbers, tutors, plumbers, etc.) and book services instantly.

### For Clients
- Search for professionals by service and location
- View verified profiles with portfolios and reviews
- See real-time availability and book instantly
- Manage all bookings in one place

### For Professionals
- Digital profile that acts as your business website
- Manage your calendar and services
- Accept/decline booking requests
- Build your reputation through reviews

### For Admins
- Review and approve new professional applications
- Monitor platform activity
- Manage users and resolve disputes

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Auth**: Supabase Auth (email/password + magic links)
- **Storage**: Supabase Storage (images)
- **Maps**: Google Maps Platform (Places API, Geocoding)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Google Cloud account (for Maps API)

### Installation

1. Clone the repository
```bash
git clone <repo-url>
cd nawaconnect
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables

Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

4. Set up Supabase

- Create a new Supabase project
- Run the database migrations (see `/supabase/migrations/`)
- Create storage bucket named `portfolio-images`

5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
nawaconnect/
├── app/
│   ├── api/              # API routes
│   ├── (auth)/          # Auth pages (login, signup)
│   ├── search/          # Search results page
│   ├── professional/    # Professional profile pages
│   ├── onboarding/      # Professional onboarding wizard
│   ├── dashboard/       # User dashboards (client, pro, admin)
│   └── page.js          # Landing page
├── components/
│   ├── ui/              # Reusable UI components
│   ├── forms/           # Form components
│   └── maps/            # Google Maps components
├── lib/
│   ├── supabase/        # Supabase client config
│   └── utils/           # Helper functions
├── public/              # Static assets
└── supabase/
    └── migrations/      # Database migrations
```

## Key Features

### Professional Onboarding
Multi-step wizard for professionals to create their profile:
1. Basic business information
2. Add services with pricing
3. Upload portfolio photos
4. Submit verification documents
5. Review and submit for admin approval

### Search & Discovery
- Location-based search with Google Maps integration
- Filter by price, rating, distance, availability
- Sort by relevance, distance, rating
- "Available Today" badge for immediate bookings

### Booking System
- Real-time availability calculation
- Prevents double-bookings
- Request/approve workflow
- Support for mobile (pro travels) or shop-based services

### Admin Panel
- Review and approve professional applications
- View verification documents
- Monitor platform activity
- User management

## Database Schema

### Core Tables

- **professional_profiles** - Business profiles linked to users
- **services** - Services offered by professionals
- **bookings** - Client bookings with professionals
- **availability_rules** - Recurring weekly schedules
- **availability_overrides** - One-time schedule exceptions
- **reviews** - Client reviews of completed bookings

See `.clinerules` for complete schema details.

## Development Guidelines

### Code Style
- Use JavaScript (not TypeScript)
- Functional React components with hooks
- Mobile-first responsive design
- Tailwind CSS for styling

### Database
- All tables must have Row Level Security (RLS) policies
- Use Supabase client for all database operations
- Store times in UTC, display in local timezone

### API Routes
- Place all API routes in `/app/api/`
- Use Next.js route handlers
- Validate inputs and handle errors properly

### Components
- Keep components small and focused
- Use composition over inheritance
- Extract reusable UI to `/components/ui/`

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production

Same as local development, but use production Supabase and Google Maps API keys.

## Roadmap

### MVP (Current Phase)
- ✅ Professional profiles and onboarding
- ✅ Search and discovery
- ✅ Booking system
- ✅ Admin approval workflow

### Phase 2 (Post-MVP)
- Payment processing (Paystack integration)
- SMS authentication
- Automated email notifications
- Review system with verified reviews
- Professional payout system

### Phase 3 (Future)
- Mobile apps (iOS/Android)
- In-app messaging
- Advanced analytics for professionals
- Multi-language support

## Contributing

This is a private project. For questions or issues, contact the development team.

## License

Proprietary - All rights reserved

## Support

For technical support or questions:
- Email: [your-email]
- Phone: [your-phone]

---

Built with ❤️ for Namibia
