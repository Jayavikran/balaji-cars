# BALAJI CARS — Premium Used Car Marketplace

A full-stack MERN application: a public car marketplace (search, filter, sort,
favourites, smart "similar cars" recommendations, WhatsApp/call/Instagram
contact) plus a completely separate, JWT-protected admin panel for managing
inventory, enquiries, and site settings.

```
BALAJI CARS/
├── backend/     Node.js + Express + MongoDB (Mongoose) API
└── frontend/    React + TypeScript + Tailwind (Vite)
```

## 1. Prerequisites

- Node.js 18+
- A MongoDB database (local `mongod`, or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster)
- A [Cloudinary](https://cloudinary.com) account (free tier is fine) for image uploads

## 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env`:

| Variable | Description |
|---|---|
| `MONGO_URI` | Your MongoDB connection string |
| `JWT_SECRET` | Any long random string (used to sign admin sessions) |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | From your Cloudinary dashboard |
| `CLIENT_URL` | `http://localhost:5173` for local dev |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | Credentials for the first admin account |

Seed the database with an admin user and sample cars:

```bash
npm run seed
```

Start the API:

```bash
npm run dev        # nodemon, auto-restarts on changes
# or
npm start
```

The API runs on `http://localhost:5000`. Health check: `GET /api/health`.

## 3. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env   # optional — the Vite dev proxy handles local API calls
npm run dev
```

The site runs on `http://localhost:5173`.

- Public site: `http://localhost:5173/`
- Admin login: `http://localhost:5173/admin/login`

Log in with the admin credentials you set in `SEED_ADMIN_EMAIL` /
`SEED_ADMIN_PASSWORD` (defaults to `admin@BALAJI CARS.com` / `ChangeMe123!` —
**change this before deploying**).

## 4. How the pieces fit together

### Public website (`/`)
- Sticky header with instant search, sort, an advanced filter drawer, and a
  favourites (wishlist) popup — favourites are stored in the browser only.
- Auto-rotating hero banner, scrollable brand chips, featured/available car
  grids, pagination.
- Car details page: image gallery, full spec sheet, features, an enquiry
  form (writes to the `Enquiry` collection), and a **smart "Similar Cars You
  Might Like"** section that scores other listings by brand, model, body
  type, fuel, transmission, price band (±20%), year band (±3 yrs), and
  location — widening the pool automatically if there aren't enough close
  matches (see `backend/src/utils/similarCars.js`).
- Floating WhatsApp / Instagram / Call buttons (pulled from Settings, with
  optional per-car overrides).

### Admin panel (`/admin/*`)
Fully separate from the public site — no admin links ever render on the
public pages, and every `/admin/*` route except `/admin/login` is wrapped in
`ProtectedRoute`, which checks a real session (`GET /api/admin/auth/me`)
before rendering.

- **Login** (`/admin/login`) — email/password, show/hide password, Remember
  Me (30-day vs 7-day JWT), Forgot Password flow, dealership-themed dark
  overlay UI.
- **Dashboard** — total/available/sold/featured car counts, a 6-month sales
  chart, recent enquiries, recent uploads.
- **Upload Car** — drag-and-drop multi-image upload (Cloudinary), the full
  spec form, feature checkboxes, status + featured toggle.
- **Manage Cars** — searchable/filterable table, per-row actions (view,
  edit, duplicate, delete, mark sold/available, feature/unfeature), bulk
  select + bulk delete/feature, pagination.
- **Edit Car** — loads existing data, lets you keep/remove existing images
  and add new ones.
- **Enquiries** — table of customer enquiries with WhatsApp/call quick
  actions, status updates, delete.
- **Settings** — company info, WhatsApp/phone/email/address, socials, SEO.

### Authentication & security
- JWT stored in an `httpOnly` cookie (`adminToken`) — not readable by
  client-side JS — with a bearer-token fallback in `localStorage` for
  non-cookie clients.
- Every `/api/admin/*` route is protected by `middleware/auth.js` (`protect`
  + `authorize('admin', 'superadmin')`).
- Passwords hashed with bcrypt (12 rounds); login is rate-limited (10
  attempts / 15 min) to slow brute-force attempts.
- `helmet`, CORS locked to `CLIENT_URL`, and a global rate limiter are
  applied to the whole API.

### Database schema (MongoDB / Mongoose)
- **User** — admin accounts (name, email, hashed password, role).
- **Car** — full spec set (brand, model, variant, body type, year, price,
  fuel, transmission, engine, mileage, km, owner, seats, color, location,
  insurance/FC/RC status, description, features, images, status, featured,
  views, per-car contact overrides, slug).
- **Enquiry** — customer name, phone, WhatsApp, email, linked car, message,
  status.
- **Settings** — a single document holding company/contact/social/SEO
  fields, read by the public site and edited from the admin panel.

## 5. SEO & Sitemap

Every page sets its own title, meta description, canonical URL, Open
Graph/Twitter tags, and (on car details + home) JSON-LD structured data via
a shared `<Seo>` component (`frontend/src/components/shared/Seo.tsx`, built
on `react-helmet-async`):

- **Home** — `AutoDealer` schema pulled from your Settings (name, phone,
  address, socials).
- **Car details** — `Vehicle` schema (price, availability, mileage, fuel,
  transmission, images) plus a `BreadcrumbList` matching the visible
  breadcrumb trail (Home → Brand → Model).
- **Compare** — marked `noindex` since it's a personalized tool page, not
  content worth ranking.

**Important limitation to know about:** this is a client-rendered SPA, not
server-rendered. Search engines that execute JavaScript (Googlebot does)
will see all of the above correctly. Bots/crawlers that *don't* execute JS
(some link-unfurlers, older scrapers) only see the static fallback tags in
`frontend/index.html`. If pixel-perfect previews on every platform matter,
the next step would be prerendering (e.g. `vite-plugin-ssg`) or a
server-rendered framework — a bigger change than this pass covers.

**Sitemap**: generated dynamically from MongoDB (not a static file) at
`GET /api/sitemap.xml` on the backend, since car listings change constantly.
`frontend/public/robots.txt` points to `/sitemap.xml` on the *frontend's*
own domain — in a typical split deployment (frontend on Vercel/Netlify,
backend on Render/Railway), you'll need one of:
- A rewrite/proxy rule on the frontend host forwarding `/sitemap.xml` (and
  optionally `/api/*`) to the backend, or
- Pointing `Sitemap:` in `robots.txt` directly at your backend's full URL,
  e.g. `https://api.yourdomain.com/sitemap.xml`.

## 6. Performance

- **Route-level code splitting** — every page (`App.tsx`) is loaded via
  `React.lazy`, so the public site never downloads admin dashboard/chart
  code and vice versa.
- **Vendor chunking** — `vite.config.ts` groups React, React Query, and
  Framer Motion into their own cacheable chunks, separate from app code
  that changes on every deploy.
- **Heavy dependency isolation** — `recharts` (used only by the EMI
  calculator) is lazy-loaded and only downloaded when someone actually
  opens a car's details page.
- **Image optimization** — `frontend/src/utils/optimizeImage.ts` rewrites
  Cloudinary URLs with `f_auto,q_auto` and a context-appropriate width
  (e.g. 500px for a card thumbnail vs. 1200px for the full gallery), so
  browsers never download a 1600px upload just to show a small card image.
  All car images use `loading="lazy"`.
- **React Query caching** — company/contact Settings are cached for 5
  minutes (`useSiteSettings` hook) since they rarely change, vs. the 30s
  default for listings.
- **Memoization** — `CarCard` is wrapped in `React.memo` so background
  filter refetches (`keepPreviousData`) don't re-render every card on the
  grid, only ones whose data actually changed.

## 7. Extending this project

- **Deployment**: deploy `backend/` (e.g. Render, Railway, Fly.io) and
  `frontend/` (e.g. Vercel, Netlify) separately, point `VITE_API_URL` at
  your deployed API, and set `CLIENT_URL` in the backend to your deployed
  frontend origin.
- **Customers collection**: the sidebar links to a Customers section; add a
  `Customer` model/routes following the same pattern as `Enquiry` if you
  want to track repeat buyers separately from one-off enquiries.
- **Email on enquiry/reset**: wire up a transactional email provider (e.g.
  Resend, SendGrid) in `authController.js` (`forgotPassword`) and
  `enquiryController.js` (`createEnquiry`) to actually send messages —
  currently these return the data needed but don't send email.
- **Image reordering / cropping**: the upload/edit forms support add/remove;
  drag-to-reorder can be added with a library like `dnd-kit`.

## 8. Design notes

The UI uses a small custom design system defined in
`frontend/tailwind.config.js` and `frontend/src/index.css`: a white/navy/
emerald palette (navy for structure and admin chrome, emerald for pricing
and primary actions), **Outfit** for display type and **Inter** for body
text, and a signature "dashboard spec-strip" — a dark, monospaced readout
of year · km · owner · insurance — echoing a car's instrument cluster,
used on every car card and the details page.
