const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { localApi } from '@/lib/api';

import { Download, Loader2, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';

export default function ImportBar({ onImported, serverStatus }) {
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);

  const doImport = async () => {
    setImporting(true);
    setResult(null);
    const programs = await localApi.getPrograms();
    // Bulk create in DB
    const existing = await db.entities.Program.list();
    const existingNames = new Set(existing.map(p => p.name));
    const toCreate = programs.filter(p => p.name && !existingNames.has(p.name));
    if (toCreate.length > 0) {
      await db.entities.Program.bulkCreate(toCreate);
    }
    setResult({ count: toCreate.length, total: programs.length });
    setImporting(false);
    onImported();
  };

  if (serverStatus !== 'connected') return null;

  return (
    <div className="flex items-center gap-3">
      {result && (
        <span className="text-xs text-muted-foreground">
          Imported {result.count} new of {result.total} found
        </span>
      )}
      <Button
        size="sm"
        variant="outline"
        className="gap-1.5 text-xs border-border h-8"
        onClick={doImport}
        disabled={importing}
      >
        {importing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
        {importing ? 'Importing...' : 'Import from PC'}
      </Button>
    </div>
  );
}