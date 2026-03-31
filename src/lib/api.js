// Local backend API client
// The local server should run on http://localhost:5001

const BASE_URL = 'http://localhost:5001';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const localApi = {
  // Check if the local server is reachable
  ping: () => request('/ping'),

  // Get all installed programs from registry
  getPrograms: () => request('/programs'),

  // Get registry details for a specific program
  getProgramRegistry: (registryKeyPath) =>
    request(`/registry?key=${encodeURIComponent(registryKeyPath)}`),

  // Update a registry value
  updateRegistryValue: (keyPath, valueName, newValue) =>
    request('/registry/update', {
      method: 'POST',
      body: JSON.stringify({ keyPath, valueName, newValue }),
    }),

  // Delete a registry key
  deleteRegistryKey: (keyPath) =>
    request('/registry/delete', {
      method: 'POST',
      body: JSON.stringify({ keyPath }),
    }),

  // Check for update for a single program
  checkUpdate: (programName, currentVersion) =>
    request('/check-update', {
      method: 'POST',
      body: JSON.stringify({ programName, currentVersion }),
    }),

  // Batch check updates for all programs
  checkAllUpdates: () => request('/check-updates-all', { method: 'POST' }),
};