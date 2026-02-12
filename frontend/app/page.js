'use client';

import { useState, useEffect } from 'react';
import { getUniverses, generateStory, rateStory, getStoryHistory, generateSystemPrompt, generateCustomStory } from '@/lib/api';
import Link from 'next/link';
import ShareModal from '@/components/ShareModal';
import RatingDisplay from '@/components/RatingDisplay';

const universeEmojis = {
  'Harry Potter': '🪄',
  'Lord of the Rings': '💍',
  'Marvel MCU': '🦸',
  'Star Wars': '⚡',
  'One Piece': '🏴\u200D☠️',
  'Naruto': '🌀',
  'Attack on Titan': '⚔️',
  'DC': '🦇'
};

const universeColors = {
  'Harry Potter': ['#6B0F2A', '#8B1538'],
  'Lord of the Rings': ['#2C5530', '#3D7043'],
  'Marvel MCU': ['#8B1538', '#D4AF37'],
  'Star Wars': ['#1A1D2E', '#D4AF37'],
  'One Piece': ['#2C5530', '#8B1538'],
  'Naruto': ['#D4AF37', '#8B1538'],
  'Attack on Titan': ['#2D3142', '#6B0F2A'],
  'DC': ['#1A1D2E', '#8B1538']
};

export default function Home() {
  const [universes, setUniverses] = useState([]);
  const [selectedUniverse, setSelectedUniverse] = useState('');
  const [isCustomUniverse, setIsCustomUniverse] = useState(false);
  const [customUniverseName, setCustomUniverseName] = useState('');
  const [customSystemPrompt, setCustomSystemPrompt] = useState('');
  const [promptLoading, setPromptLoading] = useState(false);
  const [whatIf, setWhatIf] = useState('');
  const [length, setLength] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [story, setStory] = useState(null);
  const [error, setError] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [stats, setStats] = useState({ total: 0, avgRating: 0, totalWords: 0 });
  const [communityStories, setCommunityStories] = useState([]);

  useEffect(() => {
    getUniverses().then(data => {
      setUniverses(data.universes);
      if (data.universes.length > 0) {
        setSelectedUniverse(data.universes[0]);
      }
    });

    getStoryHistory(1000).then(data => {
      const stories = data.stories || [];
      const total = stories.length;
      const totalWords = stories.reduce((sum, s) => sum + s.word_count, 0);
      const ratedStories = stories.filter(s => s.average_rating > 0);
      const avgRating = ratedStories.length > 0
        ? ratedStories.reduce((sum, s) => sum + s.average_rating, 0) / ratedStories.length
        : 0;

      setStats({ total, avgRating: avgRating.toFixed(1), totalWords });
      setCommunityStories(stories.slice(0, 8));
    }).catch(() => { });
  }, []);

  const handleGenerateSystemPrompt = async () => {
    if (!customUniverseName.trim()) return;
    setPromptLoading(true);
    try {
      const result = await generateSystemPrompt(customUniverseName);
      setCustomSystemPrompt(result.system_prompt);
    } catch (err) {
      console.error('Failed to generate prompt', err);
    } finally {
      setPromptLoading(false);
    }
  };

  const handleGenerateStory = async (e) => {
    e.preventDefault();

    if (!whatIf.trim()) {
      setError('Please enter a "What If" scenario');
      return;
    }

    if (isCustomUniverse && !customUniverseName.trim()) {
      setError('Please enter a universe name');
      return;
    }

    setLoading(true);
    setError('');
    setStory(null);

    try {
      let result;
      if (isCustomUniverse) {
        let promptToUse = customSystemPrompt;
        if (!promptToUse && customUniverseName) {
          const promptRes = await generateSystemPrompt(customUniverseName);
          promptToUse = promptRes.system_prompt;
          setCustomSystemPrompt(promptToUse);
        }
        result = await generateCustomStory(customUniverseName, promptToUse, whatIf, length);
      } else {
        result = await generateStory(selectedUniverse, whatIf, length);
      }

      setStory(result);

      setTimeout(() => {
        document.getElementById('story-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      setError('Failed to generate story. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRating = async (rating) => {
    if (!story) return;

    try {
      const result = await rateStory(story.id, rating);
      setStory({
        ...story,
        average_rating: result.average_rating,
        rating_count: result.rating_count
      });
    } catch (err) {
      setError('Failed to save rating.');
    }
  };

  const selectedColors = isCustomUniverse
    ? ['#8B1538', '#D4AF37']
    : (universeColors[selectedUniverse] || ['#8B1538', '#D4AF37']);

  return (
    <div className="min-h-screen">
      {/* Header - Book Spine Navigation */}
      <header className="sticky top-0 z-40 border-b-2 border-[var(--color-aged-paper)] bg-[var(--color-parchment)] backdrop-blur-sm shadow-md">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="font-display text-3xl md:text-4xl text-[var(--color-burgundy)] tracking-tight">
                What If Novel
              </h1>
              <div className="hidden md:block text-[var(--color-gold)] text-sm">❦</div>
              <p className="hidden md:block font-sans text-sm text-[var(--color-slate)] text-ornate">
                The Alternative Library
              </p>
            </div>
            <nav className="flex gap-3">
              <Link
                href="/stats"
                className="font-sans px-5 py-2 bg-[var(--color-burgundy)] text-[var(--color-cream)] text-sm font-semibold tracking-wide hover:bg-[var(--color-burgundy-light)] transition-all shadow-md hover:shadow-lg border-l-2 border-[var(--color-gold)]"
              >
                Statistics
              </Link>
              <Link
                href="/history"
                className="font-sans px-5 py-2 bg-[var(--color-forest)] text-[var(--color-cream)] text-sm font-semibold tracking-wide hover:bg-[var(--color-forest-light)] transition-all shadow-md hover:shadow-lg border-l-2 border-[var(--color-gold)]"
              >
                Archive
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section - Theatrical Introduction */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, var(--color-burgundy) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="container mx-auto px-6 relative">
          <div className="max-w-5xl mx-auto text-center">
            {/* Ornamental Header */}
            <div className="mb-8 animate-fade-in-up">
              <div className="inline-block">
                <div className="text-[var(--color-gold)] text-4xl mb-4">❦</div>
                <h2 className="font-display text-5xl md:text-7xl lg:text-8xl text-[var(--color-burgundy)] mb-4 leading-tight tracking-tight">
                  Reimagine<br />Reality
                </h2>
                <div className="h-1 w-24 bg-[var(--color-gold)] mx-auto"></div>
              </div>
            </div>

            <p className="font-serif text-xl md:text-2xl text-[var(--color-charcoal)] max-w-3xl mx-auto mb-6 leading-relaxed animate-fade-in-up stagger-2">
              Where imagination converges with artificial intelligence to explore infinite narrative possibilities
            </p>

            <p className="font-sans text-base text-[var(--color-slate)] max-w-2xl mx-auto animate-fade-in-up stagger-3">
              Journey through alternative timelines in beloved fictional universes. Each story, a unique branch in the tree of infinite possibility.
            </p>

            {/* Stats Banner */}
            {stats.total > 0 && (
              <div className="mt-12 flex flex-wrap justify-center gap-8 animate-fade-in-up stagger-4">
                {[
                  { label: 'Stories Crafted', value: stats.total.toLocaleString(), symbol: '✦' },
                  { label: 'Average Rating', value: stats.avgRating, symbol: '★' },
                  { label: 'Words Written', value: stats.totalWords.toLocaleString(), symbol: '✎' }
                ].map((stat, idx) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-3xl md:text-4xl font-display text-[var(--color-burgundy)] mb-1">
                      {stat.value}
                    </div>
                    <div className="text-xs font-sans text-ornate text-[var(--color-slate)]">
                      {stat.symbol} {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content - Two Column Layout */}
      <main className="container mx-auto px-6 pb-20 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar - Universe Selection (Book Spines) */}
          <aside className="lg:col-span-3 animate-slide-in-right">
            <div className="sticky top-24">
              <h3 className="font-display text-2xl text-[var(--color-burgundy)] mb-6 pb-3 border-b-2 border-[var(--color-gold)]">
                Select Universe
              </h3>

              <div className="space-y-2">
                {universes.map((u, idx) => (
                  <button
                    key={u}
                    onClick={() => {
                      setSelectedUniverse(u);
                      setIsCustomUniverse(false);
                    }}
                    className={`w-full p-4 text-left transition-all border-l-4 font-sans font-semibold text-sm tracking-wide animate-fade-in-up ${
                      !isCustomUniverse && selectedUniverse === u
                        ? 'book-spine text-[var(--color-cream)] border-[var(--color-gold)] scale-105 shadow-lg'
                        : 'bg-[var(--color-parchment)] text-[var(--color-charcoal)] border-[var(--color-aged-paper)] hover:border-[var(--color-burgundy)] hover:bg-[var(--color-aged-paper)] hover-lift'
                    }`}
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{universeEmojis[u] || '📖'}</span>
                      <span>{u}</span>
                    </div>
                  </button>
                ))}

                {/* Custom Universe Option */}
                <button
                  onClick={() => setIsCustomUniverse(true)}
                  className={`w-full p-4 text-left transition-all border-l-4 font-sans font-semibold text-sm tracking-wide ${
                    isCustomUniverse
                      ? 'book-spine text-[var(--color-cream)] border-[var(--color-gold)] scale-105 shadow-lg'
                      : 'bg-[var(--color-parchment)] text-[var(--color-charcoal)] border-[var(--color-aged-paper)] hover:border-[var(--color-burgundy)] hover:bg-[var(--color-aged-paper)] hover-lift'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">✨</span>
                    <span>Custom Universe</span>
                  </div>
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content - Story Generator */}
          <section className="lg:col-span-9 animate-fade-in-up stagger-2">
            <div className="paper-card p-8 md:p-12 relative">
              {/* Decorative Corner */}
              <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-[var(--color-gold)] opacity-30"></div>
              <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-[var(--color-gold)] opacity-30"></div>

              <div className="relative z-10">
                <div className="text-center mb-10">
                  <h2 className="font-display text-4xl md:text-5xl text-[var(--color-burgundy)] mb-3">
                    Craft Your Story
                  </h2>
                  <div className="w-20 h-1 bg-[var(--color-gold)] mx-auto"></div>
                </div>

                <form onSubmit={handleGenerateStory} className="space-y-8">
                  {/* Custom Universe Fields */}
                  {isCustomUniverse && (
                    <div className="p-6 border-2 border-[var(--color-aged-paper)] bg-[var(--color-parchment)] animate-fade-in-up space-y-5">
                      <div>
                        <label className="block font-sans font-semibold text-sm text-ornate text-[var(--color-burgundy)] mb-3">
                          Universe Name
                        </label>
                        <input
                          type="text"
                          value={customUniverseName}
                          onChange={(e) => setCustomUniverseName(e.target.value)}
                          placeholder="e.g., Cyberpunk 2077, Dune, Your Original World"
                          className="w-full px-5 py-3 font-serif bg-[var(--color-cream)] text-[var(--color-midnight)] border-2 border-[var(--color-aged-paper)] focus:border-[var(--color-burgundy)] focus:outline-none transition-colors"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <label className="block font-sans font-semibold text-sm text-ornate text-[var(--color-burgundy)]">
                            System Prompt (Optional)
                          </label>
                          <button
                            type="button"
                            onClick={handleGenerateSystemPrompt}
                            disabled={!customUniverseName || promptLoading}
                            className="font-sans text-xs px-4 py-1 bg-[var(--color-burgundy)] text-[var(--color-cream)] hover:bg-[var(--color-burgundy-light)] transition disabled:opacity-50"
                          >
                            {promptLoading ? 'Generating...' : '✨ Auto-Generate'}
                          </button>
                        </div>
                        <textarea
                          value={customSystemPrompt}
                          onChange={(e) => setCustomSystemPrompt(e.target.value)}
                          placeholder="Describe the world, characters, and narrative rules..."
                          className="w-full px-5 py-3 font-serif text-sm bg-[var(--color-cream)] text-[var(--color-midnight)] border-2 border-[var(--color-aged-paper)] focus:border-[var(--color-burgundy)] focus:outline-none min-h-[100px] transition-colors"
                        />
                      </div>
                    </div>
                  )}

                  {/* What If Scenario */}
                  <div>
                    <label className="block font-sans font-semibold text-sm text-ornate text-[var(--color-burgundy)] mb-3">
                      ✦ Your "What If" Scenario
                    </label>
                    <textarea
                      value={whatIf}
                      onChange={(e) => setWhatIf(e.target.value)}
                      placeholder="What if Harry Potter was sorted into Slytherin? What if Gandalf never came to Middle-earth? What if Tony Stark never became Iron Man?"
                      className="w-full px-5 py-4 font-serif text-lg bg-[var(--color-cream)] text-[var(--color-midnight)] border-2 border-[var(--color-aged-paper)] focus:border-[var(--color-burgundy)] focus:outline-none min-h-[140px] resize-none transition-colors"
                    />
                  </div>

                  {/* Story Length */}
                  <div>
                    <label className="block font-sans font-semibold text-sm text-ornate text-[var(--color-burgundy)] mb-4">
                      ✦ Narrative Length
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { value: 'short', label: 'Brief Tale', desc: '~300 words' },
                        { value: 'medium', label: 'Standard Chapter', desc: '~600 words' },
                        { value: 'long', label: 'Epic Saga', desc: '~1000 words' }
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setLength(opt.value)}
                          className={`p-5 border-2 font-sans transition-all ${
                            length === opt.value
                              ? 'border-[var(--color-burgundy)] bg-[var(--color-burgundy)] text-[var(--color-cream)] shadow-lg scale-105'
                              : 'border-[var(--color-aged-paper)] bg-[var(--color-parchment)] text-[var(--color-charcoal)] hover:border-[var(--color-burgundy)] hover-lift'
                          }`}
                        >
                          <div className="font-bold text-base mb-1">{opt.label}</div>
                          <div className="text-xs opacity-75">{opt.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-vintage w-full text-lg py-5 disabled:opacity-50 disabled:cursor-not-allowed font-sans"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-3">
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Weaving Your Narrative...
                      </span>
                    ) : (
                      <span>✦ Generate Story ✦</span>
                    )}
                  </button>

                  {/* Error Message */}
                  {error && (
                    <div className="p-4 bg-red-50 border-2 border-red-300 text-red-700 font-sans text-sm">
                      {error}
                    </div>
                  )}
                </form>
              </div>
            </div>
          </section>
        </div>

        {/* Community Stories Section */}
        {communityStories.length > 0 && !story && (
          <section className="mt-20 animate-fade-in-up stagger-5">
            <div className="text-center mb-12">
              <div className="ornamental-divider">
                <span>❦</span>
              </div>
              <h2 className="font-display text-4xl md:text-5xl text-[var(--color-burgundy)] mb-4">
                Recent Chronicles
              </h2>
              <p className="font-serif text-lg text-[var(--color-slate)] max-w-2xl mx-auto">
                Explore the latest narrative branches crafted by our community of storytellers
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {communityStories.map((communityStory, idx) => (
                <Link
                  key={communityStory.id}
                  href="/history"
                  className="paper-card p-6 hover-lift group animate-fade-in-up"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <span className="text-4xl group-hover:scale-110 transition-transform">
                        {universeEmojis[communityStory.universe] || '📖'}
                      </span>
                      <span className="universe-badge text-xs">
                        {communityStory.universe}
                      </span>
                    </div>

                    <h3 className="font-serif font-bold text-base text-[var(--color-midnight)] mb-3 line-clamp-2 group-hover:text-[var(--color-burgundy)] transition">
                      What if {communityStory.what_if}?
                    </h3>

                    <div className="flex items-center gap-4 font-sans text-xs text-[var(--color-slate)]">
                      <span>★ {(communityStory.average_rating || 0).toFixed(1)}</span>
                      <span>•</span>
                      <span>{communityStory.word_count} words</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center">
              <Link
                href="/history"
                className="inline-block btn-vintage font-sans"
              >
                Explore All {stats.total} Stories →
              </Link>
            </div>
          </section>
        )}

        {/* Story Display - Theatrical Reveal */}
        {story && (
          <div id="story-section" className="mt-20 animate-book-open">
            <div className="paper-card overflow-hidden max-w-5xl mx-auto">
              {/* Story Header - Curtain Style */}
              <div className="curtain text-[var(--color-cream)] p-12 relative">
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <div className="text-6xl mb-4">{universeEmojis[story.universe]}</div>
                      <span className="inline-block px-4 py-2 bg-black/20 backdrop-blur border border-white/30 font-sans text-sm font-semibold tracking-wide">
                        {story.universe}
                      </span>
                    </div>
                    <button
                      onClick={() => setShowShareModal(true)}
                      className="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur border border-white/30 font-sans font-semibold tracking-wide transition flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      Share
                    </button>
                  </div>

                  <h2 className="font-display text-4xl md:text-5xl mb-4 leading-tight">
                    What if {story.what_if}?
                  </h2>

                  <div className="flex items-center gap-4 font-sans text-sm font-medium">
                    <span>{story.word_count} words</span>
                    <span>•</span>
                    <span>{story.rating_count} {story.rating_count === 1 ? 'rating' : 'ratings'}</span>
                  </div>
                </div>
              </div>

              {/* Story Content */}
              <div className="p-12 relative">
                <div className="prose prose-lg max-w-none mb-12">
                  {story.story.split('\n').map((paragraph, i) => (
                    paragraph.trim() && (
                      <p key={i} className="mb-6 font-serif text-lg text-[var(--color-midnight)] leading-relaxed first-letter:text-5xl first-letter:font-display first-letter:text-[var(--color-burgundy)] first-letter:float-left first-letter:mr-2 first-letter:mt-1">
                        {paragraph}
                      </p>
                    )
                  ))}
                </div>

                {/* Rating Section */}
                <div className="border-t-2 border-[var(--color-aged-paper)] pt-10">
                  <div className="max-w-lg mx-auto">
                    <h3 className="font-display text-3xl text-[var(--color-burgundy)] mb-8 text-center">
                      Rate This Story
                    </h3>
                    <RatingDisplay
                      storyId={story.id}
                      initialRating={story.average_rating || 0}
                      initialCount={story.rating_count || 0}
                      onRate={handleRating}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-4 justify-center mt-10">
                  <Link
                    href="/history"
                    className="px-8 py-4 bg-[var(--color-forest)] text-[var(--color-cream)] font-sans font-semibold tracking-wide hover:bg-[var(--color-forest-light)] transition shadow-md hover:shadow-lg"
                  >
                    View Archive
                  </Link>
                  <button
                    onClick={() => setStory(null)}
                    className="btn-vintage px-8 py-4 font-sans"
                  >
                    ✦ Create Another ✦
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Share Modal */}
      {showShareModal && story && (
        <ShareModal
          storyId={story.id}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}
