'use client';

import { useMemo } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, Users } from 'lucide-react';

interface MemberContributionsProps {
  chamaId: string;
}

export function MemberContributions({ chamaId }: MemberContributionsProps) {
  const db = useFirestore();

  const membersQuery = useMemoFirebase(() => {
    if (!db || !chamaId) return null;
    return query(
      collection(db, 'chamas', chamaId, 'members'),
      orderBy('totalContributed', 'desc')
    );
  }, [db, chamaId]);

  const { data: members, isLoading } = useCollection(membersQuery);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="col-span-1 border-none shadow-sm overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-headline flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Group Members
        </CardTitle>
        <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-1 rounded">
          {members?.length || 0} Total
        </span>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
            <p className="text-xs text-muted-foreground">Fetching member list...</p>
          </div>
        ) : members && members.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="w-[200px] text-[10px] uppercase font-bold tracking-wider">Member</TableHead>
                <TableHead className="text-[10px] uppercase font-bold tracking-wider">M-Pesa Phone</TableHead>
                <TableHead className="text-right text-[10px] uppercase font-bold tracking-wider">Contributed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id} className="group border-b border-muted/50">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 bg-primary/5 text-primary border border-primary/10">
                        <AvatarFallback className="font-bold">
                          {member.firstName?.[0]}{member.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold group-hover:text-primary transition-colors">
                          {member.firstName} {member.lastName}
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase font-medium">
                          {member.nicknames?.[0] || 'Member'}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm font-mono">{member.phoneNumber}</TableCell>
                  <TableCell className="text-right">
                    <span className="inline-block px-3 py-1 rounded-full bg-primary/5 font-bold text-primary">
                      {formatCurrency(member.totalContributed || 0)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-12 space-y-3 bg-muted/20 rounded-xl border border-dashed">
            <Users className="h-8 w-8 text-muted-foreground/30 mx-auto" />
            <p className="text-sm text-muted-foreground italic">No members found yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}