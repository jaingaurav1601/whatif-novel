'use client';

import { useState, useEffect } from 'react';
import { getStoryHistory } from '@/lib/api';
import Link from 'next/link';

const universeEmojis = {
    'Harry Potter': '🪄',
    'Lord of the Rings': '💍',
    'Marvel MCU': '🦸',
    'Star Wars': '⚡',
    'One Piece': '🏴\u200D☠️',
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

    const totalStories = stories.length;
    const totalWords = stories.reduce((sum, s) => sum + s.word_count, 0);
    const ratedStories = stories.filter(s => s.average_rating > 0);
    const avgRating = ratedStories.length > 0
        ? (ratedStories.reduce((sum, s) => sum + s.average_rating, 0) / ratedStories.length).toFixed(1)
        : 0;

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

    const topRated = [...stories]
        .filter(s => s.average_rating > 0)
        .sort((a, b) => b.average_rating - a.average_rating)
        .slice(0, 5);

    const longest = [...stories]
        .sort((a, b) => b.word_count - a.word_count)
        .slice(0, 5);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-[var(--color-aged-paper)] border-t-[var(--color-burgundy)] mb-4"></div>
                    <p className="font-serif text-[var(--color-slate)]">Loading insights...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="sticky top-0 z-40 border-b-2 border-[var(--color-aged-paper)] bg-[var(--color-parchment)] backdrop-blur-sm shadow-md">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/"
                                className="text-[var(--color-slate)] hover:text-[var(--color-burgundy)] transition font-sans font-semibold text-sm"
                            >
                                ← Return
                            </Link>
                            <div className="text-[var(--color-gold)] text-sm">❦</div>
                            <h1 className="font-display text-3xl text-[var(--color-burgundy)]">
                                Statistics
                            </h1>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-12 max-w-7xl">
                {/* Intro Banner */}
                <div className="text-center mb-16 animate-fade-in-up">
                    <div className="text-[var(--color-gold)] text-4xl mb-4">✦</div>
                    <h2 className="font-display text-5xl md:text-6xl text-[var(--color-burgundy)] mb-4">
                        Library Insights
                    </h2>
                    <p className="font-serif text-lg text-[var(--color-charcoal)] max-w-2xl mx-auto">
                        A quantitative analysis of our collective narrative exploration
                    </p>
                    <div className="w-24 h-1 bg-[var(--color-gold)] mx-auto mt-4"></div>
                </div>

                {/* Hero Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    {[
                        { icon: '📚', value: totalStories.toLocaleString(), label: 'Stories Crafted', desc: 'Total narratives' },
                        { icon: '⭐', value: avgRating, label: 'Average Rating', desc: 'Community assessment' },
                        { icon: '📝', value: totalWords.toLocaleString(), label: 'Words Written', desc: 'Collective prose' }
                    ].map((stat, idx) => (
                        <div
                            key={stat.label}
                            className="paper-card p-10 text-center hover-lift animate-fade-in-up"
                            style={{ animationDelay: `${idx * 0.1}s` }}
                        >
                            <div className="relative z-10">
                                <div className="text-6xl mb-4">{stat.icon}</div>
                                <div className="text-5xl font-display text-[var(--color-burgundy)] mb-2">
                                    {stat.value}
                                </div>
                                <div className="font-sans text-sm text-ornate text-[var(--color-burgundy)] mb-1">
                                    {stat.label}
                                </div>
                                <div className="font-serif text-xs text-[var(--color-slate)] italic">
                                    {stat.desc}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Universe Breakdown */}
                <div className="mb-16 animate-fade-in-up stagger-3">
                    <div className="ornamental-divider mb-8">
                        <span>❦</span>
                    </div>
                    <h2 className="font-display text-4xl text-[var(--color-burgundy)] mb-8 text-center">
                        Universe Distribution
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {Object.entries(universeStats)
                            .sort((a, b) => b[1].count - a[1].count)
                            .map(([universe, stats], idx) => {
                            const avgUniverseRating = stats.ratings.length > 0
                                ? (stats.ratings.reduce((a, b) => a + b, 0) / stats.ratings.length).toFixed(1)
                                : 0;
                            const percentage = ((stats.count / totalStories) * 100).toFixed(0);

                            return (
                                <div
                                    key={universe}
                                    className="paper-card p-6 hover-lift animate-fade-in-up"
                                    style={{ animationDelay: `${idx * 0.05}s` }}
                                >
                                    <div className="relative z-10">
                                        <div className="text-5xl mb-4 text-center">{universeEmojis[universe] || '🌌'}</div>
                                        <h3 className="font-serif font-bold text-lg text-[var(--color-midnight)] mb-3 text-center">
                                            {universe}
                                        </h3>

                                        {/* Progress Bar */}
                                        <div className="h-2 bg-[var(--color-aged-paper)] mb-4 overflow-hidden">
                                            <div
                                                className="h-full bg-[var(--color-burgundy)]"
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>

                                        <div className="space-y-2 font-sans text-sm text-[var(--color-charcoal)]">
                                            <div className="flex justify-between">
                                                <span>Stories:</span>
                                                <span className="font-semibold">{stats.count}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Words:</span>
                                                <span className="font-semibold">{stats.words.toLocaleString()}</span>
                                            </div>
                                            {avgUniverseRating > 0 && (
                                                <div className="flex justify-between">
                                                    <span>Avg Rating:</span>
                                                    <span className="font-semibold">★ {avgUniverseRating}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between text-[var(--color-burgundy)]">
                                                <span>Share:</span>
                                                <span className="font-semibold">{percentage}%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Top Lists */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    {/* Top Rated */}
                    <div className="paper-card p-8 animate-slide-in-right">
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-[var(--color-gold)]">
                                <span className="text-4xl">🏆</span>
                                <h2 className="font-display text-3xl text-[var(--color-burgundy)]">
                                    Top Rated
                                </h2>
                            </div>
                            <div className="space-y-4">
                                {topRated.length === 0 ? (
                                    <p className="font-serif text-[var(--color-slate)] text-center py-12 italic">
                                        No rated stories in the collection yet
                                    </p>
                                ) : (
                                    topRated.map((story, idx) => (
                                        <div
                                            key={story.id}
                                            className="flex items-start gap-4 p-4 bg-[var(--color-parchment)] border-l-4 border-[var(--color-gold)] hover:bg-[var(--color-aged-paper)] transition"
                                        >
                                            <div className="font-display text-3xl text-[var(--color-burgundy)] leading-none">
                                                {idx + 1}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-2xl">{universeEmojis[story.universe]}</span>
                                                    <span className="universe-badge text-xs">
                                                        {story.universe}
                                                    </span>
                                                </div>
                                                <p className="font-serif text-sm font-semibold text-[var(--color-midnight)] mb-2">
                                                    What if {story.what_if}?
                                                </p>
                                                <div className="flex items-center gap-4 font-sans text-xs text-[var(--color-slate)]">
                                                    <span className="font-semibold text-[var(--color-burgundy)]">
                                                        ★ {story.average_rating.toFixed(1)}
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
                    </div>

                    {/* Longest Stories */}
                    <div className="paper-card p-8 animate-slide-in-right stagger-2">
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-[var(--color-gold)]">
                                <span className="text-4xl">📖</span>
                                <h2 className="font-display text-3xl text-[var(--color-burgundy)]">
                                    Epic Tales
                                </h2>
                            </div>
                            <div className="space-y-4">
                                {longest.map((story, idx) => (
                                    <div
                                        key={story.id}
                                        className="flex items-start gap-4 p-4 bg-[var(--color-parchment)] border-l-4 border-[var(--color-forest)] hover:bg-[var(--color-aged-paper)] transition"
                                    >
                                        <div className="font-display text-3xl text-[var(--color-forest)] leading-none">
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-2xl">{universeEmojis[story.universe]}</span>
                                                <span className="universe-badge text-xs">
                                                    {story.universe}
                                                </span>
                                            </div>
                                            <p className="font-serif text-sm font-semibold text-[var(--color-midnight)] mb-2">
                                                What if {story.what_if}?
                                            </p>
                                            <div className="font-sans text-xs text-[var(--color-slate)]">
                                                <span className="font-semibold text-[var(--color-forest)]">
                                                    {story.word_count.toLocaleString()}
                                                </span> words
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div className="text-center animate-fade-in-up stagger-5">
                    <div className="ornamental-divider mb-8">
                        <span>✦</span>
                    </div>
                    <Link
                        href="/"
                        className="inline-block btn-vintage font-sans text-lg px-10 py-5"
                    >
                        ✦ Create Your Story ✦
                    </Link>
                </div>
            </main>
        </div>
    );
}
