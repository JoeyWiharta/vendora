# Vendora

Vendora is a Shopee-style marketplace built for the **Frontend Engineer Bootcamp** (Study Case 1: Shopping Platform). Sellers manage their own products; customers browse, add to cart, check out, and view their order history.

- **Live demo:** https://vendora-two-xi.vercel.app
- **Repository:** https://github.com/JoeyWiharta/vendora

## Demo accounts

| Role     | Email                    | Password        |
| -------- | ------------------------ | --------------- |
| Customer | `customer@gmail.com`     | `Test1234` |
| Seller   | `seller@gmail.com`       | `Test1234` |

You can also register a new account and choose **Customer** or **Seller**.

## Features

### Authentication
- Register as a customer or seller, with auto-login and redirect to the matching dashboard
- Login with validation (email required and valid, password required, account must be registered), "remember me", and a link to the register page
- Register page links back to login
- Role-based route guards: `/seller/*` is seller-only, `/customer/*` is customer-only

### Seller
- **Add product:** name longer than 5 characters, price > 0, stock > 0, required category and description, optional image (a default image is used when none is uploaded)
- **View products:** only the seller's own products, with search by name, filter by category, and pagination (page size selectable)
- **Edit product**, including replacing the image
- **Delete products:** single or multiple at once, with a confirmation dialog; the list updates without a page reload

### Customer
- **Home:** 10 random recommended products plus the full product list; every card links to the detail page
- **Product detail:** image, name, price, current stock, description, and a back button
- **Add to cart:** quantity cannot be zero and cannot exceed available stock (quantity already in the cart is taken into account)
- **Cart:** product image, name, quantity, line total, and grand total; increase or decrease quantity (reaching zero removes the item); remove items; items with insufficient stock are highlighted and block checkout
- **Checkout:** runs in a Firestore transaction that re-checks stock, decrements it, creates the order, and clears the cart
- **Order history:** grouped by order, showing date, product image, name, quantity, line total, and order total

> The seller "Incoming Orders" and "Order History" pages are placeholders (not part of the requirements).

## Tech stack

| Area | Tools |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack), React 19, TypeScript |
| Styling / UI | Tailwind CSS 4, shadcn/ui |
| Backend | Firebase Authentication, Cloud Firestore |
| Image storage | Cloudinary (Firebase Storage is no longer free) |
| State / forms | TanStack Query, Zustand, React Hook Form, Zod |
| Testing | Jest, React Testing Library |
| Deployment | Vercel |

## Getting started

Requirements: Node.js 20+ and npm.

```bash
git clone https://github.com/JoeyWiharta/vendora.git
cd vendora
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

`.env.example` already contains the **demo configuration** (Firebase and Cloudinary) so the project runs immediately without creating your own accounts. These credentials are for evaluation only.

### Environment variables

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase web config |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase web config |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase web config |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase web config |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase web config |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase web config |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name (browser upload) |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Unsigned upload preset for product images |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name (server) |
| `CLOUDINARY_API_KEY` | Server-only, used to delete images |
| `CLOUDINARY_API_SECRET` | Server-only, used to delete images |

### Using your own Firebase / Cloudinary (optional)

1. **Firebase:** enable Authentication (Email/Password) and create a Firestore database.
2. **Firestore collections:**
   - `master-users/{uid}`: `uid`, `email`, `role` (`customer` | `seller`), `createdAt`
   - `master-products/{id}`: `productName`, `productCategory`, `description`, `productPrice`, `productStock`, `productImage`, `productImagePublicId`, `sellerId`, `createdAt`, `updatedAt`
   - `trx-carts/{uid}/items/{productId}`: `productId`, `quantity`, `updatedAt`
   - `trx-orders/{id}`: `userId`, `items[]`, `totalPrice`, `createdAt`
3. **Composite index** on `trx-orders`: `userId` (Ascending) and `createdAt` (Descending). Required by order history.
4. **Cloudinary:** create an unsigned upload preset and upload a default product image, then set its URL in `constants/ProductDefaultImage.ts`.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm start` | Run the production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run all unit tests |
| `npm run test:coverage` | Run tests with a coverage report |

## Testing

Unit tests are written with Jest and React Testing Library and cover schemas, services, hooks, utilities, guards, and components.

- 73 test suites, 621 tests
- 100% coverage (statements, branches, functions, lines)

```bash
npm run test:coverage
```

## Project structure

```
app/
  (authentication)/       login, register, guards, auth store and services
  (customer)/customer/    home, home/[id], cart, order-history
  (seller)/seller/        my-products (list, add, edit), sidebar layout
components/               shared UI (shadcn/ui in components/ui)
lib/                      firebase, cloudinary, formatters
constants/                product categories, default image
query/                    TanStack Query client and provider
```

Each feature follows the same convention: `_components`, `_hooks`, `_services`, `_schema(s)`, `_types`, `_utils`, with tests placed next to the files they cover.

## Deployment (Vercel)

1. Import the GitHub repository in Vercel (framework preset: Next.js).
2. Add all environment variables above in **Project Settings > Environment Variables**.
3. Deploy.
4. In **Firebase Console > Authentication > Settings > Authorized domains**, add the Vercel domain.

The image host `res.cloudinary.com` is already allowed in `next.config.ts`.

## Author

| Name | Student ID | Class | Role |
| --- | --- | --- | --- |
| Joey Liauw Wiharta | 2602080125 | Computer Science B26 | Full-stack developer (UI, authentication, seller and customer features, Firebase and Cloudinary integration, unit tests, deployment) |