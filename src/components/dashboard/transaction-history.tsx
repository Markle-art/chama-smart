import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RECENT_TRANSACTIONS, CHAMA_MEMBERS } from '@/lib/mock-data';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface TransactionHistoryProps {
  chamaId: string;
}

export function TransactionHistory({ chamaId }: TransactionHistoryProps) {
  return (
    <Card className="col-span-1 border-none shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-headline">Recent M-Pesa Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {RECENT_TRANSACTIONS.map((tx) => {
            const member = CHAMA_MEMBERS.find(m => m.id === tx.memberId);
            return (
              <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg border bg-white/50">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${tx.status === 'reconciled' ? 'bg-green-100' : 'bg-orange-100'}`}>
                    {tx.status === 'reconciled' ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <AlertCircle className="h-4 w-4 text-orange-600" />}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm">KES {tx.TransAmount}</span>
                    <span className="text-xs text-muted-foreground">{tx.TransID} • {new Date(tx.date).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="text-right">
                  {tx.status === 'reconciled' ? (
                    <Badge variant="outline" className="text-[10px] font-bold border-green-200 text-green-700 bg-green-50">
                      MATCHED: {member?.name.split(' ')[0]}
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="text-[10px] font-bold bg-accent text-white">
                      NEEDS REVIEW
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
