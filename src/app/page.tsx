import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coins, ShieldCheck, Zap, BrainCircuit, Users, BarChart3, Globe } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-background/50 backdrop-blur-md sticky top-0 z-50">
        <Link className="flex items-center justify-center" href="/">
          <Coins className="h-6 w-6 text-primary mr-2" />
          <span className="font-headline font-bold text-xl tracking-tight text-primary">ChamaSmart</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Link className="text-sm font-medium hover:text-primary transition-colors hidden sm:block" href="#features">Features</Link>
          <Link href="/dashboard">
            <Button size="sm" variant="default" className="bg-primary text-white">Go to Dashboard</Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-background to-background/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-4">
                <Badge variant="secondary" className="px-3 py-1 text-xs font-semibold uppercase tracking-wider mb-2 bg-primary/10 text-primary border-none">
                  The Future of Informal Finance
                </Badge>
                <h1 className="text-4xl font-headline font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none">
                  Automate Your Student <span className="text-primary italic">Chama</span>
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground text-base sm:text-lg md:text-xl font-body mt-4 px-4">
                  Stop chasing M-Pesa references. ChamaSmart uses AI to automatically reconcile payments, track member goals, and grow your savings—all in real-time.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full sm:w-auto px-6 sm:px-0">
                <Link href="/dashboard" className="w-full sm:w-auto">
                  <Button size="lg" className="bg-primary text-white h-12 px-8 text-lg rounded-full w-full">Launch Dashboard</Button>
                </Link>
                <Button size="lg" variant="outline" className="h-12 px-8 text-lg rounded-full border-primary text-primary hover:bg-primary/10 w-full sm:w-auto">Learn More</Button>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-16 sm:py-20">
          <div className="container px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-3">
              <Card className="border-none shadow-none bg-transparent">
                <CardContent className="pt-6 text-center space-y-4">
                  <div className="mx-auto bg-primary/10 p-4 rounded-2xl w-fit">
                    <Zap className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-headline font-bold">Instant Reconciliation</h3>
                  <p className="text-muted-foreground font-body text-sm sm:text-base">
                    M-Pesa webhooks are processed by Gemini AI to match payments to members by phone, name, or nickname automatically.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-none bg-transparent">
                <CardContent className="pt-6 text-center space-y-4">
                  <div className="mx-auto bg-accent/10 p-4 rounded-2xl w-fit">
                    <BrainCircuit className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="text-xl font-headline font-bold">Goal Prediction</h3>
                  <p className="text-muted-foreground font-body text-sm sm:text-base">
                    AI analyzes your chama's contribution velocity to predict if you'll hit your target goal by the deadline.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-none bg-transparent">
                <CardContent className="pt-6 text-center space-y-4">
                  <div className="mx-auto bg-primary/10 p-4 rounded-2xl w-fit">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-headline font-bold">Transparency First</h3>
                  <p className="text-muted-foreground font-body text-sm sm:text-base">
                    Live dashboards show exactly who has contributed, eliminating disputes and manual spreadsheet management.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="w-full py-20 sm:py-24 bg-primary text-white overflow-hidden relative rounded-[2rem] mx-4 lg:mx-8 w-[calc(100%-2rem)] lg:w-[calc(100%-4rem)]">
          <div className="absolute top-0 right-0 -mt-20 -mr-20 opacity-10 pointer-events-none">
            <Globe size={400} />
          </div>
          <div className="container px-4 md:px-6 relative z-10">
            <div className="flex flex-col items-center text-center space-y-8 mb-16">
              <h2 className="text-3xl font-headline font-bold tracking-tighter sm:text-4xl md:text-5xl max-w-3xl">
                Modernizing Tradition with Intelligent Infrastructure
              </h2>
              <p className="text-primary-foreground/80 max-w-2xl text-base sm:text-lg">
                Informal savings groups (Chamas) are the backbone of community finance. We provide the digital trust layer needed to scale them safely.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20 space-y-4">
                <ShieldCheck className="h-10 w-10 text-accent" />
                <h4 className="font-bold text-xl font-headline text-white">Digital Trust</h4>
                <p className="text-primary-foreground/70 text-sm leading-relaxed">
                  Eliminate financial disputes with an immutable AI-verified audit trail for every single contribution.
                </p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20 space-y-4">
                <BarChart3 className="h-10 w-10 text-accent" />
                <h4 className="font-bold text-xl font-headline text-white">Actionable Insights</h4>
                <p className="text-primary-foreground/70 text-sm leading-relaxed">
                  Go beyond tracking. Our AI predicts shortfalls before they happen, allowing your group to adjust early.
                </p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20 space-y-4">
                <Globe className="h-10 w-10 text-accent" />
                <h4 className="font-bold text-xl font-headline text-white">Scale Effortlessly</h4>
                <p className="text-primary-foreground/70 text-sm leading-relaxed">
                  Empower treasurers to manage hundreds of members with the same ease as a small group of five.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t mt-12 bg-muted/30">
        <div className="container px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm text-muted-foreground text-center md:text-left font-medium">© 2026 ChamaSmart. Empowering Student Savings in Kenya.</p>
          <nav className="flex gap-4 sm:gap-6">
            <Link className="text-sm hover:underline underline-offset-4 font-medium" href="#">Terms</Link>
            <Link className="text-sm hover:underline underline-offset-4 font-medium" href="#">Privacy</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}