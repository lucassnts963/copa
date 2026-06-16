'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { createPool } from '../_lib/bolao';

export default function CreatePoolModal({ onClose, onCreated }) {
  const [title, setTitle] = useState('');
  const [ownerName, setOwnerName] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim() || !ownerName.trim()) return;
    const pool = createPool(title.trim(), ownerName.trim());
    onCreated(pool);
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-white text-lg">Criar Bolão</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">Nome do bolão</label>
            <input
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ex: Copa da Família"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-400"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">Seu nome</label>
            <input
              value={ownerName}
              onChange={e => setOwnerName(e.target.value)}
              placeholder="Ex: Lucas"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-400"
            />
          </div>
          <button
            type="submit"
            disabled={!title.trim() || !ownerName.trim()}
            className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:opacity-40 text-black font-bold py-2.5 rounded-lg text-sm transition-colors"
          >
            Criar bolão
          </button>
        </form>
      </div>
    </div>
  );
}
