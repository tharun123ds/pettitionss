import type { Petition, PetitionCategory, PetitionStatus, User } from './types';

const mockUsers: User[] = [
  { id: 'user1', name: 'Alice Wonderland', email: 'alice@example.com', walletAddress: '0x123' },
  { id: 'user2', name: 'Bob The Builder', email: 'bob@example.com', walletAddress: '0x456' },
  { id: 'user3', name: 'Charlie Brown', email: 'charlie@example.com', walletAddress: '0x789' },
];

export const mockPetitions: Petition[] = [
  {
    id: 'p1',
    title: 'Protect Our Local Forests',
    description: 'A petition to increase protection for local forest areas and prevent deforestation due to urban sprawl. We need to preserve these vital ecosystems for future generations.',
    creatorId: mockUsers[0].id,
    creatorName: mockUsers[0].name,
    status: 'Live' as PetitionStatus,
    category: 'environment' as PetitionCategory,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    signatures: 1250,
    imageUrl: 'https://placehold.co/600x400.png',
    signaturesLastHour: 15,
    geoBreakdown: { 'California': 600, 'New York': 300, 'Texas': 150, 'Other': 200 },
  },
  {
    id: 'p2',
    title: 'Improve School Lunch Programs',
    description: 'This petition calls for healthier and more nutritious meal options in public school cafeterias across the state. Our children deserve better quality food to support their learning and development.',
    creatorId: mockUsers[1].id,
    creatorName: mockUsers[1].name,
    status: 'Voting' as PetitionStatus,
    category: 'education' as PetitionCategory,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), // 10 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(), // 1 day ago
    signatures: 3400,
    imageUrl: 'https://placehold.co/600x400.png',
    signaturesLastHour: 5,
    geoBreakdown: { 'Florida': 1000, 'Illinois': 800, 'Ohio': 700, 'Other': 900 },
  },
  {
    id: 'p3',
    title: 'Fund Local Animal Shelters',
    description: 'Local animal shelters are struggling with overcrowding and lack of resources. Sign this petition to urge local government to increase funding and support for these vital community services.',
    creatorId: mockUsers[0].id,
    creatorName: mockUsers[0].name,
    status: 'Draft' as PetitionStatus,
    category: 'animal welfare' as PetitionCategory,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    signatures: 50,
    imageUrl: 'https://placehold.co/600x400.png',
  },
  {
    id: 'p4',
    title: 'Fair Wages for Gig Workers',
    description: 'Gig economy workers often face precarious employment conditions and low pay. This petition demands fair wage standards and better protections for all gig workers.',
    creatorId: mockUsers[2].id,
    creatorName: mockUsers[2].name,
    status: 'Live' as PetitionStatus,
    category: 'social justice' as PetitionCategory,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(), // 30 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    signatures: 8700,
    imageUrl: 'https://placehold.co/600x400.png',
    signaturesLastHour: 22,
    geoBreakdown: { 'New York': 3000, 'Washington': 2000, 'Massachusetts': 1500, 'Other': 2200 },
  },
  {
    id: 'p5',
    title: 'Expand Public Access to High-Speed Internet',
    description: 'Access to reliable high-speed internet is essential in the modern world. This petition calls for government initiatives to expand broadband infrastructure to underserved rural and urban communities.',
    creatorId: mockUsers[1].id,
    creatorName: mockUsers[1].name,
    status: 'Archived' as PetitionStatus,
    category: 'technology' as PetitionCategory,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 100).toISOString(), // 100 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 50).toISOString(), // 50 days ago
    signatures: 15200,
    imageUrl: 'https://placehold.co/600x400.png',
  },
];
