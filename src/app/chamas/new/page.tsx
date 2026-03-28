'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFirestore, useUser, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Coins, Loader2, ArrowLeft, Target, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function NewChamaPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    goalAmount: '',
    goalDate: '',
  });

  // Redirect if not logged in - moved to useEffect to avoid render-phase navigation
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Generate a unique ID for the Chama
    const chamaId = Math.random().toString(36).substring(7);
    
    const chamaData = {
      id: chamaId,
      name: formData.name,
      description: formData.description,
      goalAmount: Number(formData.goalAmount),
      goalDate: new Date(formData.goalDate).toISOString(),
      adminUserId: user.uid,
      currentBalance: 0,
      status: 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      predictionStatus: 'OnTrack',
      predictionDetails: 'Waiting for first contributions to analyze patterns.',
    };

    // Use setDocumentNonBlocking with the specific ID to satisfy security rules
    // (isValidId rule expects document path ID to match request.resource.data.id)
    const docRef = doc(db, 'chamas', chamaId);
    setDocumentNonBlocking(docRef, chamaData, { merge: true });
    
    // Optimistic redirect
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background p-4 lg:p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <Link href="/dashboard" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Link>

        <div className="flex items-center">
          <Coins className="h-8 w-8 text-primary mr-3" />
          <h1 className="text-3xl font-bold font-headline">Setup New Chama</h1>
        </div>

        <Card className="border-none shadow-xl">
          <CardHeader>
            <CardTitle>Group Details</CardTitle>
            <CardDescription>Define your savings goal and invite your friends.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Chama Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Year 3 Trip Savings"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="What is this fund for?"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="goalAmount">Goal Amount (KES)</Label>
                  <div className="relative">
                    <Target className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="goalAmount"
                      type="number"
                      className="pl-10"
                      placeholder="100000"
                      value={formData.goalAmount}
                      onChange={(e) => setFormData({ ...formData, goalAmount: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="goalDate">Target Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="goalDate"
                      type="date"
                      className="pl-10"
                      value={formData.goalDate}
                      onChange={(e) => setFormData({ ...formData, goalDate: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full bg-primary text-white h-12" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Chama & Generate Invite Link"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
