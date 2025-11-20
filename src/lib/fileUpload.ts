// File upload utilities for large files (APK/IPA)
import { supabase } from './supabase';

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadOptions {
  onProgress?: (progress: UploadProgress) => void;
  onError?: (error: Error) => void;
  onSuccess?: (url: string) => void;
}

/**
 * Upload large file with chunked upload support
 */
export async function uploadGameFile(
  file: File,
  gameId: string,
  platform: 'android' | 'ios',
  options: UploadOptions = {}
): Promise<string> {
  const { onProgress, onError, onSuccess } = options;

  try {
    // Validate file
    if (platform === 'android' && !file.name.endsWith('.apk')) {
      throw new Error('Android files must be .apk format');
    }
    if (platform === 'ios' && !file.name.match(/\.(ipa|zip)$/)) {
      throw new Error('iOS files must be .ipa or .zip format');
    }

    // Generate unique file path
    // Path should be relative to bucket root, not include bucket name
    const fileExt = file.name.split('.').pop();
    const fileName = `${gameId}/${platform}/${Date.now()}.${fileExt}`;
    const filePath = fileName; // Don't include bucket name in path

    console.log('Uploading file to path:', filePath);
    console.log('File size:', file.size, 'bytes');

    // For files larger than 50MB, use chunked upload
    if (file.size > 50 * 1024 * 1024) {
      return await uploadLargeFile(file, filePath, onProgress);
    }

    // Verify we have a session before uploading
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('You must be authenticated to upload files');
    }
    console.log('Uploading with user:', session.user.id);

    // For smaller files, use direct upload
    const { data, error } = await supabase.storage
      .from('game-builds')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Storage upload error:', error);
      console.error('Error code:', error.statusCode);
      console.error('Error message:', error.message);
      
      // Provide helpful error message for RLS violations
      if (error.message?.includes('row-level security') || error.message?.includes('violates row-level security')) {
        throw new Error(
          `Storage RLS Policy Violation: ${error.message}\n\n` +
          'Even though the bucket is public, uploads require storage policies.\n' +
          'Please set up storage policies in Supabase Dashboard:\n' +
          '1. Go to Storage > game-builds > Policies\n' +
          '2. Create a policy for INSERT operations\n' +
          '3. Policy definition: (bucket_id = \'game-builds\'::text) AND (auth.role() = \'authenticated\'::text)'
        );
      }
      
      throw new Error(`File upload failed: ${error.message}`);
    }

    console.log('File uploaded successfully:', data);

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('game-builds')
      .getPublicUrl(filePath);

    const url = urlData.publicUrl;
    console.log('File URL:', url);

    // Update progress
    onProgress?.({ loaded: file.size, total: file.size, percentage: 100 });
    onSuccess?.(url);

    return url;
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Upload failed');
    onError?.(err);
    throw err;
  }
}

/**
 * Upload large file in chunks
 */
async function uploadLargeFile(
  file: File,
  filePath: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<string> {
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  let uploadedBytes = 0;

  // For chunked uploads, we'll use a simpler approach with Supabase
  // Note: Supabase Storage doesn't natively support resumable uploads
  // This is a simplified version - for production, consider using
  // a service that supports resumable uploads or implement a custom solution

  const chunks: Blob[] = [];
  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    chunks.push(file.slice(start, end));
  }

  // Upload chunks sequentially
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const chunkPath = `${filePath}.part${i}`;

    const { error } = await supabase.storage
      .from('game-builds')
      .upload(chunkPath, chunk, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) throw error;

    uploadedBytes += chunk.size;
    const percentage = Math.round((uploadedBytes / file.size) * 100);

    onProgress?.({
      loaded: uploadedBytes,
      total: file.size,
      percentage,
    });
  }

  // Note: In production, you'd need to combine chunks on the server
  // For now, we'll return the first chunk's URL as a placeholder
  const { data: urlData } = supabase.storage
    .from('game-builds')
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}

/**
 * Validate file before upload
 */
export function validateGameFile(file: File, platform: 'android' | 'ios'): { valid: boolean; error?: string } {
  // Check file size (max 500MB)
  const maxSize = 500 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds maximum limit of ${maxSize / (1024 * 1024)}MB`,
    };
  }

  // Check file type
  if (platform === 'android' && !file.name.endsWith('.apk')) {
    return {
      valid: false,
      error: 'Android files must be in .apk format',
    };
  }

  if (platform === 'ios' && !file.name.match(/\.(ipa|zip)$/)) {
    return {
      valid: false,
      error: 'iOS files must be in .ipa or .zip format',
    };
  }

  return { valid: true };
}

