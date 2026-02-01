import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, Loader2, Edit2, XCircle, Users, Video, User, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../stores/authStore';
import { meetingService, type Meeting, type MeetingStatus } from '../../services/meetingService';
import { TopHeader } from '../../components/layout';
import { EditMeetingModal } from './components/EditMeetingModal';
import { AttendanceReportModal } from './components/AttendanceReportModal';

const statusConfig: Record<MeetingStatus, { label: string; className: string }> = {
    LIVE: {
        label: 'LIVE',
        className: 'bg-status-live/20 text-status-live border-status-live/30 animate-pulse',
    },
    SCHEDULED: {
        label: 'Scheduled',
        className: 'bg-status-scheduled/20 text-status-scheduled border-status-scheduled/30',
    },
    ENDED: {
        label: 'Ended',
        className: 'bg-status-ended/20 text-status-ended border-status-ended/30',
    },
    CANCELLED: {
        label: 'Cancelled',
        className: 'bg-status-error/20 text-status-error border-status-error/30',
    },
};

const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export const LecturerDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Modal states
    const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
    const [viewingAttendance, setViewingAttendance] = useState<Meeting | null>(null);

    const fetchMeetings = async (showRefreshToast = false) => {
        try {
            if (showRefreshToast) setIsRefreshing(true);
            const data = await meetingService.getLecturerMeetings();
            setMeetings(data);
            if (showRefreshToast) toast.success('Meetings refreshed');
        } catch (error) {
            console.error('Failed to fetch meetings:', error);
            toast.error('Failed to load meetings');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchMeetings();
    }, []);

    const handleStartMeeting = async (meetingId: string) => {
        try {
            await meetingService.startMeeting(meetingId);
            toast.success('Meeting started!');
            navigate(`/lecturer/meeting/${meetingId}`);
        } catch (error) {
            toast.error('Failed to start meeting');
        }
    };

    const handleEndMeeting = async (meetingId: string) => {
        try {
            await meetingService.endMeeting(meetingId);
            toast.success('Meeting ended');
            fetchMeetings();
        } catch (error) {
            toast.error('Failed to end meeting');
        }
    };

    const handleCancelMeeting = async (meetingId: string) => {
        if (!confirm('Are you sure you want to cancel this meeting?')) return;
        try {
            await meetingService.cancelMeeting(meetingId);
            toast.success('Meeting cancelled');
            fetchMeetings();
        } catch (error) {
            toast.error('Failed to cancel meeting');
        }
    };

    const handleJoinMeeting = (meetingId: string) => {
        navigate(`/lecturer/meeting/${meetingId}`);
    };

    const liveMeetings = meetings.filter((m) => m.status === 'LIVE');
    const upcomingMeetings = meetings.filter((m) => m.status === 'SCHEDULED');
    const pastMeetings = meetings.filter((m) => m.status === 'ENDED' || m.status === 'CANCELLED');

    const renderMeetingCard = (meeting: Meeting, showFullActions = true) => {
        const status = statusConfig[meeting.status];
        const isLive = meeting.status === 'LIVE';
        const isScheduled = meeting.status === 'SCHEDULED';
        const isEnded = meeting.status === 'ENDED';

        return (
            <div
                key={meeting.meetingId}
                className="bg-background-card rounded-xl border border-primary/30 p-5 hover:border-primary/50 transition-all group"
            >
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-text-primary truncate group-hover:text-primary transition-colors">
                            {meeting.title}
                        </h3>
                        {meeting.description && (
                            <p className="text-sm text-text-secondary mt-1 line-clamp-2">
                                {meeting.description}
                            </p>
                        )}
                    </div>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${status.className}`}>
                        {status.label}
                    </span>
                </div>

                {/* Details */}
                <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                        <User size={14} className="text-text-muted" />
                        <span>{meeting.createdByName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                        <Calendar size={14} className="text-text-muted" />
                        <span>{formatDateTime(meeting.scheduledStartTime)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                        <Clock size={14} className="text-text-muted" />
                        <span>{meeting.targetDegree} • Batch {meeting.targetBatch}</span>
                    </div>
                </div>

                {/* Actions */}
                {showFullActions && (
                    <div className="space-y-2 pt-4 border-t border-white/5">
                        {/* Primary Actions */}
                        <div className="flex gap-2">
                            {isLive && (
                                <>
                                    <button
                                        onClick={() => handleJoinMeeting(meeting.meetingId)}
                                        className="flex-1 bg-primary hover:bg-primary-hover text-white font-medium py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                                    >
                                        <Video size={16} />
                                        Join
                                    </button>
                                    <button
                                        onClick={() => handleEndMeeting(meeting.meetingId)}
                                        className="flex-1 bg-status-error hover:bg-status-error/80 text-white font-medium py-2 px-4 rounded-lg transition-all"
                                    >
                                        End Meeting
                                    </button>
                                </>
                            )}
                            {isScheduled && (
                                <button
                                    onClick={() => handleStartMeeting(meeting.meetingId)}
                                    className="flex-1 bg-status-success hover:bg-status-success/80 text-white font-medium py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                                >
                                    <Video size={16} />
                                    Start Meeting
                                </button>
                            )}
                            {isEnded && (
                                <button
                                    onClick={() => setViewingAttendance(meeting)}
                                    className="flex-1 bg-primary hover:bg-primary-hover text-white font-medium py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                                >
                                    <Users size={16} />
                                    View Attendance
                                </button>
                            )}
                        </div>

                        {/* Secondary Actions for Scheduled */}
                        {isScheduled && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setEditingMeeting(meeting)}
                                    className="flex-1 bg-background-surface hover:bg-background-dark text-text-secondary font-medium py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-2 text-sm"
                                >
                                    <Edit2 size={14} />
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleCancelMeeting(meeting.meetingId)}
                                    className="flex-1 bg-status-error/10 hover:bg-status-error/20 text-status-error font-medium py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-2 text-sm"
                                >
                                    <XCircle size={14} />
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen">
            <TopHeader
                title={"Hi, " + user?.firstName}
                onRefresh={() => fetchMeetings(true)}
                isRefreshing={isRefreshing}
                actions={
                    <button
                        onClick={() => navigate('/lecturer/create-meeting')}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white font-medium transition-all"
                    >
                        <Plus size={18} />
                        New Meeting
                    </button>
                }
            />

            <main className="p-6">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                        <p className="text-text-secondary">Loading your meetings...</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Live Meetings */}
                        {liveMeetings.length > 0 && (
                            <section>
                                <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-status-live animate-pulse" />
                                    Live Now ({liveMeetings.length})
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {liveMeetings.map((meeting) => renderMeetingCard(meeting))}
                                </div>
                            </section>
                        )}

                        {/* Upcoming Meetings */}
                        <section>
                            <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                                <Calendar size={18} className="text-status-scheduled" />
                                Upcoming Meetings ({upcomingMeetings.length})
                            </h2>
                            {upcomingMeetings.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {upcomingMeetings.map((meeting) => renderMeetingCard(meeting))}
                                </div>
                            ) : (
                                <div className="bg-background-card rounded-xl border border-white/5 p-8 text-center">
                                    <Calendar className="w-12 h-12 text-text-muted mx-auto mb-3" />
                                    <h3 className="text-text-primary font-medium mb-1">No Upcoming Meetings</h3>
                                    <p className="text-text-secondary text-sm mb-4">
                                        Schedule a new meeting to get started.
                                    </p>
                                    <button
                                        onClick={() => navigate('/lecturer/create-meeting')}
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white font-medium transition-all"
                                    >
                                        <Plus size={18} />
                                        Create Meeting
                                    </button>
                                </div>
                            )}
                        </section>

                        {/* Past Meetings */}
                        {pastMeetings.length > 0 && (
                            <section>
                                <h2 className="text-lg font-semibold text-text-secondary mb-4">
                                    Past Meetings ({pastMeetings.length})
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {pastMeetings.slice(0, 6).map((meeting) => renderMeetingCard(meeting, meeting.status === 'ENDED'))}
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </main>

            {/* Edit Meeting Modal */}
            {editingMeeting && (
                <EditMeetingModal
                    meeting={editingMeeting}
                    isOpen={!!editingMeeting}
                    onClose={() => setEditingMeeting(null)}
                    onUpdated={fetchMeetings}
                />
            )}

            {/* Attendance Report Modal */}
            {viewingAttendance && (
                <AttendanceReportModal
                    meetingId={viewingAttendance.meetingId}
                    meetingTitle={viewingAttendance.title}
                    isOpen={!!viewingAttendance}
                    onClose={() => setViewingAttendance(null)}
                />
            )}
        </div>
    );
};
