import { config } from 'dotenv';
config();

import '@/ai/flows/reconcile-mpesa-transaction-flow.ts';
import '@/ai/flows/ai-savings-goal-prediction-flow.ts';