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
  'One Piece': '🏴‍☠️',
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
      const data = await getStoryHistory(100);
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
      // Update in list
      setStories(stories.map(s =>
        s.id === selectedStory.id
          ? { ...s, average_rating: result.average_rating, rating_count: result.rating_count }
          : s
      ));
    } catch (err) {
      console.error('Failed to save rating');
    }
  };

  // Get unique universes
  const universes = ['all', ...new Set(stories.map(s => s.universe))];

  // Filter and sort
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
              >
                ← Back
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                📚 Story Archive
              </h1>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {stories.length} {stories.length === 1 ? 'story' : 'stories'}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Filter by Universe
              </label>
              <select
                value={filterUniverse}
                onChange={(e) => setFilterUniverse(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
              >
                {universes.map(u => (
                  <option key={u} value={u}>
                    {u === 'all' ? 'All Universes' : `${universeEmojis[u] || ''} ${u}`}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="rating">Highest Rated</option>
                <option value="words">Longest Stories</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stories Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
          </div>
        ) : processedStories.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">✨</div>
            <p className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No stories yet</p>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Create your first story to see it here</p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
            >
              Create Story
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {processedStories.map((story) => (
              <button
                key={story.id}
                onClick={() => handleStoryClick(story.id)}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-blue-500 dark:hover:border-blue-500 transition text-left group"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{universeEmojis[story.universe] || '📖'}</span>
                  <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                    {story.universe}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                  What if {story.what_if}?
                </h3>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    ⭐ {(story.average_rating || 0).toFixed(1)}
                  </span>
                  <span>•</span>
                  <span>{story.word_count} words</span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  {new Date(story.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      {/* Story Modal */}
      {selectedStory && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={() => setSelectedStory(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full my-8 animate-fade-in" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-t-xl">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-5xl mb-3">{universeEmojis[selectedStory.universe]}</div>
                  <span className="inline-block bg-white/20 backdrop-blur px-3 py-1 rounded-full text-sm font-medium">
                    {selectedStory.universe}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowShareModal(true);
                    }}
                    className="bg-white/20 hover:bg-white/30 backdrop-blur px-4 py-2 rounded-lg font-medium transition"
                  >
                    Share
                  </button>
                  <button
                    onClick={() => setSelectedStory(null)}
                    className="bg-white/20 hover:bg-white/30 backdrop-blur px-3 py-2 rounded-lg transition"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <h2 className="text-3xl font-bold mb-2">
                What if {selectedStory.what_if}?
              </h2>
              <div className="flex items-center gap-4 text-sm">
                <span>{selectedStory.word_count} words</span>
                <span>•</span>
                <span>{selectedStory.rating_count} {selectedStory.rating_count === 1 ? 'rating' : 'ratings'}</span>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-8 max-h-[60vh] overflow-y-auto">
              <div className="prose prose-lg max-w-none dark:prose-invert mb-8">
                {selectedStory.story.split('\n').map((paragraph, i) => (
                  paragraph.trim() && (
                    <p key={i} className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                      {paragraph}
                    </p>
                  )
                ))}
              </div>

              {/* Rating */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
                <div className="max-w-md mx-auto">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">
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
