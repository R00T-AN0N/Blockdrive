# BlockDrive

> Secure file sharing using **IPFS, Blockchain, React, Node.js, Express, and MySQL**.

BlockDrive is an academic project for secure file storage and sharing. Files are uploaded to **IPFS through Pinata**, while file metadata/access information can be registered on an Ethereum-compatible smart contract. User accounts, subscriptions, and application records are stored in MySQL.

## Features

- User registration and login
- Google authentication support
- File upload through IPFS/Pinata
- Blockchain-based file metadata and access control
- MetaMask wallet connection
- Public/private file access
- Allowed-viewer access control
- File history
- Subscription plans and upload limits
- Contact form/email support
- Responsive React UI

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite |
| UI | Tailwind CSS, Radix UI, Lucide, Framer Motion |
| Backend | Node.js + Express 5 |
| Database | MySQL |
| File storage | IPFS via Pinata |
| Blockchain | Solidity / Ethereum-compatible network |
| Wallet | MetaMask |
| Web3 | ethers.js |
| Authentication | Email/password + Google OAuth |

---

# 1. Requirements

Install the following before running the project:

- **Node.js 20 or newer**
- **npm**
- **MySQL 8+** (XAMPP is fine for local development)
- **MetaMask** browser extension
- A **Pinata** account if you want real IPFS uploads
- A Google Cloud OAuth client if you want Google login
- A deployed BlockDrive smart contract if you want blockchain functionality

Check Node/npm:

```bash
node --version
npm --version
```

---

# 2. Download the Project

Clone the GitHub repository:

```bash
git clone https://github.com/YOUR-USERNAME/BlockDrive.git
cd BlockDrive
```

Or download the repository as a ZIP and extract it.

---

# 3. Install Frontend Dependencies

From the project root:

```bash
npm install
```

Install backend dependencies:

```bash
cd server
npm install
cd ..
```

Do **not** commit `node_modules` to GitHub. The included `.gitignore` already excludes it.

---

# 4. Create the MySQL Database

Start MySQL using either:

- XAMPP
- MySQL Server
- Another local MySQL installation

Create the database and tables by importing:

```text
database/schema.sql
```

### Using MySQL command line

```bash
mysql -u root -p < database/schema.sql
```

If your MySQL root account has no password:

```bash
mysql -u root < database/schema.sql
```

### Using phpMyAdmin / XAMPP

1. Start **Apache** and **MySQL** in XAMPP.
2. Open phpMyAdmin.
3. Select **Import**.
4. Choose `database/schema.sql`.
5. Click **Go**.
6. Confirm that the `blockdrive` database was created.

The schema creates these main tables:

- `register`
- `subscriptions`
- `files`

---

# 5. Configure Environment Variables

There are two environment files because the frontend and backend have different requirements.

## Frontend

Copy:

```bash
cp .env.example .env
```

Then edit `.env`:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
```

## Backend

Copy:

```bash
cp server/.env.example server/.env
```

Edit `server/.env`:

```env
PORT=3000
CLIENT_ORIGIN=http://localhost:5173

CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com

MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=blockdrive

EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password

PINATA_JWT=your-pinata-jwt
```

### Important

Never commit these files:

```text
.env
server/.env
```

They are already ignored by `.gitignore`.

Never put these into GitHub:

- Pinata JWT
- Gmail app password
- Database passwords
- Private keys
- API secrets
- OAuth client secrets

If a secret has ever been accidentally uploaded to a public repository, revoke/rotate it immediately.

---

# 6. Pinata / IPFS Setup

BlockDrive uses Pinata for IPFS uploads.

1. Create a Pinata account.
2. Create an API key/JWT with the required upload permissions.
3. Copy the JWT.
4. Put it in:

```env
PINATA_JWT=your-pinata-jwt
```

The Pinata JWT is used by the **backend**, not directly by the React frontend.

If you only want to inspect the UI, you can run the frontend without configuring Pinata. Actual file upload requires a valid Pinata configuration.

---

# 7. Google Login Setup (Optional)

Google login requires an OAuth client ID.

Create a Web application OAuth client in Google Cloud Console.

For local development, add this origin to the allowed JavaScript origins:

```text
http://localhost:5173
```

Use the client ID in both environment files where required:

```env
VITE_GOOGLE_CLIENT_ID=your-client-id
```

and:

```env
CLIENT_ID=your-client-id
```

If you do not need Google login for your demonstration, you can use the normal registration/login flow instead.

---

# 8. Gmail / Contact Email Setup (Optional)

The contact route can use Gmail SMTP.

Do **not** use your normal Gmail password. Use a Gmail **App Password** when your Google account supports it.

Set:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
```

If you do not need the contact/email feature, leave these unconfigured and avoid testing that feature.

---

# 9. Smart Contract / MetaMask Setup

The frontend contains the BlockDrive contract ABI and configured contract address in:

```text
src/config/contract.js
```

The ABI is also stored at:

```text
src/abis/FileShare.json
```

For blockchain functionality:

1. Install MetaMask.
2. Import/connect the wallet used for the demonstration.
3. Switch MetaMask to the same Ethereum-compatible network where the contract is deployed.
4. Make sure the configured contract address matches the deployed contract.
5. Make sure the contract ABI matches the deployed contract.

The project currently contains a configured contract address. If you deploy a new contract, update `src/config/contract.js` accordingly.

**Never put a wallet private key in this repository.** MetaMask signs transactions in the browser.

---

# 10. Run the Backend

