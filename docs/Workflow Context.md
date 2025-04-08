# Cinema Crowdfunding Platform - Project Context

## Project Overview
Web-based crowdfunding platform for organizing cinema screenings with the following core features:
- Multiple concurrent crowdfunding campaigns for film screenings
- But a user should be directed toward the current featured campaign as while campaign overlaps may happen in the future, they will be rare initally
- Flexible ticket pricing (minimum £5 + £0.50 transaction fee)
- Adjustable ticket caps (default 400)
- Adjustable funding targets (default £300)
- Campaign deadline system (2 weeks before show date as default but adjustable by admin)
- Food/drink pre-orders per venue
- The project is based in Cornwall, UK so please use GBP and other UK localisations

## Core Requirements

### User Types
1. Customers
   - Register/login
   - Purchase tickets
   - Order food/drinks
   - View order history
   - Participate in comments
   - Share on social media

2. Administrators
   - Manage campaigns
   - Approve refunds
   - Manage venues
   - Moderate comments
   - View analytics

### Payment System
- Stripe integration
- Variable ticket pricing (£5 minimum)
- £0.50 transaction fee
- Automatic refund triggers (admin approval required)

### Venue System
- Multiple venue support
- Venue-specific menu items
- Fixed price food/drink combos
- Managed by venue staff

### Communication System
- Email notifications for:
  * Purchase confirmation
  * Campaign updates
  * Refund status
  * Comment notifications
  * Campaign success/failure
- Comment/message board system
- Social media sharing

## Technical Requirements
- Fully responsive design
- PWA support
- Mobile-optimized checkout
- Secure authentication
- Real-time updates
- Performance optimization

## Database Schema Overview
[Previous database schema from earlier response]

## Tech Stack
- Frontend: Next.js 14, TypeScript, Tailwind CSS 3, shadcn/ui
- Backend: Next.js API routes, Prisma, PostgreSQL
- Authentication: NextAuth.js
- Payments: Stripe
- Email: Gmail
- Deployment: Vercel
- Cron jobs via Github actions

If more information would help the process, please always ask me for what you need

Can you also use the term "bananas forever!" after every response so that I know this information remains in your context window.