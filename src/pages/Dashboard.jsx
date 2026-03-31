const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useEffect, useCallback } from 'react';

import { localApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Monitor, Database, RefreshCw, Zap, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

import ProgramTable from '@/components/programs/ProgramTable';
import ProgramDetailPanel from '@/components/programs/ProgramDetailPanel';
import BatchUpdatePanel from '@/components/programs/BatchUpdatePanel';
import ServerStatusIndicator from '@/components/programs/ServerStatusIndicator';
import ImportBar from '@/components/programs/ImportBar';

export default function Dashboard() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [serverStatus, setServerStatus] = useState('checking');
  const [showBatch, setShowBatch] = useState(false);

  const loadPrograms = useCallback(async () => {
    setLoading(true);
    const data = await db.entities.Program.list('-updated_date', 500);
    setPrograms(data);
    setLoading(false);
  }, []);

  const checkServer = useCallback(async () => {
    setServerStatus('checking');
    try {
      await localApi.ping();
      setServerStatus('connected');
    } catch {
      setServerStatus('disconnected');
    }
  }, []);

  useEffect(() => {
    loadPrograms();
    checkServer();
  }, []);

  const handleCheckUpdate = async (program) => {
    setPrograms(prev => prev.map(p => p.id === program.id ? { ...p, update_status: 'checking' } : p));
    if (selectedProgram?.id === program.id) {
      setSelectedProgram(p => ({ ...p, update_status: 'checking' }));
    }
    try {
      const res = await localApi.checkUpdate(program.name, program.version);
      const status = res.updateAvailable ? 'update_available' : 'up_to_date';
      const updated = { update_status: status, latest_version: res.latestVersion || null };
      if (program.id) await db.entities.Program.update(program.id, updated);
      setPrograms(prev => prev.map(p => p.id === program.id ? { ...p, ...updated } : p));
      if (selectedProgram?.id === program.id) setSelectedProgram(p => ({ ...p, ...updated }));
    } catch {
      setPrograms(prev => prev.map(p => p.id === program.id ? { ...p, update_status: 'error' } : p));
    }
  };

  const handleSaveRegistryValue = async (keyPath, valueName, newValue) => {
    await localApi.updateRegistryValue(keyPath, valueName, newValue);
  };

  const handleDeleteRegistryKey = async (keyPath) => {
    await localApi.deleteRegistryKey(keyPath);
    await loadPrograms();
    setSelectedProgram(null);
  };

  const handleBatchDone = (results) => {
    setPrograms(prev => prev.map(p => {
      const r = results.find(r => r.id === p.id);
      return r ? { ...p, update_status: r.update_status, latest_version: r.latest_version } : p;
    }));
  };

  const updateAvailableCount = programs.filter(p => p.update_status === 'update_available').length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Nav */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-20 flex-shrink-0">
        <div className="flex items-center justify-between px-4 md:px-6 h-14">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
              <Database className="w-4 h-4 text-primary" />
            </div>
            <span className="font-semibold text-foreground text-sm">WinRegistry Manager</span>
          </div>
          <div className="flex items-center gap-2">
            <ServerStatusIndicator
              status={serverStatus}
              onClick={serverStatus === 'disconnected' ? undefined : checkServer}
            />
            {serverStatus === 'disconnected' && (
              <Link to="/setup">
                <Button size="sm" variant="outline" className="text-xs border-primary/30 text-primary h-8 gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5" />
                  Setup Guide
                </Button>
              </Link>
            )}
            <ImportBar serverStatus={serverStatus} onImported={loadPrograms} />
            <Button
              size="sm"
              className="gap-1.5 text-xs h-8 relative"
              onClick={() => setShowBatch(true)}
            >
              <Zap className="w-3.5 h-3.5" />
              Check All Updates
              {updateAvailableCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-warning text-background text-xs flex items-center justify-center font-bold">
                  {updateAvailableCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Stats Row */}
      <div className="flex gap-4 px-4 md:px-6 py-4 border-b border-border flex-shrink-0">
        {[
          { label: 'Total Programs', value: programs.length, icon: Monitor, color: 'text-primary' },
          { label: 'Updates Available', value: updateAvailableCount, icon: RefreshCw, color: 'text-warning' },
          { label: 'Registry Entries', value: programs.filter(p => p.registry_key_path).length, icon: Database, color: 'text-success' },
        ].map(stat => (
          <Card key={stat.label} className="flex-1 bg-card border-border">
            <CardContent className="flex items-center gap-3 p-3">
              <stat.icon className={`w-4 h-4 ${stat.color} flex-shrink-0`} />
              <div>
                <p className="text-lg font-bold text-foreground leading-none">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Programs table */}
        <div className={`flex-1 overflow-hidden flex flex-col ${selectedProgram ? 'hidden lg:flex' : 'flex'}`}>
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" />
                <p className="text-sm">Loading programs...</p>
              </div>
            </div>
          ) : (
            <ProgramTable
              programs={programs}
              onSelect={setSelectedProgram}
              onCheckUpdate={handleCheckUpdate}
              checkingAll={false}
            />
          )}
        </div>

        {/* Detail panel — desktop side panel */}
        {selectedProgram && (
          <div className="hidden lg:flex w-[480px] flex-shrink-0 border-l border-border flex-col overflow-hidden">
            <ProgramDetailPanel
              program={selectedProgram}
              onClose={() => setSelectedProgram(null)}
              onUpdate={(updated) => {
                setPrograms(prev => prev.map(p => p.id === updated.id ? updated : p));
                setSelectedProgram(updated);
              }}
              onCheckUpdate={handleCheckUpdate}
              onSaveValue={handleSaveRegistryValue}
              onDeleteKey={handleDeleteRegistryKey}
            />
          </div>
        )}
      </div>

      {/* Mobile detail sheet */}
      <Sheet open={!!selectedProgram} onOpenChange={open => !open && setSelectedProgram(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg p-0 bg-card border-border lg:hidden">
          {selectedProgram && (
            <ProgramDetailPanel
              program={selectedProgram}
              onClose={() => setSelectedProgram(null)}
              onUpdate={(updated) => {
                setPrograms(prev => prev.map(p => p.id === updated.id ? updated : p));
                setSelectedProgram(updated);
              }}
              onCheckUpdate={handleCheckUpdate}
              onSaveValue={handleSaveRegistryValue}
              onDeleteKey={handleDeleteRegistryKey}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Batch update dialog */}
      <Dialog open={showBatch} onOpenChange={setShowBatch}>
        <DialogContent className="bg-card border-border max-w-lg">
          <BatchUpdatePanel
            programs={programs}
            onDone={handleBatchDone}
            onClose={() => setShowBatch(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}