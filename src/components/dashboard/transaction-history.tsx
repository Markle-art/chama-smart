'use client';

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, Loader2, Banknote } from 'lucide-react';

interface TransactionHistoryProps {
  chamaId: string;
}

export function TransactionHistory({ chamaId }: TransactionHistoryProps) {
  const db = useFirestore();

  const txQuery = useMemoFirebase(() => {
    if (!db || !chamaId) return null;
    return query(
      collection(db, 'chamas', chamaId, 'transactions'),
      orderBy('transactionTime', 'desc'),
      limit(10)
    );
  }, [db, chamaId]);

  const { data: transactions, isLoading } = useCollection(txQuery);

  return (
    <Card className="col-span-1 border-none shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-headline flex items-center gap-2">
          <Banknote className="h-5 w-5 text-primary" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary/30" />
          </div>
        ) : transactions && transactions.length > 0 ? (
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4 rounded-2xl border border-muted/60 bg-white hover:border-primary/20 transition-all hover:shadow-sm">
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-xl ${tx.status === 'Reconciled' ? 'bg-green-100' : 'bg-orange-100'}`}>
                    {tx.status === 'Reconciled' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-orange-600" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm tracking-tight text-foreground">
                      KES {Number(tx.transAmount).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wide">
                      {tx.mPesaTransId} • {new Date(tx.transactionTime).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  {tx.status === 'Reconciled' ? (
                    <Badge variant="outline" className="text-[9px] px-2 py-0.5 font-bold border-green-200 text-green-700 bg-green-50 uppercase">
                      Matched: {tx.firstName}
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="text-[9px] px-2 py-0.5 font-bold bg-accent text-white uppercase border-none">
                      Needs Review
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 border-2 border-dashed rounded-2xl">
            <AlertCircle className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground italic">Waiting for first M-Pesa push...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}