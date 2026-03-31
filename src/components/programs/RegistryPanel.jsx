import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Database, FolderOpen, Edit2, Trash2, Save, X, Copy, CheckCheck, ChevronRight, AlertTriangle
} from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog';

function RegistryValueRow({ name, value, onSave, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [editVal, setEditVal] = useState(value);
  const [copied, setCopied] = useState(false);

  const copy = (v) => {
    navigator.clipboard.writeText(v);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="group flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-secondary/40 transition-colors">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-muted-foreground truncate">{name}</p>
        {editing ? (
          <Input
            value={editVal}
            onChange={e => setEditVal(e.target.value)}
            className="mt-1 h-7 text-xs font-mono bg-muted border-border"
            autoFocus
          />
        ) : (
          <p className="text-xs font-mono text-foreground truncate mt-0.5">{value || '(empty)'}</p>
        )}
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        {editing ? (
          <>
            <Button size="icon" variant="ghost" className="w-6 h-6 text-success hover:text-success" onClick={() => { onSave(name, editVal); setEditing(false); }}>
              <Save className="w-3 h-3" />
            </Button>
            <Button size="icon" variant="ghost" className="w-6 h-6 text-muted-foreground" onClick={() => { setEditing(false); setEditVal(value); }}>
              <X className="w-3 h-3" />
            </Button>
          </>
        ) : (
          <>
            <Button size="icon" variant="ghost" className="w-6 h-6 text-muted-foreground hover:text-foreground" onClick={() => copy(value)}>
              {copied ? <CheckCheck className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
            </Button>
            <Button size="icon" variant="ghost" className="w-6 h-6 text-muted-foreground hover:text-primary" onClick={() => setEditing(true)}>
              <Edit2 className="w-3 h-3" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="icon" variant="ghost" className="w-6 h-6 text-muted-foreground hover:text-destructive">
                  <Trash2 className="w-3 h-3" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-card border-border">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete registry value?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete <strong>{name}</strong> from the registry. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={() => onDelete(name)}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </div>
    </div>
  );
}

export default function RegistryPanel({ program, registryData, onSaveValue, onDeleteKey, loading }) {
  const [copied, setCopied] = useState(false);

  const copyPath = () => {
    navigator.clipboard.writeText(program.registry_key_path || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const fields = [
    { name: 'DisplayName', value: program.name },
    { name: 'Publisher', value: program.publisher },
    { name: 'DisplayVersion', value: program.version },
    { name: 'InstallDate', value: program.install_date },
    { name: 'InstallLocation', value: program.install_location },
    { name: 'UninstallString', value: program.uninstall_string },
    { name: 'ProductCode', value: program.product_id },
    { name: 'RegisteredOwner', value: program.registered_owner },
    { name: 'RegisteredOrganization', value: program.registered_organization },
    { name: 'LicenseKey', value: program.license_key },
  ].filter(f => f.value);

  return (
    <div className="flex flex-col h-full overflow-auto">
      {/* Registry path */}
      <div className="p-4 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <Database className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Registry Path</span>
        </div>
        <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 mt-2">
          <FolderOpen className="w-3.5 h-3.5 text-warning flex-shrink-0" />
          <code className="text-xs font-mono text-foreground flex-1 truncate">
            {program.registry_key_path || 'Unknown'}
          </code>
          <button onClick={copyPath} className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">
            {copied ? <CheckCheck className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
        {/* Breadcrumbs */}
        {program.registry_key_path && (
          <div className="flex items-center gap-1 mt-2 flex-wrap">
            {program.registry_key_path.split('\\').map((part, i, arr) => (
              <span key={i} className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground/60">{part}</span>
                {i < arr.length - 1 && <ChevronRight className="w-3 h-3 text-muted-foreground/30" />}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Hive badge */}
      <div className="px-4 py-2 border-b border-border flex items-center gap-2 flex-shrink-0">
        <Badge variant="outline" className={`text-xs ${program.registry_hive === 'HKCU' ? 'border-warning/40 text-warning' : 'border-primary/40 text-primary'}`}>
          {program.registry_hive || 'HKLM'}
        </Badge>
        <Badge variant="outline" className="text-xs border-border text-muted-foreground">
          {program.architecture || 'x64'}
        </Badge>
        {program.is_system && (
          <Badge variant="outline" className="text-xs border-muted-foreground/30 text-muted-foreground">System</Badge>
        )}
      </div>

      {/* Values */}
      <div className="flex-1 overflow-auto p-4 space-y-1">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Registry Values</p>
        {fields.map(f => (
          <RegistryValueRow
            key={f.name}
            name={f.name}
            value={f.value}
            onSave={(name, val) => onSaveValue(program.registry_key_path, name, val)}
            onDelete={(name) => onSaveValue(program.registry_key_path, name, '')}
          />
        ))}
        {fields.length === 0 && (
          <p className="text-xs text-muted-foreground/50 text-center py-8">No registry values found</p>
        )}
      </div>

      <Separator className="bg-border" />

      {/* Danger zone */}
      <div className="p-4 flex-shrink-0">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
          <span className="text-xs font-medium text-destructive uppercase tracking-wider">Danger Zone</span>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="w-full border-destructive/30 text-destructive hover:bg-destructive/10 text-xs gap-2">
              <Trash2 className="w-3.5 h-3.5" />
              Delete Registry Entry
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-card border-border">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete registry entry for {program.name}?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the entire registry key at:<br />
                <code className="text-xs font-mono text-foreground">{program.registry_key_path}</code><br /><br />
                This action cannot be undone and may affect how Windows tracks this software.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={() => onDeleteKey(program.registry_key_path)}>
                Delete Entry
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}