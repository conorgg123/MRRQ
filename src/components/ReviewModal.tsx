import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (review: {
    ratings: {
      teamwork: number;
      communication: number;
      skill: number;
      adaptability: number;
      positivity: number;
    };
    comment: string;
  }) => void;
  targetPlayer: {
    id: string;
    username: string;
    heroPlayed: string;
  };
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  targetPlayer
}) => {
  const [ratings, setRatings] = useState({
    teamwork: 5,
    communication: 5,
    skill: 5,
    adaptability: 5,
    positivity: 5
  });
  const [comment, setComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ratings, comment });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-lg w-full mx-4">
        <h2 className="text-xl font-semibold mb-4">
          Review {targetPlayer.username}
        </h2>
        <p className="text-gray-400 mb-6">
          Hero played: {targetPlayer.heroPlayed}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 mb-6">
            {Object.entries(ratings).map(([category, value]) => (
              <div key={category}>
                <label className="block text-sm font-medium mb-2 capitalize">
                  {category}
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setRatings(prev => ({ ...prev, [category]: rating }))}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition
                        ${rating <= value
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-700 text-gray-400'
                        }`}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Additional Comments
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full bg-gray-700 rounded-lg p-3 text-white"
              rows={4}
              placeholder="Share your experience playing with this player..."
            />
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition"
            >
              Submit Review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};