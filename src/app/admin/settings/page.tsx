'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { toast } from 'sonner';

interface Prompt {
  id: string;
  name: string;
  templateText: string;
  promptType: string;
}

export default function AdminSettingsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null); // id of prompt being saved

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      const res = await fetch('/api/settings/prompts');
      const data = await res.json();
      if (res.ok) {
        const sortedPrompts = (data.prompts as Prompt[]).sort((a, b) => {
            const aName = a.name.toLowerCase();
            const bName = b.name.toLowerCase();
            
            const topOrder = ['prompt 1', 'prompt 2', 'prompt 3', 'prompt 4'];
            const bottomOrder = ['market analysis template v1', 'translation template v1'];

            const getTopIndex = (name: string) => topOrder.findIndex(p => name.includes(p));
            const getBottomIndex = (name: string) => bottomOrder.findIndex(p => name.includes(p));

            const aTop = getTopIndex(aName);
            const bTop = getTopIndex(bName);

            if (aTop !== -1 && bTop !== -1) return aTop - bTop;
            if (aTop !== -1) return -1;
            if (bTop !== -1) return 1;

            const aBottom = getBottomIndex(aName);
            const bBottom = getBottomIndex(bName);

            if (aBottom !== -1 && bBottom !== -1) return aBottom - bBottom;
            if (aBottom !== -1) return 1;
            if (bBottom !== -1) return -1;

            return 0;
        });
        setPrompts(sortedPrompts);
      } else {
        toast.error('Failed to fetch prompts');
      }
    } catch (error) {
      toast.error('Error fetching prompts');
    } finally {
      setLoading(false);
    }
  };

  const handleTextChange = (id: string, text: string) => {
    setPrompts(prev => prev.map(p => p.id === id ? { ...p, templateText: text } : p));
  };

  const handleSave = async (id: string) => {
    const prompt = prompts.find(p => p.id === id);
    if (!prompt) return;

    setSaving(id);
    try {
      const res = await fetch('/api/settings/prompts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, templateText: prompt.templateText }),
      });
      if (res.ok) {
        toast.success('Prompt updated successfully');
      } else {
        toast.error('Failed to update prompt');
      }
    } catch (error) {
      toast.error('Error updating prompt');
    } finally {
      setSaving(null);
    }
  };

  const handleFileUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      handleTextChange(id, text);
      toast.success('File content loaded into editor. Click Save to persist.');
    };
    reader.readAsText(file);
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-lg text-gray-600">Manage AI Prompts and Application Configuration</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">AI Prompt Templates</h2>
          {loading ? (
            <div className="text-center py-8">Loading prompts...</div>
          ) : (
            <div className="space-y-8">
              {prompts.map(prompt => (
                <div key={prompt.id} className="border-b border-gray-200 pb-8 last:border-0">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900">{prompt.name}</h3>
                        <p className="text-sm text-gray-500 capitalize">{prompt.promptType.replace('_', ' ')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            <span>Upload Text File</span>
                            <input type="file" accept=".txt" className="hidden" onChange={(e) => handleFileUpload(prompt.id, e)} />
                        </label>
                        <button
                            onClick={() => handleSave(prompt.id)}
                            disabled={saving === prompt.id}
                            className="bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {saving === prompt.id ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                  </div>
                  <textarea
                    value={prompt.templateText}
                    onChange={(e) => handleTextChange(prompt.id, e.target.value)}
                    rows={10}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md font-mono"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}