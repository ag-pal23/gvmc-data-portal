'use client';

import React, { useState, useMemo } from 'react';
import { Search, Rocket, Lightbulb, ChevronRight, X, Star, Clock, Tag, TrendingUp } from 'lucide-react';
import styles from './page.module.css';

// ─────────────────────────────────────────────────────────
//  DATA — Add more ideas here as needed
// ─────────────────────────────────────────────────────────

type Difficulty = 'Easy' | 'Medium' | 'Hard';
type Tier = 1 | 2 | 3;

interface Idea {
  id: string;
  tier: Tier;
  emoji: string;
  title: string;
  tagline: string;
  description: string;
  fullDescription: string;
  category: string;
  difficulty: Difficulty;
  timeToLaunch: string;
  budgetRange: string;
  budgetUSD: string;
  steps: string[];
  tools: string[];
  earning: string;
}

const IDEAS: Idea[] = [
  // ══════════════════════════ TIER 1 — Low Budget ══════════════════════════
  {
    id: 'freelance-design',
    tier: 1, emoji: '🎨',
    title: 'Freelance Graphic Design',
    tagline: 'Turn creativity into cash — design logos, posters and social content',
    description: 'Offer logo design, social media graphics, and poster creation for local businesses, startups and events using free tools like Canva or GIMP.',
    fullDescription: 'Start with zero tools investment using Canva Free or GIMP. Build a small portfolio of 5–10 sample designs and list yourself on Fiverr, Internshala, or WhatsApp groups. Target local restaurants, shops, and event organizers who need affordable design. Scale by learning Figma and charging premium rates.',
    category: 'Creative Services',
    difficulty: 'Easy',
    timeToLaunch: '1–2 weeks',
    budgetRange: '₹0 – ₹2,000',
    budgetUSD: '$0 – $25',
    tools: ['Canva', 'GIMP', 'Figma', 'Fiverr', 'WhatsApp Business'],
    steps: [
      'Create 5–10 sample designs as your portfolio',
      'Sign up on Fiverr and Internshala with a strong profile',
      'Join local entrepreneur & business WhatsApp groups',
      'Set competitive starter prices (₹299–₹499 per logo)',
      'Reinvest first earnings into Canva Pro or Adobe Express',
    ],
    earning: '₹5,000–₹40,000/month',
  },
  {
    id: 'content-writing',
    tier: 1, emoji: '✍️',
    title: 'Freelance Content Writing',
    tagline: 'Write blogs, captions and scripts for brands and websites',
    description: 'Offer blog posts, product descriptions, social media captions, and YouTube scripts to businesses. High demand, zero investment needed.',
    fullDescription: 'Content writing is one of the lowest-barrier businesses you can start. Companies constantly need blog posts, newsletters, and social media content. Build a writing portfolio using Medium (free), pitch to startups via LinkedIn, and use Grammarly (free plan) to polish your work. Once established, move to niche writing in tech, finance, or health for 3–5× higher rates.',
    category: 'Content',
    difficulty: 'Easy',
    timeToLaunch: '1 week',
    budgetRange: '₹0 – ₹500',
    budgetUSD: '$0 – $6',
    tools: ['Google Docs', 'Grammarly', 'Medium', 'LinkedIn', 'Notion'],
    steps: [
      'Write 3 sample blog posts on topics you know well',
      'Publish them on Medium to build credibility',
      'Create a LinkedIn profile showcasing writing skills',
      'Apply on Internshala, WorkIndia, and Upwork for writing gigs',
      'Niche down to a specific industry (tech, food, health) for premium rates',
    ],
    earning: '₹8,000–₹50,000/month',
  },
  {
    id: 'social-media-management',
    tier: 1, emoji: '📱',
    title: 'Social Media Management',
    tagline: 'Manage Instagram & Facebook pages for local businesses',
    description: 'Handle Instagram, Facebook and LinkedIn for local shops, restaurants, salons and small businesses. Schedule posts, reply to DMs and grow their followers.',
    fullDescription: 'Thousands of local businesses in every city know they need social media but have no time or skills to manage it. You can handle 3–5 clients, each paying ₹3,000–₹8,000/month, from your phone. Use free tools like Buffer or Meta Business Suite. Start by offering a free trial month to 2 local shops and let results sell future clients.',
    category: 'Digital Marketing',
    difficulty: 'Easy',
    timeToLaunch: '1–2 weeks',
    budgetRange: '₹0 – ₹3,000',
    budgetUSD: '$0 – $36',
    tools: ['Canva', 'Buffer', 'Meta Business Suite', 'Later', 'Google Analytics'],
    steps: [
      'Pick a niche (restaurants, salons, coaching centres)',
      'Offer a free 2-week trial to one local business',
      'Show results: follower growth, engagement, reach screenshots',
      'Pitch 5 more businesses with those results as proof',
      'Charge ₹3,000–₹8,000/month per client',
    ],
    earning: '₹15,000–₹60,000/month',
  },

  // ══════════════════════════ TIER 2 — Medium Budget ═══════════════════════
  {
    id: 'print-on-demand',
    tier: 2, emoji: '👕',
    title: 'Print-on-Demand Merchandise Store',
    tagline: 'Sell custom t-shirts, mugs & phone cases with zero inventory',
    description: 'Create an online store selling custom designed merchandise. You design, a third-party prints and ships on order — no inventory needed.',
    fullDescription: 'Print-on-demand (POD) lets you sell custom t-shirts, mugs, hoodies, and phone cases without holding any inventory. Platforms like Printrove (India) or Printful integrate with Shopify or your own store. Focus on a specific niche (college memes, engineer quotes, anime art) to stand out. Marketing through Instagram Reels and meme accounts costs almost nothing.',
    category: 'E-commerce',
    difficulty: 'Medium',
    timeToLaunch: '2–4 weeks',
    budgetRange: '₹10,000 – ₹30,000',
    budgetUSD: '$120 – $360',
    tools: ['Shopify', 'Printrove', 'Canva', 'Instagram Ads', 'Razorpay'],
    steps: [
      'Choose a niche (college life, regional culture, fitness, etc.)',
      'Create 10–15 designs using Canva or Illustrator',
      'Set up a Shopify store and integrate with Printrove',
      'Launch with Instagram Reels showing design process',
      'Run small ₹500/day Instagram ads targeting your niche',
    ],
    earning: '₹20,000–₹1,50,000/month',
  },
  {
    id: 'tutoring-platform',
    tier: 2, emoji: '📚',
    title: 'Online Tutoring & Coaching',
    tagline: 'Teach subjects you excel at via live Zoom classes or recorded courses',
    description: 'Create and sell online courses or take live 1-on-1 / group classes for school/college students in subjects you are strong in.',
    fullDescription: 'Whether you are strong in maths, coding, English, UPSC prep, or music — there are students willing to pay you to learn it. Start with live Zoom group classes (5–10 students at ₹500 each = ₹5,000/session) and later create recorded video courses on Teachable or Graphy. Low overhead, scalable, and impactful.',
    category: 'EdTech',
    difficulty: 'Medium',
    timeToLaunch: '2–3 weeks',
    budgetRange: '₹15,000 – ₹50,000',
    budgetUSD: '$180 – $600',
    tools: ['Zoom', 'Graphy', 'Teachable', 'Razorpay', 'Notion', 'Canva'],
    steps: [
      'Pick your strongest subject or skill to teach',
      'Create a free WhatsApp / Telegram group for interested students',
      'Host a free trial class of 60 minutes to 10–15 students',
      'Convert participants to paid batch at ₹499–₹999/month',
      'Record content and sell as self-paced course on Graphy',
    ],
    earning: '₹25,000–₹2,00,000/month',
  },
  {
    id: 'app-development',
    tier: 2, emoji: '💻',
    title: 'Freelance App / Web Development',
    tagline: 'Build websites and mobile apps for businesses and startups',
    description: 'Use your coding skills to build websites, web apps and basic mobile apps for local businesses, NGOs, startups and individual clients.',
    fullDescription: 'Web and app development remains one of the most in-demand freelance services. A small business website can earn you ₹15,000–₹50,000. E-commerce websites ₹30,000–₹1,20,000. Use React, Next.js or WordPress depending on client needs. List on Upwork, Freelancer.in and Toptal. Build case studies after every project for your portfolio.',
    category: 'Tech',
    difficulty: 'Hard',
    timeToLaunch: '1–2 months',
    budgetRange: '₹20,000 – ₹80,000',
    budgetUSD: '$240 – $960',
    tools: ['Next.js', 'React', 'Firebase', 'Vercel', 'Figma', 'WordPress'],
    steps: [
      'Build 2–3 sample project websites covering different niches',
      'Create a clean portfolio website showcasing your work',
      'Register on Upwork, Freelancer.in and Toptal',
      'Approach local businesses with a free audit of their online presence',
      'Deliver with good documentation to get referrals',
    ],
    earning: '₹40,000–₹3,00,000/month',
  },

  // ══════════════════════════ TIER 3 — High Budget ═════════════════════════
  {
    id: 'saas-product',
    tier: 3, emoji: '🚀',
    title: 'Build a SaaS Micro-Product',
    tagline: 'Build and sell a niche software tool solving a real business problem',
    description: 'Identify a repetitive pain point businesses face, build a simple software solution, and charge monthly subscriptions. Even a small niche SaaS earns passive income.',
    fullDescription: 'Software-as-a-Service (SaaS) products have incredibly high margins once built. You need 3–6 months to build an MVP, then market it to a narrow niche. Ideas: appointment booking for clinics, auto-invoice generator for freelancers, WhatsApp chatbot for restaurants. Start small, solve one problem extremely well, and charge ₹299–₹1,999/month per user.',
    category: 'Tech',
    difficulty: 'Hard',
    timeToLaunch: '3–6 months',
    budgetRange: '₹1,00,000 – ₹5,00,000',
    budgetUSD: '$1,200 – $6,000',
    tools: ['Next.js', 'Supabase', 'Stripe', 'Razorpay', 'Vercel', 'Mixpanel'],
    steps: [
      'Interview 20 potential customers to validate the pain point',
      'Build a no-code MVP using Bubble or Webflow in 4 weeks',
      'Get 10 paying beta users before writing a single line of code',
      'Rebuild properly with Next.js + Supabase for scale',
      'Launch on ProductHunt + LinkedIn for initial traction',
    ],
    earning: '₹1L–₹20L+/month recurring',
  },
  {
    id: 'ecommerce-brand',
    tier: 3, emoji: '🛒',
    title: 'D2C E-Commerce Brand',
    tagline: 'Launch your own direct-to-consumer product brand online',
    description: 'Build a branded product business selling directly to consumers via your own website and Amazon/Flipkart — no middlemen, better margins.',
    fullDescription: 'Direct-to-Consumer (D2C) brands are booming in India. Categories like skincare, snacks, fitness supplements, and sustainable products are seeing massive demand. Source products from local manufacturers, brand them, and sell via your own Shopify store and Amazon FBA. The key differentiator is brand storytelling and community building on Instagram and YouTube.',
    category: 'E-commerce',
    difficulty: 'Hard',
    timeToLaunch: '2–4 months',
    budgetRange: '₹2,00,000 – ₹10,00,000',
    budgetUSD: '$2,400 – $12,000',
    tools: ['Shopify', 'Amazon Seller Central', 'Meta Ads', 'Klaviyo', 'Razorpay'],
    steps: [
      'Research trending D2C categories with high repeat purchase rates',
      'Find a reliable manufacturer and get 200–500 unit MOQ samples',
      'Design professional packaging and create brand identity',
      'Launch Shopify store + Amazon listing simultaneously',
      'Run Meta/Instagram ads targeting specific customer personas',
    ],
    earning: '₹2L–₹50L+/month (at scale)',
  },
  {
    id: 'ai-consulting',
    tier: 3, emoji: '🤖',
    title: 'AI Automation Consulting Agency',
    tagline: 'Help businesses automate workflows with AI tools and save hours daily',
    description: 'Build a consulting firm that helps small and mid-size businesses adopt AI tools — automating customer support, data entry, reporting and marketing workflows.',
    fullDescription: 'Businesses are desperate to adopt AI but lack the expertise to implement it. As an AI consultant, you assess their workflows, identify automation opportunities, and implement tools like Make.com, n8n, OpenAI APIs, and Zapier. A single client automation project can earn ₹50,000–₹3,00,000. Build a team, productize your service, and transition to a retained monthly contract model.',
    category: 'Tech',
    difficulty: 'Hard',
    timeToLaunch: '1–3 months',
    budgetRange: '₹1,50,000 – ₹6,00,000',
    budgetUSD: '$1,800 – $7,200',
    tools: ['Make.com', 'n8n', 'OpenAI API', 'Zapier', 'LangChain', 'Notion AI'],
    steps: [
      'Learn Make.com + n8n + basic OpenAI API integrations (free resources)',
      'Offer a free "AI Audit" for 5 local businesses to identify automation wins',
      'Build and deliver your first 2 automation systems as case studies',
      'Price project-based: ₹50,000–₹3,00,000 depending on complexity',
      'Transition top clients to ₹15,000–₹50,000/month retainer for maintenance',
    ],
    earning: '₹1L–₹10L+/month',
  },
];

