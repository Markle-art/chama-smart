# **App Name**: ChamaSmart

## Core Features:

- M-Pesa Webhook Integration: Securely receives and stores raw M-Pesa C2B payment transactions via API webhooks.
- AI Transaction Reconciliation Tool: Automatically matches incoming M-Pesa payments to the correct chama member using an LLM tool, considering names, phone numbers, and past payment patterns. It flags uncertain matches for manual review.
- Automated Contribution Updates: Real-time updates to member contribution records in Firebase Firestore based on reconciled M-Pesa transactions.
- Live Chama Dashboard: A dynamic dashboard displaying the chama's overall contribution progress, including savings goals, total collected, and recent transaction summaries.
- Member Contribution History: A real-time, sortable table detailing individual member contributions, payment statuses, and historical transaction data.
- Manual Review & Matching Interface: A dedicated user interface for administrators to review M-Pesa transactions that the AI flagged as 'Needs Review' and manually assign them to the correct chama member.
- AI Savings Goal Prediction Tool: An AI tool that analyzes current contribution trends and predicts the likelihood of the chama hitting its savings target by a specific date, offering simple forecasts.

## Style Guidelines:

- Primary color: A rich, professional golden-brown (#BA8622) evoking trust and financial growth.
- Background color: A subtle, warm off-white (#F8F6EE) for a clean, light interface and optimal readability.
- Accent color: A vibrant, energetic orange-red (#EB4D17) to highlight key actions, alerts, and call-to-action elements.
- Headline and body text font: 'Inter' (sans-serif) for its modern, clear, and highly legible appearance, suitable for displaying financial data and tabular information efficiently.
- Use modern, crisp icons that clearly communicate financial actions and data statuses. Leverage the accent color for key interactive icons to draw attention.
- Implement a clean, modular, and responsive grid-based layout for dashboards and data tables, prioritizing quick readability and intuitive navigation for financial information.
- Incorporate subtle, performant micro-animations and transitions for data updates and state changes, enhancing user feedback and interface responsiveness without distraction.