# Floveera — Backend

## Overview
The backend for Floveera is powered by **Supabase** (Backend-as-a-Service).  
There is no custom server — all backend logic runs on Supabase's cloud infrastructure.

## Database

### Tables
| Table | Purpose |
|-------|---------|
| `categories` | Product categories (supermart, restaurant, bakery) |
| `products` | Items within categories (name, price, stock) |
| `cakes` | Custom cake catalog |
| `cake_orders` | Customer cake order submissions |
| `gallery_images` | Image gallery for the site |

### Security
- **Row Level Security (RLS)** is enabled on all tables
- Public users can **read** categories, products, cakes, and gallery images
- Public users can **insert** cake orders
- Authenticated users have **full access** to manage all tables

## Migrations
Database migrations are located in:
```
supabase/migrations/
```

To apply migrations, use the Supabase CLI:
```bash
supabase db push
```

## Environment Variables
The following environment variables are required (configured in `frontend/.env`):
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anonymous/public API key
