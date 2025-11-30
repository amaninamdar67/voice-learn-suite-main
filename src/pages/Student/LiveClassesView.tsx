import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import CustomVideoPlayer from '../../components/VideoPlayer/CustomVideoPlayer';
import { Radio, Calendar, Clock, X, Bell, CheckCircle } from 'lucide-react';

interface LiveClass {
  id: string;
  session_title: string;
  description: string;
  stream_url: string;
  start_time: string;
  end_time: string;
  status: 'upcoming' | 'live' | 'ended';
  subject: string;
  grade: string;
  section: string;
  profiles: {
    full_name: string;
  };
}

interface AttendancePing {
  id: string;
  ping_sent_at: string;
  ping_expires_at: string;
}

export default function LiveClassesView() {
  const { user, profile } = useAuth();
  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<LiveClass | null>(null);
  const [attendanceId, setAttendanceId] = useState<string | null>(null);
  const [showPingModal, setShowPingModal] = useState(false);
  const [currentPing, setCurrentPing] = useState<AttendancePing | null>(null);
  const [countdown, setCountdown] = useState(60);
  const [hasResponded, setHasResponded] = useState(false);

  useEffect(() => {
    fetchClasses();
    
    // Refresh classes every 30 seconds to update status
    const interval = setInterval(() => {
      fetchClasses();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [user, profile]);

  useEffect(() => {
    if (selectedClass && selectedClass.status === 'live') {
      // Poll for attendance pings every 5 seconds
      const interval = setInterval(() => {
        checkForPings();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [selectedClass]);

  useEffect(() => {
    if (showPingModal && countdown > 0 && !hasResponded) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (countdown === 0 && !hasResponded) {
      // Time expired - mark as absent
      handlePingResponse(false);
    }
  }, [countdown, showPingModal, hasResponded]);

  const fetchClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('live_classes')
        .select('*')
        .order('start_time', { ascending: false });

      if (error) throw error;
      
      // Fetch teacher names separately
      if (data && data.length > 0) {
        const teacherIds = [...new Set(data.map(c => c.teacher_id))];
        const { data: teachers } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', teacherIds);
        
        const teacherMap = new Map(teachers?.map(t => [t.id, t.full_name]) || []);
        const now = new Date();
        
        const classesWithTeachers = data.map(liveClass => {
          const startTime = new Date(liveClass.start_time);
          const endTime = new Date(liveClass.end_time);
          
          // Determine actual status based on current time
          let actualStatus: 'upcoming' | 'live' | 'ended' = liveClass.status;
          if (now >= startTime && now <= endTime) {
            actualStatus = 'live';
          } else if (now > endTime) {
            actualStatus = 'ended';
          } else {
            actualStatus = 'upcoming';
          }
          
          return {
            ...liveClass,
            status: actualStatus,
            profiles: { full_name: teacherMap.get(liveClass.teacher_id) || 'Unknown' }
          };
        });
        
        setClasses(classesWithTeachers);
      } else {
        setClasses([]);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkForPings = async () => {
    if (!selectedClass || !attendanceId) return;

    try {
      // Check for new pings in the last 10 seconds
      const tenSecondsAgo = new Date(Date.now() - 10000).toISOString();
      
      const { data, error } = await supabase
        .from('live_attendance_pings')
        .select('*')
        .eq('live_class_id', selectedClass.id)
        .gte('ping_sent_at', tenSecondsAgo)
        .order('ping_sent_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        const ping = data[0];
        const expiresAt = new Date(ping.ping_expires_at);
        const now = new Date();

        // Check if ping is still valid and we haven't responded yet
        if (expiresAt > now) {
          const { data: response } = await supabase
            .from('live_ping_responses')
            .select('id')
            .eq('ping_id', ping.id)
            .eq('student_id', user?.id)
            .single();

          if (!response) {
            // New ping that we haven't responded to
            setCurrentPing(ping);
            setCountdown(Math.floor((expiresAt.getTime() - now.getTime()) / 1000));
            setHasResponded(false);
            setShowPingModal(true);
          }
        }
      }
    } catch (error) {
      console.error('Error checking for pings:', error);
    }
  };

  const handleJoinClass = async (liveClass: LiveClass) => {
    try {
      // Record attendance
      const { data, error } = await supabase
        .from('live_attendance')
        .insert([{
          student_id: user?.id,
          live_class_id: liveClass.id,
          joined_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;

      setAttendanceId(data.id);
      setSelectedClass(liveClass);
    } catch (error: any) {
      console.error('Error joining class:', error);
      alert('Error: ' + error.message);
    }
  };

  const handleLeaveClass = async () => {
    if (!attendanceId) return;

    try {
      const { error } = await supabase
        .from('live_attendance')
        .update({
          left_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', attendanceId);

      if (error) throw error;

      setSelectedClass(null);
      setAttendanceId(null);
    } catch (error: any) {
      console.error('Error leaving class:', error);
    }
  };

  const handlePingResponse = async (isPresent: boolean) => {
    if (!currentPing || hasResponded) return;

    try {
      const respondedAt = new Date();
      const pingSentAt = new Date(currentPing.ping_sent_at);
      const responseTime = Math.floor((respondedAt.getTime() - pingSentAt.getTime()) / 1000);

      await supabase
        .from('live_ping_responses')
        .insert([{
          ping_id: currentPing.id,
          student_id: user?.id,
          responded_at: isPresent ? respondedAt.toISOString() : null,
          response_time_seconds: responseTime,
          is_present: isPresent,
        }]);

      setHasResponded(true);
      
      // Close modal after 2 seconds
      setTimeout(() => {
        setShowPingModal(false);
        setCurrentPing(null);
      }, 2000);
    } catch (error) {
      console.error('Error responding to ping:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'live':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full">
            <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
            LIVE NOW
          </span>
        );
      case 'upcoming':
        return (
          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
            UPCOMING
          </span>
        );
      case 'ended':
        return (
          <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
            ENDED
          </span>
        );
      default:
        return null;
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/live\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading classes...</div>
      </div>
    );
  }

  const liveClasses = classes.filter(c => c.status === 'live');
  const upcomingClasses = classes.filter(c => c.status === 'upcoming');
  const endedClasses = classes.filter(c => c.status === 'ended');

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Live Classes</h1>
        <p className="text-gray-600 mt-1">Join live sessions and interact with teachers</p>
      </div>

      {/* Live Now Section */}
      {liveClasses.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Radio size={24} className="text-red-600" />
            Live Now
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {liveClasses.map((liveClass) => (
              <ClassCard
                key={liveClass.id}
                liveClass={liveClass}
                onJoin={() => handleJoinClass(liveClass)}
                getStatusBadge={getStatusBadge}
                formatDateTime={formatDateTime}
              />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Section */}
      {upcomingClasses.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Calendar size={24} className="text-blue-600" />
            Upcoming Classes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingClasses.map((liveClass) => (
              <ClassCard
                key={liveClass.id}
                liveClass={liveClass}
                onJoin={() => handleJoinClass(liveClass)}
                getStatusBadge={getStatusBadge}
                formatDateTime={formatDateTime}
              />
            ))}
          </div>
        </div>
      )}

      {/* Ended Section */}
      {endedClasses.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Clock size={24} className="text-gray-600" />
            Past Classes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {endedClasses.slice(0, 6).map((liveClass) => (
              <ClassCard
                key={liveClass.id}
                liveClass={liveClass}
                onJoin={() => {}}
                getStatusBadge={getStatusBadge}
                formatDateTime={formatDateTime}
                disabled
              />
            ))}
          </div>
        </div>
      )}

      {classes.length === 0 && (
        <div className="text-center py-12">
          <Radio size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No live classes scheduled</h3>
          <p className="text-gray-600">Check back later for upcoming sessions</p>
        </div>
      )}

      {/* Live Class Player Modal */}
      {selectedClass && (
        <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
          <div className="w-full h-full flex flex-col">
            <div className="bg-gray-900 p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
                <h2 className="text-white text-xl font-bold">{selectedClass.session_title}</h2>
              </div>
              <button
                onClick={handleLeaveClass}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Leave Class
              </button>
            </div>

            <div className="flex-1 flex flex-col gap-4">
              {/* YouTube Streaming Notice */}
              <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <svg className="w-12 h-12 text-red-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      Live Stream on YouTube
                    </h3>
                    <p className="text-gray-700 mb-4">
                      This live class is hosted on YouTube. Click the button below to watch the stream.
                    </p>
                    <button
                      onClick={() => window.open(selectedClass.stream_url, '_blank', 'noopener,noreferrer')}
                      className="w-full px-6 py-4 bg-red-600 hover:bg-red-700 text-white text-lg font-bold rounded-lg flex items-center justify-center gap-3 transition-all transform hover:scale-105 shadow-lg"
                    >
                      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                      Watch Live Stream on YouTube
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </button>
                    <p className="text-sm text-gray-600 mt-3 text-center">
                      The stream will open in a new tab
                    </p>
                  </div>
                </div>
              </div>

              {/* Try Embed Anyway (will likely fail) */}
              <div className="bg-gray-100 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Note:</strong> If the teacher has enabled embedding, the video will appear below:
                </p>
                <div className="bg-black rounded-lg overflow-hidden aspect-video">
                  {extractVideoId(selectedClass.stream_url) ? (
                    <CustomVideoPlayer
                      videoId={extractVideoId(selectedClass.stream_url)!}
                      title={selectedClass.session_title}
                      isLive={true}
                      autoplay={false}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white">
                      <p>Unable to extract video ID</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Ping Modal */}
      {showPingModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
            {!hasResponded ? (
              <>
                <div className="mb-6">
                  <Bell size={64} className="mx-auto text-orange-500 animate-bounce" />
                </div>
                <h2 className="text-2xl font-bold mb-4">Attendance Check!</h2>
                <p className="text-gray-600 mb-6">
                  Mark your presence within the time limit
                </p>
                
                <div className="mb-6">
                  <div className="text-6xl font-bold text-blue-600 mb-2">
                    {countdown}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all duration-1000"
                      style={{ width: `${(countdown / 60) * 100}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">seconds remaining</p>
                </div>

                <button
                  onClick={() => handlePingResponse(true)}
                  className="w-full py-4 bg-green-600 text-white text-xl font-bold rounded-lg hover:bg-green-700 transition-colors"
                >
                  Mark Present
                </button>
              </>
            ) : (
              <>
                <div className="mb-6">
                  <CheckCircle size={64} className="mx-auto text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-green-600 mb-2">
                  Attendance Marked!
                </h2>
                <p className="text-gray-600">
                  You've been marked present for this session
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Class Card Component
function ClassCard({ liveClass, onJoin, getStatusBadge, formatDateTime, disabled = false }: {
  liveClass: LiveClass;
  onJoin: () => void;
  getStatusBadge: (status: string) => React.ReactNode;
  formatDateTime: (date: string) => string;
  disabled?: boolean;
}) {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${disabled ? 'opacity-60' : ''}`}>
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-lg line-clamp-2 flex-1">{liveClass.session_title}</h3>
        {getStatusBadge(liveClass.status)}
      </div>

      {liveClass.description && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{liveClass.description}</p>
      )}

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar size={16} />
          <span>Start: {formatDateTime(liveClass.start_time)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock size={16} />
          <span>End: {formatDateTime(liveClass.end_time)}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {liveClass.subject && (
          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
            {liveClass.subject}
          </span>
        )}
        {liveClass.grade && (
          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
            Grade {liveClass.grade}
          </span>
        )}
      </div>

      <div className="text-sm text-gray-600 mb-4">
        By {liveClass.profiles.full_name}
      </div>

      {liveClass.status === 'live' && !disabled && (
        <button
          onClick={onJoin}
          className="w-full py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
        >
          <Radio size={20} />
          Join Live Class
        </button>
      )}

      {liveClass.status === 'upcoming' && (
        <button
          disabled
          className="w-full py-3 bg-gray-200 text-gray-500 font-semibold rounded-lg cursor-not-allowed"
        >
          Starts {formatDateTime(liveClass.start_time)}
        </button>
      )}
    </div>
  );
}
