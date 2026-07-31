'use client';

import React, { useState, useEffect, useMemo } from 'react';

interface CharToken {
  char: string;
  isBold: boolean;
}

interface TypewriterProps {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
  showCursor?: boolean;
  onComplete?: () => void;
}

export default function Typewriter({
  text,
  speed = 15,
  delay = 0,
  className = '',
  showCursor = true,
  onComplete
}: TypewriterProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Tokenize markdown bold text
  const tokens = useMemo(() => {
    const chars: CharToken[] = [];
    // Split by markdown bold tags
    const parts = text.split(/(\*\*.*?\*\*)/g);
    
    parts.forEach(part => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const boldText = part.slice(2, -2);
        for (let i = 0; i < boldText.length; i++) {
          chars.push({ char: boldText[i], isBold: true });
        }
      } else {
        for (let i = 0; i < part.length; i++) {
          chars.push({ char: part[i], isBold: false });
        }
      }
    });
    
    return chars;
  }, [text]);

  useEffect(() => {
    // Reset state when text changes
    setCurrentIndex(0);
    setStarted(false);
    setCompleted(false);

    const startTimeout = setTimeout(() => {
      setStarted(true);
    }, delay);

    return () => clearTimeout(startTimeout);
  }, [text, delay]);

  useEffect(() => {
    if (!started || completed || tokens.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        const next = prev + 1;
        if (next >= tokens.length) {
          clearInterval(interval);
          setCompleted(true);
          if (onComplete) onComplete();
          return tokens.length;
        }
        return next;
      });
    }, speed);

    return () => clearInterval(interval);
  }, [started, completed, tokens, speed, onComplete]);

  // Render tokens up to current index
  const renderedContent = useMemo(() => {
    const displayedTokens = tokens.slice(0, currentIndex);
    const elements: React.ReactNode[] = [];
    let currentSegment = '';
    let currentIsBold = false;
    let key = 0;

    const pushSegment = () => {
      if (!currentSegment) return;
      if (currentIsBold) {
        elements.push(<strong key={key++}>{currentSegment}</strong>);
      } else {
        elements.push(<span key={key++}>{currentSegment}</span>);
      }
      currentSegment = '';
    };

    displayedTokens.forEach(token => {
      if (token.char === '\n') {
        pushSegment();
        elements.push(<br key={key++} />);
        currentIsBold = token.isBold;
      } else {
        if (token.isBold !== currentIsBold) {
          pushSegment();
          currentIsBold = token.isBold;
        }
        currentSegment += token.char;
      }
    });
    pushSegment();

    return elements;
  }, [tokens, currentIndex]);

  return (
    <span className={className}>
      {renderedContent}
      {showCursor && !completed && (
        <span className="typewriterCursor" />
      )}
    </span>
  );
}
