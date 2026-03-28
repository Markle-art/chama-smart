import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coins, ShieldCheck, Zap, BrainCircuit, Users } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-white/50 backdrop-blur-md sticky top-0 z-50">
        <Link className="flex items-center justify-center" href="/">
          <Coins className="h-6 w-6 text-primary mr-2" />
          <span className="font-headline font-bold text-xl tracking-tight text-primary">ChamaSmart</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="#features">Features</Link>
          <Link href="/dashboard">
            <Button size="sm" variant="default" className="bg-primary text-white">Go to Dashboard</Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-white to-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <Badge variant="secondary" className="px-3 py-1 text-xs font-semibold uppercase tracking-wider mb-4">
                  Powered by AI Reconciliation
                </Badge>
                <h1 className="text-3xl font-headline font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none">
                  Automate Your Student <span className="text-primary italic">Chama</span>
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl font-body mt-4">
                  Stop chasing M-Pesa references. ChamaSmart uses AI to automatically reconcile payments, track member goals, and grow your savings—all in real-time.
                </p>
              </div>
              <div className="space-x-4 mt-8">
                <Link href="/dashboard">
                  <Button size="lg" className="bg-primary text-white h-12 px-8 text-lg rounded-full">Launch Dashboard</Button>
                </Link>
                <Button size="lg" variant="outline" className="h-12 px-8 text-lg rounded-full border-primary text-primary hover:bg-primary/10">Learn More</Button>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-20 bg-white">
          <div className="container px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-3">
              <Card className="border-none shadow-none bg-transparent">
                <CardContent className="pt-6 text-center space-y-4">
                  <div className="mx-auto bg-primary/10 p-3 rounded-2xl w-fit">
                    <Zap className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-headline font-bold">Instant Reconciliation</h3>
                  <p className="text-muted-foreground font-body">
                    M-Pesa webhooks are processed by Gemini AI to match payments to members by phone, name, or nickname automatically.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-none bg-transparent">
                <CardContent className="pt-6 text-center space-y-4">
                  <div className="mx-auto bg-accent/10 p-3 rounded-2xl w-fit">
                    <BrainCircuit className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="text-xl font-headline font-bold">Goal Prediction</h3>
                  <p className="text-muted-foreground font-body">
                    AI analyzes your chama's contribution velocity to predict if you'll hit your target goal by the deadline.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-none bg-transparent">
                <CardContent className="pt-6 text-center space-y-4">
                  <div className="mx-auto bg-primary/10 p-3 rounded-2xl w-fit">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-headline font-bold">Transparency First</h3>
                  <p className="text-muted-foreground font-body">
                    Live dashboards show exactly who has contributed, eliminating disputes and manual spreadsheet management.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="w-full py-20 bg-primary text-white">
          <div className="container px-4 md:px-6 text-center space-y-8">
            <h2 className="text-3xl font-headline font-bold tracking-tighter md:text-4xl">
              Pitch Ready: "AI Removing Friction from African Informal Finance"
            </h2>
            <div className="grid md:grid-cols-2 gap-8 text-left max-w-4xl mx-auto">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <ShieldCheck className="mt-1 h-6 w-6 shrink-0" />
                  <div>
                    <h4 className="font-bold text-lg">Trust Infrastructure</h4>
                    <p className="text-primary-foreground/80">Building trust in informal groups by providing immutable, real-time proof of payments matched via AI.</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <Zap className="mt-1 h-6 w-6 shrink-0" />
                  <div>
                    <h4 className="font-bold text-lg">Scale the Informal</h4>
                    <p className="text-primary-foreground/80">Allowing treasurers to manage 100+ members without errors, turning manual chamas into automated savings engines.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t bg-muted">
        <div className="container px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">© 2024 ChamaSmart. Empowering Student Savings in Kenya.</p>
          <nav className="flex gap-4 sm:gap-6">
            <Link className="text-sm hover:underline underline-offset-4" href="#">Terms</Link>
            <Link className="text-sm hover:underline underline-offset-4" href="#">Privacy</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}