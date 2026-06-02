"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import api from "@/services/api";
import {
  Search,
  Scale,
  ArrowLeft,
  BookOpen,
  Info,
  Newspaper,
  ChevronRight,
  Sparkles,
  Filter,
  X,
  Loader2,
  ExternalLink,
  Clock,
  RefreshCw,
} from "lucide-react";

import GlassCard from "../components/ui/GlassCard";
import GradientButton from "../components/ui/GradientButton";
import AnimatedBackground from "../components/ui/AnimatedBackground";

interface RightsResult {
  article: string;
  title: string;
  content: string;
  category?: string;
  subcategory?: string;
  aiExplanation?: string;
}

interface Category {
  name: string;
  count: number;
  subcategories: string[];
}

interface NewsArticle {
  title: string;
  description: string;
  content?: string;
  source: string;
  url?: string;
  image?: string;
  publishedAt: string;
  category: string;
  creator?: string;
}

type ActiveView = "browse" | "search" | "news";

const categoryIcons: Record<string, string> = {
  "Fundamental Rights": "⚖️",
  "Directive Principles": "📜",
  "Fundamental Duties": "🇮🇳",
  "Emergency Provisions": "🚨",
  "Criminal Law": "🔨",
  "Consumer Law": "🛒",
  "Digital Rights": "💻",
  "Transparency Laws": "🔍",
  "Labour Law": "👷",
  "The Union and its Territory": "🗺️",
  "The Union Executive": "🏛️",
  "The Union Judiciary": "⚖️",
  "The State Judiciary": "🏛️",
  "Amendment of the Constitution": "📝",
};

const categoryColors: Record<string, string> = {
  "Fundamental Rights": "from-cyan-400/20 to-blue-500/20 border-cyan-400/20",
  "Directive Principles": "from-amber-400/20 to-orange-500/20 border-amber-400/20",
  "Fundamental Duties": "from-emerald-400/20 to-teal-500/20 border-emerald-400/20",
  "Emergency Provisions": "from-rose-400/20 to-red-500/20 border-rose-400/20",
  "Criminal Law": "from-purple-400/20 to-indigo-500/20 border-purple-400/20",
  "Consumer Law": "from-blue-400/20 to-indigo-500/20 border-blue-400/20",
  "Digital Rights": "from-violet-400/20 to-purple-500/20 border-violet-400/20",
  "Transparency Laws": "from-teal-400/20 to-cyan-500/20 border-teal-400/20",
  "Labour Law": "from-orange-400/20 to-amber-500/20 border-orange-400/20",
};

