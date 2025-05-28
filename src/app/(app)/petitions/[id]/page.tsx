"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Petition, ProposedOutcome, User } from '@/lib/types';
import { mockPetitions } from '@/lib/mock-data'; // Using mock data
import { useAuth } from '@/providers/auth-provider';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { PetitionStatusBadge } from '@/components/petitions/petition-status-badge';
import { BarChartBig, CalendarDays, Edit, MessageSquare, PenLine, Tag, ThumbsDown, ThumbsUp, Trash2, User as UserIcon, Users, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { useToast } from '@/hooks/use-toast';
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
} from "@/components/ui/alert-dialog"
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';


const chartData = [ // Mock data for signatures per hour
  { time: "10:00", signatures: Math.floor(Math.random() * 20) + 5 },
  { time: "11:00", signatures: Math.floor(Math.random() * 20) + 10 },
  { time: "12:00", signatures: Math.floor(Math.random() * 30) + 15 },
  { time: "13:00", signatures: Math.floor(Math.random() * 25) + 10 },
  { time: "14:00", signatures: Math.floor(Math.random() * 20) + 5 },
  { time: "15:00", signatures: Math.floor(Math.random() * 15) + 8 },
];

const chartConfig = {
  signatures: {
    label: "Signatures",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

// Mock proposed outcomes
const mockOutcomes: ProposedOutcome[] = [
    { id: 'o1', petitionId: 'p1', description: "Implement a 5-year moratorium on development in adjacent forest areas.", proposedByUserId: 'user2', proposedByUserName: 'Bob The Builder', votesFor: 150, votesAgainst: 20, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString() },
    { id: 'o2', petitionId: 'p1', description: "Allocate 1% of city budget to forest maintenance and ranger programs.", proposedByUserId: 'user1', proposedByUserName: 'Alice Wonderland', votesFor: 90, votesAgainst: 45, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString() },
];


export default function PetitionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [petition, setPetition] = useState<Petition | null>(null);
  const [outcomes, setOutcomes] = useState<ProposedOutcome[]>(mockOutcomes.filter(o => o.petitionId === params.id)); // Filter for current petition
  const [newOutcomeDescription, setNewOutcomeDescription] = useState('');
  const [isSigning, setIsSigning] = useState(false);
  const [isProposing, setIsProposing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false); // Mock state

  useEffect(() => {
    const foundPetition = mockPetitions.find(p => p.id === params.id);
    if (foundPetition) {
      setPetition(foundPetition);
      // Mock if user has signed this petition (check local storage or similar)
      const signedStatus = localStorage.getItem(`signed_${foundPetition.id}_${user?.id}`);
      setHasSigned(!!signedStatus);
    } else {
      // Handle petition not found, e.g., redirect or show error
      toast({ title: "Petition not found", variant: "destructive" });
      router.push('/dashboard');
    }
  }, [params.id, user, router, toast]);

  const handleSignPetition = async () => {
    if (!isAuthenticated || !user || !petition) {
      toast({ title: "Please log in to sign.", variant: "destructive" });
      return;
    }
    if (hasSigned) {
      toast({ title: "Already Signed", description: "You have already signed this petition.", variant: "default" });
      return;
    }
    setIsSigning(true);
    // Simulate signing process
    await new Promise(resolve => setTimeout(resolve, 1500));
    setPetition(prev => prev ? { ...prev, signatures: prev.signatures + 1 } : null);
    setHasSigned(true);
    localStorage.setItem(`signed_${petition.id}_${user.id}`, 'true');
    toast({ title: "Petition Signed!", description: "Thank you for your support." });
    setIsSigning(false);
  };

  const handleProposeOutcome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !user || !petition) {
      toast({ title: "Error", description: "Authentication or petition data missing.", variant: "destructive" });
      return;
    }
    if (newOutcomeDescription.trim().length < 10) {
      toast({ title: "Too Short", description: "Outcome description must be at least 10 characters.", variant: "destructive" });
      return;
    }
    setIsProposing(true);
    const newOutcome: ProposedOutcome = {
      id: `o_${Date.now()}`,
      petitionId: petition.id,
      description: newOutcomeDescription.trim(),
      proposedByUserId: user.id,
      proposedByUserName: user.name,
      votesFor: 0,
      votesAgainst: 0,
      createdAt: new Date().toISOString(),
    };
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setOutcomes(prev => [...prev, newOutcome]);
    setNewOutcomeDescription('');
    toast({ title: "Outcome Proposed!", description: "Your proposed outcome has been added." });
    setIsProposing(false);
  };
  
  const handleVote = async (outcomeId: string, voteType: 'for' | 'against') => {
    if (!isAuthenticated || !user) {
       toast({ title: "Please log in to vote.", variant: "destructive" });
       return;
    }
    // Mock voting: check if user already voted on this outcome
    const voteKey = `voted_${outcomeId}_${user.id}`;
    if (localStorage.getItem(voteKey)) {
        toast({ title: "Already Voted", description: "You have already voted on this outcome.", variant: "default" });
        return;
    }

    setOutcomes(prevOutcomes => prevOutcomes.map(o => {
        if (o.id === outcomeId) {
            return { ...o, votesFor: o.votesFor + (voteType === 'for' ? 1 : 0), votesAgainst: o.votesAgainst + (voteType === 'against' ? 1 : 0) };
        }
        return o;
    }));
    localStorage.setItem(voteKey, voteType); // Mark as voted
    toast({ title: "Vote Cast!", description: `You voted ${voteType} the outcome.` });
  };


  if (!petition) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  }
  
  const isCreator = user?.id === petition.creatorId;

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Petition Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-lg">
            {petition.imageUrl && (
              <div className="relative w-full h-64 md:h-96 rounded-t-lg overflow-hidden">
                <Image src={petition.imageUrl} alt={petition.title} layout="fill" objectFit="cover" data-ai-hint={`${petition.category} event`} />
              </div>
            )}
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                <PetitionStatusBadge status={petition.status} className="text-sm px-3 py-1.5" />
                <div className="flex items-center text-sm text-muted-foreground gap-4">
                    <span className="flex items-center"><Tag className="h-4 w-4 mr-1.5" /> <span className="capitalize">{petition.category}</span></span>
                    <span className="flex items-center"><Users className="h-4 w-4 mr-1.5" /> {petition.signatures.toLocaleString()} signatures</span>
                </div>
              </div>
              <CardTitle className="text-3xl md:text-4xl font-bold text-foreground">{petition.title}</CardTitle>
              <div className="text-sm text-muted-foreground pt-1">
                By <span className="font-medium text-primary">{petition.creatorName}</span> &bull; Created {formatDistanceToNow(new Date(petition.createdAt), { addSuffix: true })}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-base md:text-lg text-foreground/90 whitespace-pre-wrap leading-relaxed">{petition.description}</p>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-4 items-center">
              <Button 
                size="lg" 
                className="w-full sm:w-auto flex-grow" 
                onClick={handleSignPetition} 
                disabled={isSigning || petition.status !== 'Live' || hasSigned}
              >
                {isSigning ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <PenLine className="mr-2 h-5 w-5" />}
                {hasSigned ? "You've Signed" : (petition.status !== 'Live' ? `Cannot Sign (${petition.status})` : "Sign with Wallet")}
              </Button>
              {isCreator && (
                <Button variant="outline" size="lg" className="w-full sm:w-auto" onClick={() => alert("Edit functionality not implemented.")}>
                  <Edit className="mr-2 h-5 w-5" /> Edit Petition
                </Button>
              )}
            </CardFooter>
          </Card>

          {/* Proposed Outcomes & Voting Section */}
          { (petition.status === 'Voting' || petition.status === 'Live' || outcomes.length > 0) && (
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>Proposed Outcomes & Community Voting</CardTitle>
                    <CardDescription>
                        {petition.status === 'Voting' ? "Vote on the proposed outcomes to decide the next steps." : 
                         petition.status === 'Live' ? "Outcomes can be proposed. Voting will begin once the petition status changes to 'Voting'." :
                         "Review proposed outcomes for this petition."}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {outcomes.map(outcome => (
                        <Card key={outcome.id} className="bg-muted/30">
                            <CardContent className="p-4 space-y-2">
                                <p className="text-foreground/90">{outcome.description}</p>
                                <p className="text-xs text-muted-foreground">Proposed by {outcome.proposedByUserName} &bull; {formatDistanceToNow(new Date(outcome.createdAt), { addSuffix: true })}</p>
                                <div className="flex items-center justify-between pt-2">
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => handleVote(outcome.id, 'for')} disabled={petition.status !== 'Voting'}>
                                            <ThumbsUp className="h-4 w-4 mr-1.5 text-green-500" /> For ({outcome.votesFor})
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => handleVote(outcome.id, 'against')} disabled={petition.status !== 'Voting'}>
                                            <ThumbsDown className="h-4 w-4 mr-1.5 text-red-500" /> Against ({outcome.votesAgainst})
                                        </Button>
                                    </div>
                                    {isCreator && user?.id === outcome.proposedByUserId && petition.status !== 'Voting' && (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="icon" className="h-8 w-8"><Trash2 className="h-4 w-4" /></Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader><AlertDialogTitle>Delete Outcome?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => alert('Delete outcome not implemented')}>Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {outcomes.length === 0 && <p className="text-muted-foreground">No outcomes proposed yet.</p>}
                </CardContent>
                { (petition.status === 'Live' || petition.status === 'Voting') && isCreator && ( // Only creator can propose if live or voting
                    <CardFooter className="border-t pt-6">
                        <form onSubmit={handleProposeOutcome} className="w-full space-y-3">
                            <Label htmlFor="new-outcome" className="font-semibold">Propose a New Outcome</Label>
                            <Textarea 
                                id="new-outcome"
                                placeholder="Describe the specific action or result you propose..."
                                value={newOutcomeDescription}
                                onChange={(e) => setNewOutcomeDescription(e.target.value)}
                                rows={3}
                            />
                            <Button type="submit" disabled={isProposing} className="w-full sm:w-auto">
                                {isProposing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Propose Outcome
                            </Button>
                        </form>
                    </CardFooter>
                )}
            </Card>
          )}

        </div>

        {/* Sidebar: Analytics & Creator Tools */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center"><BarChartBig className="mr-2 h-5 w-5 text-primary" /> Petition Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <p><strong>Total Signatures:</strong> {petition.signatures.toLocaleString()}</p>
                <p><strong>Signatures (Last Hour):</strong> {petition.signaturesLastHour?.toLocaleString() || 'N/A'}</p>
                <p><strong>Category:</strong> <span className="capitalize">{petition.category}</span></p>
                <p><strong>Status:</strong> <PetitionStatusBadge status={petition.status} /></p>
                <p><strong>Created:</strong> {format(new Date(petition.createdAt), "MMMM d, yyyy")}</p>
                <p><strong>Last Updated:</strong> {format(new Date(petition.updatedAt), "MMMM d, yyyy")}</p>
              </div>
              <Separator className="my-4" />
              <h4 className="font-semibold mb-2 text-muted-foreground">Signatures per Hour (Mock Data)</h4>
              <ChartContainer config={chartConfig} className="aspect-video h-[200px] w-full">
                <BarChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="time" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="signatures" fill="var(--color-signatures)" radius={4} />
                </BarChart>
              </ChartContainer>
               <Separator className="my-4" />
               <h4 className="font-semibold mb-2 text-muted-foreground">Geographic Breakdown (Mock)</h4>
               {petition.geoBreakdown ? (
                <ul className="text-sm space-y-1">
                    {Object.entries(petition.geoBreakdown).map(([loc, count]) => (
                        <li key={loc} className="flex justify-between"><span>{loc}:</span> <span>{count.toLocaleString()}</span></li>
                    ))}
                </ul>
               ) : <p className="text-sm text-muted-foreground">Not available.</p>}
            </CardContent>
          </Card>

          {isCreator && (
            <Card className="shadow-md">
              <CardHeader><CardTitle>Creator Tools</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" onClick={() => alert("Manage Status functionality not implemented.")}>
                    <Edit className="mr-2 h-4 w-4" /> Manage Status
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full justify-start">
                      <Trash2 className="mr-2 h-4 w-4" /> Delete Petition
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the petition
                        and all related data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => {
                          toast({ title: "Petition Deletion (Simulated)", description: "This petition would be deleted."});
                          router.push('/dashboard');
                        }}
                      >
                        Yes, delete petition
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
