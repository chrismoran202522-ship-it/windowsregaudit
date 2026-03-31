import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Terminal, Copy, CheckCheck, AlertCircle, Server } from 'lucide-react';

const CODE_SERVER = `// server.js — Run: node server.js
const express = require('express');
const cors = require('cors');
const { execSync } = require('child_process');
const app = express();
app.use(cors());
app.use(express.json());

const REG_PATHS = [
  'HKLM\\\\SOFTWARE\\\\Microsoft\\\\Windows\\\\CurrentVersion\\\\Uninstall',
  'HKLM\\\\SOFTWARE\\\\WOW6432Node\\\\Microsoft\\\\Windows\\\\CurrentVersion\\\\Uninstall',
  'HKCU\\\\SOFTWARE\\\\Microsoft\\\\Windows\\\\CurrentVersion\\\\Uninstall',
];

function runReg(cmd) {
  try { return execSync(cmd, { encoding: 'utf8' }); } catch { return ''; }
}

function parseRegOutput(output) {
  const entries = [];
  const blocks = output.split(/\\r?\\n\\r?\\n/);
  for (const block of blocks) {
    const obj = {};
    for (const line of block.split(/\\r?\\n/)) {
      const m = line.match(/^\\s+"?([^"]+)"?\\s+REG_\\w+\\s+(.+)$/);
      if (m) obj[m[1].trim()] = m[2].trim();
    }
    if (obj.DisplayName) entries.push(obj);
  }
  return entries;
}

app.get('/ping', (_, res) => res.json({ ok: true }));

app.get('/programs', (_, res) => {
  const all = [];
  for (const path of REG_PATHS) {
    const hive = path.startsWith('HKCU') ? 'HKCU' : 'HKLM';
    const out = runReg(\`reg query "\${path}" /s\`);
    const parsed = parseRegOutput(out);
    for (const p of parsed) {
      all.push({
        name: p.DisplayName,
        publisher: p.Publisher || '',
        version: p.DisplayVersion || '',
        install_date: p.InstallDate || '',
        install_location: p.InstallLocation || '',
        registry_key_path: path,
        registry_hive: hive,
        uninstall_string: p.UninstallString || '',
        product_id: p.ProductCode || '',
        is_system: p.SystemComponent === '1',
        architecture: path.includes('WOW6432') ? 'x86' : 'x64',
      });
    }
  }
  res.json(all);
});

app.get('/registry', (req, res) => {
  const { key } = req.query;
  const out = runReg(\`reg query "\${key}" /s\`);
  res.json({ raw: out, key });
});

app.post('/registry/update', (req, res) => {
  const { keyPath, valueName, newValue } = req.body;
  runReg(\`reg add "\${keyPath}" /v "\${valueName}" /d "\${newValue}" /f\`);
  res.json({ ok: true });
});

app.post('/registry/delete', (req, res) => {
  const { keyPath } = req.body;
  runReg(\`reg delete "\${keyPath}" /f\`);
  res.json({ ok: true });
});

app.post('/check-update', async (req, res) => {
  const { programName, currentVersion } = req.body;
  // Stub: integrate with winget or your preferred update API
  res.json({ programName, currentVersion, latestVersion: null, updateAvailable: false });
});

app.post('/check-updates-all', (_, res) => {
  try {
    const out = execSync('winget upgrade', { encoding: 'utf8' });
    res.json({ raw: out });
  } catch {
    res.json({ raw: 'winget not available' });
  }
});

app.listen(5001, () => console.log('Registry API server running on port 5001'));`;

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
      {copied ? <CheckCheck className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

export default function ServerSetupGuide() {
  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center">
            <Server className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Local Server Setup</h1>
            <p className="text-sm text-muted-foreground">Required one-time setup to connect this app to your Windows registry</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 rounded-xl bg-warning/10 border border-warning/30">
          <AlertCircle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
          <p className="text-sm text-warning">
            The local server must run as <strong>Administrator</strong> to read/write registry keys.
            Open your terminal with "Run as Administrator".
          </p>
        </div>

        <Tabs defaultValue="setup">
          <TabsList className="bg-secondary">
            <TabsTrigger value="setup">Setup Steps</TabsTrigger>
            <TabsTrigger value="code">Server Code</TabsTrigger>
          </TabsList>

          <TabsContent value="setup" className="space-y-4 mt-4">
            {[
              { step: '1', title: 'Install Node.js', desc: 'Download and install Node.js from nodejs.org (v18+ recommended)', cmd: null },
              { step: '2', title: 'Install dependencies', desc: 'In a new folder, run:', cmd: 'npm init -y && npm install express cors' },
              { step: '3', title: 'Create server.js', desc: 'Copy the server code from the "Server Code" tab into a file named server.js' },
              { step: '4', title: 'Run as Administrator', desc: 'Right-click Terminal → Run as Administrator, then:', cmd: 'node server.js' },
              { step: '5', title: 'Refresh this page', desc: 'The app will auto-connect once the server is running on port 5001', cmd: null },
            ].map(({ step, title, desc, cmd }) => (
              <Card key={step} className="bg-card border-border">
                <CardContent className="p-4 flex items-start gap-4">
                  <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-semibold text-primary">{step}</span>
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-sm font-medium text-foreground">{title}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                    {cmd && (
                      <div className="flex items-center justify-between bg-muted rounded-lg px-3 py-2">
                        <code className="text-xs font-mono text-foreground">{cmd}</code>
                        <CopyButton text={cmd} />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="code" className="mt-4">
            <Card className="bg-card border-border">
              <CardHeader className="flex-row items-center justify-between p-4 pb-2">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-primary" />
                  <CardTitle className="text-sm">server.js</CardTitle>
                  <Badge variant="outline" className="text-xs">Node.js</Badge>
                </div>
                <CopyButton text={CODE_SERVER} />
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <pre className="text-xs font-mono text-muted-foreground overflow-auto max-h-96 bg-muted rounded-lg p-4 leading-relaxed">
                  {CODE_SERVER}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}