// File: src/components/ui/CopyCodeButton.tsx
'use client';

import { useState } from 'react';

interface CopyCodeButtonProps {
  code: string;
}

export function CopyCodeButton({ code }: CopyCodeButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = code;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border border-cyan-500/30 hover:bg-cyan-500/10 transition-colors"
      style={{ background: 'rgba(10, 10, 30, 0.4)' }}
    >
      <span className="font-mono text-cyan-400 tracking-[0.3em] text-lg">
        {code}
      </span>
      <span className="text-xs text-gray-400">
        {copied ? '✓ Copied' : 'Copy'}
      </span>
    </button>
  );
}
