'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useFirestore, useUser, useDoc, useMemoFirebase, initiateAnonymousSignIn, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Coins, Loader2, Smartphone, CheckCircle2, ArrowLeft, ShieldCheck } from 'lucide-react';
import { initiateStkPush } from '@/lib/mpesa-service';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function JoinChamaPage() {
  const { chamaId } = useParams();
  const router = useRouter();
  const { user, isUserLoading, auth } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [isPaying, setIsPaying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const chamaRef = useMemoFirebase(() => {
    if (!db || !chamaId) return null;
    return doc(db, 'chamas', chamaId as string);
  }, [db, chamaId]);

  const { data: chama, isLoading: isChamaLoading } = useDoc(chamaRef);

  useEffect(() => {
    if (!isUserLoading && !user && auth) {
      initiateAnonymousSignIn(auth);
    }
  }, [user, isUserLoading, auth]);

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chama || !db) return;

    setIsPaying(true);
    try {
      const result = await initiateStkPush(phoneNumber, Number(amount), chama.name);
      if (result.success) {
        // Record the transaction attempt in Firestore
        const transactionId = `tx_${Math.random().toString(36).substring(7)}`;
        const transactionData = {
          id: transactionId,
          mPesaTransId: result.checkoutRequestId,
          transAmount: Number(amount),
          msisdn: phoneNumber,
          firstName: "Guest",
          billRefNumber: chama.name.substring(0, 15),
          transactionTime: new Date().toISOString(),
          businessShortCode: "174379",
          rawPayload: JSON.stringify(result),
          receivedAt: new Date().toISOString(),
          status: 'Pending Reconciliation',
          reconciledChamaId: chama.id,
          adminUserId: chama.adminUserId, // For security rules
        };

        const txRef = doc(db, 'chamas', chama.id, 'transactions', transactionId);
        setDocumentNonBlocking(txRef, transactionData, { merge: true });

        toast({
          title: "STK Push Sent",
          description: "Please check your phone for the PIN prompt.",
        });
        setIsSuccess(true);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Payment Error",
        description: "Could not initiate payment. Check your network.",
      });
    } finally {
      setIsPaying(false);
    }
  };

  if (isChamaLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!chama) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center space-y-6">
        <div className="bg-destructive/10 p-6 rounded-full">
          <ShieldCheck className="h-12 w-12 text-destructive" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold font-headline">Link Expired or Invalid</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            This savings group invitation is no longer active or the URL is incorrect. Please contact your group treasurer.
          </p>
        </div>
        <Button asChild className="bg-primary text-white px-8 h-12 rounded-full shadow-lg">
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
          </Link>
        </Button>
      </div>
    );
  }

  const progress = Math.min((chama.currentBalance / chama.goalAmount) * 100, 100);

  return (
    <div className="min-h-screen bg-background p-4 flex flex-col items-center justify-center">
      <Link href="/" className="flex items-center mb-8 hover:opacity-80 transition-opacity">
        <Coins className="h-8 w-8 text-primary mr-2" />
        <span className="font-headline font-bold text-2xl tracking-tight text-primary">ChamaSmart</span>
      </Link>

      <Card className="w-full max-w-lg border-none shadow-2xl overflow-hidden rounded-3xl">
        <div className="bg-primary h-3 w-full" />
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <Badge variant="secondary" className="bg-primary/10 text-primary border-none px-4 py-1">
              Active Savings Goal
            </Badge>
          </div>
          <CardTitle className="text-3xl font-bold font-headline text-foreground">{chama.name}</CardTitle>
          <CardDescription className="text-base mt-2">{chama.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 pt-4 px-8">
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <span className="text-sm font-medium text-muted-foreground">Raised So Far</span>
                <div className="text-2xl font-bold text-primary">KES {chama.currentBalance.toLocaleString()}</div>
              </div>
              <div className="text-right space-y-1">
                <span className="text-sm font-medium text-muted-foreground">Target Goal</span>
                <div className="text-xl font-bold">KES {chama.goalAmount.toLocaleString()}</div>
              </div>
            </div>
            <div className="space-y-2">
              <Progress value={progress} className="h-4 bg-primary/10 rounded-full" />
              <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <span>{progress.toFixed(1)}% Reached</span>
                <span>Deadline: {new Date(chama.goalDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {!isSuccess ? (
            <form onSubmit={handleContribute} className="space-y-5 pt-6 border-t border-dashed">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">M-Pesa Number</label>
                <div className="relative">
                  <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    className="pl-12 h-14 bg-muted/30 border-none rounded-2xl focus-visible:ring-primary"
                    placeholder="2547XXXXXXXX"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Contribution Amount (KES)</label>
                <Input
                  type="number"
                  className="h-14 bg-muted/30 border-none rounded-2xl focus-visible:ring-primary text-lg font-bold"
                  placeholder="e.g. 1000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-accent text-white hover:bg-accent/90 h-14 rounded-2xl text-xl font-bold shadow-xl shadow-accent/20 transition-all active:scale-95" disabled={isPaying}>
                {isPaying ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : "Initiate Payment"}
              </Button>
              <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground">
                <ShieldCheck className="h-3 w-3" /> Secure M-Pesa Express Payment
              </div>
            </form>
          ) : (
            <div className="py-10 text-center space-y-6 bg-green-50/50 rounded-3xl border border-green-100 animate-in fade-in zoom-in duration-300">
              <div className="bg-white p-4 rounded-full w-fit mx-auto shadow-sm">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-green-800 font-headline">Push Notification Sent!</h3>
                <p className="text-sm text-green-700 max-w-[280px] mx-auto leading-relaxed">
                  A payment prompt has been sent to <strong>{phoneNumber}</strong>. Please enter your PIN to confirm your contribution to {chama.name}.
                </p>
              </div>
              <Button variant="outline" onClick={() => setIsSuccess(false)} className="border-green-200 text-green-700 hover:bg-green-100 rounded-xl px-8">
                Make Another Contribution
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <footer className="mt-12 text-center text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
        © 2026 ChamaSmart Infrastructure • Level 1 PCI-DSS Secure
      </footer>
    </div>
  );
}