import React from 'react';
import styles from './Badge.module.css';

interface BadgeProps {
  label: string;
  tone?: 'info' | 'success' | 'warning' | 'danger' | 'neutral';
  icon?: React.ReactNode;
}

export default function Badge({ label, tone = 'neutral', icon }: BadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[tone]}`}>
      {icon && <span aria-hidden="true">{icon}</span>}
      {label}
    </span>
  );
}