const TIERS = [
  { id: 0 as const, label: 'All Ideas',  emoji: '💡' },
  { id: 1 as const, label: 'Low Budget',    emoji: '🌱' },
  { id: 2 as const, label: 'Medium Budget', emoji: '📈' },
  { id: 3 as const, label: 'High Budget',   emoji: '🚀' },
];

const TIER_META = {
  1: { name: '🌱 Tier 1 — Low Budget',    budget: '₹0 – ₹10,000', budgetClass: styles.tier1Budget, dotClass: styles.tier1Dot, cardClass: styles.tier1Card },
  2: { name: '📈 Tier 2 — Medium Budget', budget: '₹10,000 – ₹1,00,000', budgetClass: styles.tier2Budget, dotClass: styles.tier2Dot, cardClass: styles.tier2Card },
  3: { name: '🚀 Tier 3 — High Budget',   budget: '₹1,00,000+', budgetClass: styles.tier3Budget, dotClass: styles.tier3Dot, cardClass: styles.tier3Card },
};

const CATEGORIES = ['All', 'Tech', 'Content', 'Creative Services', 'Digital Marketing', 'E-commerce', 'EdTech'];
const DIFF_CLASS: Record<Difficulty, string> = { Easy: styles.pillEasy, Medium: styles.pillMedium, Hard: styles.pillHard };

