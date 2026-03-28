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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Coins, Plus, Settings, LogOut, Loader2, Share2, LayoutDashboard, Trash2, Menu } from 'lucide-react';
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

  const NavLinks = () => (
    <nav className="flex-1 space-y-1">
      <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-primary bg-primary/10 rounded-xl font-bold">
        <LayoutDashboard className="h-4 w-4" />
        Dashboard
      </Link>
      <Link href="/chamas/new" className="flex items-center gap-3 px-3 py-2 text-muted-foreground hover:bg-muted/50 rounded-xl font-medium transition-colors">
        <Plus className="h-4 w-4" />
        New Chama
      </Link>
      <Link href="#" className="flex items-center gap-3 px-3 py-2 text-muted-foreground hover:bg-muted/50 rounded-xl font-medium transition-colors">
        <Settings className="h-4 w-4" />
        Settings
      </Link>
    </nav>
  );

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="flex flex-1">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:flex w-64 flex-col border-r bg-card sticky top-0 h-screen">
          <div className="p-6">
            <Link className="flex items-center" href="/">
              <Coins className="h-6 w-6 text-primary mr-2" />
              <span className="font-headline font-bold text-xl tracking-tight text-primary">ChamaSmart</span>
            </Link>
          </div>
          <div className="px-4 flex-1">
            <NavLinks />
          </div>
          <div className="p-4 border-t">
            <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/5" onClick={() => auth.signOut()}>
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto">
          {/* Header */}
          <header className="h-16 border-b flex items-center justify-between px-4 lg:px-8 bg-background/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center gap-2 lg:gap-4">
              {/* Mobile Menu Trigger */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px] p-0 bg-card">
                  <SheetHeader className="p-6 text-left border-b">
                    <SheetTitle className="flex items-center">
                      <Coins className="h-6 w-6 text-primary mr-2" />
                      <span className="text-primary">ChamaSmart</span>
                    </SheetTitle>
                  </SheetHeader>
                  <div className="p-4 flex flex-col h-[calc(100%-80px)]">
                    <NavLinks />
                    <div className="mt-auto pt-4 border-t">
                      <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/5" onClick={() => auth.signOut()}>
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              <h1 className="text-lg font-bold font-headline hidden sm:block">
                Dashboard
              </h1>
              
              {chamas && chamas.length > 0 && (
                <Select value={selectedChamaId || ""} onValueChange={setSelectedChamaId}>
                  <SelectTrigger className="w-[140px] sm:w-[200px] border-primary/20 bg-card text-xs sm:text-sm font-bold">
                    <SelectValue placeholder="Select Chama" />
                  </SelectTrigger>
                  <SelectContent>
                    {chamas.map((chama) => (
                      <SelectItem key={chama.id} value={chama.id} className="font-medium">
                        {chama.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            
            <div className="flex gap-2 sm:gap-4">
              {activeChama && (
                <>
                  <Button size="sm" variant="outline" className="border-primary text-primary font-bold hidden sm:flex hover:bg-primary/5" onClick={handleShareInvite}>
                    <Share2 className="h-4 w-4 mr-2" /> Invite
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10 hidden sm:flex">
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="w-[90vw] max-w-lg rounded-3xl">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete <strong>{activeChama.name}</strong> and all its contribution history.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteChama} className="bg-destructive text-white hover:bg-destructive/90 rounded-xl">
                          {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete Chama"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
              <Link href="/chamas/new">
                <Button size="sm" className="bg-primary text-white font-bold h-9 sm:h-10 rounded-xl shadow-lg shadow-primary/20">
                  <Plus className="h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">New Chama</span>
                </Button>
              </Link>
            </div>
          </header>

          <div className="p-4 lg:p-8 space-y-6 lg:space-y-8">
            {activeChama ? (
              <>
                <DashboardStats chama={activeChama} />
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                  <div className="lg:col-span-2 space-y-6 lg:space-y-8">
                    <MemberContributions chamaId={activeChama.id} />
                    <TransactionHistory chamaId={activeChama.id} />
                  </div>
                  <div className="space-y-6 lg:space-y-8">
                    <AiPrediction chama={activeChama} />
                    <div className="bg-card border border-primary/10 rounded-3xl p-6 space-y-4 shadow-sm">
                      <h3 className="font-headline font-bold text-primary text-lg flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Treasurer Tool
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        The AI handles automatic M-Pesa reconciliation. You will be notified here if any transaction needs manual review.
                      </p>
                      <Button variant="secondary" className="w-full bg-primary/10 text-primary hover:bg-primary/20 font-bold rounded-xl h-11">
                        View Unmatched
                      </Button>
                    </div>
                    {/* Mobile visible action buttons for Chama Management */}
                    <div className="flex flex-col gap-3 sm:hidden">
                       <Button variant="outline" className="w-full border-primary text-primary font-bold rounded-xl h-12" onClick={handleShareInvite}>
                         <Share2 className="h-4 w-4 mr-2" /> Copy Invite Link
                       </Button>
                       <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" className="w-full border-destructive text-destructive hover:bg-destructive/10 font-bold rounded-xl h-12">
                            <Trash2 className="h-4 w-4 mr-2" /> Delete Chama
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="w-[90vw] max-w-lg rounded-3xl">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Chama?</AlertDialogTitle>
                            <AlertDialogDescription>This is permanent and cannot be undone.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteChama} className="bg-destructive text-white rounded-xl">Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 space-y-4 bg-card rounded-[2rem] border-2 border-dashed border-primary/20 shadow-sm">
                <Coins className="h-16 w-16 text-primary opacity-20" />
                <h2 className="text-2xl font-bold font-headline">No Active Chamas</h2>
                <p className="text-muted-foreground max-w-sm">
                  Create your first group to start automating your student savings and M-Pesa reconciliation.
                </p>
                <Link href="/chamas/new">
                  <Button className="bg-primary text-white px-8 h-12 rounded-full font-bold shadow-lg shadow-primary/20">Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}