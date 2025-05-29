
"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Petition, ProposedOutcome } from '@/lib/types';
import { useAuth } from '@/providers/auth-provider';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { PetitionStatusBadge } from '@/components/petitions/petition-status-badge';
import { BarChartBig, CalendarDays, Edit, MessageSquare, PenLine, Tag, ThumbsDown, ThumbsUp, Trash2, User as UserIcon, Users, CheckCircle, XCircle, Loader2, FileSignature, Hash } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
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

const chartData: any[] = []; 

const chartConfig = {
  signatures: {
    label: "Signatures",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

const mockOutcomes: ProposedOutcome[] = [];

const PETITIONS_STORAGE_KEY = 'decentralizeit-petitions';

export default function PetitionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [petition, setPetition] = useState<Petition | null>(null);
  const [outcomes, setOutcomes] = useState<ProposedOutcome[]>([]);
  const [newOutcomeDescription, setNewOutcomeDescription] = useState('');
  const [isSigning, setIsSigning] = useState(false);
  const [isProposing, setIsProposing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false); 
  const [isLoading, setIsLoading] = useState(true);
  const [mockTxId, setMockTxId] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    const petitionId = params.id as string;
    if (!petitionId) {
        toast({ title: "Error", description: "Petition ID missing.", variant: "destructive" });
        router.push('/dashboard');
        setIsLoading(false);
        return;
    }

    const storedPetitionsJSON = localStorage.getItem(PETITIONS_STORAGE_KEY);
    let foundPetition: Petition | undefined = undefined;
    if (storedPetitionsJSON) {
      try {
        const allPetitions: Petition[] = JSON.parse(storedPetitionsJSON);
        if (Array.isArray(allPetitions)) {
          foundPetition = allPetitions.find(p => p.id === petitionId);
        }
      } catch (e) {
        console.error("Failed to parse petitions from localStorage", e);
      }
    }

    if (foundPetition) {
      setPetition(foundPetition);
      setOutcomes(mockOutcomes.filter(o => o.petitionId === petitionId)); // Keep outcomes ephemeral for now
      if (user) {
        const signedStatus = localStorage.getItem(`signed_${foundPetition.id}_${user.id}`);
        if (signedStatus) {
            setHasSigned(true);
            const storedTxId = localStorage.getItem(`tx_${foundPetition.id}_${user.id}`);
            if(storedTxId) setMockTxId(storedTxId);
        }
      }
    } else {
      toast({ title: "Petition not found", description: "This petition may have been removed or does not exist.", variant: "destructive" });
      router.push('/dashboard');
    }
    setIsLoading(false);
  }, [params.id, user, router, toast]);

  const handleSignPetition = async () => {
    if (!isAuthenticated || !user || !petition) {
      toast({ title: "Please log in to sign.", variant: "destructive" });
      return;
    }
    if (hasSigned) {
      toast({ title: "Already Signed", description: "Your signature is already recorded for this petition.", variant: "default" });
      return;
    }
    setIsSigning(true);
    await new Promise(resolve => setTimeout(resolve, 1500)); 

    setPetition(prev => {
        if (!prev) return null;
        const updatedPetition = { ...prev, signatures: prev.signatures + 1 };
        
        const storedPetitionsJSON = localStorage.getItem(PETITIONS_STORAGE_KEY);
        if (storedPetitionsJSON) {
            try {
                let allPetitions: Petition[] = JSON.parse(storedPetitionsJSON);
                allPetitions = allPetitions.map(p => p.id === updatedPetition.id ? updatedPetition : p);
                localStorage.setItem(PETITIONS_STORAGE_KEY, JSON.stringify(allPetitions));
            } catch (e) {
                console.error("Error updating petition signatures in localStorage", e);
            }
        }
        return updatedPetition;
    });

    const newMockTxId = `tx_${Date.now().toString(16)}`;
    setHasSigned(true);
    setMockTxId(newMockTxId);
    localStorage.setItem(`signed_${petition.id}_${user.id}`, 'true');
    localStorage.setItem(`tx_${petition.id}_${user.id}`, newMockTxId);
    toast({ 
        title: "Signature Recorded!", 
        description: `Your support is now part of this petition's immutable record. (Mock Tx ID: ${newMockTxId})` 
    });
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
    await new Promise(resolve => setTimeout(resolve, 1000));
    setOutcomes(prev => [...prev, newOutcome]);
    setNewOutcomeDescription('');
    toast({ title: "Outcome Proposed to Ledger!", description: "Your proposed outcome has been submitted for community review." });
    setIsProposing(false);
  };
  
  const handleVote = async (outcomeId: string, voteType: 'for' | 'against') => {
    if (!isAuthenticated || !user) {
       toast({ title: "Please log in to vote.", variant: "destructive" });
       return;
    }
    const voteKey = `voted_${outcomeId}_${user.id}`;
    if (localStorage.getItem(voteKey)) {
        toast({ title: "Already Voted", description: "Your vote is already recorded for this outcome.", variant: "default" });
        return;
    }

    setOutcomes(prevOutcomes => prevOutcomes.map(o => {
        if (o.id === outcomeId) {
            return { ...o, votesFor: o.votesFor + (voteType === 'for' ? 1 : 0), votesAgainst: o.votesAgainst + (voteType === 'against' ? 1 : 0) };
        }
        return o;
    }));
    const mockVoteId = `vote_${Date.now().toString(16)}`;
    localStorage.setItem(voteKey, voteType); 
    toast({ title: "Vote Recorded!", description: `Your vote has been tallied. (Mock Vote ID: ${mockVoteId})` });
  };


  if (isLoading || !petition) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  }
  
  const isCreator = user?.id === petition.creatorId;

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-lg">
            {petition.imageUrl && (
              <div className="relative w-full h-64 md:h-96 rounded-t-lg overflow-hidden">
                <Image src={petition.imageUrl} alt={petition.title} layout="fill" objectFit="cover" data-ai-hint={petition.category} />
              </div>
            )}
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                <PetitionStatusBadge status={petition.status} className="text-sm px-3 py-1.5" />
                <div className="flex items-center text-sm text-muted-foreground gap-4">
                    <span className="flex items-center"><Tag className="h-4 w-4 mr-1.5" /> <span className="capitalize">{petition.category}</span></span>
                    <span className="flex items-center"><Users className="h-4 w-4 mr-1.5" /> {petition.signatures.toLocaleString()} verifiable signatures</span>
                </div>
              </div>
              <CardTitle className="text-3xl md:text-4xl font-bold text-foreground">{petition.title}</CardTitle>
              <div className="text-sm text-muted-foreground pt-1">
                Proposed by <span className="font-medium text-primary">{petition.creatorName}</span> &bull; Recorded {formatDistanceToNow(new Date(petition.createdAt), { addSuffix: true })}
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
                {isSigning ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <FileSignature className="mr-2 h-5 w-5" />}
                {hasSigned ? "Signature Recorded" : (petition.status !== 'Live' ? `Cannot Sign (Ledger Status: ${petition.status})` : "Sign & Record on Ledger (Simulated)")}
              </Button>
              {isCreator && (
                <Button variant="outline" size="lg" className="w-full sm:w-auto" onClick={() => alert("Edit functionality for immutable records requires a proposal process (not implemented).")}>
                  <Edit className="mr-2 h-5 w-5" /> Edit Proposal (Simulated)
                </Button>
              )}
            </CardFooter>
            {hasSigned && mockTxId && (
                <div className="px-6 pb-4 text-xs text-muted-foreground flex items-center">
                    <Hash className="h-3 w-3 mr-1.5" /> Mock Transaction ID: {mockTxId}
                </div>
            )}
          </Card>

          { (petition.status === 'Voting' || petition.status === 'Live' || outcomes.length > 0) && (
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>Proposed Outcomes & Community Governance</CardTitle>
                    <CardDescription>
                        {petition.status === 'Voting' ? "Vote on proposed outcomes to decide the next steps. Votes are tallied transparently (simulated)." : 
                         petition.status === 'Live' ? "Outcomes can be proposed for the ledger. Voting will begin once the petition status changes to 'Voting'." :
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
                                                <AlertDialogHeader><AlertDialogTitle>Retract Outcome Proposal?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone from the local simulation.</AlertDialogDescription></AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => alert('Retract outcome not implemented')}>Retract</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {outcomes.length === 0 && <p className="text-muted-foreground">No outcomes proposed for the ledger yet.</p>}
                </CardContent>
                { (petition.status === 'Live' || petition.status === 'Voting') && (
                    <CardFooter className="border-t pt-6">
                        <form onSubmit={handleProposeOutcome} className="w-full space-y-3">
                            <Label htmlFor="new-outcome" className="font-semibold">Propose a New Outcome to the Ledger</Label>
                            <Textarea 
                                id="new-outcome"
                                placeholder="Describe your proposed outcome for the ledger..."
                                value={newOutcomeDescription}
                                onChange={(e) => setNewOutcomeDescription(e.target.value)}
                                rows={3}
                                disabled={!isAuthenticated}
                            />
                            <Button type="submit" disabled={isProposing || !isAuthenticated} className="w-full sm:w-auto">
                                {isProposing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                {isAuthenticated ? "Propose to Ledger (Simulated)" : "Login to Propose"}
                            </Button>
                        </form>
                    </CardFooter>
                )}
            </Card>
          )}
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center"><BarChartBig className="mr-2 h-5 w-5 text-primary" /> Ledger Analytics (Simulated)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <p><strong>Total Verifiable Signatures:</strong> {petition.signatures.toLocaleString()}</p>
                <p><strong>Signatures (Last Hour - Mock):</strong> {petition.signaturesLastHour?.toLocaleString() || 'N/A'}</p>
                <p><strong>Category:</strong> <span className="capitalize">{petition.category}</span></p>
                <p><strong>Ledger Status:</strong> <PetitionStatusBadge status={petition.status} /></p>
                <p><strong>Recorded On:</strong> {format(new Date(petition.createdAt), "MMMM d, yyyy, HH:mm")}</p>
                <p><strong>Last Update:</strong> {format(new Date(petition.updatedAt), "MMMM d, yyyy, HH:mm")}</p>
              </div>
              {chartData.length > 0 && (
                <>
                  <Separator className="my-4" />
                  <h4 className="font-semibold mb-2 text-muted-foreground">Signatures Activity (Mock)</h4>
                  <ChartContainer config={chartConfig} className="aspect-video h-[200px] w-full">
                    <BarChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                      <XAxis dataKey="time" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                      <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="signatures" fill="var(--color-signatures)" radius={4} />
                    </BarChart>
                  </ChartContainer>
                </>
              )}
               <Separator className="my-4" />
               <h4 className="font-semibold mb-2 text-muted-foreground">Geographic Distribution (Mock)</h4>
               {petition.geoBreakdown && Object.keys(petition.geoBreakdown).length > 0 ? (
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
              <CardHeader><CardTitle>Creator Tools (Simulated)</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" onClick={() => alert("Managing ledger status requires consensus (not implemented).")}>
                    <Edit className="mr-2 h-4 w-4" /> Manage Ledger Status
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full justify-start">
                      <Trash2 className="mr-2 h-4 w-4" /> Burn Petition (Simulated)
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm Petition Burn (Simulated)?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action is irreversible on a real ledger. This will permanently delete the petition
                        and all related data from your browser's local storage for this simulation.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => {
                          const storedPetitionsJSON = localStorage.getItem(PETITIONS_STORAGE_KEY);
                          if (storedPetitionsJSON) {
                            try {
                              let allPetitions: Petition[] = JSON.parse(storedPetitionsJSON);
                              allPetitions = allPetitions.filter(p => p.id !== petition.id);
                              localStorage.setItem(PETITIONS_STORAGE_KEY, JSON.stringify(allPetitions));
                            } catch (e) {
                              console.error("Error burning petition from localStorage", e);
                            }
                          }
                          toast({ title: "Petition Burned (Simulated)", description: "The petition has been removed from local storage."});
                          router.push('/dashboard');
                        }}
                      >
                        Yes, burn petition
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
