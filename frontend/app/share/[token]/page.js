'use client';

import { useState, useEffect } from 'react';
import { getSharedStory, rateStory } from '@/lib/api';
import Link from 'next/link';
import { useParams } from 'next/navigation';
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

export default function SharePage() {
    const params = useParams();
    const token = params.token;

    const [story, setStory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (token) {
            fetchStory();
        }
    }, [token]);

    const fetchStory = async () => {
        setLoading(true);
        try {
            const data = await getSharedStory(token);
            setStory(data);
        } catch (err) {
            setError('Story not found or link is invalid');
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
            console.error('Failed to save rating');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-[var(--color-aged-paper)] border-t-[var(--color-burgundy)] mb-4"></div>
                    <p className="font-serif text-[var(--color-slate)]">Loading story...</p>
                </div>
            </div>
        );
    }

    if (error || !story) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center max-w-md paper-card p-12">
                    <div className="relative z-10">
                        <div className="text-6xl mb-6 opacity-30">📖</div>
                        <h1 className="font-display text-3xl text-[var(--color-burgundy)] mb-3">Story Not Found</h1>
                        <p className="font-serif text-[var(--color-charcoal)] mb-8">
                            {error || 'This story link is invalid or has been removed.'}
                        </p>
                        <Link
                            href="/"
                            className="inline-block btn-vintage font-sans"
                        >
                            ✦ Create Your Own Story ✦
                        </Link>
                    </div>
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
                            <h1 className="font-display text-3xl md:text-4xl text-[var(--color-burgundy)] tracking-tight">
                                What If Novel
                            </h1>
                            <div className="hidden md:block text-[var(--color-gold)] text-sm">❦</div>
                        </div>
                        <Link
                            href="/"
                            className="font-sans px-5 py-2 bg-[var(--color-burgundy)] text-[var(--color-cream)] text-sm font-semibold tracking-wide hover:bg-[var(--color-burgundy-light)] transition-all shadow-md hover:shadow-lg border-l-2 border-[var(--color-gold)]"
                        >
                            Create Your Own
                        </Link>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-12 max-w-5xl">
                <div className="paper-card overflow-hidden animate-fade-in-up">
                    {/* Story Header - Curtain Style */}
                    <div className="curtain text-[var(--color-cream)] p-10 md:p-12 relative">
                        <div className="relative z-10">
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <div className="text-6xl mb-4">{universeEmojis[story.universe] || '📖'}</div>
                                    <span className="inline-block px-4 py-2 bg-black/20 backdrop-blur border border-white/30 font-sans text-sm font-semibold tracking-wide">
                                        {story.universe}
                                    </span>
                                </div>
                            </div>
                            <h1 className="font-display text-4xl md:text-5xl mb-4 leading-tight">
                                What if {story.what_if}?
                            </h1>
                            <div className="flex flex-wrap items-center gap-4 font-sans text-sm font-medium">
                                <span>{story.word_count} words</span>
                                <span>•</span>
                                <span>{story.rating_count} {story.rating_count === 1 ? 'rating' : 'ratings'}</span>
                                <span>•</span>
                                <span>
                                    {new Date(story.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Story Content */}
                    <div className="p-8 md:p-12 relative">
                        <div className="prose prose-lg max-w-none mb-12">
                            {story.story.split('\n').map((paragraph, i) => (
                                paragraph.trim() && (
                                    <p key={i} className="mb-6 font-serif text-lg text-[var(--color-midnight)] leading-relaxed first-letter:text-5xl first-letter:font-display first-letter:text-[var(--color-burgundy)] first-letter:float-left first-letter:mr-2 first-letter:mt-1">
                                        {paragraph}
                                    </p>
                                )
                            ))}
                        </div>

                        {/* Rating Section */}
                        <div className="border-t-2 border-[var(--color-aged-paper)] pt-10">
                            <div className="max-w-lg mx-auto">
                                <h3 className="font-display text-3xl text-[var(--color-burgundy)] mb-8 text-center">
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

                        {/* CTA Section */}
                        <div className="mt-12 p-8 md:p-10 border-2 border-[var(--color-aged-paper)] bg-[var(--color-parchment)]">
                            <div className="text-center max-w-2xl mx-auto">
                                <div className="text-[var(--color-gold)] text-3xl mb-4">✦</div>
                                <h3 className="font-display text-3xl text-[var(--color-burgundy)] mb-3">
                                    Create Your Own Story
                                </h3>
                                <p className="font-serif text-[var(--color-charcoal)] mb-8">
                                    Explore alternative storylines in your favorite universes with AI
                                </p>
                                <div className="flex flex-wrap gap-4 justify-center">
                                    <Link
                                        href="/"
                                        className="btn-vintage font-sans px-8 py-4"
                                    >
                                        ✦ Start Creating ✦
                                    </Link>
                                    <Link
                                        href="/history"
                                        className="px-8 py-4 bg-[var(--color-forest)] text-[var(--color-cream)] font-sans font-semibold tracking-wide hover:bg-[var(--color-forest-light)] transition shadow-md hover:shadow-lg"
                                    >
                                        Browse Archive
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
