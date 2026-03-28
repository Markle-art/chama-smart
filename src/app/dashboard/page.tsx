import { DashboardStats } from '@/components/dashboard/stats';
import { MemberContributions } from '@/components/dashboard/member-contributions';
import { TransactionHistory } from '@/components/dashboard/transaction-history';
import { AiPrediction } from '@/components/dashboard/ai-prediction';
import { Button } from '@/components/ui/button';
import { Coins, Plus, Settings, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Sidebar Navigation - Simulation */}
      <div className="flex flex-1">
        <aside className="hidden lg:flex w-64 flex-col border-r bg-white">
          <div className="p-6">
            <Link className="flex items-center" href="/">
              <Coins className="h-6 w-6 text-primary mr-2" />
              <span className="font-headline font-bold text-xl tracking-tight text-primary">ChamaSmart</span>
            </Link>
          </div>
          <nav className="flex-1 px-4 space-y-1">
            <Link href="#" className="flex items-center gap-3 px-3 py-2 text-primary bg-primary/5 rounded-lg font-medium">
              <Coins className="h-4 w-4" />
              Dashboard
            </Link>
            <Link href="#" className="flex items-center gap-3 px-3 py-2 text-muted-foreground hover:bg-muted rounded-lg font-medium transition-colors">
              <Plus className="h-4 w-4" />
              New Chama
            </Link>
            <Link href="#" className="flex items-center gap-3 px-3 py-2 text-muted-foreground hover:bg-muted rounded-lg font-medium transition-colors">
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </nav>
          <div className="p-4 border-t">
            <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto">
          <header className="h-16 border-b flex items-center justify-between px-8 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
            <h1 className="text-xl font-bold font-headline">UoN CompSci '24 Overview</h1>
            <div className="flex gap-4">
              <Button size="sm" variant="outline" className="border-primary text-primary font-bold">Invite Members</Button>
              <Button size="sm" className="bg-primary text-white font-bold">Export PDF</Button>
            </div>
          </header>

          <div className="p-8 space-y-8">
            <DashboardStats />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <MemberContributions />
                <TransactionHistory />
              </div>
              <div className="space-y-8">
                <AiPrediction />
                <div className="bg-accent/5 border border-accent/20 rounded-2xl p-6 space-y-4">
                  <h3 className="font-headline font-bold text-accent text-lg">Treasurer Tool</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Awaiting reconciliation for 1 transaction from <span className="font-bold">+254755555555</span>. The AI is 40% confident this belongs to Kevin.
                  </p>
                  <Button variant="secondary" className="w-full bg-accent text-white hover:bg-accent/90">Resolve Now</Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}