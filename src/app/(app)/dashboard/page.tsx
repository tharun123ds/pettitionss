
"use client";

import React, { useState, useEffect } from 'react';
import type { Petition } from '@/lib/types';
// import { mockPetitions } from '@/lib/mock-data'; // No longer primary source
import { PetitionCard } from '@/components/petitions/petition-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle, ListFilter, Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const PETITIONS_STORAGE_KEY = 'decentralizeit-petitions';

export default function DashboardPage() {
  const [petitions, setPetitions] = useState<Petition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [selectedStatuses, setSelectedStatuses] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    setIsLoading(true);
    const storedPetitionsJSON = localStorage.getItem(PETITIONS_STORAGE_KEY);
    let loadedPetitions: Petition[] = [];
    if (storedPetitionsJSON) {
      try {
        const parsed = JSON.parse(storedPetitionsJSON);
        if (Array.isArray(parsed)) {
          loadedPetitions = parsed;
        } else {
          console.warn("Petitions from localStorage was not an array.");
        }
      } catch (e) {
        console.error("Failed to parse petitions from localStorage", e);
      }
    }
    setPetitions(loadedPetitions);
    setIsLoading(false);
  }, []);

  const uniqueCategories = Array.from(new Set(petitions.map(p => p.category)));
  const uniqueStatuses = Array.from(new Set(petitions.map(p => p.status)));

  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) newSet.delete(category);
      else newSet.add(category);
      return newSet;
    });
  };
  
  const handleStatusChange = (status: string) => {
    setSelectedStatuses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(status)) newSet.delete(status);
      else newSet.add(status);
      return newSet;
    });
  };

  const filteredPetitions = petitions.filter(petition => {
    const matchesSearch = petition.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          petition.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategories.size === 0 || selectedCategories.has(petition.category);
    const matchesStatus = selectedStatuses.size === 0 || selectedStatuses.has(petition.status);
    
    let matchesTab = true;
    if (activeTab === "live") matchesTab = petition.status === "Live";
    else if (activeTab === "voting") matchesTab = petition.status === "Voting";
    else if (activeTab === "archived") matchesTab = petition.status === "Archived" || petition.status === "Closed";
    else if (activeTab === "draft") matchesTab = petition.status === "Draft";


    return matchesSearch && matchesCategory && matchesStatus && matchesTab;
  });

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-theme(spacing.16))] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-2">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Petitions Dashboard</h1>
        <Button asChild>
          <Link href="/petitions/new">
            <PlusCircle className="mr-2 h-5 w-5" /> Create New Petition
          </Link>
        </Button>
      </div>

      <div className="mb-6 p-4 bg-card rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-1">
            <label htmlFor="search-petitions" className="block text-sm font-medium text-muted-foreground mb-1">Search Petitions</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="search-petitions"
                type="text"
                placeholder="Search by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Filter by Category</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between" disabled={uniqueCategories.length === 0}>
                  <span>{selectedCategories.size > 0 ? `${selectedCategories.size} Selected` : "All Categories"}</span> <ListFilter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Categories</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {uniqueCategories.length > 0 ? uniqueCategories.map(category => (
                  <DropdownMenuCheckboxItem
                    key={category}
                    checked={selectedCategories.has(category)}
                    onCheckedChange={() => handleCategoryChange(category)}
                    className="capitalize"
                  >
                    {category}
                  </DropdownMenuCheckboxItem>
                )) : <DropdownMenuLabel className="text-xs text-muted-foreground px-2">No categories found</DropdownMenuLabel>}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Filter by Status</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between" disabled={uniqueStatuses.length === 0}>
                 <span>{selectedStatuses.size > 0 ? `${selectedStatuses.size} Selected` : "All Statuses"}</span> <ListFilter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Statuses</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {uniqueStatuses.length > 0 ? uniqueStatuses.map(status => (
                  <DropdownMenuCheckboxItem
                    key={status}
                    checked={selectedStatuses.has(status)}
                    onCheckedChange={() => handleStatusChange(status)}
                    className="capitalize"
                  >
                    {status}
                  </DropdownMenuCheckboxItem>
                )) : <DropdownMenuLabel className="text-xs text-muted-foreground px-2">No statuses found</DropdownMenuLabel>}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
          <TabsTrigger value="live">Live</TabsTrigger>
          <TabsTrigger value="voting">Voting</TabsTrigger>
          <TabsTrigger value="archived">Archived/Closed</TabsTrigger>
        </TabsList>
      </Tabs>


      {filteredPetitions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPetitions.map((petition) => (
            <PetitionCard key={petition.id} petition={petition} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-xl text-muted-foreground">
            {petitions.length === 0 ? "No petitions created yet. Start by creating one!" : "No petitions found matching your criteria."}
          </p>
          {(searchTerm || selectedCategories.size > 0 || selectedStatuses.size > 0) && (
            <Button variant="link" onClick={() => {
              setSearchTerm('');
              setSelectedCategories(new Set());
              setSelectedStatuses(new Set());
              setActiveTab("all");
            }}>Clear filters</Button>
          )}
        </div>
      )}
    </div>
  );
}

    