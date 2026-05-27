import { useState, useEffect } from 'react';
import type { SavedOpportunity } from '@/types';

/**
 * Reusable hook to fetch saved opportunities from the API.
 * Handles loading, error, and optimistic UI updates.
 */
export const useSavedOpportunities = () => {
  const [savedOpps, setSavedOpps] = useState<SavedOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSaved = async () => {
    try {
      const res = await fetch('/api/saved');
      if (!res.ok) throw new Error('Failed to load saved opportunities');
      const data = await res.json();
      setSavedOpps(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const updateSaved = async (id: string, field: string, value: string) => {
    // Optimistic update
    setSavedOpps(prev =>
      prev.map(o => (o.id === id ? { ...o, [field]: value } : o))
    );
    try {
      const res = await fetch(`/api/saved/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      });
      if (!res.ok) throw new Error('Failed to update');
    } catch (err) {
      console.error(err);
      // Re-fetch on error to sync state
      fetchSaved();
    }
  };

  const removeSaved = async (id: string) => {
    if (!confirm('Are you sure you want to remove this from your tracker?')) return;
    setSavedOpps(prev => prev.filter(o => o.id !== id));
    try {
      const res = await fetch(`/api/saved/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to remove');
    } catch (err) {
      console.error(err);
      fetchSaved();
    }
  };

  return { savedOpps, loading, error, updateSaved, removeSaved };
};
