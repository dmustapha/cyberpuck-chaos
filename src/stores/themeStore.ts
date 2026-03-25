import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ThemeId, themes, Theme } from '@/lib/themes';

interface ThemeStore {
  themeId: ThemeId;
  theme: Theme;
  setTheme: (id: ThemeId) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      themeId: 'cyber',
      theme: themes.cyber,
      setTheme: (id: ThemeId) =>
        set({
          themeId: id,
          theme: themes[id],
        }),
    }),
    {
      name: 'air-hockey-theme',
    }
  )
);
