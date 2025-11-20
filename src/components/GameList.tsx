import { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Button,
  Avatar,
  Input,
  Select,
  SelectItem,
} from '@heroui/react';
import { useAuth } from './AuthProvider';
import { supabase } from '../lib/supabase';
import type { Game, GameStatus } from '../lib/supabase-types';

export default function GameList() {
  const { user } = useAuth();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<GameStatus | 'all'>('all');

  useEffect(() => {
    if (user) {
      loadGames();
    }
  }, [user, statusFilter]);

  async function loadGames() {
    try {
      // Use maybeSingle() instead of single() - returns null if no rows found
      const { data: developer } = await supabase
        .from('developers')
        .select('id')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (!developer) return;

      let query = supabase
        .from('games')
        .select('*')
        .eq('developer_id', developer.id)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setGames(data || []);
    } catch (error) {
      console.error('Error loading games:', error);
    } finally {
      setLoading(false);
    }
  }

  const getStatusColor = (status: GameStatus) => {
    switch (status) {
      case 'live':
        return 'success';
      case 'pending_review':
        return 'warning';
      case 'rejected':
        return 'danger';
      case 'draft':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: GameStatus) => {
    switch (status) {
      case 'live':
        return 'Live';
      case 'pending_review':
        return 'Pending Review';
      case 'rejected':
        return 'Rejected';
      case 'draft':
        return 'Draft';
      default:
        return status;
    }
  };

  const filteredGames = games.filter((game) =>
    game.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <p className="text-gray-500">Loading games...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            My Games
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and monitor your uploaded games
          </p>
        </div>
        <Button
          color="primary"
          as="a"
          href="/upload"
        >
          + Upload New Game
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Search games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              startContent="🔍"
              className="flex-1"
            />
            <Select
              label="Status"
              selectedKeys={[statusFilter]}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string;
                setStatusFilter(selected as GameStatus | 'all');
              }}
              className="w-full md:w-48"
            >
              <SelectItem key="all" value="all">
                All Status
              </SelectItem>
              <SelectItem key="draft" value="draft">
                Draft
              </SelectItem>
              <SelectItem key="pending_review" value="pending_review">
                Pending Review
              </SelectItem>
              <SelectItem key="live" value="live">
                Live
              </SelectItem>
              <SelectItem key="rejected" value="rejected">
                Rejected
              </SelectItem>
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* Games Table */}
      <Card>
        <CardBody className="p-0">
          {filteredGames.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {games.length === 0 ? 'No games yet' : 'No games match your filters'}
              </p>
              {games.length === 0 && (
                <Button color="primary" as="a" href="/upload">
                  Upload Your First Game
                </Button>
              )}
            </div>
          ) : (
            <Table aria-label="Games table">
              <TableHeader>
                <TableColumn>GAME</TableColumn>
                <TableColumn>VERSION</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>DOWNLOADS</TableColumn>
                <TableColumn>RATING</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {filteredGames.map((game) => (
                  <TableRow key={game.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={game.icon_url}
                          name={game.title.charAt(0)}
                          size="md"
                        />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {game.title}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {game.category}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {game.version}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Chip
                        color={getStatusColor(game.status)}
                        variant="flat"
                        size="sm"
                      >
                        {getStatusLabel(game.status)}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {game.downloads.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="text-sm">⭐</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {game.rating.toFixed(1)} ({game.review_count})
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="light"
                          as="a"
                          href={`/games/${game.id}`}
                        >
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="light"
                          color="danger"
                          onPress={async () => {
                            if (confirm('Are you sure you want to delete this game?')) {
                              await supabase.from('games').delete().eq('id', game.id);
                              loadGames();
                            }
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

