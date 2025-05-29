
import type { Petition } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { PetitionStatusBadge } from './petition-status-badge';
import { Users, CalendarDays, Tag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PetitionCardProps {
  petition: Petition;
}

export function PetitionCard({ petition }: PetitionCardProps) {
  return (
    <Card className="flex flex-col h-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg">
      {petition.imageUrl && (
         <div className="relative w-full h-48">
            <Image
            src={petition.imageUrl}
            alt={petition.title}
            fill
            style={{ objectFit: 'cover' }}
            className="rounded-t-lg"
            data-ai-hint={petition.category}
            />
         </div>
      )}
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start mb-2">
            <PetitionStatusBadge status={petition.status} />
            <div className="flex items-center text-xs text-muted-foreground">
                <Tag className="h-3 w-3 mr-1" />
                <span className="capitalize">{petition.category}</span>
            </div>
        </div>
        <CardTitle className="text-xl leading-tight">
          <Link href={`/petitions/${petition.id}`} className="hover:text-primary transition-colors">
            {petition.title}
          </Link>
        </CardTitle>
        <CardDescription className="text-sm line-clamp-3 h-[3.75rem] overflow-hidden"> {/* approx 3 lines */}
          {petition.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex items-center">
                <Users className="h-3.5 w-3.5 mr-1.5" />
                <span>{petition.signatures.toLocaleString()} verifiable signatures</span>
            </div>
            <div className="flex items-center">
                <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
                <span>
                    Recorded {formatDistanceToNow(new Date(petition.createdAt), { addSuffix: true })}
                </span>
            </div>
             <div className="flex items-center pt-1">
                <span className="text-xs">By: {petition.creatorName}</span>
            </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full">
          <Link href={`/petitions/${petition.id}`}>View on Ledger (Simulated)</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
