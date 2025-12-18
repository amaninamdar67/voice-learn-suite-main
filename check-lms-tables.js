import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTables() {
  console.log('🔍 Checking LMS tables...\n');

  try {
    // Check video_lessons
    const { data: videoLessons, error: vError, count: vCount } = await supabase
      .from('video_lessons')
      .select('*', { count: 'exact' });
    console.log('📹 video_lessons:', { count: vCount, error: vError?.message, data: videoLessons?.length });
    if (videoLessons?.length > 0) console.log('   Sample:', videoLessons[0]);

    // Check recorded_videos
    const { data: recordedVideos, error: rError, count: rCount } = await supabase
      .from('recorded_videos')
      .select('*', { count: 'exact' });
    console.log('📹 recorded_videos:', { count: rCount, error: rError?.message, data: recordedVideos?.length });
    if (recordedVideos?.length > 0) console.log('   Sample:', recordedVideos[0]);

    // Check live_classes
    const { data: liveClasses, error: lError, count: lCount } = await supabase
      .from('live_classes')
      .select('*', { count: 'exact' });
    console.log('🎓 live_classes:', { count: lCount, error: lError?.message, data: liveClasses?.length });
    if (liveClasses?.length > 0) console.log('   Sample:', liveClasses[0]);

    // Check quizzes
    const { data: quizzes, error: qError, count: qCount } = await supabase
      .from('quizzes')
      .select('*', { count: 'exact' });
    console.log('❓ quizzes:', { count: qCount, error: qError?.message, data: quizzes?.length });
    if (quizzes?.length > 0) console.log('   Sample:', quizzes[0]);

    // Check assignments
    const { data: assignments, error: aError, count: aCount } = await supabase
      .from('assignments')
      .select('*', { count: 'exact' });
    console.log('📝 assignments:', { count: aCount, error: aError?.message, data: assignments?.length });
    if (assignments?.length > 0) console.log('   Sample:', assignments[0]);

    console.log('\n✅ Check complete');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkTables();
