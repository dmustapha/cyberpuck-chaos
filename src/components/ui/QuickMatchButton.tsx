// File: src/components/ui/QuickMatchButton.tsx
'use client';

interface QuickMatchButtonProps {
  onQuickMatch: () => void;
  onCancel: () => void;
  isSearching: boolean;
}

export function QuickMatchButton({
  onQuickMatch,
  onCancel,
  isSearching,
}: QuickMatchButtonProps) {
  if (isSearching) {
    return (
      <button
        onClick={onCancel}
        className="w-full py-4 rounded-xl text-lg font-bold tracking-wider border border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10 transition-colors"
        style={{
          background: 'rgba(10, 10, 30, 0.6)',
          backdropFilter: 'blur(8px)',
          fontFamily: "'Orbitron', monospace",
        }}
      >
        <span className="animate-pulse">SEARCHING...</span>
        <span className="text-xs block mt-1 opacity-60 font-normal tracking-normal">
          Tap to cancel
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={onQuickMatch}
      className="w-full py-4 rounded-xl text-lg font-bold tracking-wider border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10 transition-colors"
      style={{
        background: 'rgba(10, 10, 30, 0.6)',
        backdropFilter: 'blur(8px)',
        fontFamily: "'Orbitron', monospace",
      }}
    >
      QUICK MATCH
    </button>
  );
}
