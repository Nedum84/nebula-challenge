import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Trophy, Send } from 'lucide-react';
import leaderboardService from '../services/leaderboard.service';
import toast from 'react-hot-toast';

const SubmitScore: React.FC = () => {
  const navigate = useNavigate();
  const [score, setScore] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const scoreValue = parseInt(score);
    if (isNaN(scoreValue) || scoreValue < 0 || scoreValue > 999999) {
      toast.error('Please enter a valid score between 0 and 999,999');
      return;
    }

    setIsLoading(true);
    try {
      const response = await leaderboardService.submitScore({ score: scoreValue });
      
      if (scoreValue > 1000) {
        toast.success('🎉 High score achieved! Great job!', {
          duration: 5000,
          icon: '🏆',
        });
      } else {
        toast.success('Score submitted successfully!');
      }
      
      // Navigate to leaderboard to see the new score
      navigate('/leaderboard');
    } catch (error: any) {
      const errorMessage = error.response?.data?.errors?.[0]?.message || 
                          error.response?.data?.message || 
                          'Failed to submit score';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Submit Your Score</h1>
        <p className="mt-2 text-gray-600">Enter your game score to compete on the leaderboard</p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="score" className="block text-sm font-medium text-gray-700">
              Your Score
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Target className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                name="score"
                id="score"
                min="0"
                max="999999"
                required
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md py-3"
                placeholder="Enter your score"
                value={score}
                onChange={(e) => setScore(e.target.value)}
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Enter a score between 0 and 999,999. Scores above 1,000 trigger special notifications!
            </p>
          </div>

          <div className="bg-indigo-50 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Trophy className="h-5 w-5 text-indigo-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-indigo-800">Achievement Unlock</h3>
                <div className="mt-2 text-sm text-indigo-700">
                  <p>Submit a score over 1,000 to unlock the High Score Achievement!</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !score}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4 mr-2" />
              {isLoading ? 'Submitting...' : 'Submit Score'}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Tips for High Scores</h2>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start">
            <span className="text-indigo-500 mr-2">•</span>
            Practice regularly to improve your gameplay
          </li>
          <li className="flex items-start">
            <span className="text-indigo-500 mr-2">•</span>
            Focus on combos and multipliers for bonus points
          </li>
          <li className="flex items-start">
            <span className="text-indigo-500 mr-2">•</span>
            Study the leaderboard to learn from top players
          </li>
          <li className="flex items-start">
            <span className="text-indigo-500 mr-2">•</span>
            Stay consistent and track your progress over time
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SubmitScore;