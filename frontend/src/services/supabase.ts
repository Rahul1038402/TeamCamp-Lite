import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth helpers
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/dashboard`,
    },
  });
  
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
};

export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  return { session, error };
};

// Storage helpers
export const uploadFile = async (projectId: number, file: File) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `${projectId}/${fileName}`;
  
  const { data, error } = await supabase.storage
    .from('project-files')
    .upload(filePath, file);
  
  if (error) {
    return { data: null, error };
  }
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('project-files')
    .getPublicUrl(filePath);
  
  return {
    data: {
      file_path: filePath,
      public_url: publicUrl,
      filename: file.name,
      file_size: file.size,
    },
    error: null,
  };
};

export const getFileUrl = (filePath: string) => {
  const { data } = supabase.storage
    .from('project-files')
    .getPublicUrl(filePath);
  
  return data.publicUrl;
};