import ServerSetupGuide from '@/components/ServerSetupGuide';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Setup() {
  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 pt-6">
        <Link to="/">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground text-xs">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
      <ServerSetupGuide />
    </div>
  );
}