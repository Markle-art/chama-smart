"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainCircuit, Loader2, TrendingUp, TrendingDown } from 'lucide-react';
import { predictSavingsGoal, PredictSavingsGoalOutput } from '@/ai/flows/ai-savings-goal-prediction-flow';
import { CURRENT_CHAMA, CONTRIBUTION_HISTORY } from '@/lib/mock-data';
import { Progress } from '@/components/ui/progress';

export function AiPrediction() {
  const [prediction, setPrediction] = useState<PredictSavingsGoalOutput | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        const result = await predictSavingsGoal({
          chamaId: CURRENT_CHAMA.id,
          currentTotalContributions: CURRENT_CHAMA.currentTotalContributions,
          targetGoalAmount: CURRENT_CHAMA.targetGoalAmount,
          targetDate: CURRENT_CHAMA.targetDate,
          startDate: CURRENT_CHAMA.startDate,
          contributionHistory: CONTRIBUTION_HISTORY,
        });
        setPrediction(result);
      } catch (error) {
        console.error("Prediction failed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrediction();
  }, []);

  if (loading) {
    return (
      <Card className="border-none shadow-sm bg-primary/5">
        <CardContent className="pt-6 flex flex-col items-center justify-center min-h-[200px] text-center space-y-4">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-sm font-medium text-primary">AI is analyzing contribution patterns...</p>
        </CardContent>
      </Card>
    );
  }

  if (!prediction) return null;

  return (
    <Card className="border-none shadow-lg bg-gradient-to-br from-primary to-primary/90 text-white overflow-hidden relative">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <BrainCircuit size={80} />
      </div>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-headline">
          <BrainCircuit className="h-5 w-5" />
          AI Savings Predictor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-end gap-3">
          <div className="text-4xl font-bold">
            {prediction.willReachGoal ? "On Track!" : "Behind Pace"}
          </div>
          <div className="pb-1">
            {prediction.willReachGoal ? <TrendingUp className="h-6 w-6 text-green-300" /> : <TrendingDown className="h-6 w-6 text-red-300" />}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium text-white/80">
            <span>Progress: {((CURRENT_CHAMA.currentTotalContributions / CURRENT_CHAMA.targetGoalAmount) * 100).toFixed(0)}%</span>
            <span>Target: KES {CURRENT_CHAMA.targetGoalAmount.toLocaleString()}</span>
          </div>
          <Progress value={(CURRENT_CHAMA.currentTotalContributions / CURRENT_CHAMA.targetGoalAmount) * 100} className="h-2 bg-white/20" />
        </div>

        <div className="bg-white/10 p-4 rounded-xl space-y-2">
          <p className="text-sm font-medium leading-tight">
            "{prediction.reasoning}"
          </p>
          <div className="flex justify-between items-center pt-2 border-t border-white/10">
            <span className="text-[10px] uppercase tracking-wider text-white/60">Confidence Score</span>
            <span className="text-sm font-bold">{(prediction.confidenceScore * 100).toFixed(0)}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}