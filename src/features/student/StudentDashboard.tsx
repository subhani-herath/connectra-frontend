import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../stores/authStore';
import { meetingService, type Meeting } from '../../services/meetingService';
import { MeetingCard } from '../../components/shared/MeetingCard';
import { TopHeader } from '../../components/layout';

export const StudentDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchMeetings = async (showRefreshToast = false) => {
        try {
            if (showRefreshToast) setIsRefreshing(true);
            const data = await meetingService.getStudentMeetings();
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

    const handleJoinMeeting = (meetingId: string) => {
        navigate(`/student/meeting/${meetingId}`);
    };

    const liveMeetings = meetings.filter((m) => m.status === 'LIVE');
    const upcomingMeetings = meetings.filter((m) => m.status === 'SCHEDULED');
    const pastMeetings = meetings.filter((m) => m.status === 'ENDED' || m.status === 'CANCELLED');

    return (
        <div className="min-h-screen">
            <TopHeader
                title="Dashboard"
                subtitle={user?.email}
                onRefresh={() => fetchMeetings(true)}
                isRefreshing={isRefreshing}
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
                                    {liveMeetings.map((meeting) => (
                                        <MeetingCard
                                            key={meeting.meetingId}
                                            meeting={meeting}
                                            onJoin={() => handleJoinMeeting(meeting.meetingId)}
                                        />
                                    ))}
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
                                    {upcomingMeetings.map((meeting) => (
                                        <MeetingCard
                                            key={meeting.meetingId}
                                            meeting={meeting}
                                            onJoin={() => handleJoinMeeting(meeting.meetingId)}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-background-card rounded-xl border border-white/5 p-8 text-center">
                                    <Calendar className="w-12 h-12 text-text-muted mx-auto mb-3" />
                                    <h3 className="text-text-primary font-medium mb-1">No Upcoming Meetings</h3>
                                    <p className="text-text-secondary text-sm">
                                        Check back later for scheduled sessions.
                                    </p>
                                </div>
                            )}
                        </section>

                        {/* Past Meetings */}
                        {pastMeetings.length > 0 && (
                            <section>
                                <h2 className="text-lg font-semibold text-text-secondary mb-4">
                                    Past Meetings ({pastMeetings.length})
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 opacity-75">
                                    {pastMeetings.slice(0, 6).map((meeting) => (
                                        <MeetingCard
                                            key={meeting.meetingId}
                                            meeting={meeting}
                                            showActions={false}
                                        />
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};
