
# Aura-Controls: The Future of Interaction

[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14.x-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Sanity](https://img.shields.io/badge/Sanity-CMS-red?logo=sanity)](https://www.sanity.io/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com/)

**Aura-Controls** is a full-stack web application that serves as the central hub for the revolutionary gesture-control desktop software. This repository contains the Next.js marketing site, user dashboard, and complete backend infrastructure, providing a seamless experience from discovery to subscription and management.

Ever dreamed of the fluid, intuitive control of sci-fi interfaces? **Aura-Controls** brings that fantasy to your desktop. This project is the digital storefront and command center for that experience.

---

## ✨ Features

This web application is the commercial backbone of the Aura-Controls ecosystem.

*   **Stunning Landing Page:** A modern, animated landing page built with **Framer Motion** and **Tailwind CSS** to captivate users.
*   **Interactive Browser Demos:** Live, in-browser gesture control demos powered by **MediaPipe for Web**, allowing users to experience the magic before they subscribe.
*   **Secure Authentication:** A complete authentication system using **NextAuth.js** with both email/password and Google OAuth providers.
*   **Subscription Management:** Robust subscription handling powered by **Razorpay**, including monthly/yearly plans and secure webhook integration.
*   **Headless CMS Backend:** User and subscription data is managed by **Sanity.io**, providing a flexible and powerful content backend.
*   **Personalized User Dashboard:** A dedicated, protected route where subscribed users can view their app credentials, manage connected devices, and download the desktop application.
*   **Centralized API:** All backend logic, from authentication to payment processing, is handled securely through **Next.js API Routes**.
*   **Polished UI/UX:** A consistent, elegant, and responsive design system built to provide a premium user experience.

---

## 🚀 Getting Started

Follow these instructions to get the Aura-Controls web application running locally for development and testing.

### Prerequisites

*   Node.js (v18.x or later)
*   npm, pnpm, or yarn
*   A Sanity.io account and project
*   A Razorpay account for payment integration
*   Google Cloud Platform project for Google OAuth

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/aura-controls-nextjs.git
cd aura-controls-nextjs
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root of your project. This file is crucial for storing all your secret keys and API credentials. **Do not commit this file to Git.**

```env
# Sanity.io Credentials (find these in your sanity.json or on manage.sanity.io)
NEXT_PUBLIC_SANITY_PROJECT_ID="o8ddx74t"
NEXT_PUBLIC_SANITY_DATASET="production"
SANITY_API_TOKEN="sk968...ekbb" # Your Sanity API token with write access

# NextAuth.js Credentials
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-string-for-nextauth" # Generate a strong random string
JWT_SECRET="your-super-secret-string-for-jwt" # Generate another strong random string

# Google OAuth Credentials (from Google Cloud Platform)
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Razorpay API Credentials (from Razorpay Dashboard)
RAZORPAY_KEY_ID="your_razorpay_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_key_secret"
RAZORPAY_WEBHOOK_SECRET="your_razorpay_webhook_secret" # Secret for verifying webhook calls

# Email (Nodemailer) Credentials for sending confirmations
SMTP_HOST="smtp.hostinger.com"
SMTP_PORT="465"
SMTP_USERNAME="contact@toil-labs.com"
SMTP_PASSWORD="your-email-password-or-app-password"

# Base URL for your application
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

### 4. Set Up Sanity Studio

If you haven't already, deploy your Sanity schemas. Navigate to your Sanity project folder and run:

```bash
# In your separate Sanity project directory
sanity deploy
```

Ensure your `user` and `subscription` schemas are correctly defined and deployed.

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. The application will hot-reload as you make changes.

---

## 🛠️ Project Structure

This project uses the Next.js App Router. Here's a brief overview of the key directories:

*   **/app/api/**: Contains all backend API routes, including authentication, billing webhooks, and the protected dashboard endpoint.
*   **/app/(pages)/**: The main pages of the application, such as the landing page (`/`), dashboard (`/dashboard`), and authentication pages (`/sign-in`, `/sign-up`).
*   **/components/**: Contains all reusable React components, organized by feature (e.g., `demos/`, `dashboard/`, `ui/`).
*   **/lib/**: Contains library initializations and helper functions, such as the Sanity client (`sanity_client.ts`).
*   **/actions/**: Holds all Next.js Server Actions, which handle form submissions and server-side logic securely.
*   **/public/**: Static assets, including the `hand_landmarker.task` model for the browser demo and image files like `logo.png`.

---

## ⚙️ Key Technologies

*   **Framework:** [Next.js](https://nextjs.org/) (App Router)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **Animation:** [Framer Motion](https://www.framer.com/motion/)
*   **Authentication:** [NextAuth.js](https://next-auth.js.org/)
*   **Database/CMS:** [Sanity.io](https://www.sanity.io/)
*   **Payments:** [Razorpay](https://razorpay.com/)
*   **Gesture Recognition (Web Demo):** [MediaPipe for Web](https://developers.google.com/mediapipe)
*   **Deployment:** [Vercel](https://vercel.com/)

---

## 🤝 Contributing

We welcome contributions to make Aura-Controls even better! Whether it's fixing a bug, adding a new feature, or improving documentation, your help is appreciated. Please feel free to open an issue or submit a pull request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 📧 Contact

Your Name - [@Sourav_Bera_](https://x.com/Sourav_Bera_) - souravberaofficial@gmail.com

LIVE Link: [http://aura-controls.toil-labs.com/](http://aura-controls.toil-labs.com/)