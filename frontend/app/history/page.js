'use client';

import { useState, useEffect } from 'react';
import { getStoryHistory, getStory, rateStory } from '@/lib/api';
import Link from 'next/link';

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

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      <div className="container mx-auto px-4 py-12">
        
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-block px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-cyan-400 hover:text-cyan-300 font-semibold rounded-lg mb-4 transition border border-slate-600/30"
          >
            ← Back to Generator
          </Link>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Story History
          </h1>
          <p className="text-slate-400">
            {stories.length} {stories.length === 1 ? 'story' : 'stories'} generated • Explore your creations and revisit your favorite tales
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Story List Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-lg rounded-2xl p-6 shadow-2xl sticky top-4 border border-slate-600/30">
              
              {/* Filter */}
              <div className="mb-6">
                <label className="block text-slate-200 font-semibold mb-2">
                  Universe
                </label>
                <select
                  value={filterUniverse}
                  onChange={(e) => setFilterUniverse(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-700/50 text-white border border-slate-500/50 focus:border-cyan-400 focus:outline-none text-sm focus:ring-1 focus:ring-cyan-400/30"
                >
                  {universes.map(u => (
                    <option key={u} value={u} className="bg-slate-900">
                      {u === 'all' ? 'All Universes' : u}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div className="mb-6">
                <label className="block text-slate-200 font-semibold mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-700/50 text-white border border-slate-500/50 focus:border-cyan-400 focus:outline-none text-sm focus:ring-1 focus:ring-cyan-400/30"
                >
                  <option value="newest" className="bg-slate-900">Newest</option>
                  <option value="oldest" className="bg-slate-900">Oldest</option>
                  <option value="rating" className="bg-slate-900">Highest Rated</option>
                  <option value="words" className="bg-slate-900">Longest</option>
                </select>
              </div>

              {/* Refresh Button */}
              <button
                onClick={fetchStories}
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20"
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>

            {/* Stories List */}
            <div className="mt-6 space-y-3 max-h-[80vh] overflow-y-auto">
              {processedStories.length === 0 ? (
                <div className="text-slate-400 text-center py-8">
                  No stories found
                </div>
              ) : (
                processedStories.map(story => (
                  <button
                    key={story.id}
                    onClick={() => handleStoryClick(story.id)}
                    className={`w-full text-left p-4 rounded-lg transition ${
                      selectedStory?.id === story.id
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                        : 'bg-slate-800/50 text-slate-200 hover:bg-slate-700/50 border border-slate-600/30'
                    }`}
                  >
                    <div className="font-semibold text-sm truncate">
                      {story.what_if}
                    </div>
                    <div className="text-xs opacity-75 mt-1">
                      {story.universe}
                    </div>
                    <div className="text-xs opacity-60 mt-1">
                      {'⭐'.repeat(story.rating)} {story.word_count} words
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Story Detail View */}
          <div className="lg:col-span-3">
            {selectedStory ? (
              <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-8 shadow-2xl">
                <div className="mb-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="inline-block bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold mb-2">
                        {selectedStory.universe}
                      </span>
                      <h2 className="text-3xl font-bold text-slate-900">
                        What if {selectedStory.what_if}?
                      </h2>
                    </div>
                    <div className="text-right text-sm text-slate-500">
                      <div>{selectedStory.word_count} words</div>
                      <div className="text-xs mt-1">
                        {new Date(selectedStory.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="prose prose-lg max-w-none mb-8">
                  {selectedStory.story.split('\n').map((paragraph, i) => (
                    <p key={i} className="mb-4 text-slate-700 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>

                <div className="pt-6 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-semibold">Rate this story:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(rating => (
                        <button
                          key={rating}
                          onClick={() => handleRating(rating)}
                          disabled={ratingLoading}
                          className={`text-3xl transition duration-200 cursor-pointer select-none ${
                            rating <= selectedStory.rating ? 'opacity-100' : 'opacity-40'
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
            ) : (
              <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-12 text-center text-slate-400 border border-slate-600/30">
                {stories.length === 0 ? (
                  <div>
                    <p className="text-lg mb-4">No stories yet</p>
                    <Link 
                      href="/"
                      className="text-cyan-400 hover:text-cyan-300 font-semibold transition"
                    >
                      Generate your first story →
                    </Link>
                  </div>
                ) : (
                  <p className="text-lg">Select a story to read</p>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}
