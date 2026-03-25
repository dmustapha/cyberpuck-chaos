'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useDesignStyles } from '../../useDesignStyles';
import { useDesign } from '../../DesignContext';
import { motion } from 'framer-motion';

interface ThemedLayoutProps {
  children: ReactNode;
}

export function ThemedLayout({ children }: ThemedLayoutProps) {
  const styles = useDesignStyles();
  const { config } = useDesign();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div
      className="themed-layout"
      style={{
        minHeight: '100vh',
        backgroundColor: styles.colors.bg.primary,
        color: styles.colors.text.primary,
        fontFamily: styles.fonts.body,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Effect Layer */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          background: config.backgroundGradient || styles.colors.bg.primary,
        }}
      />

      {/* Grid Effect (for synthwave, tokyo-drift) */}
      {config.effects.scanlines && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1,
            backgroundImage: 'linear-gradient(0deg, transparent 50%, rgba(0, 0, 0, 0.1) 50%)',
            backgroundSize: '100% 4px',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* CRT Curve Effect */}
      {config.effects.crtCurve && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1,
            borderRadius: '20px',
            boxShadow: 'inset 0 0 100px rgba(0, 0, 0, 0.5)',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Main Content */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        {children}
      </div>
    </div>
  );
}
