# Floveera Production Deployment & Environment Guide
## Architecture: Vercel (Customer + CRM) & Render (Backend API + WebSockets)

---

## 1. Deployment Architecture

The Floveera system is structured as a monorepo consisting of two Next.js client applications and a persistent Node.js/Express real-time backend API.

```
+-----------------------------------------------------------------------------------+
|                                  USER BROWSER                                     |
+-----------------------------------------------------------------------------------+
           |                                                      |
           | HTTP / Static Assets                                 | HTTP / Static Assets
           v                                                      v
+-------------------------------+                     +-------------------------------+
|    Customer Store (Next.js)   |                     |      Restaurant CRM (Next.js) |
|         Hosted on VERCEL      |                     |         Hosted on VERCEL      |
|  Root Directory: "frontend"   |                     |     Root Directory: "crm"     |
|   https://floveera.vercel.app |                     | https://crm-floveera.vercel...|
+-------------------------------+                     +-------------------------------+
           |                                                      |
           | REST API (credentials: 'include')                    | REST API (credentials: 'include')
           | Socket.IO (transports: websocket/polling)             | Socket.IO (Presence & Orders)
           +--------------------------+---------------------------+
                                      |
                                      v
                  +---------------------------------------+
                  |       Floveera Backend API Server     |
                  |            Hosted on RENDER           |
                  |         (Node.js Web Service)         |
                  |        Root Directory: "backend"      |
                  |  https://floveera-backend.onrender... |
                  +---------------------------------------+
                     |                 |                |
                     | Mongoose        | Base64         | Google Auth
                     | (TCP 27017)     | fs write       | verifyIdToken
                     v                 v                v
          +--------------------+  +----------+  +--------------------+
          |   MongoDB Atlas    |  | Disk /   |  |   Firebase Admin   |
          |  (Cloud Database)  |  | Uploads  |  |  (Auth Validation) |
          +--------------------+  +----------+  +--------------------+
```

### Component Roles & Responsibilities

1. **Customer Frontend (`frontend/`)**:
   - Customer-facing catalog, cart, multi-address checkout, order history, and restaurant live stock tracking.
   - Deployed to **Vercel** as a standalone Next.js project.
2. **Restaurant CRM (`crm/`)**:
   - Kitchen manager & restaurant owner dashboard for POS operations, live order status updates, staff presence management, inventory alerts, menu CRUD, and PDF invoice generation.
   - Deployed to **Vercel** as an independent standalone Next.js project.
3. **Backend API (`backend/`)**:
   - Express REST API with HTTP-only cookie session authentication, dynamic CORS, and Socket.IO real-time engine for live order synchronization and staff presence.
   - Deployed to **Render** as a continuous Web Service to maintain long-lived WebSocket connections (which serverless platforms like Vercel do not support).
4. **Database (MongoDB Atlas)**:
   - Primary data store managed via Mongoose models for Users, Restaurants, Orders, Invoices, Inventory, Categories, and Products.

---

## 2. Customer Frontend Variables (Vercel)

Configure these in **Vercel Dashboard $\rightarrow$ [Customer Project] $\rightarrow$ Settings $\rightarrow$ Environment Variables**:

| Variable Name | Purpose | Required / Optional | Expected Value Format | Secret or Public | Vercel Configuration Location |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Base URL for Express REST API endpoints and Socket.IO origin derivation | **Required** | `https://your-backend.onrender.com/api` | **Public** (Embedded in client bundle) | Production, Preview, Development |
| `NEXT_PUBLIC_CRM_APP_URL` | Cross-links to the Restaurant CRM portal if enabled | Optional | `https://your-crm.vercel.app` | **Public** | Production, Preview, Development |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Web API key for Google Login popup | Optional (if using Google OAuth) | `AIzaSy...` (alphanumeric string) | **Public** | Production, Preview, Development |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase OAuth redirect domain | Optional | `your-project.firebaseapp.com` | **Public** | Production, Preview, Development |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project identifier | Optional | `your-project-id` | **Public** | Production, Preview, Development |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket domain | Optional | `your-project.appspot.com` | **Public** | Production, Preview, Development |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase cloud messaging sender ID | Optional | `123456789012` (numeric) | **Public** | Production, Preview, Development |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase web client application ID | Optional | `1:123456789012:web:abcdef...` | **Public** | Production, Preview, Development |

