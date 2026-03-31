const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, CheckCircle2, AlertCircle, X, Zap } from 'lucide-react';
import { localApi } from '@/lib/api';

import UpdateStatusBadge from './UpdateStatusBadge';

export default function BatchUpdatePanel({ programs, onDone, onClose }) {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState([]);
  const [done, setDone] = useState(false);

  const runBatch = async () => {
    setRunning(true);
    setResults([]);
    setProgress(0);
    setDone(false);

    const newResults = [];
    for (let i = 0; i < programs.length; i++) {
      const p = programs[i];
      let status = 'unknown';
      let latestVersion = null;
      try {
        const res = await localApi.checkUpdate(p.name, p.version);
        status = res.updateAvailable ? 'update_available' : 'up_to_date';
        latestVersion = res.latestVersion;
      } catch {
        status = 'error';
      }
      newResults.push({ ...p, update_status: status, latest_version: latestVersion });
      if (p.id) {
        await db.entities.Program.update(p.id, { update_status: status, latest_version: latestVersion });
      }
      setProgress(Math.round(((i + 1) / programs.length) * 100));
      setResults([...newResults]);
    }

    setRunning(false);
    setDone(true);
    onDone(newResults);
  };

  const updatesAvailable = results.filter(r => r.update_status === 'update_available').length;
  const upToDate = results.filter(r => r.update_status === 'up_to_date').length;
  const errors = results.filter(r => r.update_status === 'error').length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">Batch Update Check</h3>
          <Badge variant="outline" className="text-xs border-border text-muted-foreground">
            {programs.length} programs
          </Badge>
        </div>
        <Button size="icon" variant="ghost" className="w-7 h-7 text-muted-foreground" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {!running && !done && (
        <p className="text-xs text-muted-foreground">
          Query each program's official source to check for available updates. This may take a few minutes.
        </p>
      )}

      {(running || done) && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{results.length} / {programs.length} checked</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
          {done && (
            <div className="flex items-center gap-3 pt-1">
              <span className="flex items-center gap-1 text-xs text-warning">
                <AlertCircle className="w-3.5 h-3.5" /> {updatesAvailable} updates available
              </span>
              <span className="flex items-center gap-1 text-xs text-success">
                <CheckCircle2 className="w-3.5 h-3.5" /> {upToDate} up to date
              </span>
              {errors > 0 && (
                <span className="flex items-center gap-1 text-xs text-destructive">
                  <X className="w-3.5 h-3.5" /> {errors} errors
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {results.length > 0 && (
        <div className="max-h-48 overflow-auto space-y-1">
          {results.map((r, i) => (
            <div key={i} className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-secondary/40">
              <span className="text-xs text-foreground truncate flex-1">{r.name}</span>
              <UpdateStatusBadge status={r.update_status} />
            </div>
          ))}
        </div>
      )}

      <Button
        className="gap-2 text-sm"
        onClick={runBatch}
        disabled={running}
      >
        <RefreshCw className={`w-4 h-4 ${running ? 'animate-spin' : ''}`} />
        {running ? 'Checking...' : done ? 'Run Again' : 'Check All Updates'}
      </Button>
    </div>
  );
}