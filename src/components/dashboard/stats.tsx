import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, Target, Banknote } from 'lucide-react';
import { CURRENT_CHAMA, CHAMA_MEMBERS } from '@/lib/mock-data';

export function DashboardStats() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="border-none shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
          <Banknote className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(CURRENT_CHAMA.currentTotalContributions)}</div>
          <p className="text-xs text-muted-foreground">+20% from last month</p>
        </CardContent>
      </Card>
      <Card className="border-none shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Members</CardTitle>
          <Users className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{CHAMA_MEMBERS.length}</div>
          <p className="text-xs text-muted-foreground">100% participation</p>
        </CardContent>
      </Card>
      <Card className="border-none shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Savings Goal</CardTitle>
          <Target className="h-4 w-4 text-accent" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(CURRENT_CHAMA.targetGoalAmount)}</div>
          <p className="text-xs text-muted-foreground">By Dec 2024</p>
        </CardContent>
      </Card>
      <Card className="border-none shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completion</CardTitle>
          <TrendingUp className="h-4 w-4 text-accent" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{((CURRENT_CHAMA.currentTotalContributions / CURRENT_CHAMA.targetGoalAmount) * 100).toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">On track</p>
        </CardContent>
      </Card>
    </div>
  );
}