import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CHAMA_MEMBERS } from '@/lib/mock-data';

interface MemberContributionsProps {
  chamaId: string;
}

export function MemberContributions({ chamaId }: MemberContributionsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // In a real implementation, we would fetch members based on chamaId
  // For now, we use the mock data as a placeholder
  return (
    <Card className="col-span-1 border-none shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-headline">Member Contributions</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Member</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead className="text-right">Total Contributed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {CHAMA_MEMBERS.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 bg-primary/10 text-primary">
                      <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span>{member.name}</span>
                      <span className="text-[10px] text-muted-foreground uppercase">{member.nicknames[0]}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{member.phone}</TableCell>
                <TableCell className="text-right font-bold">{formatCurrency(member.totalContributed)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
