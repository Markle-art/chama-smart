'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useFirestore, useUser, useDoc, useMemoFirebase, initiateAnonymousSignIn, setDocumentNonBlocking } from '@/firebase';
import { doc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Coins, Loader2, Smartphone, CheckCircle2,
  ArrowLeft, ShieldCheck, RefreshCcw, BellOff
} from 'lucide-react';
import { initiateStkPush, registerRatiba } from '@/lib/mpesa-service';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

// ── Which screen are we on? ───────────────────────────────────────────────────
type Stage =
  | 'form'          // member enters phone + amount
  | 'stk_sent'      // STK push sent, waiting for PIN
  | 'ratiba_prompt' // ask: automate future payments?
  | 'ratiba_done'   // standing order confirmed
  | 'nudge_opted'   // they chose AI reminders instead

export default function JoinChamaPage() {
  const { chamaId } = useParams();
  const { user, isUserLoading, auth } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [stage, setStage] = useState<Stage>('form');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [isPaying, setIsPaying] = useState(false);
  const [isSettingRatiba, setIsSettingRatiba] = useState(false);

  // We store these after STK push succeeds so Ratiba can use them
  const [lastCheckoutId, setLastCheckoutId] = useState('');
  const [savedMemberId, setSavedMemberId] = useState('');

  const chamaRef = useMemoFirebase(() => {
    if (!db || !chamaId) return null;
    return doc(db, 'chamas', chamaId as string);
  }, [db, chamaId]);

  const { data: chama, isLoading: isChamaLoading } = useDoc(chamaRef);

  // Sign in anonymously so Firestore rules allow the member to write
  useEffect(() => {
    if (!isUserLoading && !user && auth) {
      initiateAnonymousSignIn(auth);
    }
  }, [user, isUserLoading, auth]);

  // ── Next month's date — used as Ratiba start date ─────────────────────────
  function getNextMonthDate(): string {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().split('T')[0]; // YYYY-MM-DD
  }

  // ── STEP 1: Trigger STK Push ──────────────────────────────────────────────
  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chama || !db) return;

    setIsPaying(true);
    try {
      const result = await initiateStkPush(
        phoneNumber,
        Number(amount),
        chama.name,
        chama.id,
      );

      if (!result.success) {
        toast({
          variant: 'destructive',
          title: 'Payment Error',
          description: result.error ?? 'Could not initiate payment.',
        });
        return;
      }

      setLastCheckoutId(result.checkoutRequestId ?? '');

      // ── Write pending transaction to Firestore ──────────────────────
      const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const txRef = doc(db, 'chamas', chama.id, 'transactions', transactionId);

      setDocumentNonBlocking(txRef, {
        id: transactionId,
        checkoutRequestId: result.checkoutRequestId,
        merchantRequestId: result.merchantRequestId,
        msisdn: phoneNumber,
        transAmount: Number(amount),
        status: 'Pending Reconciliation',
        needsReview: false,
        matchedMemberId: null,
        reconciledChamaId: chama.id,
        adminUserId: chama.adminUserId,
        receivedAt: new Date().toISOString(),
      }, { merge: true });

      // ── Write lookup record so callback can find this transaction ───
      // The callback only knows CheckoutRequestID — this maps it to chamaId
      if (db) {
        addDoc(collection(db, 'pending_checkouts'), {
          checkoutRequestId: result.checkoutRequestId,
          chamaId: chama.id,
          transactionDocId: transactionId,
          phone: phoneNumber,
          createdAt: serverTimestamp(),
        }).catch(console.error);
      }

      // ── Create/update member record using phone as key ──────────────
      const memberDocId = `member_${phoneNumber.replace(/\D/g, '')}`;
      const memberRef = doc(db, 'chamas', chama.id, 'members', memberDocId);

      setDocumentNonBlocking(memberRef, {
        id: memberDocId,
        phone: phoneNumber,
        chamaId: chama.id,
        adminUserId: chama.adminUserId,
        ratibaEnabled: false,
        joinedAt: new Date().toISOString(),
      }, { merge: true });

      setSavedMemberId(memberDocId);

      toast({
        title: '📱 STK Push Sent!',
        description: 'Check your phone and enter your M-Pesa PIN.',
      });

      // Move to next stage — show PIN confirmation screen
      setStage('stk_sent');

    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Payment Error',
        description: 'Something went wrong. Please try again.',
      });
      console.error('[JoinPage] Contribute error:', error);
    } finally {
      setIsPaying(false);
    }
  };

  // ── STEP 2A: Member confirms PIN was entered → ask about Ratiba ───────────
  const handlePinConfirmed = () => {
    setStage('ratiba_prompt');
  };

  // ── STEP 2B: Member wants Ratiba (auto-pay every month) ──────────────────
  const handleSetupRatiba = async () => {
    if (!chama || !savedMemberId) return;
    setIsSettingRatiba(true);

    try {
      const result = await registerRatiba(
        phoneNumber,
        Number(amount),
        chama.id,
        chama.name,
        savedMemberId,
        getNextMonthDate(),
      );

      if (!result.success) {
        toast({
          variant: 'destructive',
          title: 'Standing Order Error',
          description: result.error ?? 'Could not set up auto-pay.',
        });
        return;
      }

      toast({
        title: '🔄 Auto-Pay Activated!',
        description: `KES ${amount} will be sent automatically every month.`,
      });

      setStage('ratiba_done');
    } catch (err) {
      console.error('[JoinPage] Ratiba error:', err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not set up standing order. Try again.',
      });
    } finally {
      setIsSettingRatiba(false);
    }
  };

  // ── STEP 2C: Member declines Ratiba → AI nudge reminders take over ────────
  const handleDeclineRatiba = () => {
    // The AI scheduled function will remind them 2 days before next deadline.
    // Member record already exists in Firestore with ratibaEnabled: false.
    setStage('nudge_opted');
  };

  // ── LOADING ───────────────────────────────────────────────────────────────
  if (isChamaLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // ── INVALID LINK ──────────────────────────────────────────────────────────
  if (!chama) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center space-y-6">
        <div className="bg-destructive/10 p-6 rounded-full">
          <ShieldCheck className="h-12 w-12 text-destructive" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold font-headline">Link Expired or Invalid</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            This savings group invitation is no longer active. Please contact your treasurer.
          </p>
        </div>
        <Button asChild className="bg-primary text-white px-8 h-12 rounded-full shadow-lg">
          <Link href="/"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Home</Link>
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

        {/* ── Chama Header — always visible ── */}
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <Badge variant="secondary" className="bg-primary/10 text-primary border-none px-4 py-1">
              Active Savings Goal
            </Badge>
          </div>
          <CardTitle className="text-3xl font-bold font-headline text-foreground">
            {chama.name}
          </CardTitle>
          <CardDescription className="text-base mt-2">{chama.description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-8 pt-4 px-8">
          {/* ── Progress Bar ── */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <span className="text-sm font-medium text-muted-foreground">Raised So Far</span>
                <div className="text-2xl font-bold text-primary">
                  KES {chama.currentBalance?.toLocaleString()}
                </div>
              </div>
              <div className="text-right space-y-1">
                <span className="text-sm font-medium text-muted-foreground">Target Goal</span>
                <div className="text-xl font-bold">KES {chama.goalAmount?.toLocaleString()}</div>
              </div>
            </div>
            <Progress value={progress} className="h-4 bg-primary/10 rounded-full" />
            <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <span>{progress.toFixed(1)}% Reached</span>
              <span>Deadline: {new Date(chama.goalDate).toLocaleDateString()}</span>
            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════
              STAGE: form — enter phone + amount
          ════════════════════════════════════════════════════════════ */}
          {stage === 'form' && (
            <form onSubmit={handleContribute} className="space-y-5 pt-6 border-t border-dashed">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">M-Pesa Number</label>
                <div className="relative">
                  <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    className="pl-12 h-14 bg-muted/30 border-none rounded-2xl focus-visible:ring-primary"
                    placeholder="07XXXXXXXX or 2547XXXXXXXX"
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
                  min="1"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-accent text-white hover:bg-accent/90 h-14 rounded-2xl text-xl font-bold shadow-xl shadow-accent/20 transition-all active:scale-95"
                disabled={isPaying}
              >
                {isPaying
                  ? <><Loader2 className="mr-2 h-6 w-6 animate-spin" /> Sending...</>
                  : 'Contribute via M-Pesa'}
              </Button>
              <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground">
                <ShieldCheck className="h-3 w-3" /> Secure M-Pesa Express Payment
              </div>
            </form>
          )}

          {/* ════════════════════════════════════════════════════════════
              STAGE: stk_sent — waiting for PIN confirmation
          ════════════════════════════════════════════════════════════ */}
          {stage === 'stk_sent' && (
            <div className="py-8 text-center space-y-6 border-t border-dashed">
              <div className="bg-primary/10 p-5 rounded-full w-fit mx-auto">
                <Smartphone className="h-12 w-12 text-primary animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold font-headline">Check Your Phone!</h3>
                <p className="text-sm text-muted-foreground max-w-[280px] mx-auto leading-relaxed">
                  A payment prompt has been sent to <strong>{phoneNumber}</strong>.
                  Enter your M-Pesa PIN to confirm <strong>KES {Number(amount).toLocaleString()}</strong> to {chama.name}.
                </p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-left space-y-1">
                <p className="text-xs font-bold text-amber-800">👆 Once you've entered your PIN:</p>
                <p className="text-xs text-amber-700">Tap the button below to continue setting up your contribution preferences.</p>
              </div>
              <Button
                onClick={handlePinConfirmed}
                className="w-full bg-green-600 hover:bg-green-700 text-white h-12 rounded-2xl font-bold"
              >
                <CheckCircle2 className="mr-2 h-5 w-5" /> I've Entered My PIN
              </Button>
              <button
                onClick={() => setStage('form')}
                className="text-xs text-muted-foreground underline underline-offset-2"
              >
                Go back and try again
              </button>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════
              STAGE: ratiba_prompt — offer standing order
          ════════════════════════════════════════════════════════════ */}
          {stage === 'ratiba_prompt' && (
            <div className="py-6 space-y-6 border-t border-dashed">
              <div className="text-center space-y-2">
                <div className="bg-green-100 p-4 rounded-full w-fit mx-auto">
                  <CheckCircle2 className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-xl font-bold font-headline">Payment Initiated! 🎉</h3>
                <p className="text-sm text-muted-foreground">
                  Your <strong>KES {Number(amount).toLocaleString()}</strong> contribution is being processed.
                </p>
              </div>

              {/* Ratiba offer */}
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <RefreshCcw className="h-5 w-5 text-primary" />
                  <span className="font-bold text-foreground">Make this automatic?</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Set up <strong>M-Pesa Ratiba</strong> and KES {Number(amount).toLocaleString()} will be
                  automatically sent to <strong>{chama.name}</strong> every month on this date.
                  No more reminders, no more manual payments.
                </p>
                <div className="text-xs text-primary/70 font-medium">
                  Next deduction: {new Date(getNextMonthDate()).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleSetupRatiba}
                  className="w-full bg-primary text-white hover:bg-primary/90 h-12 rounded-2xl font-bold"
                  disabled={isSettingRatiba}
                >
                  {isSettingRatiba
                    ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Setting up...</>
                    : <><RefreshCcw className="mr-2 h-5 w-5" /> Yes, automate my monthly payments</>}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDeclineRatiba}
                  className="w-full h-12 rounded-2xl text-muted-foreground border-dashed"
                  disabled={isSettingRatiba}
                >
                  <BellOff className="mr-2 h-4 w-4" /> No thanks, remind me manually
                </Button>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════
              STAGE: ratiba_done — standing order confirmed
          ════════════════════════════════════════════════════════════ */}
          {stage === 'ratiba_done' && (
            <div className="py-10 text-center space-y-6 bg-green-50/50 rounded-3xl border border-green-100 animate-in fade-in zoom-in duration-300">
              <div className="bg-white p-4 rounded-full w-fit mx-auto shadow-sm">
                <RefreshCcw className="h-12 w-12 text-green-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-green-800 font-headline">
                  Auto-Pay Activated! 🔄
                </h3>
                <p className="text-sm text-green-700 max-w-[280px] mx-auto leading-relaxed">
                  M-Pesa Ratiba is set up. <strong>KES {Number(amount).toLocaleString()}</strong> will
                  be automatically sent to <strong>{chama.name}</strong> every month. You're all set!
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setStage('form')}
                className="border-green-200 text-green-700 hover:bg-green-100 rounded-xl px-8"
              >
                Make Another Contribution
              </Button>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════
              STAGE: nudge_opted — AI reminders will handle it
          ════════════════════════════════════════════════════════════ */}
          {stage === 'nudge_opted' && (
            <div className="py-10 text-center space-y-6 bg-blue-50/50 rounded-3xl border border-blue-100 animate-in fade-in zoom-in duration-300">
              <div className="bg-white p-4 rounded-full w-fit mx-auto shadow-sm">
                <CheckCircle2 className="h-12 w-12 text-blue-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-blue-800 font-headline">
                  You're all set! ✅
                </h3>
                <p className="text-sm text-blue-700 max-w-[280px] mx-auto leading-relaxed">
                  Our AI will send you a reminder to <strong>{phoneNumber}</strong> a couple of days
                  before each contribution is due — with a direct payment link included.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setStage('form')}
                className="border-blue-200 text-blue-700 hover:bg-blue-100 rounded-xl px-8"
              >
                Make Another Contribution
              </Button>
            </div>
          )}

        </CardContent>
      </Card>

      <footer className="mt-12 text-center text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
        © 2026 ChamaSmart Infrastructure • Secured by M-Pesa
      </footer>
    </div>
  );
}
