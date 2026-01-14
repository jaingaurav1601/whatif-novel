'use client';

import { useState, useEffect } from 'react';
import { getUniverses, generateStory, rateStory } from '@/lib/api';
import Link from 'next/link';

export default function Home() {
  const [universes, setUniverses] = useState([]);
  const [selectedUniverse, setSelectedUniverse] = useState('');
  const [whatIf, setWhatIf] = useState('');
  const [length, setLength] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [story, setStory] = useState(null);
  const [error, setError] = useState('');
  const [ratingLoading, setRatingLoading] = useState(false);

  useEffect(() => {
    getUniverses().then(data => {
      setUniverses(data.universes);
      if (data.universes.length > 0) {
        setSelectedUniverse(data.universes[0]);
      }
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

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      <div className="container mx-auto px-4 py-12">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
            What If Novel AI
          </h1>
          <p className="text-xl text-slate-300">
            Explore alternative storylines in your favorite universes
          </p>
        </div>

        {/* Generator Form */}
        <div className="max-w-3xl mx-auto bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-lg rounded-2xl p-8 shadow-2xl mb-8 border border-slate-600/30">
          <form onSubmit={handleGenerate} className="space-y-6">
            
            {/* Universe Selector */}
            <div>
              <label className="block text-slate-200 font-semibold mb-2">
                Choose Universe
              </label>
              <select
                value={selectedUniverse}
                onChange={(e) => setSelectedUniverse(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-slate-700/50 text-white border border-slate-500/50 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/30"
              >
                {universes.map(u => (
                  <option key={u} value={u} className="bg-slate-900">{u}</option>
                ))}
              </select>
            </div>

            {/* What If Input */}
            <div>
              <label className="block text-slate-200 font-semibold mb-2">
                What If...
              </label>
              <textarea
                value={whatIf}
                onChange={(e) => setWhatIf(e.target.value)}
                placeholder="e.g., Harry was sorted into Slytherin"
                className="w-full px-4 py-3 rounded-lg bg-slate-700/50 text-white placeholder-slate-400 border border-slate-500/50 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/30 min-h-[100px]"
              />
            </div>

            {/* Length Selector */}
            <div>
              <label className="block text-slate-200 font-semibold mb-2">
                Story Length
              </label>
              <div className="flex gap-4">
                {['short', 'medium', 'long'].map(l => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLength(l)}
                    className={`px-6 py-2 rounded-lg font-semibold transition ${
                      length === l
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30'
                        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 border border-slate-600/30'
                    }`}
                  >
                    {l.charAt(0).toUpperCase() + l.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white font-bold py-4 rounded-lg hover:from-cyan-600 hover:via-blue-600 hover:to-purple-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20"
            >
              {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating Story...
              </span>
            ) : 'Generate Story'}
            </button>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
          </form>
        </div>

        {/* Story Display */}
        {story && (
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-white to-slate-50 rounded-2xl p-8 shadow-2xl">
            <div className="mb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="inline-block bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold mb-2">
                    {story.universe}
                  </span>
                  <h2 className="text-2xl font-bold text-slate-900">
                    What if {story.what_if}?
                  </h2>
                </div>
                <div className="text-right text-sm text-slate-500">
                  {story.word_count} words
                </div>
              </div>
            </div>
            
            <div className="prose prose-lg max-w-none">
              {story.story.split('\n').map((paragraph, i) => (
                <p key={i} className="mb-4 text-slate-700 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200 flex justify-between items-center">
              <Link 
                href="/history"
                className="text-cyan-600 hover:text-cyan-700 font-semibold transition"
              >
                ← See all stories
              </Link>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(rating => (
                  <button
                    key={rating}
                    onClick={() => handleRating(rating)}
                    disabled={ratingLoading}
                    className={`text-2xl transition ${
                      rating <= story.rating ? 'opacity-100' : 'opacity-40'
                    } hover:scale-110 disabled:cursor-not-allowed`}
                  >
                    ⭐
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}