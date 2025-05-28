import type { Petition, PetitionCategory, PetitionStatus, User } from './types';

const mockUsers: User[] = [
  { id: 'user1', name: 'Alice Wonderland', email: 'alice@example.com', walletAddress: '0x123' },
  { id: 'user2', name: 'Bob The Builder', email: 'bob@example.com', walletAddress: '0x456' },
  { id: 'user3', name: 'Charlie Brown', email: 'charlie@example.com', walletAddress: '0x789' },
];

export const mockPetitions: Petition[] = [];
