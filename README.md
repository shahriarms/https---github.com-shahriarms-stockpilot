# StockPilot - Inventory Management System

StockPilot is a modern, responsive inventory management application designed to streamline stock, invoice, and expense tracking for small businesses. Built with Next.js, Firebase, and Tailwind CSS.

## Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) (with App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Authentication**: [Firebase Authentication](https://firebase.google.com/docs/auth)
- **Local Database**: Browser's `localStorage` for offline support and persistence.

## Prerequisites

Before you begin, ensure you have the following installed on your local machine:

- [Node.js](https://nodejs.org/en/) (v18.x or later is recommended)
- [npm](https://www.npmjs.com/get-npm) (comes with Node.js)

## Getting Started

Follow these steps to get a local copy up and running.

### 1. Clone the repository

First, clone the repository to your local machine:

```bash
git clone https://github.com/shahriarms/stockpilot.git
cd stockpilot
```

### 2. Install Dependencies

Next, install the required npm packages:

```bash
npm install
```

### 3. Set up Environment Variables

This project uses a Firebase configuration that is already included in the source code. No `.env` file is required to run the application. The Firebase configuration is located in `src/lib/firebase/firebase.ts`.

### 4. Run the Development Server

Now you can run the application in development mode:

```bash
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result. You can start editing the page by modifying any file in `src/`. The app will auto-update as you edit the files.

## Key Features

- **Dashboard**: An overview of key metrics like total products, stock value, etc.
- **Product Management**: Add, edit, delete, and view all inventory items. Bulk upload from a CSV/Excel file is also supported.
- **Invoice Creation**: Generate and manage customer invoices with ease.
- **Buyer Tracking**: Keep a record of all buyers and their purchase history.
- **Due Payments**: Track and receive payments for outstanding invoices.
- **Expense Management**: Log and categorize all business expenses.
- **Employee & Salary Management**: Manage employee attendance and process salary payments.
- **Authentication**: Secure login and signup functionality using Firebase.
