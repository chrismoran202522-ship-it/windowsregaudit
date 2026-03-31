import { Wifi, WifiOff, Loader2, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const CONFIG = {
  connected: { icon: Wifi, label: 'Local server connected', className: 'text-success' },
  disconnected: { icon: WifiOff, label: 'Local server not found', className: 'text-destructive' },
  checking: { icon: Loader2, label: 'Connecting...', className: 'text-muted-foreground animate-spin' },
  unknown: { icon: HelpCircle, label: 'Unknown', className: 'text-muted-foreground' },
};

export default function ServerStatusIndicator({ status, onClick }) {
  const cfg = CONFIG[status] || CONFIG.unknown;
  const Icon = cfg.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
          >
            <Icon className={`w-3.5 h-3.5 ${cfg.className}`} />
            <span className="text-muted-foreground hidden sm:inline">{cfg.label}</span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {status === 'disconnected' ? 'Click to see setup guide' : cfg.label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}