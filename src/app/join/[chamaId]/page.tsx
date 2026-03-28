'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useFirestore, useUser, useDoc, useMemoFirebase, initiateAnonymousSignIn } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Coins, Loader2, Smartphone, CheckCircle2 } from 'lucide-react';
import { initiateStkPush } from '@/lib/mpesa-service';
import { useToast } from '@/hooks/use-toast';

export default function JoinChamaPage() {
  const { chamaId } = useParams();
  const { user, isUserLoading, auth } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [isPaying, setIsPaying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Memoize document reference
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
    if (!chama) return;

    setIsPaying(true);
    try {
      const result = await initiateStkPush(phoneNumber, Number(amount), chama.name);
      if (result.success) {
        toast({
          title: "STK Push Sent",
          description: result.message,
        });
        setIsSuccess(true);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Payment Error",
        description: "Could not initiate STK push. Please try again.",
      });
    } finally {
      setIsPaying(false);
    }
  };

  if (isChamaLoading || isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!chama) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4 text-center">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold font-headline">Chama Not Found</h1>
          <p className="text-muted-foreground">The invite link might be invalid or expired.</p>
          <Button asChild variant="outline">
            <a href="/">Go Home</a>
          </Button>
        </div>
      </div>
    );
  }

  const progress = (chama.currentBalance / chama.goalAmount) * 100;

  return (
    <div className="min-h-screen bg-background p-4 flex flex-col items-center justify-center">
      <div className="flex items-center mb-8">
        <Coins className="h-8 w-8 text-primary mr-2" />
        <span className="font-headline font-bold text-2xl tracking-tight text-primary">ChamaSmart</span>
      </div>

      <Card className="w-full max-w-lg border-none shadow-2xl overflow-hidden">
        <div className="bg-primary h-2 w-full" />
        <CardHeader>
          <div className="flex justify-between items-start mb-2">
            <Badge variant="secondary" className="bg-primary/10 text-primary border-none">
              Group Contribution
            </Badge>
            <span className="text-xs text-muted-foreground">Deadline: {new Date(chama.goalDate).toLocaleDateString()}</span>
          </div>
          <CardTitle className="text-2xl font-bold font-headline">{chama.name}</CardTitle>
          <CardDescription>{chama.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-bold">
              <span>Goal: KES {chama.goalAmount.toLocaleString()}</span>
              <span>{progress.toFixed(0)}% Complete</span>
            </div>
            <Progress value={progress} className="h-3 bg-primary/10" />
            <p className="text-xs text-muted-foreground text-center">
              KES {chama.currentBalance.toLocaleString()} raised so far!
            </p>
          </div>

          {!isSuccess ? (
            <form onSubmit={handleContribute} className="space-y-4 pt-4 border-t">
              <div className="space-y-2">
                <label className="text-sm font-medium">Your M-Pesa Number</label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-10"
                    placeholder="2547XXXXXXXX"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Contribution Amount (KES)</label>
                <Input
                  type="number"
                  placeholder="500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-accent text-white hover:bg-accent/90 h-12 text-lg font-bold" disabled={isPaying}>
                {isPaying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Contribute Now"}
              </Button>
              <p className="text-[10px] text-center text-muted-foreground italic">
                By clicking contribute, you will receive an STK Push on your phone to enter your PIN.
              </p>
            </form>
          ) : (
            <div className="py-8 text-center space-y-4 bg-green-50 rounded-xl border border-green-100">
              <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto" />
              <h3 className="text-xl font-bold text-green-800">Request Sent!</h3>
              <p className="text-sm text-green-700 max-w-[250px] mx-auto">
                Please check your phone and enter your M-Pesa PIN to complete the contribution.
              </p>
              <Button variant="outline" onClick={() => setIsSuccess(false)} className="border-green-200 text-green-700 hover:bg-green-100">
                Make another contribution
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <footer className="mt-8 text-center text-xs text-muted-foreground">
        © 2026 ChamaSmart. Secure payments via M-Pesa.
      </footer>
    </div>
  );
}
