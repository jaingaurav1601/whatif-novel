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
  const [visibleSections, setVisibleSections] = useState({});

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            setVisibleSections(prev => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    const sections = document.querySelectorAll('[data-scroll-animate]');
    sections.forEach(section => observer.observe(section));

    return () => {
      sections.forEach(section => observer.unobserve(section));
    };
  }, []);

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

  // Separate effect for story fetching to prevent interfering with generated stories
  useEffect(() => {
    const timer = setInterval(() => {
      getStoryHistory(1000).then(data => {
        setStories(data.stories || []);
      }).catch(() => {
        setStories([]);
      });
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(timer);
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
      
      // Scroll to story display after it's generated
      setTimeout(() => {
        const storySection = document.getElementById('story-section');
        if (storySection) {
          storySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
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
        <div className="mb-16">
          {/* Animated magical background */}
          <div className="relative h-[600px] rounded-3xl overflow-hidden mb-12 group">
            {/* Multi-layered animated background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-950"></div>
            
            {/* Animated starfield */}
            <div className="absolute inset-0">
              {Array.from({ length: 50 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute rounded-full bg-white animate-twinkle"
                  style={{
                    width: Math.random() * 3 + 'px',
                    height: Math.random() * 3 + 'px',
                    left: Math.random() * 100 + '%',
                    top: Math.random() * 100 + '%',
                    opacity: Math.random() * 0.7 + 0.3,
                    animationDelay: Math.random() * 3 + 's',
                    boxShadow: `0 0 ${Math.random() * 20 + 10}px rgba(255, 255, 255, ${Math.random() * 0.5})`
                  }}
                ></div>
              ))}
            </div>

            {/* Animated gradient orbs */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-float"></div>
            <div className="absolute bottom-0 right-10 w-96 h-96 bg-cyan-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-float animation-delay-3000"></div>
            <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-blue-500 rounded-full mix-blend-screen filter blur-3xl opacity-15 animate-pulse-large"></div>

            {/* Floating particles */}
            <div className="absolute inset-0">
              {Array.from({ length: 30 }).map((_, i) => (
                <div
                  key={`particle-${i}`}
                  className="absolute rounded-full bg-gradient-to-r from-cyan-400 to-purple-400 animate-float-particle"
                  style={{
                    width: Math.random() * 4 + 2 + 'px',
                    height: Math.random() * 4 + 2 + 'px',
                    left: Math.random() * 100 + '%',
                    top: Math.random() * 100 + '%',
                    opacity: Math.random() * 0.6,
                    animationDuration: Math.random() * 10 + 5 + 's',
                    animationDelay: Math.random() * 2 + 's'
                  }}
                ></div>
              ))}
            </div>

            {/* Content overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10 backdrop-blur-sm">
              <div className="animate-fade-in-slow">
                <h2 className="text-7xl md:text-8xl font-black mb-8 leading-tight">
                  <span className="bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent drop-shadow-2xl">
                    Reimagine
                  </span>
                  <br />
                  <span className="text-white drop-shadow-lg">Your Stories</span>
                </h2>
                <p className="text-2xl text-slate-200 max-w-2xl mx-auto mb-10 drop-shadow-lg">
                  ✨ Explore mind-bending "What If" scenarios across iconic universes
                </p>
                <div className="flex justify-center gap-6">
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                    <button 
                      onClick={() => document.getElementById('universe-section')?.scrollIntoView({ behavior: 'smooth' })}
                      className="relative px-10 py-4 bg-black rounded-full text-white font-bold text-lg group-hover:bg-slate-900 transition duration-300 cursor-pointer"
                    >
                      🚀 Start Creating
                    </button>
                  </div>
                  <Link 
                    href="/history"
                    className="px-10 py-4 bg-white/10 hover:bg-white/20 backdrop-blur border border-white/30 text-white font-bold text-lg rounded-full transition duration-300 cursor-pointer"
                  >
                    📚 View Gallery
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Divider with glow */}
          <div className="flex items-center justify-center gap-4 my-16">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
            <span className="text-cyan-400 text-2xl">✨</span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12" id="universe-section" data-scroll-animate>
          
          {/* Universe Cards */}
          <div className="lg:col-span-1">
            <h3 className="text-2xl font-bold mb-6 text-cyan-400">Select Universe</h3>
            <div className="space-y-4">
              {universes.map((u, idx) => (
                <button
                  key={u}
                  onClick={() => setSelectedUniverse(u)}
                  className={`w-full p-4 rounded-xl transition transform hover:scale-105 duration-300 border-2 group relative overflow-hidden animate-scale-in ${
                    selectedUniverse === u
                      ? `bg-gradient-to-r ${colorClass.gradient} border-transparent shadow-lg shadow-blue-500/50 animate-glow-pulse`
                      : 'bg-slate-800/50 border-slate-700 hover:border-slate-600 hover:bg-slate-700/50'
                  }`}
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  {/* Animated shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 animate-shimmer"></div>
                  
                  <div className="relative z-10 flex items-center gap-3">
                    <div className="text-3xl group-hover:animate-bounce">{universeEmojis[u]}</div>
                    <div className="font-bold text-lg text-left">{u}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Generator Form */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50 shadow-2xl group hover:shadow-cyan-500/20 transition-shadow duration-300">
              <form onSubmit={handleGenerate} className="space-y-6">
                
                {/* What If Input */}
                <div className="group/input">
                  <label className="block text-cyan-400 font-bold mb-3">
                    ✨ What If Scenario
                  </label>
                  <textarea
                    value={whatIf}
                    onChange={(e) => setWhatIf(e.target.value)}
                    placeholder="What if Harry Potter discovered he was actually a Muggle? What if Gandalf never came to Middle-earth?"
                    className="w-full px-4 py-4 rounded-xl bg-slate-900/50 text-white placeholder-slate-500 border-2 border-slate-700 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 min-h-[120px] transition resize-none group-focus-within/input:border-cyan-400 group-focus-within/input:shadow-lg group-focus-within/input:shadow-cyan-500/20"
                  />
                </div>

                {/* Length Selector */}
                <div>
                  <label className="block text-cyan-400 font-bold mb-3">
                    📖 Story Length
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {['short', 'medium', 'long'].map((l, idx) => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => setLength(l)}
                        className={`py-3 rounded-lg font-bold transition transform hover:scale-105 duration-300 relative overflow-hidden animate-scale-in ${
                          length === l
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/50 scale-105'
                            : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 border border-slate-600'
                        }`}
                        style={{ animationDelay: `${idx * 50}ms` }}
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
                  className="w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white font-bold py-4 rounded-xl hover:from-cyan-600 hover:via-blue-600 hover:to-purple-600 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 shadow-lg shadow-cyan-500/30 duration-300 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 animate-shimmer-fast"></div>
                  <span className="relative z-10">
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
                  </span>
                </button>

                {error && (
                  <div className="bg-red-500/20 border-2 border-red-500/50 text-red-300 px-4 py-3 rounded-xl animate-shake">
                    {error}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* Decorative divider with gradient */}
        <div className="my-16 flex items-center justify-center gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
          <div className="text-cyan-400/50 text-sm font-semibold tracking-widest">✨ YOUR STORIES ✨</div>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
        </div>

        {/* Stats Showcase */}
        {stories.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16" id="stats-section" data-scroll-animate>
            {[
              { icon: '📚', value: stories.length, label: 'Stories Created', color: 'cyan' },
              { icon: '⭐', value: ratingStats.average, label: 'Average Rating', color: 'amber' },
              { icon: '📝', value: stories.reduce((sum, s) => sum + s.word_count, 0).toLocaleString(), label: 'Total Words Written', color: 'purple' }
            ].map((stat, idx) => (
              <div 
                key={stat.label}
                className={`bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 text-center group hover:border-${stat.color}-500/50 transition transform hover:scale-105 hover:shadow-lg hover:shadow-${stat.color}-500/20 animate-scale-in`}
                style={{ animationDelay: `${idx * 150}ms` }}
              >
                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 rounded-2xl animate-shimmer"></div>
                
                <div className="relative z-10">
                  <div className="text-4xl mb-3 group-hover:animate-bounce">{stat.icon}</div>
                  <div className={`text-3xl font-black text-${stat.color}-400`}>{stat.value}</div>
                  <div className="text-slate-400 text-sm">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Story Display */}
        {story && (
          <div className="animate-slide-up relative group/story" id="story-section">
            {/* Decorative wrapper orbs */}
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-cyan-400 to-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-0 group-hover/story:opacity-30 transition-opacity duration-500 pointer-events-none"></div>
            <div className="absolute -bottom-20 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-0 group-hover/story:opacity-25 transition-opacity duration-500 pointer-events-none"></div>
            
            <div className={`bg-gradient-to-br ${colorClass.light} rounded-3xl p-1 shadow-2xl overflow-hidden relative transition-shadow duration-300 group-hover/story:shadow-xl`}>
              <div className="bg-gradient-to-br from-white via-slate-50 to-white rounded-3xl overflow-hidden">
                {/* Story Header with Visual Background */}
                <div className={`bg-gradient-to-r ${colorClass.gradient} text-white p-12 relative overflow-hidden group/header`}>
                  {/* Animated gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover/header:opacity-10 animate-shimmer"></div>
                  
                  <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 group-hover/header:animate-float"></div>
                  <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full -ml-40 -mb-40 group-hover/header:animate-float animation-delay-2000"></div>
                  <div className="relative z-10">
                    <div className="text-7xl mb-6 drop-shadow-lg group-hover/header:animate-bounce">{universeEmojis[story.universe]}</div>
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
                      <p key={i} className="mb-6 text-slate-700 leading-relaxed text-lg animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                        {paragraph}
                      </p>
                    ))}
                  </div>

                  {/* Rating & Stats Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8 border-t-2 border-slate-200">
                    {/* Rating Breakdown */}
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-8 border border-slate-200 group/stats hover:shadow-lg hover:shadow-slate-300/30 transition-shadow duration-300">
                      <h3 className="text-2xl font-black text-slate-900 mb-6">📊 Community Ratings</h3>
                      <div className="space-y-3">
                        {[5, 4, 3, 2, 1].map((stars, idx) => {
                          const count = ratingStats.counts[stars];
                          const percentage = ratingStats.totalRatings > 0 ? (count / ratingStats.totalRatings) * 100 : 0;
                          return (
                            <div key={stars} className="flex items-center gap-4 animate-scale-in" style={{ animationDelay: `${idx * 50}ms` }}>
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
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 border border-blue-200 flex flex-col justify-between group/rating hover:shadow-lg hover:shadow-blue-300/30 transition-shadow duration-300">
                      <div>
                        <h3 className="text-2xl font-black text-slate-900 mb-6">⭐ Rate This Story</h3>
                        <p className="text-slate-600 mb-6">What do you think of this tale? Share your rating!</p>
                      </div>
                      <div className="flex justify-center gap-3">
                        {[1, 2, 3, 4, 5].map((rating) => (
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
                        <div className="text-center mt-6 pt-6 border-t border-blue-200 animate-scale-in">
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
                      className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold rounded-full transition transform hover:scale-105 shadow-lg shadow-blue-500/30 group/btn relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover/btn:opacity-20 animate-shimmer-fast"></div>
                      <span className="relative z-10">📚 All Stories</span>
                    </Link>
                    <button
                      onClick={() => setStory(null)}
                      className="px-8 py-4 bg-slate-200 hover:bg-slate-300 text-slate-900 font-bold rounded-full transition transform hover:scale-105 group/btn2 relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover/btn2:opacity-20 animate-shimmer-fast"></div>
                      <span className="relative z-10">✨ Create Another</span>
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
        @keyframes fade-in-slow {
          from { opacity: 0; transform: translateY(30px); }
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
        @keyframes pulse-large {
          0%, 100% { transform: scale(1); opacity: 0.15; }
          50% { transform: scale(1.1); opacity: 0.25; }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-30px) translateX(10px); }
          50% { transform: translateY(-60px) translateX(20px); }
          75% { transform: translateY(-30px) translateX(10px); }
        }
        @keyframes float-particle {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 0.6;
          }
          90% {
            opacity: 0.6;
          }
          100% {
            transform: translateY(-100vh) translateX(100px);
            opacity: 0;
          }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes shimmer-fast {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(6, 182, 212, 0.3); }
          50% { box-shadow: 0 0 40px rgba(6, 182, 212, 0.6); }
        }
        @keyframes slide-in-left {
          from { opacity: 0; transform: translateX(-40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes rotate-in {
          from { opacity: 0; transform: rotate(-10deg) scale(0.9); }
          to { opacity: 1; transform: rotate(0deg) scale(1); }
        }
        @keyframes flip-in-x {
          from { opacity: 0; transform: rotateX(90deg); }
          to { opacity: 1; transform: rotateX(0deg); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-3000 {
          animation-delay: 3s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        .animate-fade-in-slow {
          animation: fade-in-slow 1.2s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
        .animate-pulse-soft {
          animation: pulse-soft 2s ease-in-out infinite;
        }
        .animate-pulse-large {
          animation: pulse-large 4s ease-in-out infinite;
        }
        .animate-twinkle {
          animation: twinkle 3s ease-in-out infinite;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-particle {
          animation: float-particle linear infinite;
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        .animate-shimmer-fast {
          animation: shimmer-fast 1.5s infinite;
        }
        .animate-scale-in {
          animation: scale-in 0.6s ease-out;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        .animate-glow-pulse {
          animation: glow-pulse 3s ease-in-out infinite;
        }
        .animate-slide-in-left {
          animation: slide-in-left 0.6s ease-out;
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.6s ease-out;
        }
        .animate-rotate-in {
          animation: rotate-in 0.6s ease-out;
        }
        .animate-flip-in-x {
          animation: flip-in-x 0.8s ease-out;
          perspective: 1000px;
        }
        /* Scroll animation state */
        [data-scroll-animate] {
          opacity: 0;
          transition: opacity 0.6s ease-out, transform 0.6s ease-out;
          transform: translateY(20px);
        }
        [data-scroll-animate].visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </main>
  );
}