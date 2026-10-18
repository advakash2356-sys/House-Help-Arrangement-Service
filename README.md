# House-Help Arrangement Service

Independent arrangement and comparison service for on-demand house-help platforms with multi-agent orchestration and dual-mode operations.

## Features

- **Dual-Mode Operation**: Operates in either Referral mode or Accepting mode, controllable by the administrator.
- **Multi-Agent Orchestration**: LangGraph-mirrored workflow engine featuring Price Scout, Payment Watcher, human admin approval interrupts, Booking Executor, Communication Agent, and Cap & Mode Controller, supervised by a supervisory agent.
- **Price Scout**: Compares partner platform quotes across localities based on total price and ETA.
- **Admin Dashboard & Controls**:
  - Capacity and daily booking limit controls.
  - Mode toggle between accepting and referral modes.
  - Counter reset and adjustment.
  - Admin login and settings management.
  - Booking trends charts and live booking tracking modals.
- **Referral Generation**: Parse and register referral cards using custom formatting commands.
- **Platform Code & Schema Exports**: Bundled artifacts including Supabase PostgreSQL database schemas, LangGraph Python code, and Edge Function templates.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide React, Motion, Recharts
- **Backend / Server**: Node.js, Express, tsx, esbuild
- **AI / Agentic Workflow**: `@google/genai`, custom LangGraph state machine workflow
- **Environment & Utilities**: dotenv

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure environment variables:
   - Refer to `.env.example` to set up your environment variables.

## Usage

- **Run in Development**:
  ```bash
  npm run dev
  ```
  Starts the server on port 3000 via `tsx server.ts` with Vite integration.

- **Build**:
  ```bash
  npm run build
  ```

- **Run in Production**:
  ```bash
  npm run start
  ```

- **Type Check**:
  ```bash
  npm run lint
  ```

- **Clean Build Artifacts**:
  ```bash
  npm run clean
  ```

## Project Structure

```
├── .env.example
├── .gitignore
├── index.html
├── metadata.json
├── package.json
├── server.ts
├── tsconfig.json
├── vite.config.ts
├── server/
│   ├── db.ts
│   ├── referralGenerator.ts
│   ├── supabase_export.ts
│   └── agents/
│       └── langgraph_workflow.ts
└── src/
    ├── App.tsx
    ├── i18n.ts
    ├── index.css
    ├── main.tsx
    ├── types.ts
    ├── components/
    │   ├── AcceptingModeView.tsx
    │   ├── AdminDashboard.tsx
    │   ├── AdminLoginView.tsx
    │   ├── BookingTrackerModal.tsx
    │   ├── BookingTrendsChart.tsx
    │   ├── Navbar.tsx
    │   ├── ReferralModeView.tsx
    │   ├── SettingsModal.tsx
    │   └── Toast.tsx
    └── hooks/
        └── useAdminCapacityAlert.ts
