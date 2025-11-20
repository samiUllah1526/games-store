import { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea,
  useDisclosure,
  Avatar,
  Tabs,
  Tab,
} from '@heroui/react';
import { supabase } from '../lib/supabase';
import { useRBAC } from '../hooks/useRBAC';
import UserRoleManagement from './UserRoleManagement';
import type { Game, GameStatus } from '../lib/supabase-types';

interface GameReview {
  id: string;
  game_id: string;
  reviewer_id: string;
  action: string;
  comment: string | null;
  created_at: string;
}

export default function AdminDashboard() {
  const { isAdmin, loading: rbacLoading } = useRBAC();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewAction, setReviewAction] = useState<'approved' | 'rejected' | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    if (!rbacLoading && isAdmin) {
      loadGames();
    }
  }, [isAdmin, rbacLoading, activeTab]);

  async function loadGames() {
    try {
      let query = supabase
        .from('games')
        .select('*')
        .order('created_at', { ascending: false });

      if (activeTab === 'pending') {
        query = query.eq('status', 'pending_review');
      } else if (activeTab === 'all') {
        // Load all games
      } else {
        query = query.eq('status', activeTab);
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

  const handleReview = (game: Game, action: 'approved' | 'rejected') => {
    setSelectedGame(game);
    setReviewAction(action);
    setReviewComment('');
    onOpen();
  };

  const submitReview = async () => {
    if (!selectedGame || !reviewAction) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Update game status
      const newStatus: GameStatus = reviewAction === 'approved' ? 'live' : 'rejected';
      
      const { error: updateError } = await supabase
        .from('games')
        .update({
          status: newStatus,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          rejection_reason: reviewAction === 'rejected' ? reviewComment : null,
        })
        .eq('id', selectedGame.id);

      if (updateError) throw updateError;

      // Create review record
      const { error: reviewError } = await supabase
        .from('game_reviews')
        .insert({
          game_id: selectedGame.id,
          reviewer_id: user.id,
          action: reviewAction,
          comment: reviewComment || null,
        });

      if (reviewError) throw reviewError;

      // Reload games
      await loadGames();
      onClose();
      setSelectedGame(null);
      setReviewComment('');
      setReviewAction(null);
    } catch (error: any) {
      console.error('Error submitting review:', error);
      alert(`Error: ${error.message}`);
    }
  };

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

  if (rbacLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <p className="text-gray-500">Loading admin dashboard...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <Card>
          <CardBody>
            <p className="text-red-600 dark:text-red-400 text-lg font-semibold mb-2">
              Access Denied
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              You do not have permission to access this page. Admin access required.
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Review and manage game submissions
        </p>
      </div>

      <Tabs
        selectedKey={activeTab}
        onSelectionChange={(key) => setActiveTab(key as string)}
      >
        <Tab key="pending" title={`Pending Review (${games.filter(g => g.status === 'pending_review').length})`}>
          <Card>
            <CardBody className="p-0">
              {games.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">No games pending review</p>
                </div>
              ) : (
                <Table aria-label="Pending games table">
                  <TableHeader>
                    <TableColumn>GAME</TableColumn>
                    <TableColumn>DEVELOPER</TableColumn>
                    <TableColumn>VERSION</TableColumn>
                    <TableColumn>STATUS</TableColumn>
                    <TableColumn>SUBMITTED</TableColumn>
                    <TableColumn>ACTIONS</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {games.map((game) => (
                      <TableRow key={game.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar
                              src={game.icon_url}
                              name={game.title.charAt(0)}
                              size="sm"
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
                            Developer
                          </span>
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
                            {game.status === 'pending_review' ? 'Pending Review' : game.status}
                          </Chip>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(game.created_at).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              color="success"
                              variant="flat"
                              onPress={() => handleReview(game, 'approved')}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              color="danger"
                              variant="flat"
                              onPress={() => handleReview(game, 'rejected')}
                            >
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              variant="light"
                              as="a"
                              href={`/games/${game.id}`}
                            >
                              View
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
        </Tab>

        <Tab key="all" title="All Games">
          <Card>
            <CardBody className="p-0">
              <Table aria-label="All games table">
                <TableHeader>
                  <TableColumn>GAME</TableColumn>
                  <TableColumn>STATUS</TableColumn>
                  <TableColumn>SUBMITTED</TableColumn>
                  <TableColumn>REVIEWED</TableColumn>
                  <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody>
                  {games.map((game) => (
                    <TableRow key={game.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={game.icon_url}
                            name={game.title.charAt(0)}
                            size="sm"
                          />
                          <p className="font-medium text-gray-900 dark:text-white">
                            {game.title}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Chip
                          color={getStatusColor(game.status)}
                          variant="flat"
                          size="sm"
                        >
                          {game.status}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(game.created_at).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {game.reviewed_at ? new Date(game.reviewed_at).toLocaleDateString() : 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="light"
                          as="a"
                          href={`/games/${game.id}`}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardBody>
          </Card>
        </Tab>

        <Tab key="users" title="User Roles">
          <UserRoleManagement />
        </Tab>
      </Tabs>

      {/* Review Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalContent>
          <ModalHeader>
            {reviewAction === 'approved' ? 'Approve Game' : 'Reject Game'}
          </ModalHeader>
          <ModalBody>
            {selectedGame && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Game</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedGame.title}</p>
                </div>
                <Textarea
                  label={reviewAction === 'approved' ? 'Approval Notes (Optional)' : 'Rejection Reason (Required)'}
                  placeholder={
                    reviewAction === 'approved'
                      ? 'Add any notes about this approval...'
                      : 'Explain why this game is being rejected...'
                  }
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  minRows={4}
                  isRequired={reviewAction === 'rejected'}
                />
                {reviewAction === 'rejected' && !reviewComment && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    Please provide a reason for rejection
                  </p>
                )}
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              Cancel
            </Button>
            <Button
              color={reviewAction === 'approved' ? 'success' : 'danger'}
              onPress={submitReview}
              isDisabled={reviewAction === 'rejected' && !reviewComment}
            >
              {reviewAction === 'approved' ? 'Approve' : 'Reject'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

