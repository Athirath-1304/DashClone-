# 🚀 DashClone – Food Delivery App with Admin + Landing Page

![Vercel](https://vercelbadge.vercel.app/api/your-vercel-app/landing)
![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)
![Next.js](https://img.shields.io/badge/Next.js-13+-black?logo=next.js)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.x-blue?logo=tailwindcss)

Welcome to **DashClone** — a full-stack food delivery application featuring:

- 🍽️ Restaurant Management
- 🚚 Order and Delivery System
- 📈 Real-time Admin Dashboard
- 🎯 Stunning Landing Page to showcase your product

🔗 **Live Demo**
- Landing Page → [https://your-vercel-app.vercel.app/landing](https://your-vercel-app.vercel.app/landing)
- Admin Dashboard → Protected (Login Required)

## ✨ Features

- ⚡️ Modern, minimal **Landing Page** (/landing)
- ✅ Authenticated **Admin Dashboard**
- 📊 Real-time stats with `SWR` + `mutate()`
- 🔐 RBAC (Role-Based Access Control)
- 📦 Modular code with `Next.js App Router`
- 🎨 Built with Tailwind, shadcn/ui, Recharts
- 🧠 Centralized API layer (`/api/stats`)

## 📸 Screenshots

### Landing Page
![Landing Page Screenshot](./public/landing-screenshot.png)

### Admin Dashboard
![Admin Dashboard Screenshot](./public/dashboard-screenshot.png)

## 🚀 Quickstart

1. Clone the repo
2. Install dependencies: `npm install`
3. Add your `.env.local` (see below)
4. Run locally: `npm run dev`

## 🛠 Tech Stack

- Next.js App Router
- Tailwind CSS
- shadcn/ui
- Supabase
- SWR
- Recharts
- Framer Motion
- Lucide Icons

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## 📝 License

This project is licensed under the MIT License.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

You can preview your app locally before deploying to Vercel! Here’s how:

---

### 1. **Start the Local Development Server**

In your project directory, run:

```sh
npm run dev
```
or, if you use yarn:
```sh
yarn dev
```

---

### 2. **Open in Your Browser**

- After running the command, you’ll see output like:
  ```
  Local: http://localhost:3000
  ```
- Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### 3. **Test All Flows**

- Sign up as a customer, restaurant, delivery agent, and admin.
- Try the full order, delivery, and admin flows.
- Check for any errors or missing features.

---

### 4. **If You See Errors**

- Make sure your `.env.local` file is set up with your Supabase credentials.
- Check the terminal for error messages.
- Let me know if you need help debugging!

---

**Once you’re happy with the local preview, you can deploy to Vercel for a live, shareable version!**

Would you like help with any specific part of the local preview or want a checklist for testing?
