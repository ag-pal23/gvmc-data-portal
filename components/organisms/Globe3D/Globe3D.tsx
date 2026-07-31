'use client';

import React, { useRef, useEffect, useState } from 'react';
import styles from './Globe3D.module.css';

// Coordinates of Visakhapatnam (83.3° E, 17.7° N)
const TARGET_LON = 83.30;
const TARGET_LAT = 17.68;

// Convert lat/lon to 3D Cartesian coordinates on unit sphere
function latLonToCartesian(lat: number, lon: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return {
    x: -Math.sin(phi) * Math.sin(theta),
    y: Math.cos(phi),
    z: Math.sin(phi) * Math.cos(theta),
  };
}

export default function Globe3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoomFactor, setZoomFactor] = useState(0); // 0 = global, 1 = fully zoomed to Vizag

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = 0;
    let height = 0;

    // Globe state
    let scale = 180;
    let rotationX = 0.3; // pitch
    let rotationY = 0.5; // yaw
    let autoSpinY = 0.003;

    // Target rotation to center Visakhapatnam
    // In our coordinate system, to center a lat/lon:
    // targetRotationY needs to align with TARGET_LON
    // targetRotationX needs to align with TARGET_LAT
    const targetRotY = -TARGET_LON * (Math.PI / 180) - Math.PI / 2;
    const targetRotX = TARGET_LAT * (Math.PI / 180);

    // Current interpolation target
    let currentZoom = 0; // target zoom factor
    let isHovered = false;

    // Generate grid points of the globe (latitudes & longitudes)
    const points: { x: number; y: number; z: number; isGrid: boolean }[] = [];
    
    // Add standard grid lines points
    for (let lat = -80; lat <= 80; lat += 10) {
      for (let lon = -180; lon < 180; lon += 10) {
        const pt = latLonToCartesian(lat, lon);
        points.push({ ...pt, isGrid: true });
      }
    }

    // Add outline markers for India & AP region for high-fidelity contextual look when zooming
    const apOutline: { lat: number; lon: number }[] = [];
    for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
      // Draw a boundary outline cluster around Visakhapatnam
      apOutline.push({
        lat: TARGET_LAT + Math.sin(angle) * (1.2 + Math.sin(angle * 3) * 0.3),
        lon: TARGET_LON + Math.cos(angle) * (1.2 + Math.cos(angle * 2) * 0.2),
      });
    }
    const outlinePoints = apOutline.map(pt => ({
      ...latLonToCartesian(pt.lat, pt.lon),
      isGrid: false
    }));

    // Target Cartesian coords
    const vizagPt = latLonToCartesian(TARGET_LAT, TARGET_LON);

    const handleResize = () => {
      if (!canvas || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Scroll listener to drive zoom transitions
    const handleScroll = () => {
      const scrollY = window.scrollY;
      // Zoom in dynamically based on scroll distance (fully zoomed at 400px scroll)
      const factor = Math.min(Math.max(scrollY / 400, 0), 1);
      currentZoom = factor;
      setZoomFactor(factor);
    };

    window.addEventListener('scroll', handleScroll);

    // Mouse interactive events
    const handleMouseMove = () => {
      // Slight hover interaction zooms in slightly
      if (currentZoom < 0.2) {
        currentZoom = 0.25;
        setZoomFactor(0.25);
      }
      isHovered = true;
    };

    const handleMouseLeave = () => {
      isHovered = false;
      if (window.scrollY === 0) {
        currentZoom = 0;
        setZoomFactor(0);
      }
    };

    const canvasElem = canvas;
    canvasElem.addEventListener('mousemove', handleMouseMove);
    canvasElem.addEventListener('mouseleave', handleMouseLeave);

    // Animation Loop
    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Smoothly interpolate parameters based on current zoom factor
      const zoom = currentZoom;
      scale = 180 + (1200 - 180) * Math.pow(zoom, 1.8);

      // Interpolate rotation angles towards targeting Visakhapatnam
      if (zoom > 0.05) {
        // Slow down and align Y rotation (yaw)
        const diffY = targetRotY - rotationY;
        rotationY += diffY * 0.1;
        
        // Align X rotation (pitch)
        const diffX = targetRotX - rotationX;
        rotationX += diffX * 0.1;
      } else {
        // Normal spinning mode
        rotationY += autoSpinY;
        const diffX = 0.3 - rotationX;
        rotationX += diffX * 0.05;
      }

      const cx = width / 2;
      const cy = height / 2;

      // Rotation matrix values
      const cosX = Math.cos(rotationX);
      const sinX = Math.sin(rotationX);
      const cosY = Math.cos(rotationY);
      const sinY = Math.sin(rotationY);

      // Helper to project 3D point to 2D screen
      const project = (pt: { x: number; y: number; z: number }) => {
        // Rotate Y (longitude)
        const x1 = pt.x * cosY - pt.z * sinY;
        const z1 = pt.x * sinY + pt.z * cosY;

        // Rotate X (latitude)
        const y2 = pt.y * cosX - z1 * sinX;
        const z2 = pt.y * sinX + z1 * cosX;

        return {
          x: cx + x1 * scale,
          y: cy - y2 * scale,
          z: z2, // Depth factor
        };
      };

      // Draw atmospheric glow ring
      const radius = scale;
      const grad = ctx.createRadialGradient(cx, cy, radius * 0.8, cx, cy, radius * 1.1);
      grad.addColorStop(0, 'rgba(11, 95, 255, 0.05)');
      grad.addColorStop(0.8, 'rgba(11, 95, 255, 0.15)');
      grad.addColorStop(1, 'rgba(11, 95, 255, 0)');
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.1, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Draw grid lines (render longitude and latitude bands)
      ctx.strokeStyle = 'var(--color-border-light)';
      ctx.lineWidth = 0.5;

      // Draw points (particle cloud)
      points.forEach(pt => {
        const proj = project(pt);
        // Only draw points on the front hemisphere (z > 0)
        if (proj.z > 0) {
          const opacity = Math.min(proj.z * 1.2, 0.7) * (1 - zoom * 0.8);
          ctx.fillStyle = `rgba(11, 95, 255, ${opacity})`;
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Draw region outline points as zoom increases
      if (zoom > 0.15) {
        ctx.beginPath();
        outlinePoints.forEach((pt, idx) => {
          const proj = project(pt);
          if (proj.z > 0) {
            if (idx === 0) ctx.moveTo(proj.x, proj.y);
            else ctx.lineTo(proj.x, proj.y);
          }
        });
        ctx.closePath();
        ctx.strokeStyle = `rgba(14, 159, 110, ${Math.min((zoom - 0.15) * 2, 0.4)})`;
        ctx.lineWidth = 1 + zoom * 2;
        ctx.stroke();
      }

      // Draw TARGET (Visakhapatnam locator)
      const vizagProj = project(vizagPt);
      if (vizagProj.z > 0) {
        // Glowing target ring
        const glowRadius = 8 + Math.sin(Date.now() * 0.005) * 4 + zoom * 10;
        ctx.beginPath();
        ctx.arc(vizagProj.x, vizagProj.y, glowRadius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.8)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Inner solid dot
        ctx.beginPath();
        ctx.arc(vizagProj.x, vizagProj.y, 4 + zoom * 2, 0, Math.PI * 2);
        ctx.fillStyle = '#F59E0B';
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Text label
        ctx.fillStyle = 'var(--color-text)';
        ctx.font = `bold ${11 + zoom * 4}px var(--font-family)`;
        ctx.textAlign = 'left';
        ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
        ctx.shadowBlur = 4;
        ctx.fillText('Visakhapatnam', vizagProj.x + 10 + zoom * 5, vizagProj.y + 4);
        ctx.shadowBlur = 0; // reset
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      canvasElem.removeEventListener('mousemove', handleMouseMove);
      canvasElem.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div ref={containerRef} className={styles.globeContainer}>
      <canvas ref={canvasRef} className={styles.canvas} />
      <div className={styles.interactiveArea} aria-hidden="true" />
    </div>
  );
}
