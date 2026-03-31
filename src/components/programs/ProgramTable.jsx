import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Search, RefreshCw, ChevronRight, Shield, Monitor, Cpu } from 'lucide-react';
import UpdateStatusBadge from './UpdateStatusBadge';

export default function ProgramTable({ programs, onSelect, onCheckUpdate, checkingAll }) {
  const [search, setSearch] = useState('');
  const [hideSystem, setHideSystem] = useState(true);

  const filtered = programs.filter(p => {
    if (hideSystem && p.is_system) return false;
    const q = search.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.publisher?.toLowerCase().includes(q) ||
      p.version?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-3 p-4 border-b border-border flex-shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search programs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-secondary border-border text-sm h-9"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          className={`text-xs border-border gap-1.5 ${hideSystem ? 'bg-primary/10 border-primary/30 text-primary' : 'text-muted-foreground'}`}
          onClick={() => setHideSystem(!hideSystem)}
        >
          <Shield className="w-3.5 h-3.5" />
          Hide System
        </Button>
      </div>

      {/* Count */}
      <div className="px-4 py-2 border-b border-border flex-shrink-0">
        <span className="text-xs text-muted-foreground">{filtered.length} programs</span>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-background">
            <tr className="border-b border-border">
              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Name</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground hidden md:table-cell">Publisher</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground hidden lg:table-cell">Version</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground hidden xl:table-cell">Arch</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Status</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Update</th>
              <th className="w-8"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((program, i) => (
              <tr
                key={program.id || i}
                onClick={() => onSelect(program)}
                className="border-b border-border/50 hover:bg-secondary/40 cursor-pointer transition-colors group"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                      <Monitor className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="font-medium text-foreground text-sm truncate max-w-[180px]">{program.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className="text-muted-foreground text-xs truncate max-w-[140px] block">{program.publisher || '—'}</span>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <code className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    {program.version || '—'}
                  </code>
                </td>
                <td className="px-4 py-3 hidden xl:table-cell">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Cpu className="w-3 h-3" />
                    {program.architecture || '—'}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant="outline"
                    className={`text-xs ${program.registry_hive === 'HKCU' ? 'border-warning/40 text-warning' : 'border-primary/40 text-primary'}`}
                  >
                    {program.registry_hive || 'HKLM'}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <UpdateStatusBadge status={program.update_status} />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={e => { e.stopPropagation(); onCheckUpdate(program); }}
                            className="p-1 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${program.update_status === 'checking' ? 'animate-spin' : ''}`} />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top">Check for update</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-12 text-muted-foreground text-sm">
                  No programs found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}