Open Terminal 1:

```bash
cd server
npm start
```

The backend normally runs at:

```text
http://localhost:3000
```

Test it in a browser:

```text
http://localhost:3000/
```

You should receive a JSON response indicating that the BlockDrive API is running.

---

# 11. Run the Frontend

Open Terminal 2 from the project root:

```bash
npm run dev
```

Vite normally starts at:

```text
http://localhost:5173
```

Open that URL in your browser.

---

# 12. Typical Demo Flow

For an academic demonstration, use this sequence:

### Step 1 — Register

Create a BlockDrive account.

### Step 2 — Login

Log in with the account.

### Step 3 — Connect Wallet

Connect MetaMask.

### Step 4 — Upload a File

Select a small test file and upload it.

The application sends the file to the backend, which uploads it to Pinata/IPFS.

### Step 5 — Blockchain Registration

If blockchain functionality is enabled, confirm the MetaMask transaction that registers the file metadata/access information on the configured contract.

### Step 6 — File Access

Open the file/access section and test the configured public/private or allowed-viewer permissions.

### Step 7 — History

Open the history section to view stored file records.

### Step 8 — Subscription

Demonstrate the subscription/upload-limit functionality if required by your project presentation.

---

# 13. Useful Commands

Install dependencies:

```bash
npm install
cd server && npm install
```

Start frontend:

```bash
npm run dev
```

Start backend:

```bash
cd server
npm start
```

Build frontend:

```bash
npm run build
```

Preview production frontend:

```bash
npm run preview
```

Run ESLint:

```bash
npm run lint
```

---

# 14. Project Structure

```text
BlockDrive/
│
├── database/
│   └── schema.sql
│
├── public/
│
├── src/
│   ├── abis/
│   ├── assets/
│   ├── components/
│   ├── config/
│   ├── contexts/
│   ├── lib/
│   ├── pages/
│   ├── utils/
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
│
├── server/
│   ├── routes/
│   ├── db.js
│   ├── index.js
│   ├── package.json
│   └── .env.example
│
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js
└── README.md
```

---

# 15. GitHub Upload

## Option A — Git command line

From the project root:

```bash
git init
git add .
git commit -m "Initial BlockDrive project"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/BlockDrive.git
git push -u origin main
```

Replace `YOUR-USERNAME` with your GitHub username.

## Option B — GitHub website

1. Create a new GitHub repository named `BlockDrive`.
2. Keep the repository empty when creating it (do not add another README if you are uploading this folder).
3. Upload the project files/folders.
4. Confirm that `.env` and `server/.env` are **not** uploaded.
5. Commit the files.

### Before pushing

Run:

```bash
git status
```

Make sure you do **not** see:

```text
.env
server/.env
node_modules/
dist/
```

---

# 16. Vercel Deployment Note

The current project is primarily prepared for **local development with MySQL**.

Vercel can host the frontend, but a local MySQL server such as XAMPP cannot be used by a public Vercel deployment.

For a public deployment, use a cloud-hosted database and update the backend environment variables accordingly. If you want to keep the current MySQL code, use a cloud MySQL-compatible provider. If you want a Vercel/Neon PostgreSQL setup, the database layer must be converted from MySQL to PostgreSQL first.

For the academic GitHub submission, the included MySQL setup is sufficient for local demonstration.

---

# 17. Troubleshooting

## Frontend cannot connect to backend

Check:

```env
VITE_API_BASE_URL=http://localhost:3000
```

Then make sure the backend is running:

```bash
cd server
npm start
```

Restart Vite after changing `.env`.

## MySQL connection error

Check:

```env
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=blockdrive
```

Also confirm that MySQL is running and that `database/schema.sql` was imported.

## Google login does not work

Check that:

- Google OAuth client ID is correct.
- `http://localhost:5173` is an allowed JavaScript origin.
- `VITE_GOOGLE_CLIENT_ID` is set correctly.
- The frontend was restarted after changing `.env`.

## IPFS upload fails

Check:

```env
PINATA_JWT=your-pinata-jwt
```

Make sure the token is valid and has the required Pinata permissions.

## MetaMask transaction fails

Check:

- MetaMask is installed.
- The correct network is selected.
- The contract address is correct.
- The wallet has enough test/native currency for gas.
- The deployed contract ABI matches `src/config/contract.js`.

## Port 3000 is already in use

Either stop the process using port 3000 or change:

```env
PORT=3001
```

and update:

```env
VITE_API_BASE_URL=http://localhost:3001
```

---

# 18. Security Notes

This repository is intended for an **academic/demo project**.

Before using a similar architecture for a real production service, strengthen at least:

- Authentication/session handling
- Authorization checks
- File type and file size validation
- Rate limiting
- CSRF protection where applicable
- Input validation
- API security headers
- Secret management
- Database permissions
- Subscription/payment verification
- Smart-contract security auditing
- IPFS content/privacy considerations

Never commit credentials, private keys, database passwords, API tokens, or OAuth secrets.

---

# 19. Academic Project Summary

**Project:** BlockDrive — Secure File Sharing System

**Purpose:** Provide secure file storage and sharing using decentralized storage and blockchain-based access metadata.

**Core technologies:** React, Node.js, Express, MySQL, IPFS/Pinata, Solidity, Ethereum, MetaMask, and ethers.js.

The project demonstrates how traditional web application components can be combined with decentralized storage and blockchain technologies to manage file metadata and access permissions.

---

## Author

**Yash Panchal**

Academic Project — BlockDrive
