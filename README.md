#  Apka Vakeel — AI-Powered Legal Assistant

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-7-blue?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-cyan?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Groq Llama-3.3](https://img.shields.io/badge/AI_Engine-Llama_3.3_70B-orange?style=for-the-badge&logo=meta)](https://groq.com/)
[![License](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)](./LICENSE)

**Apka Vakeel** (meaning *"Your Lawyer"*) is a comprehensive, production-grade legal technology platform designed to make legal consultations, document analysis, and constitutional rights exploration highly accessible. By leveraging advanced conversational legal models (Llama 3.3 70B via Groq) and modern web architectures, the platform bridges the gap between complex legal code and the everyday citizen.

 **Live Demo**: [https://apka-vakeel.netlify.app](https://apka-vakeel.netlify.app)

---

##  System Architecture

Apka Vakeel is built as a split-stack client-server application optimized for speed, reliability, and security.

```mermaid
graph TD
    User([👤 User / Client]) -->|Interacts| Frontend[💻 Next.js Frontend]
    Frontend -->|Clerk Session Token| Backend[⚙️ Node.js / Express Server]
    
    subgraph Services [Internal & External Services]
        Backend -->|Prisma Client| DB[(🗄️ PostgreSQL Database)]
        Backend -->|Llama 3.3 Context| Groq[🤖 Groq SDK / Llama-3.3 LLM]
        Backend -->|Rest API| NewsAPI[📰 Live Legal News Service]
    end
    
    classDef main fill:#0c1425,stroke:#22d3ee,stroke-width:2px,color:#f1f5f9;
    classDef service fill:#111d35,stroke:#94a3b8,stroke-width:1px,color:#94a3b8;
    class Frontend,Backend main;
    class DB,Groq,NewsAPI service;
```

---

##  Key Features

*    **AI-Powered Legal Consultation**: Multi-turn chat interface providing insights based on Indian law (IPC, CrPC, Constitution) with custom system prompts for conversational legal advice.
*    **Legal Document Analysis**: Upload contract or agreement PDFs. The engine extracts the text, analyzes clauses, flags high-risk items, suggests defensive modifications, and flags missing protections.
*    **Rights Explorer & Indian Constitution**: Browse and search constitutional articles by category, sub-category, or keyword with AI-powered plain-language translations and real-world examples.
*    **Live Legal News Feed**: Real-time legal news updates and Supreme Court rulings fetched directly from Live News API services with secure server-side AI fallback.
*    **Secure User Authentication**: Integrated secure user authentication, signup, and user management powered by Clerk.

---

##  Interface Screenshots

Here is a showcase of the beautiful, dark-themed responsive glassmorphic interfaces designed for **Apka Vakeel**:

###  1. AI Legal Workspace
An advanced, multi-turn AI consultation workspace featuring document uploads, instant simplified counsel, and context-aware citations of IPC, CrPC, and Constitution sections.
![AI Legal Workspace](./frontend/public/demo/ai-workspace.png)

###  2. Indian Constitution & Rights Explorer
A custom interface to browse and search the Constitution of India across various categories with AI-translated explanations.
![Rights Explorer](./frontend/public/demo/rights-explorer.png)

###  3. Intelligent Legal Document Generator
A step-by-step smart document wizard that generates professional legal notices and agreements using local AI-powered execution.
![Document Generator](./frontend/public/demo/document-generator.png)

###  4. Live Legal News & SC Rulings
Real-time legal feeds directly connected to global and national legal news streams with automatic AI failover handling.
![Live Legal News](./frontend/public/demo/legal-news.png)

---


##  Repository Structure

The codebase is organized in a clean, monorepo-friendly folder structure:

```text
apka-vakeel/
├── frontend/             # Next.js web application
│   ├── app/              # App router (Dashboard, Rights, Document generator)
│   ├── components/       # Reusable components & beautiful Glassmorphism UI tokens
│   ├── services/         # Axios API Client with Clerk token interceptor
│   └── public/           # Static assets and branding
├── backend/              # Node.js Express API server
│   ├── routes/           # Core API Route Handlers (AI, Rights, Documents)
│   ├── services/         # Business logic layer (AI integrations, News utilities)
│   ├── config/           # Database adapter and ORM clients
│   └── prisma/           # Prisma DB schema & migrations history
├── .github/              # CI/CD Workflows
│   └── workflows/        # Automated GitHub Actions
├── .gitignore            # Root-level git rules protecting credentials
├── LICENSE               # MIT Open Source License
└── README.md             # Landing page and documentation
```

---

## ⚙️ Environment Variables Setup

Both the frontend and backend require local environment variables. Do **not** commit actual `.env` files to git. Use `.env.example` as a template.

### Backend Configurations (`backend/.env`)

```ini
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration (PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/apka_vakeel"

# AI & Third-Party APIs
GROQ_API_KEY="your_groq_api_key_here"
NEWSDATA_API_KEY="your_newsdata_api_key_here"

# Security (CORS)
CORS_ORIGIN="http://localhost:3000"
```

### Frontend Configurations (`frontend/.env.local`)

```ini
# Backend API Link
NEXT_PUBLIC_API_URL="http://localhost:5000"

# Clerk Client & Secret Authentication Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key_here"
CLERK_SECRET_KEY="your_clerk_secret_key"
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

---

##  Getting Started

Follow these steps to run a local development instance:

### 1. Prerequisite Checks
Ensure you have the following installed:
*   **Node.js** (v20.x or higher)
*   **npm** (v10.x or higher)
*   **PostgreSQL** database (optional, fallback enabled for chat without DB)

### 2. Install & Launch Backend
```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Run database migrations (if database setup is ready)
npx prisma migrate dev

# Start development server
npm run dev
# Server boots on http://localhost:5000
```

### 3. Install & Launch Frontend
```bash
# Navigate to frontend (from root)
cd frontend

# Install dependencies
npm install

# Start Next.js hot reload
npm run dev
# Frontend boots on http://localhost:3000
```

---

##  Security Best Practices

We enforce strict guidelines to ensure the repository remains secure and production-ready:
1.  **Zero Secrets Committed**: All secrets are strictly managed in local environments. A root-level `.gitignore` blocks any accidental additions of `.env`, `.env.local`, or build assets.
2.  **Safe Fallbacks**: If keys are missing, backend routers fail gracefully rather than crashing the Express process, ensuring high availability.
3.  **Input Limits**: Document uploads are restricted to a maximum size of `10MB` using Multer boundaries to prevent resource exhaustion attacks.

---

##  Legal Disclaimer

> [!WARNING]
> Apka Vakeel is an **informational AI assistant** built for educational and demonstration purposes. It **does not** constitute licensed legal advice, nor does it create an attorney-client relationship. The information provided by the AI is for guidance only. For any formal legal matters or court filings, always consult with a qualified legal professional in your jurisdiction.

---

## 📄 License

Distributed under the MIT License. See [LICENSE](./LICENSE) for details.
