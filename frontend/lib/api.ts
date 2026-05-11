import { supabase } from './supabaseClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'API Request Failed');
  }

  return response.json();
}

export const api = {
  getUnvotedPhotos: () => fetchWithAuth('/api/photos/next'),
  getMyPhotos: () => fetchWithAuth('/api/photos/me'),
  uploadPhoto: (url: string) => fetchWithAuth('/api/photos', { method: 'POST', body: JSON.stringify({ url }) }),
  castVote: (photoId: string, isSuperGay: boolean) => fetchWithAuth('/api/votes', { method: 'POST', body: JSON.stringify({ photo_id: photoId, is_super_gay: isSuperGay }) }),
  reportPhoto: (photoId: string) => fetchWithAuth('/api/reports', { method: 'POST', body: JSON.stringify({ photo_id: photoId }) }),
  deletePhoto: (photoId: string) => fetchWithAuth(`/api/photos/${photoId}`, { method: 'DELETE' })
};