export default function RightsPage() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<RightsResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeView, setActiveView] = useState<ActiveView>("browse");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [browseResults, setBrowseResults] = useState<RightsResult[]>([]);
  const [browseLoading, setBrowseLoading] = useState(false);
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsLoaded, setNewsLoaded] = useState(false);
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);
  const [explaining, setExplaining] = useState<string | null>(null);
  const [explanations, setExplanations] = useState<Record<string, string>>({});

  // Load categories on mount
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await api.get("/api/rights/categories");
        setCategories(res.data);
      } catch (e) {
        console.log(e);
      }
    }
    loadCategories();
  }, []);

  // Debounced search
  const debounceTimer = useCallback(() => {
    let timer: NodeJS.Timeout;
    return (value: string) => {
      clearTimeout(timer);
      timer = setTimeout(() => doSearch(value), 350);
    };
  }, [])();

  async function doSearch(value: string) {
    if (!value.trim()) {
      setResults([]);
      setHasSearched(false);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setHasSearched(true);
      const res = await api.get(`/api/rights/search?q=${value}`);
      setResults(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(value: string) {
    setSearch(value);
    setActiveView("search");
    if (!value.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }
    setLoading(true);
    debounceTimer(value);
  }

  async function browseCategory(category: string) {
    setSelectedCategory(category);
    setBrowseLoading(true);
    try {
      const res = await api.get(`/api/rights/browse?category=${encodeURIComponent(category)}`);
      setBrowseResults(res.data);
    } catch (e) {
      console.log(e);
    } finally {
      setBrowseLoading(false);
    }
  }

  async function loadNews(refresh = false) {
    if (newsLoaded && !refresh) return;
    setNewsLoading(true);
    try {
      const res = await api.get("/api/rights/news");
      setNewsArticles(res.data.articles || []);
      setNewsLoaded(true);
    } catch (e) {
      console.log(e);
    } finally {
      setNewsLoading(false);
    }
  }

  function formatDate(dateStr: string) {
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours < 1) return "Just now";
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `${diffDays}d ago`;
      return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    } catch {
      return dateStr;
    }
  }

  async function explainArticle(article: string) {
    if (explanations[article]) {
      setExpandedArticle(expandedArticle === article ? null : article);
      return;
    }
    setExplaining(article);
    setExpandedArticle(article);
    try {
      const res = await api.get(`/api/rights/explain?article=${encodeURIComponent(article)}`);
      setExplanations((prev) => ({ ...prev, [article]: res.data.aiExplanation }));
    } catch (e) {
      console.log(e);
    } finally {
      setExplaining(null);
    }
  }

  const suggestions = [
    "Right to Equality",
    "Freedom of Speech",
    "Right to Life",
    "Arrest",
    "Consumer Rights",
    "Privacy",
    "RTI",
    "Labour",
  ];

  const totalArticles = categories.reduce((sum, c) => sum + c.count, 0);

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-8">
        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-6 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Link>

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-2xl mx-auto mb-4 shadow-[0_0_30px_rgba(245,158,11,0.2)]"
          >
            <Scale size={28} className="text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            <span className="gradient-text">Constitution of India</span>
          </h1>
          <p className="text-[var(--text-muted)] text-base max-w-2xl mx-auto">
            Explore {totalArticles}+ articles, fundamental rights, criminal law, consumer protection, and more — powered by AI explanations
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
          <div className="relative">
            <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search articles, rights, laws, or any legal topic…"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="input-field !pl-13 !py-4 !rounded-2xl !text-base"
            />
            {search && (
              <button
                onClick={() => { setSearch(""); setResults([]); setHasSearched(false); setActiveView("browse"); }}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </motion.div>

        {/* Tab Switcher */}
        <div className="flex gap-1 p-1 rounded-xl bg-[rgba(15,25,50,0.5)] border border-[var(--glass-border)] w-fit mx-auto mb-8">
          {[
            { key: "browse" as ActiveView, icon: BookOpen, label: "Browse" },
            { key: "search" as ActiveView, icon: Search, label: "Search" },
            { key: "news" as ActiveView, icon: Newspaper, label: "Legal News" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveView(tab.key);
                if (tab.key === "news") loadNews();
              }}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                activeView === tab.key
                  ? "bg-gradient-to-r from-cyan-500/15 to-blue-500/15 text-[var(--accent-cyan)] border border-[rgba(34,211,238,0.2)] shadow-[0_0_12px_rgba(34,211,238,0.08)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] border border-transparent"
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* =================== BROWSE VIEW =================== */}
        {activeView === "browse" && !selectedCategory && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <h2 className="text-xs uppercase tracking-widest text-[var(--text-muted)] font-semibold mb-4">
              Browse by Category
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((cat, i) => (
                <motion.div
                  key={cat.name}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <GlassCard
                    hoverable
                    className="cursor-pointer group"
                    onClick={() => browseCategory(cat.name)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${categoryColors[cat.name] || "from-slate-400/20 to-slate-500/20 border-slate-400/20"} border flex items-center justify-center text-xl flex-shrink-0`}>
                        {categoryIcons[cat.name] || "📋"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-cyan)] transition-colors">
                          {cat.name}
                        </h3>
                        <p className="text-xs text-[var(--text-muted)]">
                          {cat.count} articles · {cat.subcategories.length} topics
                        </p>
                      </div>
                      <ChevronRight size={18} className="text-[var(--text-muted)] group-hover:text-[var(--accent-cyan)] group-hover:translate-x-1 transition-all" />
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Browse: Category Detail */}
        {activeView === "browse" && selectedCategory && (
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}>
            <button
              onClick={() => { setSelectedCategory(null); setBrowseResults([]); }}
              className="inline-flex items-center gap-2 text-sm text-[var(--accent-cyan)] hover:text-[var(--text-primary)] transition-colors mb-6 cursor-pointer"
            >
              <ArrowLeft size={14} />
              All Categories
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${categoryColors[selectedCategory] || "from-slate-400/20 to-slate-500/20 border-slate-400/20"} border flex items-center justify-center text-lg`}>
                {categoryIcons[selectedCategory] || "📋"}
              </div>
              <div>
                <h2 className="text-xl font-bold text-[var(--text-primary)]">{selectedCategory}</h2>
                <p className="text-xs text-[var(--text-muted)]">{browseResults.length} articles</p>
              </div>
            </div>

            {browseLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="glass rounded-[var(--radius-lg)] p-6">
                    <div className="skeleton h-5 w-20 mb-3" />
                    <div className="skeleton h-5 w-48 mb-4" />
                    <div className="skeleton h-4 w-full mb-2" />
                    <div className="skeleton h-4 w-3/4" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {browseResults.map((item, i) => (
                  <ArticleCard
                    key={`${item.article}-${i}`}
                    item={item}
                    index={i}
                    expanded={expandedArticle === item.article}
                    explaining={explaining === item.article}
                    explanation={explanations[item.article]}
                    onExplain={() => explainArticle(item.article)}
                    onToggle={() => setExpandedArticle(expandedArticle === item.article ? null : item.article)}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* =================== SEARCH VIEW =================== */}
        {activeView === "search" && (
          <div>
            {/* Quick Suggestions */}
            {!hasSearched && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest font-semibold mb-3">Quick Search</p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => { setSearch(s); handleSearch(s); }}
                      className="px-4 py-2 rounded-full text-sm text-[var(--text-secondary)] border border-[var(--glass-border)] hover:border-[rgba(34,211,238,0.3)] hover:text-[var(--accent-cyan)] hover:bg-[rgba(34,211,238,0.04)] transition-all duration-200 cursor-pointer"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {loading && results.length === 0 && [1, 2, 3].map((i) => (
                  <motion.div key={`sk-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass rounded-[var(--radius-lg)] p-6">
                    <div className="skeleton h-5 w-24 mb-3" />
                    <div className="skeleton h-5 w-48 mb-4" />
                    <div className="skeleton h-4 w-full mb-2" />
                    <div className="skeleton h-4 w-3/4" />
                  </motion.div>
                ))}

                {results.map((item, index) => (
                  <ArticleCard
                    key={`${item.article}-${index}`}
                    item={item}
                    index={index}
                    expanded={expandedArticle === item.article}
                    explaining={explaining === item.article}
                    explanation={explanations[item.article]}
                    onExplain={() => explainArticle(item.article)}
                    onToggle={() => setExpandedArticle(expandedArticle === item.article ? null : item.article)}
                  />
                ))}

                {hasSearched && !loading && results.length === 0 && (
                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12">
                    <Info size={28} className="text-[var(--text-muted)] mx-auto mb-3" />
                    <p className="text-lg font-medium text-[var(--text-secondary)] mb-1">No results found</p>
                    <p className="text-sm text-[var(--text-muted)]">Try different keywords like &quot;equality&quot;, &quot;speech&quot;, or &quot;consumer&quot;</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* =================== NEWS VIEW =================== */}
        {activeView === "news" && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-400/20 to-orange-500/20 border border-rose-400/20 flex items-center justify-center">
                  <Newspaper size={20} className="text-rose-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">Live Legal News</h2>
                  <p className="text-xs text-[var(--text-muted)]">Real-time updates from Indian courts, Parliament & legal world</p>
                </div>
              </div>
              {newsLoaded && (
                <GradientButton
                  variant="ghost"
                  size="sm"
                  icon={RefreshCw}
                  loading={newsLoading}
                  onClick={() => loadNews(true)}
                >
                  Refresh
                </GradientButton>
              )}
            </div>

            {newsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <GlassCard key={i} className="!rounded-2xl">
                    <div className="flex gap-4">
                      <div className="skeleton w-24 h-24 rounded-xl flex-shrink-0" />
                      <div className="flex-1">
                        <div className="skeleton h-4 w-16 mb-2" />
                        <div className="skeleton h-5 w-full mb-2" />
                        <div className="skeleton h-4 w-3/4 mb-3" />
                        <div className="skeleton h-3 w-24" />
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            ) : newsArticles.length > 0 ? (
              <div className="space-y-4">
                {newsArticles.map((article, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <GlassCard hoverable className="!rounded-2xl group">
                      <div className="flex gap-4">
                        {article.image && (
                          <div className="w-28 h-28 rounded-xl overflow-hidden flex-shrink-0 bg-[rgba(15,25,50,0.5)]">
                            <img
                              src={article.image}
                              alt={article.title}
                              className="w-full h-full object-cover"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <span className="badge badge-cyan">{article.source}</span>
                            {article.category && (
                              <span className="badge badge-gold">{article.category}</span>
                            )}
                            <span className="flex items-center gap-1 text-[0.7rem] text-[var(--text-muted)]">
                              <Clock size={10} />
                              {formatDate(article.publishedAt)}
                            </span>
                          </div>
                          <h3 className="text-[0.95rem] font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-cyan)] transition-colors leading-snug mb-2">
                            {article.title}
                          </h3>
                          {article.description && (
                            <p className="text-[0.82rem] text-[var(--text-secondary)] leading-relaxed line-clamp-2">
                              {article.description}
                            </p>
                          )}
                          {article.url && (
                            <a
                              href={article.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 mt-3 text-xs text-[var(--accent-cyan)] hover:underline"
                            >
                              Read full article
                              <ExternalLink size={10} />
                            </a>
                          )}
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>
            ) : (
              <GlassCard className="!rounded-2xl text-center !py-10">
                <Newspaper size={36} className="text-[var(--text-muted)] mx-auto mb-3 opacity-40" />
                <p className="text-[var(--text-secondary)] mb-1">Stay updated with Indian legal news</p>
                <p className="text-sm text-[var(--text-muted)] mb-4">Live updates from Supreme Court, High Courts, and Parliament</p>
                <GradientButton variant="accent" size="sm" icon={Newspaper} onClick={() => loadNews()}>
                  Load Live News
                </GradientButton>
              </GlassCard>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ========= Article Card Component =========

function ArticleCard({
  item,
  index,
  expanded,
  explaining,
  explanation,
  onExplain,
  onToggle,
}: {
  item: RightsResult;
  index: number;
  expanded: boolean;
  explaining: boolean;
  explanation?: string;
  onExplain: () => void;
  onToggle: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
    >
      <GlassCard hoverable className="group">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 mt-1">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${categoryColors[item.category || ""] || "from-cyan-400/20 to-blue-500/20"} border border-[rgba(100,180,255,0.12)] flex items-center justify-center`}>
              <BookOpen size={18} className="text-amber-400" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="badge badge-cyan">{item.article}</span>
              {item.category && (
                <span className="badge badge-gold">{item.category}</span>
              )}
            </div>
            <h2
              className="text-lg font-semibold text-[var(--text-primary)] mb-2 group-hover:text-[var(--accent-cyan)] transition-colors cursor-pointer"
              onClick={onToggle}
            >
              {item.title}
            </h2>
            <p className="text-[0.88rem] leading-relaxed text-[var(--text-secondary)]">
              {item.content}
            </p>

            {/* AI Explain Button */}
            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={onExplain}
                className="inline-flex items-center gap-1.5 text-xs text-[var(--accent-cyan)] hover:underline cursor-pointer font-medium"
              >
                <Sparkles size={12} />
                {explaining ? "Getting AI explanation…" : explanation ? "Hide explanation" : "Explain with AI"}
              </button>
            </div>

            {/* AI Explanation */}
            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 p-4 bg-[rgba(34,211,238,0.04)] border border-[rgba(34,211,238,0.1)] rounded-xl">
                    {explaining ? (
                      <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                        <Loader2 size={14} className="animate-spin" />
                        AI is analyzing this article…
                      </div>
                    ) : (() => {
                      let parsed = null;
                      if (explanation) {
                        try {
                          parsed = JSON.parse(explanation);
                        } catch (e) {
                          // Not valid JSON
                        }
                      }

                      if (parsed) {
                        return (
                          <div className="space-y-4">
                            <div className="flex items-center gap-2">
                              <Sparkles size={14} className="text-[var(--accent-cyan)] animate-pulse" />
                              <p className="text-xs font-semibold text-[var(--accent-cyan)] uppercase tracking-wider">
                                AI Legal Breakdown
                              </p>
                            </div>
                            
                            <div className="space-y-3.5 text-[0.85rem] leading-relaxed text-[var(--text-secondary)]">
                              {/* Main Response */}
                              {parsed.response && (
                                <div className="text-[0.88rem] whitespace-pre-line text-[var(--text-primary)]">
                                  {parsed.response}
                                </div>
                              )}

                              {/* Simplified English */}
                              {parsed.simplifiedEnglish && (
                                <div className="p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)]">
                                  <span className="block text-[0.7rem] font-semibold text-amber-400 uppercase tracking-wider mb-1">
                                    💡 In Simple Terms
                                  </span>
                                  <p className="text-[0.82rem] text-[var(--text-secondary)]">{parsed.simplifiedEnglish}</p>
                                </div>
                              )}

                              {/* Hindi Translation */}
                              {parsed.hindiTranslation && (
                                <div className="p-3 rounded-xl bg-[rgba(34,211,238,0.02)] border border-[rgba(34,211,238,0.04)]">
                                  <span className="block text-[0.7rem] font-semibold text-cyan-400 uppercase tracking-wider mb-1">
                                    🇮🇳 आसान शब्दों में (Hindi / Hinglish)
                                  </span>
                                  <p className="text-[0.82rem] text-[var(--text-secondary)] font-sans">{parsed.hindiTranslation}</p>
                                </div>
                              )}

                              {/* Citations */}
                              {parsed.citations && parsed.citations.length > 0 && (
                                <div>
                                  <span className="block text-[0.7rem] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
                                    🔗 Relevant Laws & Citations
                                  </span>
                                  <div className="grid grid-cols-1 gap-1.5">
                                    {parsed.citations.map((c: any, ci: number) => (
                                      <div key={ci} className="p-2.5 rounded-lg bg-[rgba(15,25,50,0.3)] border border-[rgba(255,255,255,0.04)] flex flex-col gap-0.5">
                                        <span className="text-xs font-semibold text-[var(--accent-cyan)]">{c.section}</span>
                                        <span className="text-[0.78rem] text-[var(--text-muted)]">{c.desc}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Suggested Next Steps */}
                              {parsed.suggestedNextSteps && parsed.suggestedNextSteps.length > 0 && (
                                <div>
                                  <span className="block text-[0.7rem] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
                                    📋 Recommended Next Steps
                                  </span>
                                  <ul className="space-y-1">
                                    {parsed.suggestedNextSteps.map((step: string, si: number) => (
                                      <li key={si} className="flex items-start gap-1.5 text-[0.8rem] text-[var(--text-secondary)]">
                                        <span className="text-[var(--accent-cyan)] font-bold">✓</span>
                                        <span>{step}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div>
                          <p className="text-xs font-semibold text-[var(--accent-cyan)] mb-2 uppercase tracking-wider">
                            ✨ AI Explanation
                          </p>
                          <pre className="whitespace-pre-wrap text-[0.85rem] leading-relaxed text-[var(--text-secondary)] font-sans">
                            {explanation}
                          </pre>
                        </div>
                      );
                    })()}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}