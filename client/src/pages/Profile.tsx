import React, { useEffect, useState } from 'react';
import { User, Mail, AtSign, CheckCircle, XCircle, Trophy, Target } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import leaderboardService from '../services/leaderboard.service';
import { LeaderboardEntry } from '../types/leaderboard.types';
import toast from 'react-hot-toast';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [userScores, setUserScores] = useState<LeaderboardEntry[]>([]);
  const [bestScore, setBestScore] = useState<LeaderboardEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch user's scores
      try {
        const scoresRes = await leaderboardService.getUserScores();
        setUserScores(scoresRes.data);
      } catch (error) {
        console.error('Error fetching user scores:', error);
      }

      // Fetch best score
      try {
        const bestScoreRes = await leaderboardService.getUserBestScore();
        setBestScore(bestScoreRes.data);
      } catch (error: any) {
        if (error.response?.status !== 404) {
          console.error('Error fetching best score:', error);
        }
      }
    } catch (error) {
      toast.error('Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="mt-2 text-gray-600">View your account information and game statistics</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Info Card */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Account Information</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p className="text-sm text-gray-900">{user?.name}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-sm text-gray-900">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center">
                <AtSign className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Username</p>
                  <p className="text-sm text-gray-900">{user?.preferred_username}</p>
                </div>
              </div>
              <div className="flex items-center">
                {user?.email_verified ? (
                  <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-400 mr-3" />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-500">Email Status</p>
                  <p className="text-sm text-gray-900">
                    {user?.email_verified ? 'Verified' : 'Not Verified'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="bg-white shadow rounded-lg p-6 mt-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Game Statistics</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Trophy className="h-5 w-5 text-yellow-500 mr-3" />
                  <span className="text-sm font-medium text-gray-500">Best Score</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {bestScore ? bestScore.score.toLocaleString() : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Target className="h-5 w-5 text-indigo-500 mr-3" />
                  <span className="text-sm font-medium text-gray-500">Total Games</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{userScores.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Trophy className="h-5 w-5 text-purple-500 mr-3" />
                  <span className="text-sm font-medium text-gray-500">Average Score</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {userScores.length > 0
                    ? Math.round(
                        userScores.reduce((sum, score) => sum + score.score, 0) / userScores.length
                      ).toLocaleString()
                    : '—'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Score History */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Score History</h3>
              <p className="mt-1 text-sm text-gray-500">
                Your recent game scores and achievements
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Achievement
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {userScores.map((score) => (
                    <tr key={score.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {score.score.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(score.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {score.score > 1000 && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            🏆 High Score
                          </span>
                        )}
                        {score.score === bestScore?.score && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 ml-2">
                            Personal Best
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {userScores.length === 0 && (
              <div className="text-center py-12">
                <Target className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No scores yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Start playing to see your score history!
                </p>
                <div className="mt-6">
                  <a
                    href="/submit-score"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Submit Your First Score
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;