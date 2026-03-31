const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { X, RefreshCw, Monitor, FileText, Database, Save } from 'lucide-react';

import RegistryPanel from './RegistryPanel';
import UpdateStatusBadge from './UpdateStatusBadge';

export default function ProgramDetailPanel({ program, onClose, onUpdate, onCheckUpdate, onSaveValue, onDeleteKey }) {
  const [notes, setNotes] = useState(program.notes || '');
  const [savingNotes, setSavingNotes] = useState(false);

  const saveNotes = async () => {
    setSavingNotes(true);
    await db.entities.Program.update(program.id, { notes });
    onUpdate({ ...program, notes });
    setSavingNotes(false);
  };

  const fields = [
    { label: 'Publisher', value: program.publisher },
    { label: 'Version', value: program.version },
    { label: 'Latest Version', value: program.latest_version },
    { label: 'Install Date', value: program.install_date },
    { label: 'Install Location', value: program.install_location },
    { label: 'Architecture', value: program.architecture },
    { label: 'Product ID', value: program.product_id },
    { label: 'Registered Owner', value: program.registered_owner },
    { label: 'Registered Org', value: program.registered_organization },
    { label: 'License Key', value: program.license_key },
    { label: 'Uninstall String', value: program.uninstall_string },
  ].filter(f => f.value);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between p-4 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
            <Monitor className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-foreground truncate">{program.name}</h2>
            <p className="text-xs text-muted-foreground">{program.publisher || 'Unknown publisher'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 text-xs border-border h-8"
            onClick={() => onCheckUpdate(program)}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${program.update_status === 'checking' ? 'animate-spin' : ''}`} />
            Check Update
          </Button>
          <Button size="icon" variant="ghost" className="w-8 h-8 text-muted-foreground" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Update status bar */}
      {program.update_status && program.update_status !== 'unknown' && (
        <div className="px-4 py-2 border-b border-border flex items-center gap-2 flex-shrink-0">
          <UpdateStatusBadge status={program.update_status} />
          {program.update_status === 'update_available' && program.latest_version && (
            <span className="text-xs text-muted-foreground">→ v{program.latest_version} available</span>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="info" className="h-full flex flex-col">
          <TabsList className="bg-secondary mx-4 mt-3 flex-shrink-0">
            <TabsTrigger value="info" className="gap-1.5 text-xs">
              <FileText className="w-3.5 h-3.5" /> Info
            </TabsTrigger>
            <TabsTrigger value="registry" className="gap-1.5 text-xs">
              <Database className="w-3.5 h-3.5" /> Registry
            </TabsTrigger>
            <TabsTrigger value="notes" className="gap-1.5 text-xs">
              <FileText className="w-3.5 h-3.5" /> Notes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="flex-1 overflow-auto p-4 mt-0">
            <div className="space-y-1">
              {fields.map(f => (
                <div key={f.label} className="flex items-start gap-3 py-2.5 px-3 rounded-lg hover:bg-secondary/40 transition-colors">
                  <span className="text-xs text-muted-foreground w-32 flex-shrink-0 mt-0.5">{f.label}</span>
                  <span className="text-xs font-mono text-foreground flex-1 break-all">{f.value}</span>
                </div>
              ))}
              {fields.length === 0 && (
                <p className="text-xs text-muted-foreground/50 text-center py-8">No details available. Import from local server.</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="registry" className="flex-1 overflow-hidden mt-0">
            <RegistryPanel
              program={program}
              onSaveValue={onSaveValue}
              onDeleteKey={onDeleteKey}
            />
          </TabsContent>

          <TabsContent value="notes" className="flex-1 overflow-auto p-4 mt-0 flex flex-col gap-3">
            <p className="text-xs text-muted-foreground">Personal notes about this program (saved to database)</p>
            <Textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Add notes, license keys, or anything useful..."
              className="flex-1 min-h-[200px] bg-secondary border-border text-sm font-mono resize-none"
            />
            <Button
              size="sm"
              className="self-end gap-1.5 text-xs"
              onClick={saveNotes}
              disabled={savingNotes}
            >
              <Save className="w-3.5 h-3.5" />
              {savingNotes ? 'Saving...' : 'Save Notes'}
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}