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
  'One Piece': '🏴‍☠️',
  'Naruto': '🌀',
  'Attack on Titan': '⚔️',
  'DC': '🦇'
};

const universeColors = {
  'Harry Potter': 'from-amber-500 via-red-500 to-purple-600',
  'Lord of the Rings': 'from-green-600 via-emerald-500 to-teal-600',
  'Marvel MCU': 'from-red-600 via-blue-500 to-yellow-500',
  'Star Wars': 'from-yellow-500 via-orange-500 to-red-600',
  'One Piece': 'from-orange-500 via-red-500 to-pink-500',
  'Naruto': 'from-orange-600 via-yellow-500 to-red-600',
  'Attack on Titan': 'from-gray-700 via-red-600 to-gray-900',
  'DC': 'from-blue-600 via-yellow-500 to-red-600'
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
      // Show more recent stories (12 instead of 6)
      setCommunityStories(stories.slice(0, 12));
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
        // If no prompt manually entered, try to generate one first or let backend handle it
        let promptToUse = customSystemPrompt;
        if (!promptToUse && customUniverseName) {
          // Optional: auto-generate if empty. For now trust backend or user.
          // Actually backend generate_custom_story might need prompt. 
          // Let's ensure we have a prompt if the user didn't generate one.
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

  const selectedColor = universeColors[selectedUniverse] || 'from-purple-600 to-blue-600';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 animate-gradient">
      {/* Floating sparkles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-pink-400 rounded-full animate-sparkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: 0.6
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="border-b border-purple-200 dark:border-purple-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent animate-shimmer">
            ✨ What If Novel
          </h1>
          <div className="flex gap-3">
            <Link
              href="/stats"
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg transition shadow-lg"
            >
              📊 Stats
            </Link>
            <Link
              href="/history"
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium rounded-lg transition shadow-lg"
            >
              📚 History
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-6xl relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 blur-3xl opacity-30 animate-pulse-glow"></div>
            <h2 className="relative text-6xl md:text-7xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              Reimagine Reality
            </h2>
          </div>
          <p className="text-2xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto mb-4 font-medium">
            Where imagination meets AI to create infinite possibilities
          </p>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Explore alternative storylines in your favorite universes, powered by cutting-edge AI
          </p>
        </div>

        {/* Stats */}
        {stats.total > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { icon: '📚', value: stats.total, label: 'Stories Created', gradient: 'from-blue-500 to-cyan-500' },
              { icon: '⭐', value: stats.avgRating, label: 'Average Rating', gradient: 'from-yellow-500 to-orange-500' },
              { icon: '📝', value: stats.totalWords.toLocaleString(), label: 'Words Written', gradient: 'from-purple-500 to-pink-500' }
            ].map((stat, idx) => (
              <div
                key={stat.label}
                className="relative group animate-fade-in"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} rounded-2xl blur opacity-25 group-hover:opacity-40 transition`}></div>
                <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:scale-105 transition-transform">
                  <div className="text-4xl mb-2 animate-float" style={{ animationDelay: `${idx * 0.5}s` }}>{stat.icon}</div>
                  <div className={`text-3xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Universe Selection */}
          <div className="lg:col-span-1 animate-slide-in">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">🌌</span>
              Choose Your Universe
            </h3>
            <div className="space-y-3">
              {universes.map((u, idx) => (
                <button
                  key={u}
                  onClick={() => {
                    setSelectedUniverse(u);
                    setIsCustomUniverse(false);
                  }}
                  className={`w-full p-4 rounded-xl text-left transition-all border-2 group relative overflow-hidden animate-fade-in ${!isCustomUniverse && selectedUniverse === u
                    ? `bg-gradient-to-r ${universeColors[u]} text-white border-transparent shadow-lg scale-105`
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-600 hover:scale-102'
                    }`}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  {!isCustomUniverse && selectedUniverse === u ? null : (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-100 dark:via-purple-900 to-transparent opacity-0 group-hover:opacity-100 transition-opacity animate-shimmer"></div>
                  )}
                  <div className="relative flex items-center gap-3">
                    <span className="text-3xl group-hover:scale-110 transition-transform">{universeEmojis[u] || '🌌'}</span>
                    <span className={`font-bold text-lg ${!isCustomUniverse && selectedUniverse === u ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                      {u}
                    </span>
                  </div>
                </button>
              ))}

              {/* Custom Universe Button */}
              <button
                onClick={() => setIsCustomUniverse(true)}
                className={`w-full p-4 rounded-xl text-left transition-all border-2 group relative overflow-hidden animate-fade-in ${isCustomUniverse
                  ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white border-transparent shadow-lg scale-105'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-600 hover:scale-102'
                  }`}
              >
                <div className="relative flex items-center gap-3">
                  <span className="text-3xl group-hover:scale-110 transition-transform">✨</span>
                  <span className={`font-bold text-lg ${isCustomUniverse ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                    Custom Universe
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Generator Form */}
          <div className="lg:col-span-2 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <div className="relative group">
              <div className={`absolute inset-0 bg-gradient-to-r ${isCustomUniverse ? 'from-pink-500 via-purple-500 to-indigo-500' : selectedColor} rounded-2xl blur opacity-20 group-hover:opacity-30 transition`}></div>
              <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700">
                <form onSubmit={handleGenerateStory} className="space-y-6">

                  {isCustomUniverse && (
                    <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 animate-slide-in">
                      <div>
                        <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
                          Universe Name
                        </label>
                        <input
                          type="text"
                          value={customUniverseName}
                          onChange={(e) => setCustomUniverseName(e.target.value)}
                          placeholder="e.g. Cyberpunk 2077, Dune, My Original World"
                          className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-sm font-bold text-gray-900 dark:text-white">
                            System Prompt (Optional)
                          </label>
                          <button
                            type="button"
                            onClick={handleGenerateSystemPrompt}
                            disabled={!customUniverseName || promptLoading}
                            className="text-xs px-3 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 rounded-full hover:bg-purple-200 dark:hover:bg-purple-800 transition disabled:opacity-50"
                          >
                            {promptLoading ? 'Generating...' : '✨ Auto-Generate'}
                          </button>
                        </div>
                        <textarea
                          value={customSystemPrompt}
                          onChange={(e) => setCustomSystemPrompt(e.target.value)}
                          placeholder="Describe the world, rules, and tone..."
                          className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none min-h-[100px] text-sm"
                        />
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="block text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <span className="text-2xl">💭</span>
                      What If Scenario
                    </label>
                    <textarea
                      value={whatIf}
                      onChange={(e) => setWhatIf(e.target.value)}
                      placeholder="What if Harry Potter was sorted into Slytherin? What if Gandalf never came to Middle-earth?"
                      className="w-full px-4 py-4 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border-2 border-gray-300 dark:border-gray-600 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 outline-none min-h-[140px] resize-none transition text-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <span className="text-2xl">📏</span>
                      Story Length
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'short', icon: '⚡', label: 'Quick' },
                        { value: 'medium', icon: '📖', label: 'Standard' },
                        { value: 'long', icon: '📚', label: 'Epic' }
                      ].map((l) => (
                        <button
                          key={l.value}
                          type="button"
                          onClick={() => setLength(l.value)}
                          className={`py-4 rounded-xl font-bold transition-all border-2 ${length === l.value
                            ? `bg-gradient-to-r ${selectedColor} text-white border-transparent shadow-lg scale-105`
                            : 'bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-600 hover:scale-102'
                            }`}
                        >
                          <div className="text-2xl mb-1">{l.icon}</div>
                          {l.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full bg-gradient-to-r ${selectedColor} hover:opacity-90 text-white font-bold py-5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl text-lg relative overflow-hidden group/btn`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover/btn:opacity-20 animate-shimmer"></div>
                    <span className="relative flex items-center justify-center gap-3">
                      {loading ? (
                        <>
                          <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Weaving Your Story...
                        </>
                      ) : (
                        <>
                          <span className="text-2xl">✨</span>
                          Generate Story
                        </>
                      )}
                    </span>
                  </button>

                  {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl font-medium">
                      {error}
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Community Stories Section */}
        {communityStories.length > 0 && !story && (
          <div className="mb-12 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <span className="text-4xl">🌟</span>
                  Community Stories
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Explore recent creations from our community
                </p>
              </div>
              <Link
                href="/history"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition shadow-lg"
              >
                View All {stats.total} Stories →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {communityStories.map((communityStory, idx) => (
                <Link
                  key={communityStory.id}
                  href="/history"
                  className="group relative animate-fade-in"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${universeColors[communityStory.universe] || 'from-purple-600 to-blue-600'} rounded-2xl blur opacity-20 group-hover:opacity-30 transition`}></div>
                  <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:scale-105 transition-transform">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-4xl group-hover:scale-110 transition-transform">{universeEmojis[communityStory.universe] || '📖'}</span>
                      <span className="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full font-medium">
                        {communityStory.universe}
                      </span>
                    </div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition">
                      What if {communityStory.what_if}?
                    </h4>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        ⭐ {(communityStory.average_rating || 0).toFixed(1)}
                      </span>
                      <span>•</span>
                      <span>{communityStory.word_count} words</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-8">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Explore {stats.total} amazing stories created by our community!
              </p>
            </div>
          </div>
        )}

        {/* Story Display */}
        {story && (
          <div id="story-section" className="animate-fade-in">
            <div className="relative group/story">
              <div className={`absolute inset-0 bg-gradient-to-r ${universeColors[story.universe]} rounded-3xl blur-xl opacity-30 group-hover/story:opacity-40 transition`}></div>
              <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Story Header */}
                <div className={`bg-gradient-to-r ${universeColors[story.universe]} text-white p-10 relative overflow-hidden`}>
                  <div className="absolute inset-0 opacity-10">
                    {[...Array(10)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute rounded-full bg-white animate-float"
                        style={{
                          width: `${Math.random() * 100 + 50}px`,
                          height: `${Math.random() * 100 + 50}px`,
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                          animationDelay: `${i * 0.5}s`
                        }}
                      />
                    ))}
                  </div>
                  <div className="relative flex items-start justify-between mb-6">
                    <div>
                      <div className="text-6xl mb-4 animate-float">{universeEmojis[story.universe]}</div>
                      <span className="inline-block bg-white/20 backdrop-blur px-4 py-2 rounded-full text-sm font-bold border border-white/30">
                        {story.universe}
                      </span>
                    </div>
                    <button
                      onClick={() => setShowShareModal(true)}
                      className="bg-white/20 hover:bg-white/30 backdrop-blur px-6 py-3 rounded-xl font-bold transition flex items-center gap-2 border border-white/30"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      Share
                    </button>
                  </div>
                  <h2 className="text-4xl font-black mb-3 leading-tight">
                    What if {story.what_if}?
                  </h2>
                  <div className="flex items-center gap-4 text-lg font-medium">
                    <span>{story.word_count} words</span>
                    <span>•</span>
                    <span>{story.rating_count} {story.rating_count === 1 ? 'rating' : 'ratings'}</span>
                  </div>
                </div>

                {/* Story Content */}
                <div className="p-10">
                  <div className="prose prose-lg max-w-none dark:prose-invert mb-10">
                    {story.story.split('\n').map((paragraph, i) => (
                      paragraph.trim() && (
                        <p key={i} className="mb-5 text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                          {paragraph}
                        </p>
                      )
                    ))}
                  </div>

                  {/* Rating Section */}
                  <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-10">
                    <div className="max-w-lg mx-auto">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center flex items-center justify-center gap-2">
                        <span className="text-3xl">⭐</span>
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
                  <div className="flex gap-4 justify-center mt-10">
                    <Link
                      href="/history"
                      className="px-8 py-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-bold rounded-xl transition shadow-lg"
                    >
                      📚 View All Stories
                    </Link>
                    <button
                      onClick={() => setStory(null)}
                      className={`px-8 py-4 bg-gradient-to-r ${selectedColor} hover:opacity-90 text-white font-bold rounded-xl transition shadow-lg`}
                    >
                      ✨ Create Another
                    </button>
                  </div>
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