---

## 3. CRM Frontend Variables (Vercel)

Configure these in **Vercel Dashboard $\rightarrow$ [CRM Project] $\rightarrow$ Settings $\rightarrow$ Environment Variables**:

| Variable Name | Purpose | Required / Optional | Expected Value Format | Secret or Public | Vercel Configuration Location |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Primary backend API endpoint for all CRM and restaurant endpoints | **Required** | `https://your-backend.onrender.com/api` | **Public** | Production, Preview, Development |
| `NEXT_PUBLIC_SOCKET_URL` | Socket.IO server origin for kitchen order events & staff presence sync | Optional (Defaults to `NEXT_PUBLIC_API_URL` origin) | `https://your-backend.onrender.com` | **Public** | Production, Preview, Development |
| `NEXT_PUBLIC_CUSTOMER_URL` | Customer store origin used for unauthorized redirects & navigation back | **Required** | `https://your-store.vercel.app` | **Public** | Production, Preview, Development |
| `NEXT_PUBLIC_CUSTOMER_APP_URL` | Alias for customer store origin used in login and registration links | **Required** | `https://your-store.vercel.app` | **Public** | Production, Preview, Development |

---

## 4. Backend Variables (Render)

Configure these in **Render Dashboard $\rightarrow$ [Backend Web Service] $\rightarrow$ Environment**:

| Variable Name | Purpose | Required / Optional | Expected Value Format | Secret or Public | Where to Configure |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `NODE_ENV` | Sets production mode, disables dev bypasses, enables secure cookie policies | **Required** | `production` | Public config | Render Environment |
| `PORT` | Listening port for HTTP server | Optional (Render injects `PORT=10000` automatically) | `10000` | Public config | Render Environment |
| `MONGO_URI` | MongoDB Atlas database connection string | **Required** | `mongodb+srv://user:pass@cluster0.xxx.mongodb.net/floveera?retryWrites=true&w=majority` | **CRITICAL SECRET** (Never expose!) | Render Environment |
| `JWT_SECRET` | Secret key used to sign and verify user and worker session tokens | **Required** | 64+ char random hex or alphanumeric string | **CRITICAL SECRET** (Never expose!) | Render Environment |
| `CUSTOMER_APP_URL` | Allowed origin for customer store in CORS and cookie credentialing | **Required** | `https://your-store.vercel.app` | Public URL | Render Environment |
| `CRM_APP_URL` | Allowed origin for restaurant CRM in CORS and cookie credentialing | **Required** | `https://your-crm.vercel.app` | Public URL | Render Environment |
| `FRONTEND_URL` | Base origin for building password-reset links | Optional (Falls back to `CUSTOMER_APP_URL`) | `https://your-store.vercel.app` | Public URL | Render Environment |
| `FIREBASE_PROJECT_ID` | Firebase Admin SDK project ID | Optional (if using Google OAuth) | `your-firebase-project-id` | Sensitive | Render Environment |
| `FIREBASE_PRIVATE_KEY_ID` | Firebase Admin private key key-id | Optional | `abcdef123456...` | Sensitive | Render Environment |
| `FIREBASE_PRIVATE_KEY` | Firebase service account RSA private key | Optional | `"-----BEGIN PRIVATE KEY-----\nMIIEvgI...==\n-----END PRIVATE KEY-----\n"` | **CRITICAL SECRET** | Render Environment |
| `FIREBASE_CLIENT_EMAIL` | Firebase service account client email | Optional | `firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com` | Sensitive | Render Environment |
| `FIREBASE_CLIENT_ID` | Firebase service account numeric client ID | Optional | `11223344556677889900` | Sensitive | Render Environment |
| `FIREBASE_CLIENT_CERT_URL` | Firebase service account public x509 cert URL | Optional | `https://www.googleapis.com/robot/v1/metadata/x509/...` | Public URL | Render Environment |

