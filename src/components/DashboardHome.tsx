import DashboardStats from './DashboardStats';
import RecentActivity from './RecentActivity';
import { Card, CardBody, CardHeader, Button } from '@heroui/react';
import { useAuth } from './AuthProvider';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Game } from '../lib/supabase-types';

export default function DashboardHome() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalGames: 0,
    totalDownloads: 0,
    totalRevenue: 0,
    pendingReviews: 0,
  });
  const [recentGames, setRecentGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  async function loadDashboardData() {
    try {
      // Get developer ID
      // Use maybeSingle() instead of single() to handle case where developer doesn't exist
      const { data: developer, error: devError } = await supabase
        .from('developers')
        .select('id')
        .eq('user_id', user?.id)
        .maybeSingle();

      // If table doesn't exist, show helpful message
      if (devError && (devError.code === 'PGRST116' || devError.message?.includes('schema cache'))) {
        console.error('Database tables not found. Please run SUPABASE_SCHEMA.sql in Supabase SQL Editor.');
        return;
      }

      if (!developer) return;

      // Get games
      const { data: games, error } = await supabase
        .from('games')
        .select('*')
        .eq('developer_id', developer.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Calculate stats
      const totalGames = games?.length || 0;
      const totalDownloads = games?.reduce((sum, game) => sum + (game.downloads || 0), 0) || 0;
      const totalRevenue = games?.reduce((sum, game) => sum + (game.price || 0) * (game.downloads || 0), 0) || 0;
      const pendingReviews = games?.filter(game => game.status === 'pending_review').length || 0;

      setStats({
        totalGames,
        totalDownloads,
        totalRevenue,
        pendingReviews,
      });

      setRecentGames(games || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  const recentActivities = recentGames.slice(0, 5).map((game) => ({
    id: game.id,
    type: game.status === 'pending_review' ? 'review' : 'upload' as const,
    game: game.title,
    message: game.status === 'pending_review' 
      ? 'Game submitted for review' 
      : `Game ${game.status === 'live' ? 'published' : 'created'}`,
    timestamp: game.created_at,
    status: game.status === 'pending_review' ? 'pending' as const : 'success' as const,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your games and track your performance
        </p>
      </div>

      {/* Stats */}
      <DashboardStats stats={stats} />

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentActivity activities={recentActivities} />
        </div>
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Quick Actions</h3>
          </CardHeader>
          <CardBody className="space-y-3">
            <Button
              color="primary"
              className="w-full justify-start"
              as="a"
              href="/upload"
            >
              📤 Upload New Game
            </Button>
            <Button
              variant="bordered"
              className="w-full justify-start"
              as="a"
              href="/games"
            >
              📋 View All Games
            </Button>
            <Button
              variant="bordered"
              className="w-full justify-start"
              as="a"
              href="/analytics"
            >
              📊 View Analytics
            </Button>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

