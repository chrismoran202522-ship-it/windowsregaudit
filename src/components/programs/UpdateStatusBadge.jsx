import { CheckCircle2, AlertCircle, HelpCircle, Loader2, XCircle } from 'lucide-react';

const CONFIG = {
  up_to_date: { icon: CheckCircle2, label: 'Up to date', className: 'text-success' },
  update_available: { icon: AlertCircle, label: 'Update available', className: 'text-warning' },
  checking: { icon: Loader2, label: 'Checking...', className: 'text-muted-foreground animate-spin' },
  error: { icon: XCircle, label: 'Error', className: 'text-destructive' },
  unknown: { icon: HelpCircle, label: 'Unknown', className: 'text-muted-foreground/50' },
};

export default function UpdateStatusBadge({ status }) {
  const cfg = CONFIG[status] || CONFIG.unknown;
  const Icon = cfg.icon;
  return (
    <span className={`flex items-center gap-1 text-xs ${cfg.className}`} title={cfg.label}>
      <Icon className="w-3.5 h-3.5" />
      <span className="hidden xl:inline">{cfg.label}</span>
    </span>
  );
}