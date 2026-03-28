import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, Target, Banknote } from 'lucide-react';

interface DashboardStatsProps {
  chama: any;
}

export function DashboardStats({ chama }: DashboardStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const progress = (chama.currentBalance / chama.goalAmount) * 100;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="border-none shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
          <Banknote className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(chama.currentBalance)}</div>
          <p className="text-xs text-muted-foreground">Current balance</p>
        </CardContent>
      </Card>
      <Card className="border-none shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Status</CardTitle>
          <Users className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{chama.status}</div>
          <p className="text-xs text-muted-foreground">Chama Operational</p>
        </CardContent>
      </Card>
      <Card className="border-none shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Savings Goal</CardTitle>
          <Target className="h-4 w-4 text-accent" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(chama.goalAmount)}</div>
          <p className="text-xs text-muted-foreground">Target: {new Date(chama.goalDate).toLocaleDateString()}</p>
        </CardContent>
      </Card>
      <Card className="border-none shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completion</CardTitle>
          <TrendingUp className="h-4 w-4 text-accent" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{progress.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">{chama.predictionStatus || 'On track'}</p>
        </CardContent>
      </Card>
    </div>
  );
}
