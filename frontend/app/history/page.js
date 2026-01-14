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
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-12">
        
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/"
            className="text-purple-300 hover:text-purple-100 font-semibold mb-4 inline-block"
          >
            ← Back to Generator
          </Link>
          <h1 className="text-5xl font-bold text-white mb-2">
            Story History
          </h1>
          <p className="text-purple-200">
            {stories.length} {stories.length === 1 ? 'story' : 'stories'} generated
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Story List Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl sticky top-4">
              
              {/* Filter */}
              <div className="mb-6">
                <label className="block text-white font-semibold mb-2">
                  Universe
                </label>
                <select
                  value={filterUniverse}
                  onChange={(e) => setFilterUniverse(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/20 text-white border border-white/30 focus:border-purple-400 focus:outline-none text-sm"
                >
                  {universes.map(u => (
                    <option key={u} value={u} className="bg-gray-900">
                      {u === 'all' ? 'All Universes' : u}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div className="mb-6">
                <label className="block text-white font-semibold mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/20 text-white border border-white/30 focus:border-purple-400 focus:outline-none text-sm"
                >
                  <option value="newest" className="bg-gray-900">Newest</option>
                  <option value="oldest" className="bg-gray-900">Oldest</option>
                  <option value="rating" className="bg-gray-900">Highest Rated</option>
                  <option value="words" className="bg-gray-900">Longest</option>
                </select>
              </div>

              {/* Refresh Button */}
              <button
                onClick={fetchStories}
                disabled={loading}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>

            {/* Stories List */}
            <div className="mt-6 space-y-3 max-h-[80vh] overflow-y-auto">
              {processedStories.length === 0 ? (
                <div className="text-white/60 text-center py-8">
                  No stories found
                </div>
              ) : (
                processedStories.map(story => (
                  <button
                    key={story.id}
                    onClick={() => handleStoryClick(story.id)}
                    className={`w-full text-left p-4 rounded-lg transition ${
                      selectedStory?.id === story.id
                        ? 'bg-purple-500 text-white'
                        : 'bg-white/10 text-white hover:bg-white/20'
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
              <div className="bg-white rounded-2xl p-8 shadow-2xl">
                <div className="mb-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold mb-2">
                        {selectedStory.universe}
                      </span>
                      <h2 className="text-3xl font-bold text-gray-800">
                        What if {selectedStory.what_if}?
                      </h2>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <div>{selectedStory.word_count} words</div>
                      <div className="text-xs mt-1">
                        {new Date(selectedStory.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="prose prose-lg max-w-none mb-8">
                  {selectedStory.story.split('\n').map((paragraph, i) => (
                    <p key={i} className="mb-4 text-gray-700 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 font-semibold">Rate this story:</span>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(rating => (
                        <button
                          key={rating}
                          onClick={() => handleRating(rating)}
                          disabled={ratingLoading}
                          className={`text-3xl transition ${
                            rating <= selectedStory.rating ? 'opacity-100' : 'opacity-40'
                          } hover:scale-110 disabled:cursor-not-allowed`}
                        >
                          ⭐
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 text-center text-white/60">
                {stories.length === 0 ? (
                  <div>
                    <p className="text-lg mb-4">No stories yet</p>
                    <Link 
                      href="/"
                      className="text-purple-300 hover:text-purple-100 font-semibold"
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
