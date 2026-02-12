'use client';

import { useState, useEffect } from 'react';
import { getStoryHistory, getStory, rateStory } from '@/lib/api';
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

export default function HistoryPage() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [filterUniverse, setFilterUniverse] = useState('all');

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    setLoading(true);
    try {
      const data = await getStoryHistory(1000);
      setStories(data.stories || []);
    } catch (err) {
      console.error('Failed to load stories');
    } finally {
      setLoading(false);
    }
  };

  const handleStoryClick = async (storyId) => {
    try {
      const story = await getStory(storyId);
      setSelectedStory(story);
    } catch (err) {
      console.error('Failed to load story');
    }
  };

  const handleRating = async (rating) => {
    if (!selectedStory) return;

    try {
      const result = await rateStory(selectedStory.id, rating);
      setSelectedStory({
        ...selectedStory,
        average_rating: result.average_rating,
        rating_count: result.rating_count
      });
      setStories(stories.map(s =>
        s.id === selectedStory.id
          ? { ...s, average_rating: result.average_rating, rating_count: result.rating_count }
          : s
      ));
    } catch (err) {
      console.error('Failed to save rating');
    }
  };

  const universes = ['all', ...new Set(stories.map(s => s.universe))];

  let processedStories = [...stories];

  if (filterUniverse !== 'all') {
    processedStories = processedStories.filter(s => s.universe === filterUniverse);
  }

  if (sortBy === 'newest') {
    processedStories.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  } else if (sortBy === 'oldest') {
    processedStories.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  } else if (sortBy === 'rating') {
    processedStories.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
  } else if (sortBy === 'words') {
    processedStories.sort((a, b) => b.word_count - a.word_count);
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b-2 border-[var(--color-aged-paper)] bg-[var(--color-parchment)] backdrop-blur-sm shadow-md">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-[var(--color-slate)] hover:text-[var(--color-burgundy)] transition font-sans font-semibold text-sm"
              >
                ← Return
              </Link>
              <div className="text-[var(--color-gold)] text-sm">❦</div>
              <h1 className="font-display text-3xl text-[var(--color-burgundy)]">
                The Archive
              </h1>
            </div>
            <div className="font-sans text-sm text-[var(--color-slate)] text-ornate">
              {processedStories.length} {processedStories.length === 1 ? 'Chronicle' : 'Chronicles'}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-7xl">
        {/* Intro Banner */}
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="text-[var(--color-gold)] text-4xl mb-4">✦</div>
          <h2 className="font-display text-5xl md:text-6xl text-[var(--color-burgundy)] mb-4">
            Collected Stories
          </h2>
          <p className="font-serif text-lg text-[var(--color-charcoal)] max-w-2xl mx-auto">
            A curated collection of alternative narratives, preserved for posterity
          </p>
          <div className="w-24 h-1 bg-[var(--color-gold)] mx-auto mt-4"></div>
        </div>

        {/* Filters - Library Card Catalog Style */}
        <div className="paper-card p-6 mb-10 animate-fade-in-up stagger-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-sans font-semibold text-sm text-ornate text-[var(--color-burgundy)] mb-3">
                ✦ Filter by Universe
              </label>
              <div className="relative">
                <select
                  value={filterUniverse}
                  onChange={(e) => setFilterUniverse(e.target.value)}
                  className="w-full px-5 py-3 font-sans bg-[var(--color-cream)] text-[var(--color-midnight)] border-2 border-[var(--color-aged-paper)] focus:border-[var(--color-burgundy)] focus:outline-none appearance-none pr-10"
                >
                  {universes.map(u => (
                    <option key={u} value={u}>
                      {u === 'all' ? 'All Universes' : `${universeEmojis[u] || ''} ${u}`}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-[var(--color-burgundy)]">
                  ▼
                </div>
              </div>
            </div>
            <div>
              <label className="block font-sans font-semibold text-sm text-ornate text-[var(--color-burgundy)] mb-3">
                ✦ Sort By
              </label>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-5 py-3 font-sans bg-[var(--color-cream)] text-[var(--color-midnight)] border-2 border-[var(--color-aged-paper)] focus:border-[var(--color-burgundy)] focus:outline-none appearance-none pr-10"
                >
                  <option value="newest">Recently Added</option>
                  <option value="oldest">Oldest First</option>
                  <option value="rating">Highest Rated</option>
                  <option value="words">Longest Stories</option>
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-[var(--color-burgundy)]">
                  ▼
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stories Grid - Library Shelves */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-[var(--color-aged-paper)] border-t-[var(--color-burgundy)]"></div>
            <p className="font-serif text-[var(--color-slate)] mt-4">Loading archive...</p>
          </div>
        ) : processedStories.length === 0 ? (
          <div className="text-center py-20 paper-card p-12">
            <div className="text-6xl mb-6 opacity-30">📚</div>
            <h3 className="font-display text-3xl text-[var(--color-burgundy)] mb-3">Empty Archive</h3>
            <p className="font-serif text-lg text-[var(--color-charcoal)] mb-8">
              No stories match your criteria. Begin your journey by creating the first tale.
            </p>
            <Link
              href="/"
              className="inline-block btn-vintage font-sans"
            >
              ✦ Create Story ✦
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {processedStories.map((story, idx) => (
              <button
                key={story.id}
                onClick={() => handleStoryClick(story.id)}
                className="paper-card p-6 text-left hover-lift group animate-fade-in-up"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-4xl group-hover:scale-110 transition-transform">
                      {universeEmojis[story.universe] || '📖'}
                    </span>
                    <span className="universe-badge text-xs">
                      {story.universe}
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-lg text-[var(--color-midnight)] mb-3 line-clamp-2 group-hover:text-[var(--color-burgundy)] transition">
                    What if {story.what_if}?
                  </h3>

                  <div className="flex items-center gap-4 font-sans text-xs text-[var(--color-slate)] mb-3">
                    <span>★ {(story.average_rating || 0).toFixed(1)}</span>
                    <span>•</span>
                    <span>{story.word_count} words</span>
                  </div>

                  <div className="text-xs font-sans text-[var(--color-slate)]">
                    {new Date(story.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      {/* Story Modal - Reading Room */}
      {selectedStory && (
        <div className="fixed inset-0 bg-[var(--color-midnight)]/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto animate-fade-in-up" onClick={() => setSelectedStory(null)}>
          <div className="paper-card max-w-4xl w-full my-8 animate-book-open" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="curtain text-[var(--color-cream)] p-10 relative">
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="text-5xl mb-3">{universeEmojis[selectedStory.universe]}</div>
                    <span className="inline-block px-3 py-1 bg-black/20 backdrop-blur border border-white/30 font-sans text-xs font-semibold tracking-wide">
                      {selectedStory.universe}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowShareModal(true);
                      }}
                      className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur border border-white/30 font-sans text-sm font-semibold transition"
                    >
                      Share
                    </button>
                    <button
                      onClick={() => setSelectedStory(null)}
                      className="px-3 py-2 bg-white/20 hover:bg-white/30 backdrop-blur border border-white/30 transition text-xl"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <h2 className="font-display text-4xl mb-3 leading-tight">
                  What if {selectedStory.what_if}?
                </h2>
                <div className="flex items-center gap-4 font-sans text-sm font-medium">
                  <span>{selectedStory.word_count} words</span>
                  <span>•</span>
                  <span>{selectedStory.rating_count} {selectedStory.rating_count === 1 ? 'rating' : 'ratings'}</span>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-10 max-h-[60vh] overflow-y-auto relative">
              <div className="prose prose-lg max-w-none mb-10">
                {selectedStory.story.split('\n').map((paragraph, i) => (
                  paragraph.trim() && (
                    <p key={i} className={`mb-5 font-serif text-lg text-[var(--color-midnight)] leading-relaxed ${i === 0 ? 'first-letter:text-5xl first-letter:font-display first-letter:text-[var(--color-burgundy)] first-letter:float-left first-letter:mr-2 first-letter:mt-1' : ''}`}>
                      {paragraph}
                    </p>
                  )
                ))}
              </div>

              {/* Rating */}
              <div className="border-t-2 border-[var(--color-aged-paper)] pt-8">
                <div className="max-w-md mx-auto">
                  <h3 className="font-display text-2xl text-[var(--color-burgundy)] mb-6 text-center">
                    Rate This Story
                  </h3>
                  <RatingDisplay
                    storyId={selectedStory.id}
                    initialRating={selectedStory.average_rating || 0}
                    initialCount={selectedStory.rating_count || 0}
                    onRate={handleRating}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && selectedStory && (
        <ShareModal
          storyId={selectedStory.id}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}
