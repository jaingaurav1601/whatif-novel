'use client';

import { useState, useEffect } from 'react';
import { getStoryHistory, getStory, rateStory } from '@/lib/api';
import Link from 'next/link';

const universeEmojis = {
  'Harry Potter': '🪄',
  'Lord of the Rings': '💍',
  'Marvel MCU': '🦸',
  'Star Wars': '⚡'
};

const universeColors = {
  'Harry Potter': { gradient: 'from-amber-600 via-red-500 to-purple-600', light: 'from-amber-100 to-red-100' },
  'Lord of the Rings': { gradient: 'from-green-700 via-emerald-600 to-slate-700', light: 'from-green-100 to-emerald-100' },
  'Marvel MCU': { gradient: 'from-red-600 via-blue-500 to-red-700', light: 'from-red-100 to-blue-100' },
  'Star Wars': { gradient: 'from-yellow-500 via-orange-500 to-red-600', light: 'from-yellow-100 to-orange-100' }
};

export default function HistoryPage() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStory, setSelectedStory] = useState(null);
  const [ratingLoading, setRatingLoading] = useState(false);
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
      setError('Failed to load stories');
    } finally {
      setLoading(false);
    }
  };

  const handleStoryClick = async (storyId) => {
    try {
      const story = await getStory(storyId);
      setSelectedStory(story);
    } catch (err) {
      setError('Failed to load story');
    }
  };

  const handleRating = async (rating) => {
    if (!selectedStory) return;
    
    setRatingLoading(true);
    try {
      await rateStory(selectedStory.id, rating);
      setSelectedStory({ ...selectedStory, rating });
      // Update the story in the list as well
      setStories(stories.map(s => 
        s.id === selectedStory.id ? { ...s, rating } : s
      ));
    } catch (err) {
      setError('Failed to save rating.');
    } finally {
      setRatingLoading(false);
    }
  };

  // Get unique universes for filter
  const universes = ['all', ...new Set(stories.map(s => s.universe))];

  // Sort and filter stories
  let processedStories = [...stories];
  
  if (filterUniverse !== 'all') {
    processedStories = processedStories.filter(s => s.universe === filterUniverse);
  }

  if (sortBy === 'newest') {
    processedStories.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  } else if (sortBy === 'oldest') {
    processedStories.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  } else if (sortBy === 'rating') {
    processedStories.sort((a, b) => b.rating - a.rating);
  } else if (sortBy === 'words') {
    processedStories.sort((a, b) => b.word_count - a.word_count);
  }

  const selectedUniverse = selectedStory?.universe || '';
  const colorClass = universeColors[selectedUniverse] || universeColors['Harry Potter'];

  return (
    <main className="min-h-screen bg-slate-950 text-white overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-black opacity-80"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        
        {/* Header */}
        <div className="mb-12">
          <Link 
            href="/"
            className="inline-block px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-cyan-400 hover:text-cyan-300 font-semibold rounded-lg mb-6 transition border border-slate-600/30 group"
          >
            ← Back
          </Link>
          <h1 className="text-6xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-3">
            📚 Story Archive
          </h1>
          <p className="text-slate-300 text-lg">
            {stories.length} {stories.length === 1 ? 'story' : 'stories'} • Explore and revisit your created tales
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Story List Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl p-6 shadow-2xl sticky top-4 border border-slate-700/50">
              
              {/* Filter */}
              <div className="mb-6">
                <label className="block text-cyan-400 font-bold mb-3">
                  🌍 Filter
                </label>
                <select
                  value={filterUniverse}
                  onChange={(e) => setFilterUniverse(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-700/50 text-white border border-slate-600/50 focus:border-cyan-400 focus:outline-none text-sm focus:ring-2 focus:ring-cyan-400/30 transition"
                >
                  {universes.map(u => (
                    <option key={u} value={u} className="bg-slate-900">
                      {u === 'all' ? '🌟 All Universes' : `${universeEmojis[u] || ''} ${u}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div className="mb-6">
                <label className="block text-cyan-400 font-bold mb-3">
                  ⚙️ Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-700/50 text-white border border-slate-600/50 focus:border-cyan-400 focus:outline-none text-sm focus:ring-2 focus:ring-cyan-400/30 transition"
                >
                  <option value="newest" className="bg-slate-900">🕐 Newest</option>
                  <option value="oldest" className="bg-slate-900">🕰️ Oldest</option>
                  <option value="rating" className="bg-slate-900">⭐ Top Rated</option>
                  <option value="words" className="bg-slate-900">📖 Longest</option>
                </select>
              </div>

              {/* Refresh Button */}
              <button
                onClick={fetchStories}
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/30 transform hover:scale-105 active:scale-95 duration-200"
              >
                {loading ? '⟳ Refreshing...' : '⟳ Refresh'}
              </button>
            </div>

            {/* Stories List */}
            <div className="mt-6 space-y-3 max-h-[80vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
              {processedStories.length === 0 ? (
                <div className="text-slate-400 text-center py-8">
                  {stories.length === 0 ? '✨ No stories yet' : '🔍 No matches found'}
                </div>
              ) : (
                processedStories.map((story, idx) => (
                  <button
                    key={story.id}
                    onClick={() => handleStoryClick(story.id)}
                    className={`w-full text-left p-4 rounded-xl transition transform hover:scale-105 duration-300 border-2 group animate-slide-up ${
                      selectedStory?.id === story.id
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 border-transparent text-white shadow-lg shadow-cyan-500/50'
                        : 'bg-slate-800/50 text-slate-200 hover:bg-slate-700/50 border-slate-700 hover:border-slate-600'
                    }`}
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div className="font-semibold text-sm truncate flex gap-2 items-center">
                      <span>{universeEmojis[story.universe] || '📖'}</span>
                      {story.what_if}
                    </div>
                    <div className="text-xs opacity-75 mt-2">
                      {new Date(story.created_at).toLocaleDateString()}
                    </div>
                    <div className="text-xs opacity-60 mt-1 flex gap-2">
                      <span>{'⭐'.repeat(story.rating) || '★'}</span>
                      <span>•</span>
                      <span>{story.word_count}w</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Story Detail View */}
          <div className="lg:col-span-3">
            {selectedStory ? (
              <div className="animate-slide-up">
                <div className={`bg-gradient-to-br ${colorClass.light} rounded-2xl p-1 shadow-2xl`}>
                  <div className="bg-white rounded-2xl p-12 shadow-2xl">
                    <div className="mb-8">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <div className="text-5xl mb-4">{universeEmojis[selectedStory.universe]}</div>
                          <span className={`inline-block bg-gradient-to-r ${colorClass.gradient} text-white px-4 py-2 rounded-full text-sm font-bold mb-3 shadow-lg`}>
                            {selectedStory.universe}
                          </span>
                          <h2 className="text-4xl font-black text-slate-900 leading-tight">
                            What if {selectedStory.what_if}?
                          </h2>
                        </div>
                        <div className="text-right">
                          <div className="text-4xl font-black text-slate-900">{selectedStory.word_count}</div>
                          <div className="text-sm text-slate-600 mb-4">words</div>
                          <div className="text-xs text-slate-500">
                            {new Date(selectedStory.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="prose prose-lg max-w-none mb-10">
                      {selectedStory.story.split('\n').map((paragraph, i) => (
                        <p key={i} className="mb-6 text-slate-700 leading-relaxed text-lg">
                          {paragraph}
                        </p>
                      ))}
                    </div>

                    <div className="pt-8 border-t-2 border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-6">
                      <Link 
                        href="/"
                        className="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold rounded-full transition transform hover:scale-105 shadow-lg shadow-blue-500/30"
                      >
                        ⚡ Create New
                      </Link>
                      <div className="flex gap-3">
                        <span className="text-sm text-slate-600 font-semibold">Rate:</span>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map(rating => (
                            <button
                              key={rating}
                              onClick={() => handleRating(rating)}
                              disabled={ratingLoading}
                              className={`text-4xl transition duration-200 cursor-pointer select-none transform ${
                                rating <= selectedStory.rating ? 'opacity-100 drop-shadow-lg' : 'opacity-30'
                              } hover:opacity-100 hover:scale-125 active:scale-110 disabled:cursor-not-allowed`}
                              title={`Rate ${rating} star${rating > 1 ? 's' : ''}`}
                            >
                              ⭐
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-12 text-center text-slate-400 border border-slate-600/30 animate-fade-in">
                {stories.length === 0 ? (
                  <div>
                    <p className="text-6xl mb-4">✨</p>
                    <p className="text-2xl font-bold mb-4">No stories yet</p>
                    <p className="text-slate-500 mb-6">Create your first story to see it here</p>
                    <Link 
                      href="/"
                      className="inline-block px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold rounded-full transition transform hover:scale-105 shadow-lg shadow-cyan-500/30"
                    >
                      ⚡ Generate Story
                    </Link>
                  </div>
                ) : (
                  <div>
                    <p className="text-2xl font-bold">👈 Select a story to read</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
      `}</style>
    </main>
  );
}
