'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection, useMemoFirebase, deleteDocumentNonBlocking } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import { DashboardStats } from '@/components/dashboard/stats';
import { MemberContributions } from '@/components/dashboard/member-contributions';
import { TransactionHistory } from '@/components/dashboard/transaction-history';
import { AiPrediction } from '@/components/dashboard/ai-prediction';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Coins, Plus, Settings, LogOut, Loader2, Share2, LayoutDashboard, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function DashboardPage() {
  const { user, isUserLoading, auth } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [selectedChamaId, setSelectedChamaId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!isUserLoading && (!user || user.isAnonymous)) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  // Memoize query for chamas managed by the current user
  const chamasQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'chamas'), where('adminUserId', '==', user.uid));
  }, [db, user?.uid]);

  const { data: chamas, isLoading: isChamasLoading } = useCollection(chamasQuery);

  // Set default selected chama when data loads
  useEffect(() => {
    if (chamas && chamas.length > 0 && !selectedChamaId) {
      setSelectedChamaId(chamas[0].id);
    } else if (chamas && chamas.length === 0) {
      setSelectedChamaId(null);
    }
  }, [chamas, selectedChamaId]);

  const activeChama = useMemo(() => {
    if (!chamas || !selectedChamaId) return null;
    return chamas.find(c => c.id === selectedChamaId) || null;
  }, [chamas, selectedChamaId]);

  const handleShareInvite = () => {
    if (!activeChama) return;
    const url = `${window.location.origin}/join/${activeChama.id}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Invite Link Copied!",
      description: "Send this link to your group members.",
    });
  };

  const handleDeleteChama = () => {
    if (!activeChama || !db) return;
    
    setIsDeleting(true);
    const chamaRef = doc(db, 'chamas', activeChama.id);
    
    deleteDocumentNonBlocking(chamaRef);
    
    toast({
      title: "Chama Deleted",
      description: `${activeChama.name} has been removed.`,
    });
    
    setSelectedChamaId(null);
    setIsDeleting(false);
  };

  if (isUserLoading || isChamasLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || user.isAnonymous) return null;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="hidden lg:flex w-64 flex-col border-r bg-white">
          <div className="p-6">
            <Link className="flex items-center" href="/">
              <Coins className="h-6 w-6 text-primary mr-2" />
              <span className="font-headline font-bold text-xl tracking-tight text-primary">ChamaSmart</span>
            </Link>
          </div>
          <nav className="flex-1 px-4 space-y-1">
            <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-primary bg-primary/5 rounded-lg font-medium">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
            <Link href="/chamas/new" className="flex items-center gap-3 px-3 py-2 text-muted-foreground hover:bg-muted rounded-lg font-medium transition-colors">
              <Plus className="h-4 w-4" />
              New Chama
            </Link>
            <Link href="#" className="flex items-center gap-3 px-3 py-2 text-muted-foreground hover:bg-muted rounded-lg font-medium transition-colors">
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </nav>
          <div className="p-4 border-t">
            <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground" onClick={() => auth.signOut()}>
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto">
          <header className="h-16 border-b flex items-center justify-between px-8 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold font-headline hidden md:block">
                Dashboard
              </h1>
              {chamas && chamas.length > 0 && (
                <Select value={selectedChamaId || ""} onValueChange={setSelectedChamaId}>
                  <SelectTrigger className="w-[200px] border-primary/20 bg-white">
                    <SelectValue placeholder="Select Chama" />
                  </SelectTrigger>
                  <SelectContent>
                    {chamas.map((chama) => (
                      <SelectItem key={chama.id} value={chama.id}>
                        {chama.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            
            <div className="flex gap-4">
              {activeChama && (
                <>
                  <Button size="sm" variant="outline" className="border-primary text-primary font-bold hidden sm:flex" onClick={handleShareInvite}>
                    <Share2 className="h-4 w-4 mr-2" /> Invite
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10 hidden sm:flex">
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the Chama <strong>{activeChama.name}</strong> and remove all associated data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteChama} className="bg-destructive text-white hover:bg-destructive/90">
                          {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete Chama"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
              <Link href="/chamas/new">
                <Button size="sm" className="bg-primary text-white font-bold">
                  <Plus className="h-4 w-4 mr-2" /> New
                </Button>
              </Link>
            </div>
          </header>

          <div className="p-8 space-y-8">
            {activeChama ? (
              <>
                <DashboardStats chama={activeChama} />
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-8">
                    <MemberContributions chamaId={activeChama.id} />
                    <TransactionHistory chamaId={activeChama.id} />
                  </div>
                  <div className="space-y-8">
                    <AiPrediction chama={activeChama} />
                    <div className="bg-accent/5 border border-accent/20 rounded-2xl p-6 space-y-4">
                      <h3 className="font-headline font-bold text-accent text-lg">Treasurer Tool</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        The AI handles automatic M-Pesa reconciliation. You will be notified here if any transaction needs manual review.
                      </p>
                      <Button variant="secondary" className="w-full bg-accent text-white hover:bg-accent/90">View Unmatched</Button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4 bg-white rounded-2xl border-2 border-dashed">
                <Coins className="h-12 w-12 text-muted-foreground opacity-20" />
                <h2 className="text-2xl font-bold font-headline">No Active Chamas</h2>
                <p className="text-muted-foreground max-w-sm">
                  Create your first group to start automating your student savings and M-Pesa reconciliation.
                </p>
                <Link href="/chamas/new">
                  <Button className="bg-primary text-white">Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
