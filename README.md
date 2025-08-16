
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
- **POS Printing**: [Node.js Backend API](https://nextjs.org/docs/app/building-your-application/routing/route-handlers) with `node-thermal-printer`.

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

## Fully Functional POS Printing System

This application includes a powerful backend printing system that communicates directly with thermal printers, bypassing browser limitations.

### How It Works
- The React frontend (e.g., the **POS Terminal** page) sends order data as JSON to a Next.js API route (`/api/print`).
- The Node.js backend receives the JSON, formats a receipt using `node-thermal-printer`, and sends ESC/POS commands to the printer.
- This allows for printing text, images, barcodes, QR codes, and controlling the cash drawer and cutter.

### Setting Up Your Printer

The printer configuration is located in the **`/src/app/dashboard/pos-terminal/page.tsx`** file. You must edit the `printerConfig` object to match your printer's connection type.

#### **Option 1: USB Printer (Recommended)**
This is the default and simplest method for many printers.

```javascript
const printerConfig = {
  type: 'usb', 
  // For the first detected USB printer, no options are needed.
  // To target a specific printer, find its vendor and product ID:
  // options: { vendorId: '0x...', productId: '0x...' }
};
```
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

```javascript
const printerConfig = {
  type: 'tcp',
  options: {
    host: '192.168.1.123', // IMPORTANT: Replace with your printer's IP address
    port: 9100,           // 9100 is the default for most raw printing
  },
};
```

#### **Option 3: Serial Printer**
For older printers connected via a serial port.

```javascript
const printerConfig = {
    type: 'serial',
    options: {
        port: '/dev/ttyS0', // For Linux
        // port: 'COM3',    // For Windows
        baudRate: 9600,     // Check your printer's manual for the correct baud rate
    }
}
```

### Testing the Printer
1.  Configure your printer in `/src/app/dashboard/pos-terminal/page.tsx`.
2.  Run the application (`npm run dev`).
3.  Navigate to the **POS Terminal** page from the sidebar.
4.  Click the **"Print Receipt"** button.

If everything is set up correctly, your thermal printer should print a detailed receipt with a logo, QR code, and barcode, and then cut the paper and open the cash drawer. If it fails, check the terminal where you are running `npm run dev` for detailed error messages.

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
