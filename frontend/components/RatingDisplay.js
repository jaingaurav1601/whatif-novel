'use client';

import { useState, useEffect } from 'react';

export default function RatingDisplay({ storyId, initialRating = 0, initialCount = 0, onRate }) {
    const [userRating, setUserRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [loading, setLoading] = useState(false);

    const handleRate = async (rating) => {
        if (loading) return;

        setLoading(true);
        setUserRating(rating);

        if (onRate) {
            await onRate(rating);
        }

        setLoading(false);
    };

    return (
        <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2">
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            onClick={() => handleRate(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            disabled={loading}
                            className="transition-transform hover:scale-110 disabled:cursor-not-allowed"
                        >
                            <svg
                                className={`w-8 h-8 ${star <= (hoverRating || userRating)
                                        ? 'text-yellow-400 fill-yellow-400'
                                        : 'text-gray-300 dark:text-gray-600'
                                    }`}
                                fill={star <= (hoverRating || userRating) ? 'currentColor' : 'none'}
                                stroke="currentColor"
                                strokeWidth="1.5"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                                />
                            </svg>
                        </button>
                    ))}
                </div>
            </div>

            <div className="text-center">
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">{initialRating.toFixed(1)}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        ({initialCount} {initialCount === 1 ? 'rating' : 'ratings'})
                    </span>
                </div>
                {userRating > 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        You rated: {userRating} {userRating === 1 ? 'star' : 'stars'}
                    </p>
                )}
            </div>
        </div>
    );
}