---

## 5. Example Environment Files

Templates with sanitized placeholders have been created directly in the repository:

- `backend/.env.example`
- `frontend/.env.example`
- `crm/.env.example`

### `backend/.env.example`
```env
# Server
NODE_ENV=production
PORT=10000

# Database
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/floveera?retryWrites=true&w=majority

# Authentication
JWT_SECRET=replace_with_strong_random_jwt_secret_minimum_32_characters

# CORS Origins
CUSTOMER_APP_URL=https://your-customer-store.vercel.app
CRM_APP_URL=https://your-restaurant-crm.vercel.app
FRONTEND_URL=https://your-customer-store.vercel.app

# Firebase Admin (Optional: For Google Sign-in verification)
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY_ID=your_firebase_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgk...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your_firebase_client_id
FIREBASE_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project.iam.gserviceaccount.com
```

### `frontend/.env.example`
```env
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api
NEXT_PUBLIC_CRM_APP_URL=https://your-restaurant-crm.vercel.app

NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyYourFirebaseApiKey
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=000000000000
NEXT_PUBLIC_FIREBASE_APP_ID=1:000000000000:web:000000000000
```

### `crm/.env.example`
```env
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api
NEXT_PUBLIC_SOCKET_URL=https://your-backend.onrender.com
NEXT_PUBLIC_CUSTOMER_URL=https://your-customer-store.vercel.app
NEXT_PUBLIC_CUSTOMER_APP_URL=https://your-customer-store.vercel.app
```

---

## 6. Step-by-Step Deployment Instructions

Deploy in the following order so dependent URLs can be linked smoothly.

### Step 1: Deploy Backend on Render

1. Log in to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** $\rightarrow$ **Web Service**.
3. Connect your Floveera GitHub repository.
4. Set the service settings:
   - **Name**: `floveera-backend` (or your preferred name)
   - **Region**: Nearest to your users (e.g., *Singapore / Frankfurt / Ohio*)
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Free or Starter
5. Under **Environment Variables**, add the variables from Section 4 (`NODE_ENV`, `MONGO_URI`, `JWT_SECRET`, etc.).
   *(For `CUSTOMER_APP_URL` and `CRM_APP_URL`, enter placeholder values like `https://localhost` or leave empty temporarily until Vercel deploys finish)*.
6. Click **Create Web Service**.
7. Once deployed, copy your Render service URL (e.g., `https://floveera-backend.onrender.com`).

---

### Step 2: Deploy Customer Website on Vercel

