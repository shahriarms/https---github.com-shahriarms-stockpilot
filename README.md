
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

## How to Push Your Code to GitHub (সম্পূর্ণ প্রজেক্ট পুশ করার নিয়ম)

If you are starting a new project in Firebase Studio and want to push it to your own GitHub repository for the first time, follow these steps very carefully. This will solve the problem of missing files/folders when you clone.

**Step 1: Open Terminal in Your Project Folder**
Make sure your terminal is open inside your project's root folder (the folder that contains `src`, `package.json`, etc.).

**Step 2: Run These Commands One By One**

```bash
# Initialize a new Git repository
# (এটি শুধুমাত্র প্রথমবার করতে হবে)
git init

# Add ALL files to Git's tracking
# (এখানে ডট (.) চিহ্নটি খুবই গুরুত্বপূর্ণ)
git add .

# Create a "commit" - a snapshot of your entire project
git commit -m "Initial project commit with all files"

# Set the default branch name to 'main'
git branch -M main

# Connect your local project to your GitHub repository
# (আপনার রিপোজিটরির URL এখানে ব্যবহার করুন)
git remote add origin https://github.com/shahriarms/stockpilot.git

# IMPORTANT: Push all your code to GitHub
# (-u flag sets it as the default for future pushes)
git push -u origin main
```

After running these commands, your entire project, including the `src` folder, will be uploaded to GitHub. Then, anyone can clone it without any issues.

---
## How Offline Mode Works (অফলাইন মোড)

This application is designed to work even without an internet connection after the first load.

- **Data Storage**: All your inventory data (products, invoices, buyers, expenses, etc.) is stored in your web browser's `localStorage`.
- **Functionality**: You can add, edit, and view all data completely offline. The application logic runs entirely in the browser.
- **Authentication**: Logging in, signing up, or resetting your password requires an active internet connection to communicate with Firebase. Once you are logged in, you can go offline and continue working. Your login session will persist.

This ensures that you can manage your inventory anytime, anywhere, regardless of your internet connectivity.
