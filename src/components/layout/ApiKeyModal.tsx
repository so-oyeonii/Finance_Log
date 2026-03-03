'use client';

import { useState, useEffect } from 'react';
import { X, Eye, EyeOff, Trash2 } from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ApiKeyModal({ isOpen, onClose }: ApiKeyModalProps) {
  const { openaiApiKey, setOpenaiApiKey } = useAppStore();
  const [inputKey, setInputKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setInputKey(openaiApiKey);
      setShowKey(false);
    }
  }, [isOpen, openaiApiKey]);

  if (!isOpen) return null;

  const maskedKey = openaiApiKey
    ? `${openaiApiKey.slice(0, 3)}...${openaiApiKey.slice(-4)}`
    : '';

  const handleSave = () => {
    setOpenaiApiKey(inputKey.trim());
    onClose();
  };

  const handleDelete = () => {
    setOpenaiApiKey('');
    setInputKey('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-bold">OpenAI API Key 설정</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {openaiApiKey && (
            <p className="text-sm text-gray-500">
              현재 저장된 키: <code className="bg-gray-100 px-1 rounded">{maskedKey}</code>
            </p>
          )}

          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="sk-..."
              className="w-full border rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <p className="text-xs text-gray-400">
            키는 브라우저(IndexedDB)에 저장되며 서버에 전송되지 않습니다.
          </p>
        </div>

        <div className="flex justify-between p-4 border-t">
          <button
            onClick={handleDelete}
            disabled={!openaiApiKey}
            className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1 disabled:opacity-30"
          >
            <Trash2 className="w-4 h-4" />
            삭제
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={!inputKey.trim()}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
