'use client';

import { useState, useEffect } from 'react';
import { getUniverses, generateStory, rateStory, getStoryHistory } from '@/lib/api';
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

export default function Home() {
  const [universes, setUniverses] = useState([]);
  const [selectedUniverse, setSelectedUniverse] = useState('');
  const [whatIf, setWhatIf] = useState('');
  const [length, setLength] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [story, setStory] = useState(null);
  const [error, setError] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [stats, setStats] = useState({ total: 0, avgRating: 0, totalWords: 0 });

  useEffect(() => {
    getUniverses().then(data => {
      setUniverses(data.universes);
      if (data.universes.length > 0) {
        setSelectedUniverse(data.universes[0]);
      }
    });

    // Fetch stats
    getStoryHistory(1000).then(data => {
      const stories = data.stories || [];
      const total = stories.length;
      const totalWords = stories.reduce((sum, s) => sum + s.word_count, 0);
      const ratedStories = stories.filter(s => s.average_rating > 0);
      const avgRating = ratedStories.length > 0
        ? ratedStories.reduce((sum, s) => sum + s.average_rating, 0) / ratedStories.length
        : 0;

      setStats({ total, avgRating: avgRating.toFixed(1), totalWords });
    }).catch(() => { });
  }, []);

  const handleGenerateStory = async (e) => {
    e.preventDefault();

    if (!whatIf.trim()) {
      setError('Please enter a "What If" scenario');
      return;
    }

    setLoading(true);
    setError('');
    setStory(null);

    try {
      const result = await generateStory(selectedUniverse, whatIf, length);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            ✨ What If Novel
          </h1>
          <Link
            href="/history"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
          >
            📚 History
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
            Reimagine Your Favorite Stories
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Explore alternative storylines in iconic universes powered by AI
          </p>
        </div>

        {/* Stats */}
        {stats.total > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="text-4xl mb-2">📚</div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Stories Created</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="text-4xl mb-2">⭐</div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.avgRating}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Average Rating</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="text-4xl mb-2">📝</div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalWords.toLocaleString()}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Words Written</div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Universe Selection */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Select Universe</h3>
            <div className="space-y-2">
              {universes.map((u) => (
                <button
                  key={u}
                  onClick={() => setSelectedUniverse(u)}
                  className={`w-full p-4 rounded-lg text-left transition border-2 ${selectedUniverse === u
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-600 dark:border-blue-500'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{universeEmojis[u] || '🌌'}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{u}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Generator Form */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
              <form onSubmit={handleGenerateStory} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    What If Scenario
                  </label>
                  <textarea
                    value={whatIf}
                    onChange={(e) => setWhatIf(e.target.value)}
                    placeholder="What if Harry Potter was sorted into Slytherin? What if Gandalf never came to Middle-earth?"
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none min-h-[120px] resize-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Story Length
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {['short', 'medium', 'long'].map((l) => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => setLength(l)}
                        className={`py-3 rounded-lg font-medium transition border-2 ${length === l
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                          }`}
                      >
                        {l.charAt(0).toUpperCase() + l.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </span>
                  ) : (
                    '✨ Generate Story'
                  )}
                </button>

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* Story Display */}
        {story && (
          <div id="story-section" className="animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Story Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-5xl mb-3">{universeEmojis[story.universe]}</div>
                    <span className="inline-block bg-white/20 backdrop-blur px-3 py-1 rounded-full text-sm font-medium">
                      {story.universe}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowShareModal(true)}
                    className="bg-white/20 hover:bg-white/30 backdrop-blur px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    Share
                  </button>
                </div>
                <h2 className="text-3xl font-bold mb-2">
                  What if {story.what_if}?
                </h2>
                <div className="flex items-center gap-4 text-sm">
                  <span>{story.word_count} words</span>
                  <span>•</span>
                  <span>{story.rating_count} {story.rating_count === 1 ? 'rating' : 'ratings'}</span>
                </div>
              </div>

              {/* Story Content */}
              <div className="p-8">
                <div className="prose prose-lg max-w-none dark:prose-invert mb-8">
                  {story.story.split('\n').map((paragraph, i) => (
                    paragraph.trim() && (
                      <p key={i} className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                        {paragraph}
                      </p>
                    )
                  ))}
                </div>

                {/* Rating Section */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
                  <div className="max-w-md mx-auto">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">
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
                <div className="flex gap-4 justify-center mt-8">
                  <Link
                    href="/history"
                    className="px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition"
                  >
                    View All Stories
                  </Link>
                  <button
                    onClick={() => setStory(null)}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
                  >
                    Create Another
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