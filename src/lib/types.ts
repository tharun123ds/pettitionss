export interface User {
  id: string;
  email: string;
  name: string;
  walletAddress?: string; // Optional, as it's mocked
}

export type PetitionStatus = "Draft" | "Live" | "Voting" | "Archived" | "Closed";

// Matches CategorySchema in categorize-petition.ts
export type PetitionCategory =
  | "environment"
  | "health"
  | "education"
  | "social justice"
  | "animal welfare"
  | "politics"
  | "technology"
  | "other";

export interface Petition {
  id: string;
  title: string;
  description: string;
  creatorId: string; // User ID of the creator
  creatorName: string; // User name of the creator for display
  status: PetitionStatus;
  category: PetitionCategory;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  signatures: number; // Mock count
  imageUrl?: string; // Optional placeholder image
  // For analytics
  signaturesLastHour?: number;
  geoBreakdown?: Record<string, number>; // e.g., { "USA": 100, "Canada": 50 }
}

export interface ProposedOutcome {
  id: string;
  petitionId: string;
  description: string;
  proposedByUserId: string;
  proposedByUserName: string;
  votesFor: number;
  votesAgainst: number;
  createdAt: string;
}
