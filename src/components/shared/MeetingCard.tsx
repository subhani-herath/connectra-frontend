import React from 'react';
import { Calendar, Clock, User, Video } from 'lucide-react';
import type { Meeting, MeetingStatus } from '../../services/meetingService';

interface MeetingCardProps {
    meeting: Meeting;
    onJoin?: () => void;
    showActions?: boolean;
    isLecturer?: boolean;
    onStart?: () => void;
    onEnd?: () => void;
}

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

export const MeetingCard: React.FC<MeetingCardProps> = ({
    meeting,
    onJoin,
    showActions = true,
    isLecturer = false,
    onStart,
    onEnd,
}) => {
    const status = statusConfig[meeting.status];
    const canJoin = meeting.status === 'LIVE';
    const canStart = isLecturer && meeting.status === 'SCHEDULED';
    const canEnd = isLecturer && meeting.status === 'LIVE';

    return (
        <div className="bg-background-card rounded-xl border border-primary/30 p-5 hover:border-primary/50 transition-all group">
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
                <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full border ${status.className}`}
                >
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
                    <span>
                        {meeting.targetDegree} • Batch {meeting.targetBatch}
                    </span>
                </div>
            </div>

            {/* Actions */}
            {showActions && (
                <div className="flex gap-2 pt-4 border-t border-white/5">
                    {canJoin && onJoin && (
                        <button
                            onClick={onJoin}
                            className="flex-1 bg-primary hover:bg-primary-hover text-white font-medium py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                        >
                            <Video size={16} />
                            Join Meeting
                        </button>
                    )}
                    {canStart && onStart && (
                        <button
                            onClick={onStart}
                            className="flex-1 bg-status-success hover:bg-status-success/80 text-white font-medium py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                        >
                            <Video size={16} />
                            Start Meeting
                        </button>
                    )}
                    {canEnd && onEnd && (
                        <button
                            onClick={onEnd}
                            className="flex-1 bg-status-error hover:bg-status-error/80 text-white font-medium py-2 px-4 rounded-lg transition-all"
                        >
                            End Meeting
                        </button>
                    )}
                    {!canJoin && !canStart && !canEnd && (
                        <button
                            disabled
                            className="flex-1 bg-background-surface text-text-muted font-medium py-2 px-4 rounded-lg cursor-not-allowed"
                        >
                            {meeting.status === 'ENDED' ? 'Meeting Ended' : 'Not Available'}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};
