
"use client";

import React, { useState } from 'react';
import { useForm, type SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/providers/auth-provider';
import { useRouter } from 'next/navigation';
import type { Petition, PetitionCategory, PetitionStatus } from '@/lib/types';
import { categorizePetition, type CategorizePetitionOutput } from '@/ai/flows/categorize-petition';
import { Loader2, Info, FileSignature } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

const petitionSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters." }).max(100, { message: "Title must be 100 characters or less." }),
  description: z.string().min(20, { message: "Description must be at least 20 characters." }).max(2000, { message: "Description must be 2000 characters or less." }),
  category: z.custom<PetitionCategory>((val) => typeof val === 'string' && val.length > 0, {
    message: "Category is required."
  }),
});

type PetitionFormInputs = z.infer<typeof petitionSchema>;

const availableCategories: PetitionCategory[] = [
  "environment", "health", "education", "social justice", 
  "animal welfare", "politics", "technology", "other"
];

const PETITIONS_STORAGE_KEY = 'decentralizeit-petitions';

export default function NewPetitionPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<CategorizePetitionOutput | null>(null);

  const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm<PetitionFormInputs>({
    resolver: zodResolver(petitionSchema),
    defaultValues: {
      title: '',
      description: '',
      category: undefined,
    }
  });

  const petitionDescription = watch('description');
  const petitionTitle = watch('title');

  const handleAiCategorize = async () => {
    if (!petitionTitle || !petitionDescription || petitionDescription.length < 20) {
      toast({
        title: "Cannot Categorize",
        description: "Please provide a title and a description (min 20 chars) to use AI categorization.",
        variant: "destructive",
      });
      return;
    }
    setIsCategorizing(true);
    setAiSuggestion(null);
    try {
      const result = await categorizePetition({ petitionTitle, petitionDescription });
      setAiSuggestion(result);
      setValue('category', result.category, { shouldValidate: true });
      toast({
        title: "AI Suggestion Applied",
        description: `Petition categorized as "${result.category}" with ${Math.round(result.confidence * 100)}% confidence.`,
      });
    } catch (error) {
      console.error("AI categorization failed:", error);
      toast({
        title: "AI Categorization Failed",
        description: "Could not automatically categorize the petition. Please select a category manually.",
        variant: "destructive",
      });
    } finally {
      setIsCategorizing(false);
    }
  };

  const onSubmit: SubmitHandler<PetitionFormInputs> = async (data) => {
    if (!user) {
      toast({ title: "Authentication Error", description: "You must be logged in to create a petition.", variant: "destructive"});
      return;
    }
    setIsSubmitting(true);
    
    const newPetition: Petition = {
      id: `petition_${Date.now()}`,
      ...data,
      creatorId: user.id,
      creatorName: user.name,
      status: 'Draft' as PetitionStatus, // Petitions start as Draft
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      signatures: 0,
      imageUrl: `https://placehold.co/600x400.png` // Standardized placeholder, hint added in card/detail
    };

    try {
      const existingPetitionsJSON = localStorage.getItem(PETITIONS_STORAGE_KEY);
      let allPetitions: Petition[] = [];
      if (existingPetitionsJSON) {
        try {
          allPetitions = JSON.parse(existingPetitionsJSON);
          if (!Array.isArray(allPetitions)) { 
            allPetitions = [];
          }
        } catch (e) {
          console.error("Failed to parse petitions from localStorage, resetting.", e);
          allPetitions = []; 
        }
      }
      allPetitions.push(newPetition);
      localStorage.setItem(PETITIONS_STORAGE_KEY, JSON.stringify(allPetitions));

      toast({
        title: "Petition Proposal Submitted!",
        description: `Your petition "${newPetition.title}" has been recorded as a draft. It's ready for the community ledger once finalized.`,
      });
      router.push('/dashboard');
    } catch (error) {
      console.error("Error saving petition to localStorage:", error);
      toast({
        title: "Storage Error",
        description: "Could not save the petition to local storage.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl">Create a New Petition</CardTitle>
          <CardDescription>Launch your proposal onto our decentralized platform. Share your cause and gather verifiable support.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Petition Title</Label>
              <Input id="title" placeholder="E.g., Improve Local Park Safety" {...register('title')} />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Explain the issue and what you want to achieve..."
                {...register('description')}
                rows={6}
              />
              {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="category">Category</Label>
                <Button type="button" variant="outline" size="sm" onClick={handleAiCategorize} disabled={isCategorizing || !petitionTitle || (petitionDescription?.length || 0) < 20}>
                  {isCategorizing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Suggest with AI
                </Button>
              </div>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCategories.map(cat => (
                        <SelectItem key={cat} value={cat} className="capitalize">{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
              {aiSuggestion && (
                <Alert variant="default" className="mt-2 bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-700">
                  <Info className="h-4 w-4 !text-blue-600 dark:!text-blue-400" />
                  <AlertTitle className="text-blue-700 dark:text-blue-300">AI Suggestion</AlertTitle>
                  <AlertDescription className="text-blue-600 dark:text-blue-400">
                    Suggested category: <span className="font-semibold capitalize">{aiSuggestion.category}</span> (Confidence: {Math.round(aiSuggestion.confidence * 100)}%)
                  </AlertDescription>
                </Alert>
              )}
            </div>

          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting || isCategorizing}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileSignature className="mr-2 h-4 w-4" />}
              Submit Proposal to Ledger
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
