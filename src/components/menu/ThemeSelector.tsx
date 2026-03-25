'use client';

import { useThemeStore } from '@/stores/themeStore';
import { themeList, ThemeId } from '@/lib/themes';
import { Button } from '@/components/ui/Button';

interface ThemeSelectorProps {
  onBack: () => void;
}

export function ThemeSelector({ onBack }: ThemeSelectorProps) {
  const { themeId, theme, setTheme } = useThemeStore();

  const getPreviewStyle = (id: ThemeId) => {
    const t = themeList.find((th) => th.id === id)!;
    return {
      background: t.colors.table,
      borderColor: t.colors.tableBorder,
    };
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen p-8 transition-colors duration-500"
      style={{ background: theme.colors.backgroundGradient || theme.colors.background }}
    >
      <h2
        className="text-4xl font-bold mb-2"
        style={{ color: theme.colors.text }}
      >
        Choose Theme
      </h2>
      <p
        className="text-sm mb-8"
        style={{ color: theme.colors.textMuted }}
      >
        Select your visual style
      </p>

      <div className="grid grid-cols-1 gap-4 w-full max-w-md mb-8">
        {themeList.map((t) => (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            className={`p-4 rounded-xl border-2 transition-all text-left flex items-center gap-4 ${
              themeId === t.id
                ? 'scale-[1.02]'
                : 'hover:scale-[1.01] opacity-80 hover:opacity-100'
            }`}
            style={{
              background: themeId === t.id
                ? `${t.colors.primary}20`
                : `${t.colors.background}80`,
              borderColor: themeId === t.id
                ? t.colors.primary
                : t.colors.tableBorder + '40',
            }}
          >
            {/* Theme preview */}
            <div
              className="w-16 h-20 rounded-lg border-2 flex-shrink-0 relative overflow-hidden"
              style={getPreviewStyle(t.id)}
            >
              {/* Mini table */}
              <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 w-full h-px"
                style={{ background: t.colors.centerLine }}
              />
              {/* Mini puck */}
              <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
                style={{ background: t.colors.puck }}
              />
              {/* Mini paddles */}
              <div
                className="absolute left-1/2 top-2 -translate-x-1/2 w-3 h-3 rounded-full"
                style={{ background: t.colors.paddle2 }}
              />
              <div
                className="absolute left-1/2 bottom-2 -translate-x-1/2 w-3 h-3 rounded-full"
                style={{ background: t.colors.paddle1 }}
              />
            </div>

            {/* Theme info */}
            <div className="flex-1">
              <div
                className="text-lg font-bold"
                style={{ color: t.colors.text }}
              >
                {t.name}
              </div>
              <div
                className="text-sm"
                style={{ color: t.colors.textMuted }}
              >
                {t.description}
              </div>
              {/* Effect badges */}
              <div className="flex gap-2 mt-2">
                {t.effects.glowIntensity > 0 && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      background: t.colors.primary + '30',
                      color: t.colors.primary,
                    }}
                  >
                    Glow
                  </span>
                )}
                {t.effects.trailEffect && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      background: t.colors.secondary + '30',
                      color: t.colors.secondary,
                    }}
                  >
                    Trail
                  </span>
                )}
                {t.effects.scanlines && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      background: t.colors.accent + '30',
                      color: t.colors.accent,
                    }}
                  >
                    CRT
                  </span>
                )}
              </div>
            </div>

            {/* Selected indicator */}
            {themeId === t.id && (
              <div
                className="text-2xl"
                style={{ color: t.colors.primary }}
              >
                ✓
              </div>
            )}
          </button>
        ))}
      </div>

      <Button
        onClick={onBack}
        variant="secondary"
        size="md"
        style={{
          background: theme.colors.secondary + '20',
          color: theme.colors.text,
          borderColor: theme.colors.secondary,
        }}
      >
        Back
      </Button>
    </div>
  );
}