1. Log in to [Vercel Dashboard](https://vercel.com).
2. Click **Add New...** $\rightarrow$ **Project**.
3. Import your Floveera GitHub repository.
4. In the configuration screen:
   - **Project Name**: `floveera-store`
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Click *Edit* and select **`frontend`**
   - **Build and Output Settings**: Leave defaults (`next build` and `.next`)
5. Expand **Environment Variables** and add:
   - `NEXT_PUBLIC_API_URL` = `https://floveera-backend.onrender.com/api`
   - Add your Firebase client variables if using Google login.
6. Click **Deploy**.
7. Copy your deployed customer store URL (e.g., `https://floveera-store.vercel.app`).

---

### Step 3: Deploy Restaurant CRM on Vercel

1. In Vercel, click **Add New...** $\rightarrow$ **Project** again.
2. Select the **same** Floveera GitHub repository.
3. In the configuration screen:
   - **Project Name**: `floveera-crm`
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Click *Edit* and select **`crm`**
   - **Build and Output Settings**: Leave defaults (`next build` and `.next`)
4. Expand **Environment Variables** and add:
   - `NEXT_PUBLIC_API_URL` = `https://floveera-backend.onrender.com/api`
   - `NEXT_PUBLIC_SOCKET_URL` = `https://floveera-backend.onrender.com`
   - `NEXT_PUBLIC_CUSTOMER_URL` = `https://floveera-store.vercel.app`
   - `NEXT_PUBLIC_CUSTOMER_APP_URL` = `https://floveera-store.vercel.app`
5. Click **Deploy**.
6. Copy your deployed CRM URL (e.g., `https://floveera-crm.vercel.app`).

---

### Step 4: Finalize Backend Origins in Render

1. Return to your Render Web Service dashboard.
2. Under **Environment**, update the origin variables:
   - `CUSTOMER_APP_URL` = `https://floveera-store.vercel.app`
   - `CRM_APP_URL` = `https://floveera-crm.vercel.app`
   - `FRONTEND_URL` = `https://floveera-store.vercel.app`
3. Click **Save Changes** (Render will automatically redeploy the backend with the new origins).

---

## 7. Post-Deployment Verification Checklist

Perform these tests immediately following deployment:

### 1. Health & Root Endpoints
- [ ] Open `https://your-backend.onrender.com/` in your browser. Verify it responds with:
  ```
  Floveera Backend API instance is running
  ```
- [ ] Open `https://your-backend.onrender.com/api/categories`. Verify it returns a JSON list of categories.

### 2. MongoDB Connectivity & Data
- [ ] In Render logs, verify:
  ```
  MongoDB connected successfully
  User indexes synchronized successfully
  [Restaurant System] Initialized active Floveera Restaurant (...)
  ```
- [ ] If initial categories and products are empty, run the seed script locally or via Render SSH:
  ```bash
  node seed.js
  ```

### 3. Cross-Domain Cookie Authentication
- [ ] Open the customer store on Vercel (`https://your-store.vercel.app/signup`).
- [ ] Register an account or log in.
- [ ] Open Chrome DevTools $\rightarrow$ **Application** $\rightarrow$ **Cookies** $\rightarrow$ `your-backend.onrender.com`.
- [ ] Verify that `auth_token` is present with:
  - `HttpOnly`: Checked
  - `Secure`: Checked
  - `SameSite`: `None`
- [ ] Refresh the page and visit `/account/profile`. Verify user details persist without re-logging in.

### 4. Restaurant CRM Login & Role Guard
- [ ] Open `https://your-crm.vercel.app/login`.
- [ ] Log in with an admin or worker account.
- [ ] Verify that `crm_auth_token` is stored with `SameSite=None` and `Secure=true`.
- [ ] Verify access to `/dashboard`, `/orders`, `/menu`, and `/workers`.

### 5. Real-Time WebSockets (Socket.IO)
- [ ] In CRM `/dashboard`, look at the staff presence bar. Verify your connection shows **Online**.
- [ ] Open the customer store menu in one browser window and the CRM menu in another.
- [ ] Toggle an item's stock status in the CRM. Verify that the customer store menu updates instantly via the `menu:stock_updated` socket event without page refresh.

### 6. Dish Image Uploads & Storage Warning
- [ ] In CRM `/menu`, upload a new food image.
- [ ] Verify that the uploaded photo renders properly in both the CRM menu and the customer store food cards.
- [ ] ⚠️ **Important Storage Notice**: Render web service disks are ephemeral on free plans. Any files uploaded to `/uploads/menu` will disappear if the Render service restarts or spins down. For permanent production image persistence:
  - Attach a **Render Persistent Disk** mounted at `/uploads` (available on Starter/paid plans).
  - Or configure cloud storage (e.g., AWS S3, Cloudinary, or Supabase Storage).
