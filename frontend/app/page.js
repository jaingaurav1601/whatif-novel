'use client';

import { useState, useEffect } from 'react';
import { getUniverses, generateStory, rateStory, getStoryHistory } from '@/lib/api';
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

export default function Home() {
  const [universes, setUniverses] = useState([]);
  const [selectedUniverse, setSelectedUniverse] = useState('');
  const [whatIf, setWhatIf] = useState('');
  const [length, setLength] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [story, setStory] = useState(null);
  const [error, setError] = useState('');
  const [ratingLoading, setRatingLoading] = useState(false);
  const [stories, setStories] = useState([]);

  useEffect(() => {
    getUniverses().then(data => {
      setUniverses(data.universes);
      if (data.universes.length > 0) {
        setSelectedUniverse(data.universes[0]);
      }
    });
    // Fetch stories to calculate average ratings
    getStoryHistory(1000).then(data => {
      setStories(data.stories || []);
    }).catch(() => {
      setStories([]);
    });
  }, []);

  const handleGenerate = async (e) => {
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
    } catch (err) {
      setError('Failed to generate story. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRating = async (rating) => {
    if (!story) return;
    
    setRatingLoading(true);
    try {
      await rateStory(story.id, rating);
      setStory({ ...story, rating });
    } catch (err) {
      setError('Failed to save rating.');
    } finally {
      setRatingLoading(false);
    }
  };

  const colorClass = universeColors[selectedUniverse] || universeColors['Harry Potter'];

  // Calculate rating statistics
  const getRatingStats = () => {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let total = 0;
    stories.forEach(s => {
      if (s.rating > 0) {
        counts[s.rating]++;
        total += s.rating;
      }
    });
    const totalRatings = Object.values(counts).reduce((a, b) => a + b, 0);
    const average = totalRatings > 0 ? (total / totalRatings).toFixed(1) : 0;
    return { counts, average, totalRatings };
  };

  const ratingStats = getRatingStats();

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
        {/* Navigation */}
        <div className="flex justify-between items-center mb-16">
          <h1 className="text-4xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            ✨ What If Novel
          </h1>
          <Link 
            href="/history"
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold rounded-full transition transform hover:scale-105 shadow-lg shadow-cyan-500/30"
          >
            📚 History
          </Link>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-6xl md:text-7xl font-black mb-6 leading-tight">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Reimagine
            </span>
            <br />
            <span className="text-white">Your Favorite Stories</span>
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8">
            Explore mind-bending "What If" scenarios across iconic universes. Let AI weave tales of alternate realities.
          </p>
        </div>

        {/* Stats Showcase */}
        {stories.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 text-center group hover:border-cyan-500/50 transition">
              <div className="text-4xl mb-3">📚</div>
              <div className="text-3xl font-black text-cyan-400">{stories.length}</div>
              <div className="text-slate-400 text-sm">Stories Created</div>
            </div>
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 text-center group hover:border-cyan-500/50 transition">
              <div className="text-4xl mb-3">⭐</div>
              <div className="text-3xl font-black text-amber-400">{ratingStats.average}</div>
              <div className="text-slate-400 text-sm">Average Rating</div>
            </div>
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 text-center group hover:border-cyan-500/50 transition">
              <div className="text-4xl mb-3">📝</div>
              <div className="text-3xl font-black text-purple-400">{stories.reduce((sum, s) => sum + s.word_count, 0).toLocaleString()}</div>
              <div className="text-slate-400 text-sm">Total Words Written</div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          
          {/* Universe Cards */}
          <div className="lg:col-span-1">
            <h3 className="text-2xl font-bold mb-6 text-cyan-400">Select Universe</h3>
            <div className="space-y-4">
              {universes.map(u => (
                <button
                  key={u}
                  onClick={() => setSelectedUniverse(u)}
                  className={`w-full p-4 rounded-xl transition transform hover:scale-105 duration-300 border-2 group ${
                    selectedUniverse === u
                      ? `bg-gradient-to-r ${colorClass.gradient} border-transparent shadow-lg shadow-blue-500/50`
                      : 'bg-slate-800/50 border-slate-700 hover:border-slate-600 hover:bg-slate-700/50'
                  }`}
                >
                  <div className="text-3xl mb-2">{universeEmojis[u]}</div>
                  <div className="font-bold text-lg">{u}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Generator Form */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50 shadow-2xl">
              <form onSubmit={handleGenerate} className="space-y-6">
                
                {/* What If Input */}
                <div>
                  <label className="block text-cyan-400 font-bold mb-3">
                    ✨ What If Scenario
                  </label>
                  <textarea
                    value={whatIf}
                    onChange={(e) => setWhatIf(e.target.value)}
                    placeholder="What if Harry Potter discovered he was actually a Muggle? What if Gandalf never came to Middle-earth?"
                    className="w-full px-4 py-4 rounded-xl bg-slate-900/50 text-white placeholder-slate-500 border-2 border-slate-700 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 min-h-[120px] transition resize-none"
                  />
                </div>

                {/* Length Selector */}
                <div>
                  <label className="block text-cyan-400 font-bold mb-3">
                    📖 Story Length
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {['short', 'medium', 'long'].map(l => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => setLength(l)}
                        className={`py-3 rounded-lg font-bold transition transform hover:scale-105 duration-300 ${
                          length === l
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/50 scale-105'
                            : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 border border-slate-600'
                        }`}
                      >
                        {l === 'short' && '🎯'}
                        {l === 'medium' && '📚'}
                        {l === 'long' && '📖'}
                        {' ' + l.charAt(0).toUpperCase() + l.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white font-bold py-4 rounded-xl hover:from-cyan-600 hover:via-blue-600 hover:to-purple-600 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 shadow-lg shadow-cyan-500/30 duration-300"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      ✨ Weaving Reality...
                    </span>
                  ) : (
                    '⚡ Generate Story'
                  )}
                </button>

                {error && (
                  <div className="bg-red-500/20 border-2 border-red-500/50 text-red-300 px-4 py-3 rounded-xl">
                    {error}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* Story Display */}
        {story && (
          <div className="animate-slide-up">
            <div className={`bg-gradient-to-br ${colorClass.light} rounded-3xl p-1 shadow-2xl overflow-hidden`}>
              <div className="bg-gradient-to-br from-white via-slate-50 to-white rounded-3xl overflow-hidden">
                {/* Story Header with Visual Background */}
                <div className={`bg-gradient-to-r ${colorClass.gradient} text-white p-12 relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48"></div>
                  <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full -ml-40 -mb-40"></div>
                  <div className="relative z-10">
                    <div className="text-7xl mb-6 drop-shadow-lg">{universeEmojis[story.universe]}</div>
                    <span className="inline-block bg-white/20 backdrop-blur text-white px-4 py-2 rounded-full text-sm font-bold mb-4 shadow-lg border border-white/30">
                      {story.universe}
                    </span>
                    <h2 className="text-5xl font-black leading-tight mb-4">
                      What if {story.what_if}?
                    </h2>
                    <div className="flex gap-8 items-center text-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-3xl">📖</span>
                        <div>
                          <div className="font-black text-2xl">{story.word_count}</div>
                          <div className="text-sm opacity-90">words</div>
                        </div>
                      </div>
                      <div className="h-12 w-px bg-white/30"></div>
                      <div className="flex items-center gap-3">
                        <div className="text-4xl font-black">{story.rating}</div>
                        <div className="text-2xl">⭐</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-12">
                  {/* Story Content */}
                  <div className="prose prose-lg max-w-none mb-12">
                    {story.story.split('\n').map((paragraph, i) => (
                      <p key={i} className="mb-6 text-slate-700 leading-relaxed text-lg">
                        {paragraph}
                      </p>
                    ))}
                  </div>

                  {/* Rating & Stats Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8 border-t-2 border-slate-200">
                    {/* Rating Breakdown */}
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-8 border border-slate-200">
                      <h3 className="text-2xl font-black text-slate-900 mb-6">📊 Community Ratings</h3>
                      <div className="space-y-3">
                        {[5, 4, 3, 2, 1].map(stars => {
                          const count = ratingStats.counts[stars];
                          const percentage = ratingStats.totalRatings > 0 ? (count / ratingStats.totalRatings) * 100 : 0;
                          return (
                            <div key={stars} className="flex items-center gap-4">
                              <div className="flex gap-1 text-xl">
                                {'⭐'.repeat(stars)}<span className="text-slate-300">{'⭐'.repeat(5 - stars)}</span>
                              </div>
                              <div className="flex-1">
                                <div className="bg-slate-300 rounded-full h-2 overflow-hidden">
                                  <div 
                                    className={`h-full bg-gradient-to-r ${colorClass.gradient} transition-all duration-500`}
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-slate-900">{count}</div>
                                <div className="text-xs text-slate-600">{percentage.toFixed(0)}%</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-6 pt-6 border-t border-slate-300 flex justify-between items-center">
                        <div>
                          <div className="text-sm text-slate-600 font-semibold">Average Rating</div>
                          <div className="text-4xl font-black text-slate-900">{ratingStats.average}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-slate-600 font-semibold">Total Ratings</div>
                          <div className="text-3xl font-black text-slate-900">{ratingStats.totalRatings}</div>
                        </div>
                      </div>
                    </div>

                    {/* Rate This Story */}
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 border border-blue-200 flex flex-col justify-between">
                      <div>
                        <h3 className="text-2xl font-black text-slate-900 mb-6">⭐ Rate This Story</h3>
                        <p className="text-slate-600 mb-6">What do you think of this tale? Share your rating!</p>
                      </div>
                      <div className="flex justify-center gap-3">
                        {[1, 2, 3, 4, 5].map(rating => (
                          <button
                            key={rating}
                            onClick={() => handleRating(rating)}
                            disabled={ratingLoading}
                            className={`text-6xl transition duration-300 cursor-pointer select-none transform hover:scale-125 active:scale-110 disabled:cursor-not-allowed ${
                              rating <= story.rating ? 'drop-shadow-lg animate-pulse-soft' : 'opacity-40 hover:opacity-80'
                            }`}
                            title={`Rate ${rating} star${rating > 1 ? 's' : ''}`}
                          >
                            ⭐
                          </button>
                        ))}
                      </div>
                      {story.rating > 0 && (
                        <div className="text-center mt-6 pt-6 border-t border-blue-200">
                          <p className="text-sm text-slate-600">Your rating:</p>
                          <p className="text-2xl font-black text-blue-600">{'⭐'.repeat(story.rating)}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom CTA */}
                  <div className="mt-12 flex gap-4 justify-center">
                    <Link 
                      href="/history"
                      className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold rounded-full transition transform hover:scale-105 shadow-lg shadow-blue-500/30"
                    >
                      📚 All Stories
                    </Link>
                    <button
                      onClick={() => setStory(null)}
                      className="px-8 py-4 bg-slate-200 hover:bg-slate-300 text-slate-900 font-bold rounded-full transition transform hover:scale-105"
                    >
                      ✨ Create Another
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
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
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-soft {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
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
        .animate-pulse-soft {
          animation: pulse-soft 2s ease-in-out infinite;
        }
      `}</style>
    </main>
  );
}