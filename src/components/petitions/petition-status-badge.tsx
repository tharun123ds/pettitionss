import type { PetitionStatus } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PetitionStatusBadgeProps {
  status: PetitionStatus;
  className?: string;
}

export function PetitionStatusBadge({ status, className }: PetitionStatusBadgeProps) {
  const statusColors: Record<PetitionStatus, string> = {
    Draft: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700',
    Live: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700',
    Voting: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700',
    Archived: 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-700/50 dark:text-gray-300 dark:border-gray-500',
    Closed: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700',
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "capitalize px-2.5 py-1 text-xs font-medium",
        statusColors[status],
        className
      )}
    >
      {status}
    </Badge>
  );
}
