<div align="center">

<img src="https://img.shields.io/badge/M--Pesa-00A651?style=for-the-badge&logoColor=white" alt="M-Pesa"/>
<img src="https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js"/>
<img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase"/>
<img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel"/>
<img src="https://img.shields.io/badge/Gemini_AI-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white" alt="Gemini AI"/>
<img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>

# 🫱🏾‍🫲🏽 ChamaSmart

### AI-Powered Student Chama Automation — Built for Kenya, Powered by M-Pesa

**M-Pesa × GoMyCode | Money in Motion Hackathon 2025**

[🚀 Live Demo](https://chama-smart-nine.vercel.app/) · [📂 Repository](https://github.com/zakoshy/chama-smart)

</div>

---

## 📖 Table of Contents

- [About the Project](#-about-the-project)
- [The Problem](#-the-problem)
- [Our Solution](#-our-solution)
- [Live Demo & Test Credentials](#-live-demo--test-credentials)
- [Key Features](#-key-features)
- [How It Works](#-how-it-works)
- [Screenshots](#-screenshots)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Team](#-team)

---

## 🌍 About the Project

**ChamaSmart** is a web application that automates the full lifecycle of a student chama . Kenya's culturally rooted informal savings group. It replaces manual M-Pesa reconciliation, missed-payment chaos, and treasurer burnout with an intelligent, real-time platform.

The Treasurer logs into a dashboard, creates a chama with a goal and deadline, and shares a single link to the WhatsApp group. Members click the link, contribute via M-Pesa STK Push, and the system captures their identity directly from the transaction. An AI layer built on **Google Gemini** (via Firebase Genkit) then handles payment matching, goal forecasting, and smart payment reminders  all automatically.

No spreadsheets. No chasing people. No awkward messages.

---

## 🔴 The Problem

In Kenyan student communities, chamas are everywhere  for trips, rent, projects, emergency funds, and shared goals. But the administration is a nightmare:

- **The Treasurer's Burden:** For every 10 members sending money via M-Pesa, the treasurer manually checks 10 SMS notifications, matches names, and updates a spreadsheet  often getting it wrong.
- **The Ghost Member Problem:** People forget to pay. Deadlines slip. Group goals are missed. Friendships strain.
- **No Visibility:** Members never know in real-time how close the group is to its goal which kills motivation and accountability.
- **No Structure:** Without automated reminders, the treasurer becomes the sole accountability mechanism, which is exhausting and unsustainable.

**The result:** The number one reason student chamas collapse is not lack of money. It is the administrative chaos of tracking it.

---

## ✅ Our Solution

ChamaSmart digitizes and automates every stage of the chama lifecycle:

1. **Treasurer creates a Chama** on their dashboard — sets a name, goal amount (KES), and target date.
2. **A unique shareable invite link is generated** — the treasurer drops it in the WhatsApp group.
3. **Members click the link** — they are prompted for an M-Pesa STK Push. No account creation needed.
4. **M-Pesa callback is received** by Firebase — the member's identity is captured from the transaction metadata (phone number as the primary key).
5. **Gemini AI processes the payment** — matches the contributor, flags unmatched transactions for manual review, and recalculates the group's goal forecast.
6. **The dashboard updates in real time** via Firestore listeners — Total Collected, Completion %, and member list all update live.
7. **AI Nudge Reminders** are sent before contribution deadlines for any member who has not yet paid — with a direct payment link embedded.

The Treasurer stops chasing people. The system runs itself.

---

## 🔗 Live Demo & Test Credentials

> **🌐 Live Application:** [https://chama-smart-nine.vercel.app/](https://chama-smart-nine.vercel.app/)

### 🔐 Test Account (Treasurer / Admin Role)

| Field | Value |
|-------|-------|
| **Email** | `treasurer@gmail.com` |
| **Password** | `chama254` |

> **How to test the full flow:**
> 1. Log in with the Treasurer credentials above — click **"Go to Dashboard"** on the landing page
> 2. Select an existing Chama (e.g. "Tsavo trip") from the dropdown, or click **"+ New Chama"** to create one
> 3. Set a Chama Name, Description, Goal Amount (KES), and Target Date — then click **"Create Chama & Generate Invite Link"**
> 4. Copy the generated invite link and open it in a new tab to experience the Member contribution flow
> 5. Return to the dashboard to see the real-time update — Total Collected, Completion %, and Recent Activity all update live
> 6. Any unmatched M-Pesa transaction appears in **Recent Activity** tagged **"NEEDS REVIEW"** — click **"View Unmatched"** in the Treasurer Tool panel to manually resolve it
>
> ⚠️ M-Pesa STK Push runs in **Daraja sandbox mode** — no real money is transacted during the demo.

---

## ✨ Key Features

### 👨‍💼 Treasurer Dashboard
- Create and manage multiple chamas with custom goal amounts (KES) and target dates
- Live stats: **Total Collected**, **Status**, **Savings Goal**, and **Completion %** — all update in real time
- **Group Members** panel — see every member who has contributed via the invite link
- **Recent Activity** feed — live log of every incoming M-Pesa transaction with amount, reference, and timestamp
- **Treasurer Tool** — AI handles automatic M-Pesa reconciliation; unmatched transactions are flagged for manual review via "View Unmatched"
- Invite members directly from the dashboard, or delete a chama when the goal is complete
- Switch between multiple active chamas using the dropdown selector

### 👤 Member Experience (Zero Friction)
- Members need no account — click the invite link, pay via M-Pesa STK Push, done
- Identity is captured automatically from M-Pesa transaction metadata (phone number as primary key)
- No data entry required — the payment itself is the registration

### 🤖 AI Features — Powered by Google Gemini via Firebase Genkit
- **Smart Payment Matching:** Gemini matches M-Pesa transactions to member records using phone number, name, or nickname from the transaction reference
- **Unmatched Transaction Flagging:** Payments that cannot be auto-matched are surfaced to the Treasurer for manual review so nothing is ever lost
- **Goal Prediction:** AI forecasts whether the group will meet its savings target based on current contribution velocity which is displayed as Completion % with "On Track" status
- **AI Nudge Reminders:** Personalized reminders auto-generated and sent before due dates with a direct payment link embedded

### 💳 M-Pesa Integration (Daraja API)
- **STK Push (Lipa Na M-Pesa Online):** One-tap payment prompt sent to the member's phone
- **C2B Webhook Handling:** Firebase receives and processes M-Pesa payment callbacks in real time
- Transaction records stored in Firestore under `/chamas/{chamaId}/transactions/`

### 🔐 Security
- Role-based Firestore security rules — Treasurers have admin write access; members have scoped read/create access via the invite link flow
- Immutable AI-verified audit trail for every transaction — no disputes possible
- All API secrets are server-side only, never exposed to the browser

---

## ⚙️ How It Works

```
[Treasurer] Creates Chama → Generates invite link → Shares on WhatsApp
                                      ↓
              [Member] Clicks link → M-Pesa STK Push triggered → Enters PIN
                                      ↓
              M-Pesa Daraja Callback → Firebase receives payload
                                      ↓
              Gemini AI (via Genkit) → Matches contributor → Logs to Firestore
                    ↓ matched                          ↓ unmatched
              Member record updated            Flagged as "NEEDS REVIEW"
                                      ↓
              Firestore listener → Dashboard updates live (Collected, %, Members)
                                      ↓
              [Before deadline] AI Nudge Reminder → SMS with payment link
```

**Firestore Data Model:**
```
/users/{userId}                                               ← Treasurer profile
/chamas/{chamaId}                                             ← Chama metadata (goal, deadline, adminUserId)
/chamas/{chamaId}/members/{memberId}                          ← Member records (phone as primary key)
/chamas/{chamaId}/transactions/{transactionId}                ← Raw M-Pesa transaction logs
/chamas/{chamaId}/members/{memberId}/contributions/{id}       ← Per-member financial records
```

---

## 📸 Screenshots

### 🏠 Landing Page
![Landing Page](./docs/LandingPage.png)

### 🌟 Features Section
![Features](./docs/Features.png)

### 📊 Treasurer Dashboard
![Dashboard](./docs/UserInterface.png)
*Live view showing Total Collected, Savings Goal, Completion %, Group Members, Recent Activity feed, and the AI-powered Treasurer Tool panel*

### 💳 M-Pesa STK Push — Live Integration Proof
![M-Pesa STK Success](./docs/mpesa-stk-success%202.png)](./docs/)
*Daraja sandbox confirming a successful STK Push request — ResponseCode 0, 
CheckoutRequestID issued, payment prompt sent to member's phone*

 ### 💸 Payment Integration (Lipa Na M-Pesa)
ChamaSmart integrates directly with the **Safaricom Daraja API** to automate member contributions. When a treasurer initiates a collection or a member requests to save, an STK Push is triggered instantly to their registered phone number.

#### Sandbox STK Push Preview:
![M-Pesa STK Success](./docs/STK-Push.jpeg)

*Figure 1: Live STK Push prompt for 'Chamasmart' showing the 1,000 KES contribution request in the Sandbox environment.*
### ➕ Create New Chama

### 🤖 AI-Powered Analytics — Group Goal Forecasting
![AI Insights](./docs/Ai%20Insights.png)
*Figure : The **AI Savings Predictor** powered by Google Gemini. It analyzes M-Pesa contribution velocity to provide a 100% confidence forecast on goal attainment.*


## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | [Next.js 15](https://nextjs.org/) (React 19, TypeScript) | Full-stack web app with App Router |
| **Database** | [Firebase Firestore](https://firebase.google.com/docs/firestore) | Real-time NoSQL — contributions, members, chamas |
| **Auth** | [Firebase Authentication](https://firebase.google.com/docs/auth) | Treasurer sign-in; anonymous member access via invite link |
| **Backend** | [Firebase Cloud Functions](https://firebase.google.com/docs/functions) | M-Pesa webhook receiver, scheduled AI reminders |
| **AI / LLM** | [Google Gemini](https://ai.google.dev/) via [Firebase Genkit](https://firebase.google.com/docs/genkit) | Payment matching, goal prediction, nudge generation |
| **Payments** | [Daraja API (M-Pesa)](https://developer.safaricom.co.ke/) | STK Push, C2B webhook callbacks |
| **Hosting** | [Vercel](https://vercel.com/) | Frontend deployment |
| **Styling** | Tailwind CSS + [shadcn/ui](https://ui.shadcn.com/) (Radix UI) | Component library and design system |
| **Charts** | [Recharts](https://recharts.org/) | Contribution analytics visualizations |
| **Forms** | React Hook Form + Zod | Type-safe form validation |
| **Security** | Firestore Security Rules | Role-based read/write access control |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [npm](https://www.npmjs.com/)
- [Firebase CLI](https://firebase.google.com/docs/cli): `npm install -g firebase-tools`
- A [Firebase project](https://console.firebase.google.com/) with Firestore and Authentication enabled
- A [Safaricom Daraja](https://developer.safaricom.co.ke/) sandbox account
- A [Google AI Studio](https://aistudio.google.com/) account for a Gemini API key

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/zakoshy/chama-smart.git
cd chama-smart

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Open .env.local and fill in your keys (see section below)

# 4. Start the development server (runs on port 9002)
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) in your browser.

### Running the AI Layer (Genkit)

```bash
# Start Genkit dev server
npm run genkit:dev

# Or with file watching
npm run genkit:watch
```

### Deploy to Firebase

```bash
firebase login
firebase deploy --only firestore:rules
firebase deploy --only functions
```

---

## 🔐 Environment Variables


## 👥 Team

Built with 🫱🏾‍🫲🏽 by a team of six for the **M-Pesa × GoMyCode Money in Motion Hackathon**.

| Name | Role | Responsibility |
|------|------|----------------|
| **Mercy Kimutai** | Backend Engineer | M-Pesa Daraja API integration, Firebase Cloud Functions, C2B webhook handling |
| **Joseph Constantine** | Frontend Engineer | Next.js UI, member contribution flow, landing page, responsive design |
| **Edwin Oshome** | Fullstack Engineer | System architecture, Firebase Authentication, Firestore data modelling |
| **Akinyi Grace Fiona** | Backend Engineer | Genkit AI flows — payment matching, goal prediction, nudge generation |
| **Breattah Okeyo** | Data Scientist | Group Health Score algorithm, contribution analytics, Recharts visualizations |
| **Lekayia Mark** | Cybersecurity Engineer | Firestore security rules, API endpoint hardening, webhook validation |

---

## 📄 License

Built for hackathon purposes. All rights reserved by the ChamaSmart team © 2025.

---

<div align="center">

**Made in Kenya 🇰🇪 — For the culture, powered by M-Pesa**

[🚀 Try ChamaSmart Live](https://chama-smart-nine.vercel.app/) · [📂 View Source](https://github.com/zakoshy/chama-smart)
</div>
