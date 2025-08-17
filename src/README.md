
# StockPilot - Inventory Management System

StockPilot is a modern, responsive inventory management application designed to streamline stock, invoice, and expense tracking for small businesses. Built with Next.js, Firebase, and Tailwind CSS.

---

## Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) (with App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Authentication**: [Firebase Authentication](https://firebase.google.com/docs/auth)
- **Local Database**: Browser's `localStorage` for offline support and persistence.
- **POS Printing**: [Next.js API Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers) with direct device communication.

---

## Getting Started (Local Setup)

Follow these steps to get a local copy up and running on your machine.

### 1. Prerequisites (পূর্বশর্ত)

Before you begin, ensure you have the following installed on your local machine:

- **Node.js**: `v18.x` or later is recommended. You can download it from [nodejs.org](https://nodejs.org/).
- **npm**: This comes automatically with Node.js.
- **Git**: You need Git to clone the repository. You can download it from [git-scm.com](https://git-scm.com/).

### 2. Clone the Repository (রিপোজিটরি ক্লোন করুন)

Open your terminal (like Git Bash, PowerShell, or Command Prompt) and run the following command to clone the project to your computer:

```bash
git clone https://github.com/shahriarms/stockpilot.git
```

After the clone is complete, navigate into the project directory:
```bash
cd stockpilot
```

### 3. Install Dependencies (প্যাকেজ ইনস্টল করুন)

Inside the `stockpilot` folder, run this command to install all the necessary libraries and packages for the project.

```bash
npm install
```
This might take a few minutes.

### 4. Run the Development Server (প্রজেক্ট চালান)

Once the installation is complete, you can start the development server with this command:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. You can start editing the page by modifying any file in `src/`. The app will auto-update as you edit the files.

---

## Backend Development: PostgreSQL Integration

This project is configured to easily transition from using `localStorage` to a live **PostgreSQL** database. The architecture is designed so that if a `POSTGRES_URL` environment variable is detected, the app will automatically use the database. Otherwise, it will fall back to using `localStorage`.

### 1. PostgreSQL Prerequisites

- **Install PostgreSQL**: Ensure PostgreSQL is installed on your local machine or use a cloud-hosted service like [Supabase](https://supabase.com/), [Neon](https://neon.tech/), or [Vercel Postgres](https://vercel.com/storage/postgres).
- **Create a Database**: Create a new database for this project (e.g., `stockpilot_db`).
- **Get Connection String**: Obtain your database connection string. It will look something like this:
  ```
  postgresql://USER:PASSWORD@HOST:PORT/DATABASE
  ```

### 2. Set Up Environment Variables

For security, your database connection string should not be hard-coded.

1.  In the root of the project, create a copy of the `.env.local.example` file and rename it to `.env.local`.
2.  Open the new `.env.local` file and add your PostgreSQL connection string:
    ```
    POSTGRES_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
    ```
    The `.gitignore` file is already configured to ignore `.env.local`, so your credentials will not be committed to Git.

### 3. Create the `products` Table

Connect to your PostgreSQL database using a tool like `psql`, DBeaver, or Postico and run the following SQL command to create the necessary `products` table:

```sql
CREATE TABLE products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    sku TEXT NOT NULL UNIQUE,
    price NUMERIC(10, 2) NOT NULL,
    stock INTEGER NOT NULL,
    "mainCategory" TEXT NOT NULL,
    category TEXT NOT NULL,
    "subCategory" TEXT NOT NULL
);
```
With the table created and the `.env.local` file in place, the application's server actions in `src/lib/actions/product-actions.ts` will automatically connect to and use this table. No other code changes are needed.

After setting this up, restart your development server (`npm run dev`) for the changes and environment variables to take effect. Your application will now perform all product operations directly on your PostgreSQL database.


---

## Fully Functional POS Printing System

This application includes a powerful backend printing system that communicates directly with thermal printers, bypassing browser limitations for a seamless POS experience.

### How It Works
- The frontend (the **Invoice** page) sends order data as JSON to a Next.js API route (`/api/print`) when you choose the POS print option.
- The Node.js backend receives the JSON, formats a receipt, and sends raw ESC/POS commands to the printer.
- This allows for printing text, images, barcodes, QR codes, and controlling the cash drawer and cutter.

### Setting Up Your Printer

The printer configuration is managed from within the application on the **Settings** page.

1.  Navigate to the **Settings** page from the sidebar.
2.  Under **Print Settings**, select **POS Receipt**. This will reveal the POS printer configuration options.
3.  Choose your printer's connection type (**USB** or **Network**) and provide the necessary details.

#### **Option 1: USB Printer (Recommended)**
This is the simplest method for many printers. In the Settings page, simply select "USB".

**Troubleshooting USB on Windows:**
1.  Connect your thermal printer via USB. Windows may install its own driver.
2.  Download **Zadig** ([https://zadig.akeo.ie/](https://zadig.akeo.ie/)).
3.  In Zadig, go to `Options > List All Devices` and select your printer from the dropdown (e.g., "POS-80", "TM-T20II", or "Unknown Device").
4.  Select the **libusb-win32** or **WinUSB** driver from the list on the right.
5.  Click "Replace Driver". This allows Node.js to communicate directly with the printer.

**Troubleshooting USB on Linux/macOS:**
- You might need to grant Node.js permission to access the USB device. Create a file at `/etc/udev/rules.d/99-usb-thermal.rules` and add the following line, replacing `VENDOR_ID` and `PRODUCT_ID` with your printer's IDs (use `lsusb` to find them):
  ```
  SUBSYSTEM=="usb", ATTRS{idVendor}=="VENDOR_ID", ATTRS{idProduct}=="PRODUCT_ID", MODE="0666", GROUP="dialout"
  ```
- Run `sudo udevadm control --reload-rules` and unplug/replug the printer.

#### **Option 2: Network (TCP/IP) Printer**
For printers connected to your router via Ethernet or WiFi.

1.  In the Settings page, select **Network (TCP)**.
2.  Enter your printer's IP address in the "Printer IP Address" field (e.g., `192.168.1.123`).
3.  Enter the port number. `9100` is the default for most raw printing.

### Testing the Printer
1.  Configure your printer in the **Settings** page.
2.  Run the application (`npm run dev`).
3.  Navigate to the **Invoice** page from the sidebar.
4.  Add a customer and at least one item to the invoice.
5.  Click the **"Save & Print"** button.

If everything is set up correctly, your thermal printer should print a detailed receipt. If it fails, check the terminal where you are running `npm run dev` for detailed error messages.

---

## How to Push Your Code to GitHub (সম্পূর্ণ প্রজেক্ট পুশ করার নিয়ম)

If you are starting a new project in Firebase Studio and want to push it to your own GitHub repository for the first time, follow these steps very carefully.

```bash
# Initialize a new Git repository
git init
# Add ALL files to Git's tracking
git add .
# Create a "commit" - a snapshot of your entire project
git commit -m "Initial project commit with all files"
# Set the default branch name to 'main'
git branch -M main
# Connect your local project to your GitHub repository
# (আপনার রিপোজিটরির URL এখানে ব্যবহার করুন)
git remote add origin https://github.com/your-username/your-repo-name.git
# IMPORTANT: Push all your code to GitHub
git push -u origin main
```
