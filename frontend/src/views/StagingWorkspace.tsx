import React, { useState } from 'react';
import { api } from '../lib/api';
import { Loader2 } from 'lucide-react';
import type { TransactionBase } from '../lib/api';

export default function StagingWorkspace() {
  const [text, setText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [parsedData, setParsedData] = useState<TransactionBase[] | null>(null);

  const handleExtract = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const result = await api.extractTransactions(text);
      setParsedData(result.transactions);
    } catch (e) {
      console.log(e);
      alert("Extraction failed. Check the terminal logs.");
    }
    setLoading(false);
  };

  const handleCommit = async () => {
    if (!parsedData) return;
    try {
      await api.saveTransactions(parsedData);
      alert("Successfully saved to database!");
      setParsedData(null);
      setText('');
    } catch (e) {
      console.log(e);
      alert("Failed to commit data.");
    }
  };

  const handleJsonEdit = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    try {
      setParsedData(JSON.parse(e.target.value));
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-6 h-[600px]">
      <div className="flex flex-col h-full">
        <h2 className="text-lg font-bold mb-2">Raw Notes</h2>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your unstructured spending notes here...(Avoid duplicated notes)"
          className="flex-grow p-4 rounded-xl border border-slate-300 resize-none focus:ring-2 focus:ring-indigo-500 outline-none"
        />
        <button
          onClick={handleExtract}
          disabled={loading || !text}
          className="mt-4 bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 flex justify-center items-center gap-2"
        >
          {loading && <Loader2 className="animate-spin" size={18} />}
          {loading ? 'LLM is Processing...' : 'Extract Data'}
        </button>
      </div>

      <div className="flex flex-col h-full">
        <h2 className="text-lg font-bold mb-2">Parsed JSON Review</h2>
        <textarea
          value={parsedData ? JSON.stringify(parsedData, null, 2) : ''}
          onChange={handleJsonEdit}
          placeholder="Awaiting extraction..."
          className="flex-grow p-4 font-mono text-sm bg-slate-900 text-green-400 rounded-xl resize-none outline-none"
        />
        <button
          onClick={handleCommit}
          disabled={!parsedData || parsedData.length === 0}
          className="mt-4 bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 disabled:opacity-50"
        >
          Confirm & Commit to Database
        </button>
      </div>
    </div>
  );
}