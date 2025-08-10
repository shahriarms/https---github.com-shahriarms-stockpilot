
# StockPilot - Inventory Management System

StockPilot is a modern, responsive inventory management application designed to streamline stock, invoice, and expense tracking for small businesses. Built with Next.js, Firebase, and Tailwind CSS.

## Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) (with App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Authentication**: [Firebase Authentication](https://firebase.google.com/docs/auth)
- **Local Database**: Browser's `localStorage` for offline support and persistence.

---

## Getting Started (Local Setup)

Follow these steps to get a local copy up and running on your machine.

### 1. Prerequisites (পূর্বশর্ত)

Before you begin, ensure you have the following installed on your local machine:

- **Node.js**: `v18.x` or later is recommended. You can download it from [nodejs.org](https://nodejs.org/).
- **npm**: This comes automatically with Node.js.

### 2. Clone the repository

First, clone the repository to your local machine using Git:

```bash
git clone https://github.com/shahriarms/stockpilot.git
cd stockpilot
```

### 3. Install Dependencies (প্যাকেজ ইনস্টল)

Navigate into the project directory and install all the required npm packages. This command reads the `package.json` file and downloads all the necessary libraries into a `node_modules` folder.

```bash
npm install
```

### 4. Set up Environment Variables (পরিবেশ সেটআপ)

This project uses a Firebase configuration that is already included in the source code (`src/lib/firebase/firebase.ts`). No `.env` file or extra configuration is required to run the application.

### 5. Run the Development Server (প্রজেক্ট চালান)

Now you can run the application in development mode. The `--turbopack` flag helps it run faster.

```bash
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result. You can start editing the page by modifying any file in `src/`. The app will auto-update as you edit the files.

---

## How Offline Mode Works (অফলাইন মোড)

This application is designed to work even without an internet connection after the first load.

- **Data Storage**: All your inventory data (products, invoices, buyers, expenses, etc.) is stored in your web browser's `localStorage`.
- **Functionality**: You can add, edit, and view all data completely offline. The application logic runs entirely in the browser.
- **Authentication**: Logging in, signing up, or resetting your password requires an active internet connection to communicate with Firebase. Once you are logged in, you can go offline and continue working. Your login session will persist.

This ensures that you can manage your inventory anytime, anywhere, regardless of your internet connectivity.
