# Vendora

Vendora is a Shopee-style marketplace built for the **Frontend Engineer Bootcamp** (Study Case 1: Shopping Platform). It has two roles: **sellers** manage their own products, and **customers** browse, add to cart, check out, and view order history.

**Live demo:** `<ISI_URL_VERCEL>`
**Repository:** https://github.com/JoeyWiharta/vendora

## Demo accounts

| Role     | Email                 | Password        |
| -------- | --------------------- | --------------- |
| Customer | `<isi_email_customer>` | `<isi_password>` |
| Seller   | `<isi_email_seller>`   | `<isi_password>` |

You can also register a new account and choose Customer or Seller.

## Features

**Authentication**
- Register as customer or seller, with auto-login and role-based redirect
- Login with validation (required, valid email, registered account), "remember me", and a link to register
- Route guards: `/seller/*` is seller-only, `/customer/*` is customer-only

**Seller**
- Add product (name > 5 chars, price > 0, stock > 0, category, description, optional image; a default image is used when none is uploaded)
- Product list showing only the seller's own products, with search by name, filter by category, and pagination
- Edit product (including image replacement)
- Delete one or many products with a confirmation dialog; the list updates without reload

**Customer**
- Home: 10 random recommended products plus the full product list, each card linking to the detail page
- Product detail: image, name, price, stock, description, back button, add to cart with quantity validation (cannot be 0, cannot exceed stock, accounts for what is already in the cart)
- Cart: image, name, quantity, line total, grand total, quantity +/-, remove item, highlight for items with insufficient stock
- Checkout: runs in a Firestore transaction that re-validates stock, decrements it, creates the order, and clears the cart
- Order history grouped by order, with date, items, line totals, and order total

## Tech stack

- [Next.js](https://nextjs.org) 16 (App Router) and React 19, TypeScript
- Tailwind CSS 4 and shadcn/ui
- Firebase Authentication and Cloud Firestore
- Cloudinary for image storage
- TanStack Query, Zustand, React Hook Form, Zod
- Jest and React Testing Library

## Getting started

Requirements: Node.js 20+ and npm.

```bash
git clone https://github.com/JoeyWiharta/vendora.git
cd vendora
npm install
cp .env.example .env.local   # then fill in the values
npm run dev
```

Open http://localhost:3000.

### Environment variables

See `.env.example`. All 11 variables are required.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_FIREBASE_*` (6) | Firebase web app config |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Unsigned image upload from the browser |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Server-only, used to delete images |

### Firebase setup

1. Enable **Authentication > Email/Password**.
2. Create a **Firestore** database.
3. Collections used:
   - `master-users/{uid}`: `uid`, `email`, `role` (`customer` | `seller`), `createdAt`
   - `master-products/{id}`: product data, `sellerId`, `productImage`, `productImagePublicId`, stock, price
   - `trx-carts/{uid}/items/{productId}`: `quantity`
   - `trx-orders/{id}`: `userId`, `items[]`, `totalPrice`, `createdAt`
4. Create a **composite index** for `trx-orders`: `userId` (Ascending) + `createdAt` (Descending). Order history needs it. Firestore shows a link to create it in the browser console on first use.
5. Publish Firestore security rules that restrict access by role and ownership.

### Cloudinary setup

Create an **unsigned upload preset** (for example `vendora_products`) and put its name in `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`. Upload a default product image and set its URL in `constants/ProductDefaultImage.ts`.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm start` | Run the production build |
| `npm run lint` | ESLint |
| `npm test` | Run Jest unit tests |
| `npm run test:coverage` | Jest with coverage report |

## Project structure

```
app/
  (authentication)/   login, register, guards, auth store and services
  (customer)/customer/  home, home/[id], cart, order-history
  (seller)/seller/      my-products (list, add, edit), layout and sidebar
components/           shared UI (shadcn/ui in components/ui)
lib/                  firebase, cloudinary, formatters
constants/            categories, default image
query/                TanStack Query client and provider
```

Each feature folder follows the same layout: `_components`, `_hooks`, `_services`, `_schemas`, `_types`, with tests next to the files they cover.

## Testing

Unit tests use Jest and React Testing Library and cover schemas, services, hooks, utilities, and components.

```bash
npm test
```

## Deployment (Vercel)

1. Import the GitHub repo in Vercel (framework preset: Next.js).
2. Add all environment variables from `.env.example` under Project Settings > Environment Variables.
3. Deploy.
4. In Firebase Console > Authentication > Settings > **Authorized domains**, add your Vercel domain.
5. Image host `res.cloudinary.com` is already allowed in `next.config.ts`.

## Team

| Name | Role |
| --- | --- |
| `<nama>` | `<peran>` |