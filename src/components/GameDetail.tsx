import { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Button,
  Avatar,
  Tabs,
  Tab,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from '@heroui/react';
import { useAuth } from './AuthProvider';
import { useRBAC } from '../hooks/useRBAC';
import { supabase } from '../lib/supabase';
import type { Game, GameBuild } from '../lib/supabase-types';

interface GameDetailProps {
  gameId: string;
}

export default function GameDetail({ gameId }: GameDetailProps) {
  const { user } = useAuth();
  const { isAdmin } = useRBAC();
  const [game, setGame] = useState<Game | null>(null);
  const [builds, setBuilds] = useState<GameBuild[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && gameId) {
      loadGameData();
    }
  }, [user, gameId, isAdmin]);

  async function loadGameData() {
    try {
      // Load game
      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .select('*')
        .eq('id', gameId)
        .single();

      if (gameError) throw gameError;
      setGame(gameData);

      // Load builds
      const { data: buildsData, error: buildsError } = await supabase
        .from('game_builds')
        .select('*')
        .eq('game_id', gameId)
        .order('created_at', { ascending: false });

      if (buildsError) throw buildsError;
      setBuilds(buildsData || []);

      // Load reviews if admin
      if (isAdmin) {
        const { data: reviewsData } = await supabase
          .from('game_reviews')
          .select('*')
          .eq('game_id', gameId)
          .order('created_at', { ascending: false });
        
        setReviews(reviewsData || []);
      }
    } catch (error) {
      console.error('Error loading game data:', error);
    } finally {
      setLoading(false);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'success';
      case 'pending_review':
        return 'warning';
      case 'rejected':
        return 'danger';
      case 'ready':
        return 'success';
      case 'processing':
        return 'warning';
      case 'failed':
        return 'danger';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <p className="text-gray-500">Loading game details...</p>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 mb-4">Game not found</p>
        <Button as="a" href="/games">Back to Games</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Avatar
            src={game.icon_url}
            name={game.title.charAt(0)}
            size="lg"
            className="w-20 h-20 text-2xl"
          />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {game.title}
            </h1>
            <div className="flex items-center gap-2">
              <Chip
                color={getStatusColor(game.status)}
                variant="flat"
              >
                {game.status === 'live' ? 'Live' : game.status === 'pending_review' ? 'Pending Review' : game.status}
              </Chip>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Version {game.version}
              </span>
            </div>
          </div>
        </div>
        <Button
          variant="light"
          as="a"
          href="/games"
        >
          ← Back to Games
        </Button>
      </div>

      {/* Tabs */}
      <Tabs aria-label="Game details tabs">
        <Tab key="overview" title="Overview">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Game Information</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Description</p>
                <p className="text-gray-900 dark:text-white">{game.description || 'No description provided'}</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Category</p>
                  <p className="font-medium text-gray-900 dark:text-white">{game.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Price</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    ${game.price.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Downloads</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {game.downloads.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Rating</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    ⭐ {game.rating.toFixed(1)} ({game.review_count} reviews)
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Created</p>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(game.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Last Updated</p>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(game.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {(game.reviewed_at || game.rejection_reason) && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Review Information</p>
                  <div className="grid grid-cols-2 gap-4">
                    {game.reviewed_at && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Reviewed At</p>
                        <p className="text-gray-900 dark:text-white">
                          {new Date(game.reviewed_at).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {game.rejection_reason && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Rejection Reason</p>
                        <p className="text-gray-900 dark:text-white">{game.rejection_reason}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </Tab>

        {isAdmin && (
          <Tab key="reviews" title="Reviews">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Review History</h2>
            </CardHeader>
            <CardBody className="p-0">
              {reviews.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">No reviews yet</p>
                </div>
              ) : (
                <Table aria-label="Reviews table">
                  <TableHeader>
                    <TableColumn>ACTION</TableColumn>
                    <TableColumn>REVIEWER</TableColumn>
                    <TableColumn>COMMENT</TableColumn>
                    <TableColumn>DATE</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {reviews.map((review) => (
                      <TableRow key={review.id}>
                        <TableCell>
                          <Chip
                            color={review.action === 'approved' ? 'success' : 'danger'}
                            variant="flat"
                            size="sm"
                          >
                            {review.action}
                          </Chip>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Reviewer
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {review.comment || 'No comment'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardBody>
          </Card>
          </Tab>
        )}

        <Tab key="builds" title="Builds">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Build History</h2>
            </CardHeader>
            <CardBody className="p-0">
              {builds.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">No builds yet</p>
                </div>
              ) : (
                <Table aria-label="Builds table">
                  <TableHeader>
                    <TableColumn>VERSION</TableColumn>
                    <TableColumn>PLATFORM</TableColumn>
                    <TableColumn>FILE SIZE</TableColumn>
                    <TableColumn>STATUS</TableColumn>
                    <TableColumn>UPLOADED</TableColumn>
                    <TableColumn>ACTIONS</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {builds.map((build) => (
                      <TableRow key={build.id}>
                        <TableCell>
                          <span className="font-medium">{build.version}</span>
                        </TableCell>
                        <TableCell>
                          <Chip size="sm" variant="flat">
                            {build.platform.toUpperCase()}
                          </Chip>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {(build.file_size / (1024 * 1024)).toFixed(2)} MB
                          </span>
                        </TableCell>
                        <TableCell>
                          <Chip
                            color={getStatusColor(build.status)}
                            variant="flat"
                            size="sm"
                          >
                            {build.status}
                          </Chip>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(build.created_at).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="light"
                            as="a"
                            href={build.file_url}
                            target="_blank"
                          >
                            Download
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardBody>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
}

