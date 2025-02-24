import { useState, useCallback } from 'react';
import type { Review, ReputationScore } from '../types/review';

export function useReviews(userId: string) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reputation, setReputation] = useState<ReputationScore>({
    overall: 0,
    teamwork: 0,
    communication: 0,
    skill: 0,
    adaptability: 0,
    positivity: 0,
    totalReviews: 0
  });

  const calculateReputation = useCallback((reviews: Review[]) => {
    if (reviews.length === 0) return reputation;

    const totals = reviews.reduce((acc, review) => ({
      teamwork: acc.teamwork + review.ratings.teamwork,
      communication: acc.communication + review.ratings.communication,
      skill: acc.skill + review.ratings.skill,
      adaptability: acc.adaptability + review.ratings.adaptability,
      positivity: acc.positivity + review.ratings.positivity
    }), {
      teamwork: 0,
      communication: 0,
      skill: 0,
      adaptability: 0,
      positivity: 0
    });

    const newReputation = {
      teamwork: totals.teamwork / reviews.length,
      communication: totals.communication / reviews.length,
      skill: totals.skill / reviews.length,
      adaptability: totals.adaptability / reviews.length,
      positivity: totals.positivity / reviews.length,
      totalReviews: reviews.length,
      overall: 0
    };

    // Calculate overall score (weighted average)
    newReputation.overall = (
      (newReputation.teamwork * 0.25) +
      (newReputation.communication * 0.2) +
      (newReputation.skill * 0.2) +
      (newReputation.adaptability * 0.2) +
      (newReputation.positivity * 0.15)
    );

    return newReputation;
  }, [reputation]);

  const submitReview = useCallback((review: Omit<Review, 'id' | 'createdAt'>) => {
    const newReview: Review = {
      ...review,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date()
    };

    setReviews(prev => {
      const updated = [...prev, newReview];
      setReputation(calculateReputation(updated));
      return updated;
    });
  }, [calculateReputation]);

  return {
    reviews,
    reputation,
    submitReview
  };
}