import Link from 'next/link';
import { Network } from 'lucide-react'; // Or any other appropriate icon

export function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-2 text-primary hover:opacity-80 transition-opacity">
      <Network className="h-7 w-7" />
      <span className="text-2xl font-bold text-foreground">DecentralizeIt</span>
    </Link>
  );
}
