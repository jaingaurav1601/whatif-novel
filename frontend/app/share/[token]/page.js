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
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-blue-600 mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading story...</p>
                </div>
            </div>
        );
    }

    if (error || !story) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <div className="text-6xl mb-4">😕</div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Story Not Found</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        {error || 'This story link is invalid or has been removed.'}
                    </p>
                    <Link
                        href="/"
                        className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
                    >
                        Create Your Own Story
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            {/* Header */}
            <header className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-40">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            ✨ What If Novel
                        </h1>
                        <Link
                            href="/"
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
                        >
                            Create Your Own
                        </Link>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-12 max-w-4xl">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden animate-fade-in">
                    {/* Story Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
                        <div className="text-5xl mb-3">{universeEmojis[story.universe]}</div>
                        <span className="inline-block bg-white/20 backdrop-blur px-3 py-1 rounded-full text-sm font-medium mb-4">
                            {story.universe}
                        </span>
                        <h1 className="text-4xl font-bold mb-2">
                            What if {story.what_if}?
                        </h1>
                        <div className="flex items-center gap-4 text-sm">
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

                    {/* Story Content */}
                    <div className="p-8">
                        <div className="prose prose-lg max-w-none dark:prose-invert mb-8">
                            {story.story.split('\n').map((paragraph, i) => (
                                paragraph.trim() && (
                                    <p key={i} className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                                        {paragraph}
                                    </p>
                                )
                            ))}
                        </div>

                        {/* Rating Section */}
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
                            <div className="max-w-md mx-auto">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">
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
                        <div className="mt-12 text-center bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-8 border border-blue-200 dark:border-blue-800">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                                Create Your Own Story
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Explore alternative storylines in your favorite universes with AI
                            </p>
                            <div className="flex gap-4 justify-center">
                                <Link
                                    href="/"
                                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition shadow-lg shadow-blue-500/20"
                                >
                                    ✨ Start Creating
                                </Link>
                                <Link
                                    href="/history"
                                    className="px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition"
                                >
                                    Browse Stories
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
