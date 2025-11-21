import React, { useState, useEffect } from 'react';
import { updateSupabaseConfig } from '../lib/supabaseClient';
import { DB_SCHEMA_SQL } from '../lib/schema';
import { Database, Key, Check, Copy, Server, AlertTriangle } from 'lucide-react';

interface ConnectionManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConnectionManager: React.FC<ConnectionManagerProps> = ({ isOpen, onClose }) => {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [activeTab, setActiveTab] = useState<'credentials' | 'schema'>('credentials');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const storedUrl = localStorage.getItem('jewelerp_supabase_url');
    const storedKey = localStorage.getItem('jewelerp_supabase_key');
    if (storedUrl) setUrl(storedUrl);
    if (storedKey) setKey(storedKey);
  }, [isOpen]);

  const handleSave = () => {
    if (url && key) {
      updateSupabaseConfig(url, key);
    }
  };

  const handleCopySchema = () => {
    navigator.clipboard.writeText(DB_SCHEMA_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 text-white">
            <Server size={20} className="text-amber-500" />
            <h2 className="text-lg font-bold">Backend Connection</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">✕</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('credentials')}
            className={`flex-1 py-3 text-sm font-medium ${activeTab === 'credentials' ? 'text-amber-600 border-b-2 border-amber-500 bg-amber-50' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            1. Connection Keys
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`flex-1 py-3 text-sm font-medium ${activeTab === 'schema' ? 'text-amber-600 border-b-2 border-amber-500 bg-amber-50' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            2. Database Setup (SQL)
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {activeTab === 'credentials' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3 items-start">
                <Database className="text-blue-600 shrink-0 mt-0.5" size={18} />
                <div className="text-sm text-blue-800">
                  <p className="font-bold mb-1">Connect to your Database</p>
                  <p>Create a project at <a href="https://supabase.com" target="_blank" rel="noreferrer" className="underline">supabase.com</a>, then find your URL and Anon Key in <strong>Project Settings &gt; API</strong>.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Project URL</label>
                  <div className="relative">
                    <Server className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="text" 
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono text-sm"
                      placeholder="https://your-project.supabase.co"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">API Key (public/anon)</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="password" 
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono text-sm"
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      value={key}
                      onChange={(e) => setKey(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button 
                  onClick={handleSave}
                  className="w-full bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                >
                  <Check size={18} /> Save & Connect
                </button>
                <p className="text-xs text-center text-slate-500 mt-2">Credentials are saved locally in your browser.</p>
              </div>
            </div>
          )}

          {activeTab === 'schema' && (
            <div className="space-y-4">
               <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3 items-start">
                <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={18} />
                <div className="text-sm text-amber-800">
                  <p className="font-bold mb-1">Prepare your Database</p>
                  <p>Run the SQL below in your Supabase <strong>SQL Editor</strong> to create the necessary tables for JewelERP.</p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute top-2 right-2">
                  <button 
                    onClick={handleCopySchema}
                    className="bg-slate-800 hover:bg-slate-700 text-white text-xs px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Copied!' : 'Copy SQL'}
                  </button>
                </div>
                <pre className="bg-slate-900 text-slate-200 p-4 rounded-lg text-xs font-mono overflow-x-auto h-64 leading-relaxed border border-slate-700">
                  {DB_SCHEMA_SQL}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};