# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/5f228d84-7019-45bc-a3c9-e95179b71c38

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/5f228d84-7019-45bc-a3c9-e95179b71c38) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Quick Start (Recommended)**

For an even easier setup, use our quick start scripts:

**Frontend Only:**
- **Linux/macOS:** `./start.sh`
- **Windows:** `start.bat`

**Backend Only:**
- **Linux/macOS:** `cd backend && ./start-backend.sh`
- **Windows:** `cd backend && start-backend.bat`

**Full Stack (Frontend + Backend):**
- **Linux/macOS:** `./start-full-stack.sh`
- **Windows:** See manual setup below

These scripts will automatically:
- ✅ Check for Node.js and npm
- 📦 Install dependencies if needed
- 🔧 Set up environment files
- 🚀 Start the development servers
- 📊 Provide helpful status information

**Manual Setup:**
```sh
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend && npm install && cd ..

# Start backend (in one terminal)
cd backend && npm start

# Start frontend (in another terminal)
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## About This Project

This is a **Cafe Connect Suite** - a comprehensive cafe management system that includes:

🏪 **Multi-tenant cafe management**  
📱 **QR code ordering system**  
👥 **Customer discovery platform**  
📊 **Real-time analytics**  
🌐 **Multi-language support**  

### ✅ **Current Status: Fully Working!**

Both frontend and backend are now fully functional:

- ✅ **Frontend**: React app with TypeScript, Tailwind CSS, and shadcn-ui
- ✅ **Backend**: Node.js/Express API with authentication and data management
- ✅ **Database**: Intelligent fallback system (MongoDB when available, mock data for development)
- ✅ **Authentication**: JWT-based auth system with role management
- ✅ **API Endpoints**: All core endpoints working (auth, cafes, menus, etc.)

### 🚀 **Quick Status Check**

Run `./check-status.sh` to see the current status of all services.

For detailed information about features and system architecture, see [README-CAFE-SYSTEM.md](./README-CAFE-SYSTEM.md).

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/5f228d84-7019-45bc-a3c9-e95179b71c38) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
