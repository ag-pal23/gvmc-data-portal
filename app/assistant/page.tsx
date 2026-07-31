'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, Send, ThumbsUp, ThumbsDown, BookOpen, BarChart3 } from 'lucide-react';
import { aiResponses, type AIResponse } from '@/data/mock';
import styles from './page.module.css';
import Typewriter from '@/components/atoms/Typewriter/Typewriter';

const promptSuggestions = [
  "How many floors can I build on soft red soil in Madhurawada?",
  "Analyze soil oxygen levels and bearing capacity for Beach Road plot",
  "What is the water supply trend in Ward 12 this month?",
  "How many grievances were filed this week?",
  "Compare AQI across all zones for July 2026",
  "Show me datasets related to water",
  "Predict traffic congestion for tomorrow",
];

interface Message {
  role: 'user' | 'assistant';
  content: string;
  response?: AIResponse;
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [feedback, setFeedback] = useState<Record<number, 'up' | 'down'>>({});
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = (text?: string) => {
    const question = text || input.trim();
    if (!question) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: question }]);
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const matched = aiResponses.find(
        r => r.question.toLowerCase() === question.toLowerCase()
      );
      const response: AIResponse = matched || {
        question,
        answer: `I found some related information about "${question}". Based on the available civic datasets, here are some insights:\n\nThe GVMC platform contains multiple datasets that may help answer your question. I recommend exploring the **Open Datasets** section for detailed data.\n\nYou can also try rephrasing your question or browse specific dataset categories for more precise results.`,
        confidence: 'low',
        sources: [
          { dataset_id: "ds-water-001", title: "Water Supply Daily", updated: "2h ago" },
          { dataset_id: "ds-grievance-001", title: "Citizen Grievances", updated: "4h ago" },
        ],
      };

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.answer,
        response,
      }]);
      setIsTyping(false);
    }, 1200 + Math.random() * 800);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleFeedback = (idx: number, type: 'up' | 'down') => {
    setFeedback(prev => ({
      ...prev,
      [idx]: prev[idx] === type ? undefined as unknown as 'up' : type,
    }));
  };

  return (
    <div className={styles.page}>
      <div className={styles.chatContainer} ref={chatRef} role="log" aria-live="polite" aria-label="Chat messages">
        {messages.length === 0 ? (
          <div className={styles.welcome}>
            <div className={styles.welcomeIcon}>
              <Sparkles size={32} />
            </div>
            <h1 className={styles.welcomeTitle}>Ask GVMC</h1>
            <p className={styles.welcomeSubtitle}>
              Ask any question about Visakhapatnam&apos;s civic data. Get AI-powered answers with source citations.
            </p>
            <div className={styles.promptChips} role="list" aria-label="Suggested questions">
              {promptSuggestions.map((prompt) => (
                <button
                  key={prompt}
                  className={styles.chip}
                  onClick={() => handleSend(prompt)}
                  role="listitem"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`${styles.message} ${msg.role === 'user' ? styles.messageUser : ''}`}>
              <div className={`${styles.avatar} ${msg.role === 'user' ? styles.avatarUser : styles.avatarAssistant}`}>
                {msg.role === 'user' ? 'A' : <Sparkles size={18} />}
              </div>
              <div className={`${styles.bubble} ${msg.role === 'user' ? styles.bubbleUser : styles.bubbleAssistant}`}>
                <div className={styles.bubbleContent}>
                  {idx === messages.length - 1 && msg.role === 'assistant' ? (
                    <Typewriter text={msg.content} speed={10} showCursor={true} />
                  ) : (
                    msg.content.split('\n').map((line, i) => (
                      <p key={i}>
                        {line.split(/(\*\*.*?\*\*)/).map((part, j) =>
                          part.startsWith('**') && part.endsWith('**')
                            ? <strong key={j}>{part.slice(2, -2)}</strong>
                            : part
                        )}
                      </p>
                    ))
                  )}
                </div>

                {msg.response && (
                  <>
                    {/* Inline Chart */}
                    {msg.response.chartData && (
                      <div className={styles.inlineChart} aria-label="Chart visualization">
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '160px', padding: '0 8px' }}>
                          {msg.response.chartData.values.map((v, i) => {
                            const max = Math.max(...msg.response!.chartData!.values);
                            const height = (v / max) * 140;
                            return (
                              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>{v}</span>
                                <div style={{
                                  width: '100%', height: `${height}px`,
                                  background: `linear-gradient(to top, #0B5FFF, #7C3AED)`,
                                  borderRadius: '4px 4px 0 0',
                                  transition: 'height 0.5s ease',
                                  minWidth: '20px',
                                }} />
                                <span style={{ fontSize: '9px', color: 'var(--color-text-light)', textAlign: 'center', lineHeight: 1.2 }}>
                                  {msg.response!.chartData!.labels[i]}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Sources */}
                    <div className={styles.sources}>
                      <div className={styles.sourcesTitle}>
                        <BookOpen size={12} /> Sources ({msg.response.sources.length})
                        <span className={`${styles.confidence} ${
                          msg.response.confidence === 'high' ? styles.confidenceHigh :
                          msg.response.confidence === 'medium' ? styles.confidenceMedium :
                          styles.confidenceLow
                        }`}>
                          {msg.response.confidence === 'high' ? '🟢' : msg.response.confidence === 'medium' ? '🟡' : '🔴'} {msg.response.confidence}
                        </span>
                      </div>
                      {msg.response.sources.map((src) => (
                        <Link
                          key={src.dataset_id}
                          href={`/datasets/${src.dataset_id}`}
                          className={styles.sourceChip}
                        >
                          {src.title} · {src.updated}
                        </Link>
                      ))}
                    </div>

                    {/* Feedback */}
                    <div className={styles.feedback}>
                      <button
                        className={`${styles.feedbackBtn} ${feedback[idx] === 'up' ? styles.feedbackBtnActive : ''}`}
                        onClick={() => toggleFeedback(idx, 'up')}
                        aria-label="Helpful"
                        aria-pressed={feedback[idx] === 'up'}
                      >
                        <ThumbsUp size={14} />
                      </button>
                      <button
                        className={`${styles.feedbackBtn} ${feedback[idx] === 'down' ? styles.feedbackBtnActive : ''}`}
                        onClick={() => toggleFeedback(idx, 'down')}
                        aria-label="Not helpful"
                        aria-pressed={feedback[idx] === 'down'}
                      >
                        <ThumbsDown size={14} />
                      </button>
                      <Link href="/datasets" className={styles.feedbackBtn}>
                        <BarChart3 size={14} /> Explore Data
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))
        )}

        {isTyping && (
          <div className={styles.message}>
            <div className={`${styles.avatar} ${styles.avatarAssistant}`}>
              <Sparkles size={18} />
            </div>
            <div className={`${styles.bubble} ${styles.bubbleAssistant}`}>
              <div className={styles.typing}>
                <div className={styles.typingDot} />
                <div className={styles.typingDot} />
                <div className={styles.typingDot} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className={styles.inputArea}>
        <div className={styles.inputInner}>
          <textarea
            className={styles.inputField}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about Visakhapatnam's data..."
            aria-label="Type your question"
            rows={1}
          />
          <button
            className={styles.sendBtn}
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            aria-label="Send message"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
