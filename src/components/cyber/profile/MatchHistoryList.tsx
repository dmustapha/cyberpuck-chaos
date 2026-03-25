'use client';

/**
 * MatchHistoryList - Paginated match history display
 */

import React, { useState } from 'react';
import { cyberTheme } from '@/lib/cyber/theme';
import { useMatchHistoryStore } from '@/stores/matchHistoryStore';
import { HUDPanel } from '../ui/HUDPanel';
import { CyberButton } from '../ui/CyberButton';
import { StatusBadge } from '../ui/StatusBadge';
import { formatRelativeTime, formatDuration } from '@/lib/cyber/utils';

interface MatchHistoryListProps {
  className?: string;
}

const PAGE_SIZE = 5;

export function MatchHistoryList({ className = '' }: MatchHistoryListProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const matches = useMatchHistoryStore((state) => state.matches);
  const getMatchesPage = useMatchHistoryStore((state) => state.getMatchesPage);
  const getTotalPages = useMatchHistoryStore((state) => state.getTotalPages);

  const pageMatches = getMatchesPage(currentPage, PAGE_SIZE);
  const totalPages = getTotalPages(PAGE_SIZE);

  if (matches.length === 0) {
    return (
      <HUDPanel className={className} padding="lg">
        <h3
          className="text-lg font-bold uppercase tracking-wider mb-4"
          style={{
            color: cyberTheme.colors.text.primary,
            fontFamily: cyberTheme.fonts.heading,
          }}
        >
          Match History
        </h3>
        <div
          className="text-center py-8"
          style={{ color: cyberTheme.colors.text.muted }}
        >
          No matches played yet. Start playing to see your history!
        </div>
      </HUDPanel>
    );
  }

  return (
    <HUDPanel className={className} padding="lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-lg font-bold uppercase tracking-wider"
          style={{
            color: cyberTheme.colors.text.primary,
            fontFamily: cyberTheme.fonts.heading,
          }}
        >
          Match History
        </h3>
        <span
          className="text-sm"
          style={{ color: cyberTheme.colors.text.muted }}
        >
          {matches.length} matches
        </span>
      </div>

      {/* Match list */}
      <div className="space-y-3">
        {pageMatches.map((match) => (
          <div
            key={match.id}
            className="p-4 rounded-lg"
            style={{
              backgroundColor: cyberTheme.colors.bg.tertiary,
              borderLeft: `4px solid ${
                match.result === 'win'
                  ? cyberTheme.colors.success
                  : cyberTheme.colors.error
              }`,
            }}
          >
            <div className="flex items-center justify-between mb-2">
              {/* Result and score */}
              <div className="flex items-center gap-3">
                <span
                  className="font-bold uppercase"
                  style={{
                    color:
                      match.result === 'win'
                        ? cyberTheme.colors.success
                        : cyberTheme.colors.error,
                    fontFamily: cyberTheme.fonts.heading,
                  }}
                >
                  {match.result === 'win' ? 'VICTORY' : 'DEFEAT'}
                </span>
                <span
                  className="text-lg font-bold"
                  style={{
                    color: cyberTheme.colors.text.primary,
                    fontFamily: cyberTheme.fonts.heading,
                  }}
                >
                  {match.playerScore} - {match.opponentScore}
                </span>
              </div>

              {/* Match type badge */}
              <StatusBadge status={match.type} size="sm" />
            </div>

            {/* Match details */}
            <div className="flex items-center gap-4 text-sm">
              <span style={{ color: cyberTheme.colors.text.secondary }}>
                vs {match.opponentName}
              </span>
              <span style={{ color: cyberTheme.colors.text.muted }}>•</span>
              <span style={{ color: cyberTheme.colors.text.muted }}>
                {formatDuration(match.duration)}
              </span>
              <span style={{ color: cyberTheme.colors.text.muted }}>•</span>
              <span style={{ color: cyberTheme.colors.text.muted }}>
                {formatRelativeTime(match.timestamp)}
              </span>
            </div>

            {/* ELO and XP changes */}
            <div className="flex items-center gap-4 mt-2">
              <span
                className="text-sm font-bold"
                style={{
                  color:
                    match.eloChange >= 0
                      ? cyberTheme.colors.success
                      : cyberTheme.colors.error,
                }}
              >
                {match.eloChange >= 0 ? '+' : ''}
                {match.eloChange} ELO
              </span>
              <span
                className="text-sm font-bold"
                style={{ color: cyberTheme.colors.primary }}
              >
                +{match.xpGained} XP
              </span>
              {match.perfectGame && (
                <span
                  className="text-xs px-2 py-0.5 rounded"
                  style={{
                    backgroundColor: `${cyberTheme.colors.rank.GOLD}20`,
                    color: cyberTheme.colors.rank.GOLD,
                  }}
                >
                  PERFECT
                </span>
              )}
              {match.comebackWin && (
                <span
                  className="text-xs px-2 py-0.5 rounded"
                  style={{
                    backgroundColor: `${cyberTheme.colors.warning}20`,
                    color: cyberTheme.colors.warning,
                  }}
                >
                  COMEBACK
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-4">
          <CyberButton
            variant="ghost"
            size="sm"
            disabled={currentPage === 0}
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
          >
            Previous
          </CyberButton>
          <span
            className="text-sm"
            style={{ color: cyberTheme.colors.text.secondary }}
          >
            Page {currentPage + 1} of {totalPages}
          </span>
          <CyberButton
            variant="ghost"
            size="sm"
            disabled={currentPage >= totalPages - 1}
            onClick={() =>
              setCurrentPage((p) => Math.min(totalPages - 1, p + 1))
            }
          >
            Next
          </CyberButton>
        </div>
      )}
    </HUDPanel>
  );
}

export default MatchHistoryList;
