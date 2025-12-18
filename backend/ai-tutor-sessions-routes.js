import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

// Middleware to get user from auth header
const getUserFromAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('[Auth] Authorization header present:', !!authHeader);
    
    if (!authHeader) {
      console.error('[Auth] No authorization header');
      return res.status(401).json({ error: 'No authorization header' });
    }
    
    const token = authHeader.replace('Bearer ', '');
    console.log('[Auth] Token length:', token.length);
    
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error) {
      console.error('[Auth] Error getting user:', error.message);
    }
    
    if (!user) {
      console.error('[Auth] No user found from token');
      return res.status(401).json({ error: 'Unauthorized - invalid token' });
    }
    
    console.log('[Auth] User authenticated:', user.id);
    req.user = user;
    next();
  } catch (error) {
    console.error('[Auth] Exception:', error.message);
    res.status(401).json({ error: 'Unauthorized - ' + error.message });
  }
};

// Apply auth middleware to all routes
router.use(getUserFromAuth);

// Get all sessions for current user
router.get('/sessions', async (req, res) => {
  try {
    const userId = req.user?.id;
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    if (!userId) {
      console.error('[Sessions] No user ID found in auth');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log('[Sessions] Fetching sessions for user:', userId);

    const { data, error } = await supabase
      .from('ai_tutor_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('[Sessions] Error fetching sessions:', error);
      throw error;
    }

    console.log('[Sessions] Found', data?.length || 0, 'sessions');
    res.json({ sessions: data || [] });
  } catch (error) {
    console.error('[Sessions] Error fetching sessions:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new session
router.post('/sessions', async (req, res) => {
  try {
    const userId = req.user?.id;
    const { title } = req.body;

    console.log('[Sessions] Creating new session for user:', userId);

    if (!userId) {
      console.error('[Sessions] No user ID found');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data, error } = await supabase
      .from('ai_tutor_sessions')
      .insert([
        {
          user_id: userId,
          title: title || 'New Chat',
        },
      ])
      .select();

    if (error) {
      console.error('[Sessions] Error creating session:', error);
      throw error;
    }

    console.log('[Sessions] Session created successfully:', data[0]?.id);
    res.json({ session: data[0] });
  } catch (error) {
    console.error('[Sessions] Error creating session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get session with messages
router.get('/sessions/:sessionId', async (req, res) => {
  try {
    const userId = req.user?.id;
    const { sessionId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Verify session belongs to user
    const { data: session, error: sessionError } = await supabase
      .from('ai_tutor_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', userId)
      .single();

    if (sessionError || !session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Get messages
    const { data: messages, error: messagesError } = await supabase
      .from('ai_tutor_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (messagesError) throw messagesError;

    res.json({ session, messages: messages || [] });
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Save message to session
router.post('/sessions/:sessionId/messages', async (req, res) => {
  try {
    const userId = req.user?.id;
    const { sessionId } = req.params;
    const { role, content, imageData } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Verify session belongs to user
    const { data: session, error: sessionError } = await supabase
      .from('ai_tutor_sessions')
      .select('id')
      .eq('id', sessionId)
      .eq('user_id', userId)
      .single();

    if (sessionError || !session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Save message
    const { data, error } = await supabase
      .from('ai_tutor_messages')
      .insert([
        {
          session_id: sessionId,
          role,
          content,
          image_data: imageData || null,
        },
      ])
      .select();

    if (error) throw error;

    // Update session timestamp
    await supabase
      .from('ai_tutor_sessions')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', sessionId);

    res.json({ message: data[0] });
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete session
router.delete('/sessions/:sessionId', async (req, res) => {
  try {
    const userId = req.user?.id;
    const { sessionId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Soft delete
    const { error } = await supabase
      .from('ai_tutor_sessions')
      .update({ is_deleted: true })
      .eq('id', sessionId)
      .eq('user_id', userId);

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update session title
router.patch('/sessions/:sessionId', async (req, res) => {
  try {
    const userId = req.user?.id;
    const { sessionId } = req.params;
    const { title } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data, error } = await supabase
      .from('ai_tutor_sessions')
      .update({ title })
      .eq('id', sessionId)
      .eq('user_id', userId)
      .select();

    if (error) throw error;

    res.json({ session: data[0] });
  } catch (error) {
    console.error('Error updating session:', error);
    res.status(500).json({ error: error.message });
  }
});

export const initializeAITutorSessionRoutes = (app) => {
  app.use('/api/ai-tutor', router);
};

export default router;
