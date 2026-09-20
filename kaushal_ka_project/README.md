# Floveera - Modern Retail & Restaurant Website

A professional, animated business website for Floveera, combining a multi-category supermart and sweet, cake shop & restaurant.

## Features

- Modern, responsive design with smooth animations
- Multiple pages: Home, Supermart, Restaurant, Cakes & Bakery, Gallery, Contact, Admin Dashboard
- Cake ordering system with database integration
- WhatsApp integration for direct orders
- Google Maps integration
- Social media links
- Professional color scheme: Deep Blue (#1e3a8a), White/Light Gray, Orange (#f97316)

## Tech Stack

- Next.js 13
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion (animations)
- Supabase (database)

## Project Structure

```
├── app/
│   ├── page.tsx              # Homepage
│   ├── supermart/page.tsx    # Supermart page
│   ├── restaurant/page.tsx   # Restaurant menu
│   ├── cakes/page.tsx        # Cake ordering page
│   ├── gallery/page.tsx      # Image gallery
│   ├── contact/page.tsx      # Contact information
│   └── admin/page.tsx        # Admin dashboard
├── components/
│   ├── Navigation.tsx        # Main navigation
│   ├── Footer.tsx            # Footer component
│   ├── CategoryCard.tsx      # Product category cards
│   └── FoodCard.tsx          # Food item cards
└── lib/
    └── supabase.ts           # Supabase client

```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Supabase

Update `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

The database schema is already created with the following tables:
- `categories` - Product categories
- `products` - Product listings
- `cakes` - Cake varieties
- `cake_orders` - Customer cake orders
- `gallery_images` - Gallery images

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the website.

### 4. Build for Production

```bash
npm run build
npm start
```

## Pages Overview

### Home (`/`)
- Hero section with animated text
- About Floveera section
- Supermart categories showcase
- Food specialties preview
- Custom cake order CTA

### Supermart (`/supermart`)
- Product categories grid
- Beauty & Personal Care
- Garments, Household Items
- Kitchenware, Tailoring Accessories
- Jewellery & Gifts, FMCG Products

### Restaurant (`/restaurant`)
- Traditional sweets menu
- Snacks section
- Fast food items
- WhatsApp order button

### Cakes & Bakery (`/cakes`)
- Cake varieties showcase
- Custom cake order form
- Database-integrated order system
- WhatsApp direct order option

### Gallery (`/gallery`)
- Image categories
- Store interior photos
- Product displays
- Customer moments

### Contact (`/contact`)
- Complete address details
- Phone, WhatsApp, Email
- Google Maps embed
- Business hours
- Social media links

### Admin Dashboard (`/admin`)
- Dashboard overview
- Product management UI
- Cake management UI
- Order management UI
- Gallery management UI

## Business Information

**Floveera**
FLOVEERA PRIVATE LIMITED

**Address:**
Village – Matar, Tola – Matar
Post – Umapur, PS – Bhagwanpur
Panchayat – Paharia, Block – Bhagwanpur
District – Kaimur (Bhabua)
Pin Code – 821102, State – Bihar, India

**Contact:**
Phone/WhatsApp: 9113342012
Email: mart.floveera@gmail.com

**Business Hours:** 9 AM – 10 PM (Daily)

**Social Media:**
- Instagram: [@floveeraindiaofficial](https://www.instagram.com/floveeraindiaofficial/)
- Facebook: [Floveera India Official](https://www.facebook.com/floveeraindiaoffical)

## Customization

### Colors
Update colors in `tailwind.config.ts` or use Tailwind's utility classes:
- Primary: `bg-blue-900` (#1e3a8a)
- Secondary: `bg-white`, `bg-gray-50`
- Accent: `bg-orange-500` (#f97316)

### Animations
Framer Motion animations are configured in each component. Adjust timing and effects in the component files.

### Content
Update text, images, and content directly in the page files under `app/`.

## Database Schema

The Supabase database includes Row Level Security (RLS) policies:

- **Public Read Access:** Categories, Products, Cakes, Gallery
- **Public Insert:** Cake Orders
- **Authenticated Access:** Full CRUD for authenticated users (admin)

## Future Enhancements

- Authentication system for admin
- Product search functionality
- Shopping cart system
- Online payment integration
- Order tracking system
- Customer reviews
- Email notifications
- Image upload functionality

## License

Copyright © 2025 FLOVEERA PRIVATE LIMITED. All rights reserved.

## Support

For technical support or inquiries, contact: mart.floveera@gmail.com