export default function IdeasPage() {
  const [activeTier, setActiveTier]   = useState<0|1|2|3>(0);
  const [activeCat,  setActiveCat]    = useState('All');
  const [search,     setSearch]       = useState('');
  const [activeIdea, setActiveIdea]   = useState<Idea | null>(null);

  const filtered = useMemo(() => {
    return IDEAS.filter((idea) => {
      const tierOk   = activeTier === 0 || idea.tier === activeTier;
      const catOk    = activeCat  === 'All' || idea.category === activeCat;
      const searchOk = search.trim() === '' ||
        idea.title.toLowerCase().includes(search.toLowerCase()) ||
        idea.description.toLowerCase().includes(search.toLowerCase()) ||
        idea.category.toLowerCase().includes(search.toLowerCase());
      return tierOk && catOk && searchOk;
    });
  }, [activeTier, activeCat, search]);

  const tiersToShow = ([1, 2, 3] as const).filter(t =>
    filtered.some(i => i.tier === t)
  );

  return (
    <div className={styles.page}>

      {/* ── Hero ─────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroBadge}>
          <Lightbulb size={13} /> Startup Ideas for the Next Generation
        </div>
        <h1 className={styles.heroTitle}>
          Build Your Dream.<br />
          <span>Start Small. Scale Big.</span>
        </h1>
        <p className={styles.heroSub}>
          Curated startup and business ideas for young entrepreneurs and students —
          organized by budget, complexity, and time to launch. Find your perfect idea and start today.
        </p>
        <div className={styles.statsRow}>
          <div className={styles.statPill}><span>{IDEAS.length}</span> Curated Ideas</div>
          <div className={styles.statPill}><span>3</span> Budget Tiers</div>
          <div className={styles.statPill}><span>6</span> Categories</div>
          <div className={styles.statPill}><span>₹0</span> Min to Start</div>
        </div>
      </section>

      {/* ── Controls ─────────────────────────────── */}
      <div className={styles.controls}>
        <div className={styles.topRow}>

          {/* Tier Tabs */}
          <div className={styles.tabs} role="tablist" aria-label="Filter by budget tier">
            {TIERS.map(t => (
              <button
                key={t.id}
                role="tab"
                aria-selected={activeTier === t.id}
                className={`${styles.tab} ${activeTier === t.id ? (t.id === 0 ? styles.tabActive : t.id === 1 ? styles.tab1Active : t.id === 2 ? styles.tab2Active : styles.tab3Active) : ''} ${activeTier === t.id && t.id !== 0 ? styles.tabActive : activeTier === t.id ? styles.tabActive : ''}`}
                onClick={() => setActiveTier(t.id)}
                suppressHydrationWarning
              >
                {t.emoji} {t.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className={styles.searchWrap}>
            <Search size={15} className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search ideas…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Search startup ideas"
              suppressHydrationWarning
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className={styles.catRow}>
          <span className={styles.catLabel}><Tag size={12} /> Category:</span>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`${styles.catBtn} ${activeCat === cat ? styles.catBtnActive : ''}`}
              onClick={() => setActiveCat(cat)}
              suppressHydrationWarning
            >
              {cat}
            </button>
          ))}
          <span className={styles.countBadge}>{filtered.length} idea{filtered.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* ── Ideas Main ───────────────────────────── */}
      <main className={styles.main}>
        {filtered.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>🔍</div>
            <div className={styles.emptyTitle}>No ideas found</div>
            <p className={styles.emptyText}>Try changing your filters or search term.</p>
          </div>
        ) : (
          tiersToShow.map(tierNum => {
            const meta  = TIER_META[tierNum];
            const ideas = filtered.filter(i => i.tier === tierNum);
            return (
              <div key={tierNum} className={styles.tierBlock}>
                <div className={styles.tierHeading}>
                  <span className={`${styles.tierDot} ${meta.dotClass}`} />
                  <span className={styles.tierName}>{meta.name}</span>
                  <span className={`${styles.tierBudget} ${meta.budgetClass}`}>{meta.budget}</span>
                </div>

                <div className={styles.grid}>
                  {ideas.map(idea => (
                    <article
                      key={idea.id}
                      className={`${styles.card} ${meta.cardClass}`}
                      onClick={() => setActiveIdea(idea)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => e.key === 'Enter' && setActiveIdea(idea)}
                      aria-label={`View details for ${idea.title}`}
                    >
                      <div className={styles.cardHeader}>
                        <div className={styles.cardEmoji}>{idea.emoji}</div>
                        <div className={styles.cardMeta}>
                          <span className={styles.cardCategory}>{idea.category}</span>
                          <span className={styles.cardTitle}>{idea.title}</span>
                        </div>
                      </div>

                      <p className={styles.cardDesc}>{idea.description}</p>

                      <div className={styles.pills}>
                        <span className={`${styles.pill} ${DIFF_CLASS[idea.difficulty]}`}>{idea.difficulty}</span>
                        <span className={`${styles.pill} ${styles.pillTime}`}><Clock size={10} style={{display:'inline',marginRight:3}} />{idea.timeToLaunch}</span>
                        <span className={`${styles.pill} ${styles.pillCat}`}>{idea.category}</span>
                      </div>

                      <div className={styles.cardFooter}>
                        <div>
                          <div className={styles.budgetLabel}>{idea.budgetRange}</div>
                          <div className={styles.budgetSub}>{idea.budgetUSD}</div>
                        </div>
                        <button className={styles.viewBtn} suppressHydrationWarning>
                          Details <ChevronRight size={13} />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </main>

      {/* ── Modal ────────────────────────────────── */}
      {activeIdea && (
        <div
          className={styles.overlay}
          role="dialog"
          aria-modal="true"
          aria-label={`Details: ${activeIdea.title}`}
          onClick={e => e.target === e.currentTarget && setActiveIdea(null)}
        >
          <div className={styles.modal}>
            <div className={styles.modalTopBar}>
              <span className={styles.modalEmoji}>{activeIdea.emoji}</span>
              <span className={styles.modalTitle}>{activeIdea.title}</span>
              <button className={styles.closeBtn} onClick={() => setActiveIdea(null)} aria-label="Close" suppressHydrationWarning>
                <X size={16} />
              </button>
            </div>

            <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap', marginBottom:'1.25rem' }}>
              <span className={`${styles.pill} ${DIFF_CLASS[activeIdea.difficulty]}`}>{activeIdea.difficulty}</span>
              <span className={`${styles.pill} ${styles.pillCat}`}>{activeIdea.category}</span>
              <span className={`${styles.pill} ${styles.pillTime}`}>⏱ {activeIdea.timeToLaunch}</span>
              <span className={`${styles.pill} ${styles.pillTime}`}>💰 {activeIdea.budgetRange}</span>
            </div>

            <div className={styles.modalSection}>
              <div className={styles.modalSectionLabel}>Overview</div>
              <p className={styles.modalDesc}>{activeIdea.fullDescription}</p>
            </div>

            <div className={styles.modalSection}>
              <div className={styles.modalSectionLabel}>Financial Snapshot</div>
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statCardVal}>{activeIdea.budgetRange}</div>
                  <div className={styles.statCardKey}>Budget Needed</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statCardVal}>{activeIdea.timeToLaunch}</div>
                  <div className={styles.statCardKey}>Time to Launch</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statCardVal}>{activeIdea.earning}</div>
                  <div className={styles.statCardKey}>Potential Earnings</div>
                </div>
              </div>
            </div>

            <div className={styles.modalSection}>
              <div className={styles.modalSectionLabel}>Tools You&apos;ll Need</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'0.4rem' }}>
                {activeIdea.tools.map(tool => (
                  <span key={tool} className={`${styles.pill} ${styles.pillCat}`}>{tool}</span>
                ))}
              </div>
            </div>

            <div className={styles.modalSection}>
              <div className={styles.modalSectionLabel}>Step-by-Step Launch Plan</div>
              <ol className={styles.stepList}>
                {activeIdea.steps.map((step, i) => (
                  <li key={i} className={styles.step}>
                    <span className={styles.stepNum}>{i + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <button className={styles.modalCta} suppressHydrationWarning>
              <Rocket size={17} /> Start Building This Idea
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
