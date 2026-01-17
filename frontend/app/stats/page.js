'use client';

import { useState, useEffect } from 'react';
import { getStoryHistory } from '@/lib/api';
import Link from 'next/link';

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

export default function StatsPage() {
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getStoryHistory(1000).then(data => {
            setStories(data.stories || []);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    // Calculate statistics
    const totalStories = stories.length;
    const totalWords = stories.reduce((sum, s) => sum + s.word_count, 0);
    const ratedStories = stories.filter(s => s.average_rating > 0);
    const avgRating = ratedStories.length > 0
        ? (ratedStories.reduce((sum, s) => sum + s.average_rating, 0) / ratedStories.length).toFixed(1)
        : 0;

    // Universe breakdown
    const universeStats = {};
    stories.forEach(s => {
        if (!universeStats[s.universe]) {
            universeStats[s.universe] = { count: 0, words: 0, ratings: [] };
        }
        universeStats[s.universe].count++;
        universeStats[s.universe].words += s.word_count;
        if (s.average_rating > 0) {
            universeStats[s.universe].ratings.push(s.average_rating);
        }
    });

    // Top rated stories
    const topRated = [...stories]
        .filter(s => s.average_rating > 0)
        .sort((a, b) => b.average_rating - a.average_rating)
        .slice(0, 5);

    // Longest stories
    const longest = [...stories]
        .sort((a, b) => b.word_count - a.word_count)
        .slice(0, 5);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-purple-300 border-t-purple-600 mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading insights...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 animate-gradient">
            {/* Header */}
            <header className="border-b border-purple-200 dark:border-purple-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-40">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/"
                                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
                            >
                                ← Back
                            </Link>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                                📊 Story Insights
                            </h1>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-12 max-w-7xl">
                {/* Hero Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {[
                        { icon: '📚', value: totalStories, label: 'Stories Created', color: 'from-blue-500 to-cyan-500' },
                        { icon: '⭐', value: avgRating, label: 'Average Rating', color: 'from-yellow-500 to-orange-500' },
                        { icon: '📝', value: totalWords.toLocaleString(), label: 'Words Written', color: 'from-purple-500 to-pink-500' }
                    ].map((stat, idx) => (
                        <div
                            key={stat.label}
                            className="relative group animate-fade-in"
                            style={{ animationDelay: `${idx * 100}ms` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r ${stat.color} rounded-2xl blur opacity-25 group-hover:opacity-40 transition"></div>
                            <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
                                <div className="text-5xl mb-4 animate-float" style={{ animationDelay: `${idx * 0.5}s` }}>{stat.icon}</div>
                                <div className={`text-4xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}>
                                    {stat.value}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Universe Breakdown */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 mb-8 animate-fade-in">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <span className="text-3xl">🌌</span>
                        Universe Breakdown
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {Object.entries(universeStats).map(([universe, stats]) => {
                            const avgUniverseRating = stats.ratings.length > 0
                                ? (stats.ratings.reduce((a, b) => a + b, 0) / stats.ratings.length).toFixed(1)
                                : 0;
                            return (
                                <div
                                    key={universe}
                                    className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 hover:shadow-lg transition magical-glow"
                                >
                                    <div className="text-4xl mb-3">{universeEmojis[universe] || '🌌'}</div>
                                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">{universe}</h3>
                                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                        <div>{stats.count} {stats.count === 1 ? 'story' : 'stories'}</div>
                                        <div>{stats.words.toLocaleString()} words</div>
                                        {avgUniverseRating > 0 && <div>⭐ {avgUniverseRating} avg</div>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Top Rated */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 animate-slide-in">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            <span className="text-3xl">🏆</span>
                            Top Rated Stories
                        </h2>
                        <div className="space-y-4">
                            {topRated.length === 0 ? (
                                <p className="text-gray-500 dark:text-gray-400 text-center py-8">No rated stories yet</p>
                            ) : (
                                topRated.map((story, idx) => (
                                    <div
                                        key={story.id}
                                        className="flex items-start gap-4 p-4 rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800"
                                    >
                                        <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">#{idx + 1}</div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-lg">{universeEmojis[story.universe]}</span>
                                                <span className="text-xs px-2 py-1 bg-white dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-400">
                                                    {story.universe}
                                                </span>
                                            </div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                                                What if {story.what_if}?
                                            </p>
                                            <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                                                <span className="flex items-center gap-1">
                                                    ⭐ {story.average_rating.toFixed(1)}
                                                </span>
                                                <span>•</span>
                                                <span>{story.rating_count} {story.rating_count === 1 ? 'rating' : 'ratings'}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Longest Stories */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 animate-slide-in" style={{ animationDelay: '100ms' }}>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            <span className="text-3xl">📖</span>
                            Epic Tales
                        </h2>
                        <div className="space-y-4">
                            {longest.map((story, idx) => (
                                <div
                                    key={story.id}
                                    className="flex items-start gap-4 p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800"
                                >
                                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">#{idx + 1}</div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-lg">{universeEmojis[story.universe]}</span>
                                            <span className="text-xs px-2 py-1 bg-white dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-400">
                                                {story.universe}
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                                            What if {story.what_if}?
                                        </p>
                                        <div className="text-xs text-gray-600 dark:text-gray-400">
                                            {story.word_count.toLocaleString()} words
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div className="mt-12 text-center">
                    <Link
                        href="/"
                        className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 text-white font-bold rounded-full transition shadow-lg animate-pulse-glow"
                    >
                        ✨ Create New Story
                    </Link>
                </div>
            </main>
        </div>
    );
}
