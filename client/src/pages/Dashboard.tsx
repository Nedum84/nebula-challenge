import React, { useEffect, useState } from 'react';
import { Trophy, Target, TrendingUp, Award } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import leaderboardService from '../services/leaderboard.service';
import { LeaderboardEntry } from '../types/leaderboard.types';
import toast from 'react-hot-toast';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [userBestScore, setUserBestScore] = useState<LeaderboardEntry | null>(null);
  const [userScoresCount, setUserScoresCount] = useState(0);
  const [topScore, setTopScore] = useState<LeaderboardEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch user's best score
      try {
        const bestScoreRes = await leaderboardService.getUserBestScore();
        setUserBestScore(bestScoreRes.data);
      } catch (error: any) {
        if (error.response?.status !== 404) {
          console.error('Error fetching best score:', error);
        }
      }

      // Fetch all user scores to get count
      try {
        const userScoresRes = await leaderboardService.getUserScores();
        setUserScoresCount(userScoresRes.data.length);
      } catch (error) {
        console.error('Error fetching user scores:', error);
      }

      // Fetch top score
      const topScoreRes = await leaderboardService.getTopScore();
      if (topScoreRes.data.length > 0) {
        setTopScore(topScoreRes.data[0]);
      }
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
        <p className="mt-2 text-gray-600">Track your progress and compete with others</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Your Best Score</dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {userBestScore && typeof userBestScore.score === 'number' ? userBestScore.score.toLocaleString() : '—'}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Games Played</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{userScoresCount}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Global Top Score</dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {topScore && typeof topScore.score === 'number' ? topScore.score.toLocaleString() : '—'}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Your Rank</dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {userBestScore && topScore && typeof userBestScore.score === 'number' && typeof topScore.score === 'number' && userBestScore.score === topScore.score ? '#1' : '—'}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="/submit-score"
            className="inline-flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Submit New Score
          </a>
          <a
            href="/leaderboard"
            className="inline-flex items-center justify-center px-4 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            View Leaderboard
          </a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;