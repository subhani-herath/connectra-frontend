import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Users, Loader2, AlertTriangle, Info, ClipboardList, ChevronRight, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAgora } from '../../hooks/useAgora';
import { useAuthStore } from '../../stores/authStore';
import { meetingService, type Meeting, type Participant } from '../../services/meetingService';
import { VideoGrid } from './components/VideoGrid';
import { ScreenShareLayout } from './components/ScreenShareLayout';
import { Controls } from './components/Controls';
import { ScreenPicker } from './components/ScreenPicker';
import { QuizPanel } from '../lecturer/components/QuizPanel';
import { QuizOverlay } from '../student/components/QuizOverlay';

export const MeetingRoom: React.FC = () => {
    const { meetingId } = useParams<{ meetingId: string }>();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [meeting, setMeeting] = useState<Meeting | null>(null);
    const [meetingLoading, setMeetingLoading] = useState(true);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [showScreenPicker, setShowScreenPicker] = useState(false);
    const [showSidebar, setShowSidebar] = useState(true);
    const [sidebarTab, setSidebarTab] = useState<'info' | 'quiz'>('info');

    // meetingId is already a string (UUID)
    const isLecturer = user?.role === 'LECTURER';
    const userName = user?.email?.split('@')[0] || 'You';

    const {
        isJoined,
        isLoading: agoraLoading,
        error: agoraError,
        localVideoTrack,
        remoteUsers,
        isMicMuted,
        isCamOff,
        isScreenSharing,
        toggleMic,
        toggleCam,
        startScreenShare,
        stopScreenShare,
        leave,
        currentUserInfo,
    } = useAgora(meetingId || '');

    // Backend-based participant name sync (replaces RTM placeholder)
    const [backendParticipants, setBackendParticipants] = useState<Participant[]>([]);

    // Fetch meeting details
    useEffect(() => {
        const fetchMeeting = async () => {
            try {
                const data = await meetingService.getMeetingById(meetingId || '');
                setMeeting(data);
            } catch (error) {
                console.error('Failed to fetch meeting:', error);
                toast.error('Meeting not found');
            } finally {
                setMeetingLoading(false);
            }
        };

        if (meetingId) {
            fetchMeeting();
        }
    }, [meetingId]);

    // Record student attendance on join/leave
    useEffect(() => {
        if (!meetingId || isLecturer) return;

        const recordAttendance = async () => {
            try {
                if (isJoined) {
                    // Student joined - record attendance
                    await meetingService.joinMeeting(meetingId);
                    console.log('Attendance recorded: joined meeting');
                } else {
                    // Student left - update attendance
                    await meetingService.leaveMeeting(meetingId);
                    console.log('Attendance recorded: left meeting');
                }
            } catch (error) {
                console.error('Failed to record attendance:', error);
            }
        };

        recordAttendance();
    }, [isJoined, meetingId, isLecturer]);

    // Poll meeting status for students - detect when lecturer ends the meeting
    useEffect(() => {
        if (!isJoined || !meetingId || isLecturer) return;

        const checkMeetingStatus = async () => {
            try {
                const data = await meetingService.getMeetingById(meetingId);
                if (data.status === 'ENDED' || data.status === 'CANCELLED') {
                    toast('Meeting has ended', { icon: '📢' });
                    leave();
                    navigate(isLecturer ? '/lecturer/dashboard' : '/student/dashboard');
                }
                setMeeting(data);
            } catch (error) {
                console.error('Failed to check meeting status:', error);
            }
        };

        // Poll every 10 seconds
        const interval = setInterval(checkMeetingStatus, 10000);
        return () => clearInterval(interval);
    }, [isJoined, meetingId, isLecturer, leave, navigate]);

    // Timer for meeting duration
    useEffect(() => {
        if (!isJoined) return;

        const interval = setInterval(() => {
            setElapsedTime((prev) => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [isJoined]);

    // Poll backend for participant names every 5 seconds
    useEffect(() => {
        if (!isJoined || !meetingId) return;

        const fetchParticipants = async () => {
            try {
                const participants = await meetingService.getParticipants(meetingId);
                setBackendParticipants(participants);
            } catch (error) {
                console.debug('Failed to fetch participants:', error);
            }
        };

        // Initial fetch
        fetchParticipants();

        // Poll every 5 seconds
        const interval = setInterval(fetchParticipants, 5000);

        return () => clearInterval(interval);
    }, [isJoined, meetingId]);

    const formatTime = (seconds: number): string => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        if (hrs > 0) {
            return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleLeave = async () => {
        // Record attendance leave for students
        if (!isLecturer && meetingId) {
            try {
                await meetingService.leaveMeeting(meetingId);
            } catch (error) {
                console.error('Failed to record leave attendance:', error);
            }
        }

        await leave();
        toast.success('You have left the meeting');
        navigate(isLecturer ? '/lecturer/dashboard' : '/student/dashboard');
    };

    const handleToggleScreenShare = () => {
        if (isScreenSharing) {
            stopScreenShare();
        } else {
            setShowScreenPicker(true);
        }
    };

    const handleScreenSelect = async (sourceId: string) => {
        await startScreenShare(sourceId);
    };

    // Build participants list - uses backend API for real names, with fallback to generic names
    const getParticipantDisplayName = (uid: number | string, remoteIndex: number = 0): string => {
        // Try to get real name from backend participants
        const numericUid = typeof uid === 'string' ? parseInt(uid, 10) : uid;
        const participantInfo = backendParticipants.find(p => p.agoraUid === numericUid);

        if (participantInfo) {
            const suffix = participantInfo.isHost ? ' (Host)' : '';
            return `${participantInfo.displayName}${suffix}`;
        }

        // Fallback when backend data is unavailable - check if it's the lecturer for students
        if (!isLecturer && remoteIndex === 0) {
            // First remote user is the lecturer
            return `${meeting?.createdByName || 'Lecturer'} (Host)`;
        }

        // For other participants, show generic names as last resort
        return `Participant ${remoteIndex + 1}`;
    };

    const participants = [
        {
            uid: currentUserInfo?.uid || 0,
            name: currentUserInfo
                ? `${currentUserInfo.userName}${currentUserInfo.isHost ? ' (Host)' : ''}`
                : isLecturer
                    ? `${userName} (Host)`
                    : userName,
            hasVideo: !isCamOff || isScreenSharing,
            hasAudio: !isMicMuted,
            isLocal: true,
        },
        ...remoteUsers.map((u, index) => {
            return {
                uid: u.uid,
                name: getParticipantDisplayName(u.uid, index),
                hasVideo: u.hasVideo,
                hasAudio: u.hasAudio,
                isLocal: false,
                videoTrack: u.videoTrack,
                isHost: !isLecturer && index === 0, // Only first remote user is host when viewing as student
            };
        }),
    ];

    // Determine if screen sharing layout should be used
    // Use it when local user is sharing, or when there are multiple participants (professional presentation view)
    const shouldUseScreenShareLayout = participants.length > 2 || isScreenSharing;

    // Loading state
    if (meetingLoading || agoraLoading) {
        return (
            <div className="min-h-screen bg-background-dark flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                    <p className="text-text-secondary">Joining meeting...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (agoraError) {
        return (
            <div className="min-h-screen bg-background-dark flex items-center justify-center p-4">
                <div className="bg-background-card p-8 rounded-2xl text-center max-w-md border border-white/5">
                    <AlertTriangle className="w-16 h-16 text-status-warning mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-text-primary mb-2">Connection Error</h1>
                    <p className="text-text-secondary mb-6">{agoraError}</p>
                    <button
                        onClick={() => navigate(isLecturer ? '/lecturer/dashboard' : '/student/dashboard')}
                        className="px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-lg transition-all"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-dark flex flex-col">
            {/* Header */}
            <header className="bg-background-card border-b border-white/5 px-6 py-3">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-semibold text-text-primary">
                            {meeting?.title || 'Meeting Room'}
                        </h1>
                        {meeting?.createdByName && (
                            <p className="text-sm text-text-secondary">Hosted by {meeting.createdByName}</p>
                        )}
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-text-secondary">
                            <Clock size={16} />
                            <span className="font-mono">{formatTime(elapsedTime)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-text-secondary">
                            <Users size={16} />
                            <span>{participants.length}</span>
                        </div>
                        {meeting?.status === 'LIVE' && (
                            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-status-live/20 text-status-live border border-status-live/30 animate-pulse">
                                LIVE
                            </span>
                        )}
                    </div>
                </div>
            </header>

            {/* Main content with sidebar */}
            <div className="flex-1 flex overflow-hidden">
                {/* Video Grid or Screen Share Layout */}
                <main className={`flex-1 overflow-auto transition-all ${showSidebar ? 'mr-0' : ''}`}>
                    {shouldUseScreenShareLayout ? (
                        <ScreenShareLayout
                            participants={participants}
                            localVideoTrack={localVideoTrack}
                            isScreenSharing={isScreenSharing}
                        />
                    ) : (
                        <VideoGrid
                            participants={participants}
                            localVideoTrack={localVideoTrack}
                            isScreenSharing={isScreenSharing}
                        />
                    )}
                </main>

                {/* Sidebar Toggle */}
                <button
                    onClick={() => setShowSidebar(!showSidebar)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background-card border border-white/10 rounded-l-lg p-2 hover:bg-white/5 transition-colors"
                    style={{ right: showSidebar ? '320px' : '0' }}
                >
                    {showSidebar ? <ChevronRight size={16} className="text-text-secondary" /> : <ChevronLeft size={16} className="text-text-secondary" />}
                </button>

                {/* Sidebar */}
                {showSidebar && (
                    <aside className="w-80 bg-background-card border-l border-white/5 flex flex-col">
                        {/* Sidebar Tabs */}
                        <div className="flex border-b border-white/5">
                            <button
                                onClick={() => setSidebarTab('info')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${sidebarTab === 'info'
                                    ? 'text-primary border-b-2 border-primary'
                                    : 'text-text-secondary hover:text-text-primary'
                                    }`}
                            >
                                <Info size={16} />
                                Info
                            </button>
                            {isLecturer && (
                                <button
                                    onClick={() => setSidebarTab('quiz')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${sidebarTab === 'quiz'
                                        ? 'text-primary border-b-2 border-primary'
                                        : 'text-text-secondary hover:text-text-primary'
                                        }`}
                                >
                                    <ClipboardList size={16} />
                                    Quiz
                                </button>
                            )}
                        </div>

                        {/* Sidebar Content */}
                        <div className="flex-1 overflow-auto p-4">
                            {sidebarTab === 'info' && (
                                <div className="space-y-4">
                                    {/* Meeting Details */}
                                    <div className="bg-background-surface rounded-xl p-4 space-y-3">
                                        <h3 className="font-semibold text-text-primary">Meeting Details</h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-text-secondary">Title</span>
                                                <span className="text-text-primary">{meeting?.title}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-text-secondary">Host</span>
                                                <span className="text-text-primary">{meeting?.createdByName}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-text-secondary">Degree</span>
                                                <span className="text-text-primary">{meeting?.targetDegree}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-text-secondary">Batch</span>
                                                <span className="text-text-primary">{meeting?.targetBatch}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-text-secondary">Status</span>
                                                <span className={`font-medium ${meeting?.status === 'LIVE' ? 'text-status-live' : 'text-text-primary'}`}>
                                                    {meeting?.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    {meeting?.description && (
                                        <div className="bg-background-surface rounded-xl p-4">
                                            <h3 className="font-semibold text-text-primary mb-2">Description</h3>
                                            <p className="text-sm text-text-secondary">{meeting.description}</p>
                                        </div>
                                    )}

                                    {/* Participants */}
                                    <div className="bg-background-surface rounded-xl p-4">
                                        <h3 className="font-semibold text-text-primary mb-3">
                                            Participants ({participants.length})
                                        </h3>
                                        <div className="space-y-2">
                                            {participants.map((p) => (
                                                <div key={p.uid} className="flex items-center gap-2 text-sm">
                                                    <div className={`w-2 h-2 rounded-full ${p.hasVideo ? 'bg-status-success' : 'bg-text-muted'}`} />
                                                    <span className="text-text-primary">
                                                        {p.name}
                                                        {p.isLocal && ' (You)'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {sidebarTab === 'quiz' && isLecturer && meetingId && (
                                <QuizPanel
                                    meetingId={meetingId}
                                    isMeetingLive={meeting?.status === 'LIVE'}
                                />
                            )}
                        </div>
                    </aside>
                )}
            </div>

            {/* Controls */}
            <footer className="p-6 flex justify-center">
                <Controls
                    isMicMuted={isMicMuted}
                    isCamOff={isCamOff}
                    isScreenSharing={isScreenSharing}
                    showScreenShare={true}
                    onToggleMic={toggleMic}
                    onToggleCam={toggleCam}
                    onToggleScreenShare={handleToggleScreenShare}
                    onLeave={handleLeave}
                />
            </footer>

            {/* Screen Picker Modal */}
            <ScreenPicker
                isOpen={showScreenPicker}
                onClose={() => setShowScreenPicker(false)}
                onSelect={handleScreenSelect}
            />

            {/* Quiz Overlay for Students */}
            {!isLecturer && meetingId && (
                <QuizOverlay meetingId={meetingId} />
            )}
        </div>
    );
};
