import { createClient } from '@supabase/supabase-js'

// These would be environment variables in production
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database schema as per PRD specifications
export const createTables = async () => {
  // Users table
  const { error: usersError } = await supabase.rpc('create_users_table', {
    sql: `
      CREATE TABLE IF NOT EXISTS users (
        user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        auth_provider TEXT NOT NULL,
        subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'pro')),
        preferred_language TEXT DEFAULT 'en' CHECK (preferred_language IN ('en', 'es')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
  })

  // Content table
  const { error: contentError } = await supabase.rpc('create_content_table', {
    sql: `
      CREATE TABLE IF NOT EXISTS content (
        content_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        state TEXT NOT NULL,
        language TEXT NOT NULL CHECK (language IN ('en', 'es')),
        type TEXT NOT NULL CHECK (type IN ('rights', 'script')),
        version INTEGER DEFAULT 1,
        content JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
  })

  // Saved Scripts table
  const { error: savedScriptsError } = await supabase.rpc('create_saved_scripts_table', {
    sql: `
      CREATE TABLE IF NOT EXISTS saved_scripts (
        saved_script_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
        content_id UUID REFERENCES content(content_id) ON DELETE CASCADE,
        custom_notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
  })

  // Recorded Interactions table
  const { error: recordedInteractionsError } = await supabase.rpc('create_recorded_interactions_table', {
    sql: `
      CREATE TABLE IF NOT EXISTS recorded_interactions (
        interaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        duration INTEGER, -- in seconds
        media_url TEXT,
        location_data JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
  })

  if (usersError) console.error('Users table error:', usersError)
  if (contentError) console.error('Content table error:', contentError)
  if (savedScriptsError) console.error('Saved scripts table error:', savedScriptsError)
  if (recordedInteractionsError) console.error('Recorded interactions table error:', recordedInteractionsError)
}

// User operations
export const createUser = async (authProvider, preferredLanguage = 'en') => {
  const { data, error } = await supabase
    .from('users')
    .insert([
      {
        auth_provider: authProvider,
        preferred_language: preferredLanguage
      }
    ])
    .select()

  return { data, error }
}

export const getUserById = async (userId) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('user_id', userId)
    .single()

  return { data, error }
}

export const updateUserSubscription = async (userId, subscriptionStatus) => {
  const { data, error } = await supabase
    .from('users')
    .update({ subscription_status: subscriptionStatus })
    .eq('user_id', userId)
    .select()

  return { data, error }
}

// Content operations
export const getContentByStateAndLanguage = async (state, language, type = null) => {
  let query = supabase
    .from('content')
    .select('*')
    .eq('state', state)
    .eq('language', language)

  if (type) {
    query = query.eq('type', type)
  }

  const { data, error } = await query

  return { data, error }
}

export const createContent = async (state, language, type, content) => {
  const { data, error } = await supabase
    .from('content')
    .insert([
      {
        state,
        language,
        type,
        content
      }
    ])
    .select()

  return { data, error }
}

// Saved Scripts operations
export const saveScript = async (userId, contentId, customNotes = '') => {
  const { data, error } = await supabase
    .from('saved_scripts')
    .insert([
      {
        user_id: userId,
        content_id: contentId,
        custom_notes: customNotes
      }
    ])
    .select()

  return { data, error }
}

export const getUserSavedScripts = async (userId) => {
  const { data, error } = await supabase
    .from('saved_scripts')
    .select(`
      *,
      content (*)
    `)
    .eq('user_id', userId)

  return { data, error }
}

// Recorded Interactions operations
export const saveRecordedInteraction = async (userId, duration, mediaUrl, locationData) => {
  const { data, error } = await supabase
    .from('recorded_interactions')
    .insert([
      {
        user_id: userId,
        duration,
        media_url: mediaUrl,
        location_data: locationData
      }
    ])
    .select()

  return { data, error }
}

export const getUserRecordedInteractions = async (userId) => {
  const { data, error } = await supabase
    .from('recorded_interactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  return { data, error }
}

// Storage operations for media files
export const uploadRecording = async (file, fileName) => {
  const { data, error } = await supabase.storage
    .from('recordings')
    .upload(fileName, file)

  return { data, error }
}

export const getRecordingUrl = async (fileName) => {
  const { data } = supabase.storage
    .from('recordings')
    .getPublicUrl(fileName)

  return data.publicUrl
}
