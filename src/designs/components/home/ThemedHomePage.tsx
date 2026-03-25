'use client';

import { useDesignStyles } from '../../useDesignStyles';
import { ThemedHeroSection } from './ThemedHeroSection';
import { ThemedProfilePreview } from './ThemedProfilePreview';
import { ThemedSeasonBanner } from './ThemedSeasonBanner';
import { ThemedQuickLinks } from './ThemedQuickLinks';

export function ThemedHomePage() {
  const styles = useDesignStyles();

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
      {/* Hero Section */}
      <ThemedHeroSection />

      {/* Main Content Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '2rem',
          marginTop: '3rem',
        }}
      >
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <ThemedProfilePreview />
          <ThemedSeasonBanner />
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <h2
              style={{
                fontFamily: styles.fonts.heading,
                fontSize: styles.fontSize['2xl'],
                fontWeight: 700,
                color: styles.colors.text.primary,
                marginBottom: '1rem',
              }}
            >
              Quick Play
            </h2>
            <ThemedQuickLinks />
          </div>
        </div>
      </div>
    </div>
  );
}
