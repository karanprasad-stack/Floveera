/*
  # Floveera Database Schema

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text)
      - `type` (text) - supermart, restaurant, bakery
      - `icon` (text)
      - `image_url` (text)
      - `description` (text)
      - `created_at` (timestamptz)
    
    - `products`
      - `id` (uuid, primary key)
      - `category_id` (uuid, foreign key)
      - `name` (text)
      - `description` (text)
      - `price` (numeric)
      - `image_url` (text)
      - `in_stock` (boolean)
      - `created_at` (timestamptz)
    
    - `cakes`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `base_price` (numeric)
      - `image_url` (text)
      - `available` (boolean)
      - `created_at` (timestamptz)
    
    - `cake_orders`
      - `id` (uuid, primary key)
      - `customer_name` (text)
      - `customer_phone` (text)
      - `customer_email` (text)
      - `cake_type` (text)
      - `message` (text)
      - `weight` (text)
      - `delivery_date` (date)
      - `status` (text)
      - `created_at` (timestamptz)
    
    - `gallery_images`
      - `id` (uuid, primary key)
      - `title` (text)
      - `category` (text)
      - `image_url` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access
    - Add policies for authenticated admin access
*/

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  icon text,
  image_url text,
  description text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES categories(id),
  name text NOT NULL,
  description text,
  price numeric DEFAULT 0,
  image_url text,
  in_stock boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cakes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  base_price numeric DEFAULT 0,
  image_url text,
  available boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cake_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text,
  cake_type text NOT NULL,
  message text,
  weight text,
  delivery_date date,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text,
  image_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE cake_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Cakes are viewable by everyone"
  ON cakes FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Gallery images are viewable by everyone"
  ON gallery_images FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can submit cake orders"
  ON cake_orders FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage categories"
  ON categories FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage products"
  ON products FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage cakes"
  ON cakes FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view cake orders"
  ON cake_orders FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update cake orders"
  ON cake_orders FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage gallery"
  ON gallery_images FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
