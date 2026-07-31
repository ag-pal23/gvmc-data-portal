'use client';

import React from 'react';
import styles from './GVMCWatermark.module.css';

/**
 * GVMCWatermark — Fixed full-screen stamp-style watermark
 * with liquid morphism animated blobs in the background.
 * Renders a repeating grid of "GVMC" text stamps diagonally
 * across the entire viewport on every page.
 */
export default function GVMCWatermark() {
  // Generate a grid of GVMC stamps
  const stamps = Array.from({ length: 48 }, (_, i) => (
    <span key={i} className={styles.stamp}>GVMC</span>
  ));

  return (
    <div className={styles.watermarkContainer} aria-hidden="true">
      {/* Liquid morphism animated blobs */}
      <div className={styles.liquidBlob1} />
      <div className={styles.liquidBlob2} />
      <div className={styles.liquidBlob3} />
      <div className={styles.liquidBlob4} />

      {/* Ambient background glows */}
      <div className={styles.radialGlow1} />
      <div className={styles.radialGlow2} />

      {/* Repeating GVMC stamp grid */}
      <div className={styles.stampGrid}>
        {stamps}
      </div>

      {/* Large centered hero stamp */}
      <div className={styles.heroStamp}>
        <div className={styles.heroStampInner}>
          <div className={styles.heroRing}>
            <span className={styles.heroText}>GVMC</span>
            <span className={styles.heroSubtext}>GREATER VISAKHAPATNAM</span>
            <span className={styles.heroSubtext}>MUNICIPAL CORPORATION</span>
          </div>
        </div>
      </div>
    </div>
  );
}
