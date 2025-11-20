import { useState, useCallback } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Textarea,
  Button,
  Select,
  SelectItem,
  Progress,
  Chip,
} from '@heroui/react';
import { useAuth } from './AuthProvider';
import { supabase } from '../lib/supabase';
import { uploadGameFile, validateGameFile } from '../lib/fileUpload';
import type { GameStatus } from '../lib/supabase-types';

// Helper to get authenticated supabase client
async function getAuthenticatedSupabase() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('You must be logged in to upload games');
  }
  return supabase;
}

const CATEGORIES = [
  { value: 'action', label: 'Action' },
  { value: 'adventure', label: 'Adventure' },
  { value: 'puzzle', label: 'Puzzle' },
  { value: 'racing', label: 'Racing' },
  { value: 'sports', label: 'Sports' },
  { value: 'strategy', label: 'Strategy' },
  { value: 'rpg', label: 'RPG' },
  { value: 'simulation', label: 'Simulation' },
  { value: 'arcade', label: 'Arcade' },
  { value: 'casual', label: 'Casual' },
];

export default function GameUpload() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('0');
  const [version, setVersion] = useState('1.0.0');
  const [platform, setPlatform] = useState<'android' | 'ios'>('android');
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFileError(null);
    const validation = validateGameFile(selectedFile, platform);
    
    if (!validation.valid) {
      setFileError(validation.error || 'Invalid file');
      setFile(null);
      return;
    }

    setFile(selectedFile);
  }, [platform]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const droppedFile = e.dataTransfer.files[0];
    if (!droppedFile) return;

    setFileError(null);
    const validation = validateGameFile(droppedFile, platform);
    
    if (!validation.valid) {
      setFileError(validation.error || 'Invalid file');
      setFile(null);
      return;
    }

    setFile(droppedFile);
  }, [platform]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!file) {
      setError('Please select a game file');
      return;
    }

    if (!title || !description || !category) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setUploading(true);

    try {
      // Ensure user is authenticated
      if (!user?.id) {
        throw new Error('You must be logged in to upload games');
      }

      // Get current session to ensure auth token is available
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error('Authentication session not found. Please sign in again.');
      }

      // Verify the session has an access token
      if (!session.access_token) {
        throw new Error('Session token missing. Please sign in again.');
      }

      console.log('Session user ID:', session.user.id);
      console.log('Context user ID:', user.id);
      console.log('Session token exists:', !!session.access_token);

      // Get or create developer profile
      // Use maybeSingle() instead of single() - returns null if no rows found instead of throwing
      let { data: developer, error: devQueryError } = await supabase
        .from('developers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      // If table doesn't exist, provide helpful error
      if (devQueryError && (devQueryError.code === 'PGRST116' || devQueryError.message?.includes('schema cache'))) {
        throw new Error(
          'Database tables not found. Please run the SQL schema in Supabase:\n\n' +
          '1. Go to Supabase Dashboard → SQL Editor\n' +
          '2. Copy and paste the contents of SUPABASE_SCHEMA.sql\n' +
          '3. Click Run\n\n' +
          'See QUICK_SETUP.md for detailed instructions.'
        );
      }

      if (!developer) {
        // Create developer profile - RLS policy requires auth.uid() = user_id
        // Verify session is still valid before insert
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (!currentSession || currentSession.user.id !== user.id) {
          throw new Error('Session expired. Please sign in again.');
        }

        console.log('Attempting to insert developer with user_id:', user.id);
        console.log('Session user_id:', currentSession.user.id);

        const { data: newDeveloper, error: devError } = await supabase
          .from('developers')
          .insert({ user_id: user.id })
          .select()
          .single();

        if (devError) {
          console.error('Developer insert error:', devError);
          if (devError.code === 'PGRST116' || devError.message?.includes('schema cache')) {
            throw new Error(
              'Database tables not found. Please run the SQL schema in Supabase SQL Editor. See QUICK_SETUP.md for instructions.'
            );
          }
          if (devError.code === '42501' || devError.message?.includes('row-level security') || devError.message?.includes('violates row-level security')) {
            throw new Error(
              `RLS Policy Violation: ${devError.message}\n\n` +
              'This usually means:\n' +
              '1. The JWT token is not being sent with the request\n' +
              '2. The RLS policy condition (auth.uid() = user_id) is not matching\n' +
              '3. Try signing out and signing in again to refresh your session\n\n' +
              'Debug info: Check browser console for session details'
            );
          }
          throw devError;
        }
        developer = newDeveloper;
      }

      // Get category ID
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', category)
        .single();

      // Create game record
      // developer should exist at this point (created above if needed)
      if (!developer) {
        throw new Error('Failed to create developer profile');
      }

      const { data: game, error: gameError } = await supabase
        .from('games')
        .insert({
          developer_id: developer.id,
          title,
          description,
          category_id: categoryData?.id,
          price: parseFloat(price) || 0,
          version,
          status: 'draft' as GameStatus,
        })
        .select()
        .single();

      if (gameError) throw gameError;

      // Upload file
      console.log('Starting file upload...');
      let fileUrl: string;
      try {
        fileUrl = await uploadGameFile(file, game.id, platform, {
          onProgress: (progress) => {
            setUploadProgress(progress.percentage);
          },
          onError: (err) => {
            console.error('File upload error:', err);
            throw err;
          },
        });
        console.log('File upload successful, URL:', fileUrl);
      } catch (uploadError: any) {
        console.error('File upload failed:', uploadError);
        // Delete the game record if file upload fails
        await supabase.from('games').delete().eq('id', game.id);
        throw new Error(`File upload failed: ${uploadError.message || 'Unknown error'}. Game record has been removed.`);
      }

      // Create build record
      const { error: buildError } = await supabase
        .from('game_builds')
        .insert({
          game_id: game.id,
          version,
          platform,
          file_url: fileUrl,
          file_size: file.size,
          file_name: file.name,
          status: 'ready',
        });

      if (buildError) throw buildError;

      // Update game status to pending review
      await supabase
        .from('games')
        .update({ status: 'pending_review' })
        .eq('id', game.id);

      setSuccess(true);
      setUploading(false);
      setUploadProgress(0);

      // Reset form
      setTitle('');
      setDescription('');
      setCategory('');
      setPrice('0');
      setVersion('1.0.0');
      setFile(null);
    } catch (err: any) {
      setError(err.message || 'Failed to upload game');
      setUploading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Upload New Game
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Share your game with the world
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Game Metadata */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Game Information</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <Input
              label="Game Title"
              placeholder="Enter game title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              isRequired
              isDisabled={loading}
            />

            <Textarea
              label="Description"
              placeholder="Describe your game..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              minRows={4}
              isRequired
              isDisabled={loading}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Category"
                placeholder="Select category"
                selectedKeys={category ? [category] : []}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  setCategory(selected);
                }}
                isRequired
                isDisabled={loading}
              >
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </Select>

              <Input
                label="Version"
                placeholder="1.0.0"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                isRequired
                isDisabled={loading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="number"
                label="Price (USD)"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                startContent="$"
                isDisabled={loading}
              />

              <Select
                label="Platform"
                selectedKeys={[platform]}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  setPlatform(selected as 'android' | 'ios');
                  setFile(null); // Reset file when platform changes
                }}
                isRequired
                isDisabled={loading}
              >
                <SelectItem key="android">
                  Android (APK)
                </SelectItem>
                <SelectItem key="ios">
                  iOS (IPA/ZIP)
                </SelectItem>
              </Select>
            </div>
          </CardBody>
        </Card>

        {/* File Upload */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Game File</h2>
          </CardHeader>
          <CardBody>
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                file
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-indigo-500'
              }`}
            >
              {file ? (
                <div className="space-y-2">
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
                    {file.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                  <Button
                    size="sm"
                    variant="light"
                    onPress={() => setFile(null)}
                    isDisabled={loading || uploading}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-4xl">📦</div>
                  <div>
                    <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Drag and drop your game file here
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      or click to browse
                    </p>
                    <input
                      type="file"
                      accept={platform === 'android' ? '.apk' : '.ipa,.zip'}
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                      disabled={loading || uploading}
                    />
                    <label htmlFor="file-upload">
                      <Button
                        as="span"
                        color="primary"
                        variant="bordered"
                        isDisabled={loading || uploading}
                      >
                        Select File
                      </Button>
                    </label>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {platform === 'android'
                      ? 'Supports .apk files up to 500MB'
                      : 'Supports .ipa or .zip files up to 500MB'}
                  </p>
                </div>
              )}
            </div>

            {fileError && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                {fileError}
              </p>
            )}

            {uploading && (
              <div className="mt-4">
                <Progress
                  value={uploadProgress}
                  color="primary"
                  className="mb-2"
                />
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  Uploading... {uploadProgress}%
                </p>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Error/Success Messages */}
        {error && (
          <Card className="border-red-200 dark:border-red-800">
            <CardBody>
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </CardBody>
          </Card>
        )}

        {success && (
          <Card className="border-green-200 dark:border-green-800">
            <CardBody>
              <div className="flex items-center gap-2">
                <Chip color="success" variant="flat">
                  Success
                </Chip>
                <p className="text-green-600 dark:text-green-400">
                  Game uploaded successfully! It's now pending review.
                </p>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button
            variant="light"
            as="a"
            href="/"
            isDisabled={loading || uploading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            color="primary"
            isLoading={loading || uploading}
            isDisabled={loading || uploading || !file}
          >
            Upload Game
          </Button>
        </div>
      </form>
    </div>
  );
}

