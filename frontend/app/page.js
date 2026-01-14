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
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-12">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-white mb-4">
            What If Novel AI
          </h1>
          <p className="text-xl text-purple-200">
            Explore alternative storylines in your favorite universes
          </p>
        </div>

        {/* Generator Form */}
        <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl mb-8">
          <form onSubmit={handleGenerate} className="space-y-6">
            
            {/* Universe Selector */}
            <div>
              <label className="block text-white font-semibold mb-2">
                Choose Universe
              </label>
              <select
                value={selectedUniverse}
                onChange={(e) => setSelectedUniverse(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/20 text-white border border-white/30 focus:border-purple-400 focus:outline-none"
              >
                {universes.map(u => (
                  <option key={u} value={u} className="bg-gray-900">{u}</option>
                ))}
              </select>
            </div>

            {/* What If Input */}
            <div>
              <label className="block text-white font-semibold mb-2">
                What If...
              </label>
              <textarea
                value={whatIf}
                onChange={(e) => setWhatIf(e.target.value)}
                placeholder="e.g., Harry was sorted into Slytherin"
                className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/50 border border-white/30 focus:border-purple-400 focus:outline-none min-h-[100px]"
              />
            </div>

            {/* Length Selector */}
            <div>
              <label className="block text-white font-semibold mb-2">
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
                        ? 'bg-purple-500 text-white'
                        : 'bg-white/20 text-white hover:bg-white/30'
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
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 rounded-lg hover:from-purple-600 hover:to-pink-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
              <div className="bg-red-500/20 border border-red-500 text-white px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
          </form>
        </div>

        {/* Story Display */}
        {story && (
          <div className="max-w-4xl mx-auto bg-white rounded-2xl p-8 shadow-2xl">
            <div className="mb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold mb-2">
                    {story.universe}
                  </span>
                  <h2 className="text-2xl font-bold text-gray-800">
                    What if {story.what_if}?
                  </h2>
                </div>
                <div className="text-right text-sm text-gray-500">
                  {story.word_count} words
                </div>
              </div>
            </div>
            
            <div className="prose prose-lg max-w-none">
              {story.story.split('\n').map((paragraph, i) => (
                <p key={i} className="mb-4 text-gray-700 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between items-center">
              <Link 
                href="/history"
                className="text-purple-600 hover:text-purple-800 font-semibold"
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