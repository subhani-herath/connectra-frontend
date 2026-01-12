import { useState, useEffect } from 'react';
import { X, Loader2, CheckCircle, XCircle, AlertCircle, Users, Clock, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import {
    meetingService,
    type AttendanceReport,
    type AttendanceEntry,
} from '../../../services/meetingService';

interface AttendanceReportModalProps {
    meetingId: string;
    meetingTitle: string;
    isOpen: boolean;
    onClose: () => void;
}

const statusConfig: Record<AttendanceEntry['status'], { label: string; icon: React.ReactNode; className: string }> = {
    PRESENT: {
        label: 'Present',
        icon: <CheckCircle size={14} />,
        className: 'text-status-success bg-status-success/20',
    },
    ABSENT: {
        label: 'Absent',
        icon: <XCircle size={14} />,
        className: 'text-status-error bg-status-error/20',
    },
    LATE: {
        label: 'Late',
        icon: <AlertCircle size={14} />,
        className: 'text-status-warning bg-status-warning/20',
    },
};

const formatTime = (dateString?: string): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
    });
};

export const AttendanceReportModal: React.FC<AttendanceReportModalProps> = ({
    meetingId,
    meetingTitle,
    isOpen,
    onClose,
}) => {
    const [report, setReport] = useState<AttendanceReport | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchReport();
        }
    }, [isOpen, meetingId]);

    const fetchReport = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await meetingService.getAttendanceReport(meetingId);
            setReport(data);
        } catch (err) {
            console.error('Failed to fetch attendance report:', err);
            setError('Failed to load attendance report');
            toast.error('Failed to load attendance report');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-background-card rounded-2xl max-w-2xl w-full border border-white/10 max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                    <div>
                        <h2 className="text-xl font-semibold text-text-primary">Attendance Report</h2>
                        <p className="text-sm text-text-secondary mt-1">{meetingTitle}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-background-surface text-text-muted hover:text-text-primary transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
                            <p className="text-text-secondary">Loading attendance...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <XCircle className="w-12 h-12 text-status-error mx-auto mb-3" />
                            <p className="text-text-secondary">{error}</p>
                        </div>
                    ) : report ? (
                        <>
                            {/* Stats */}
                            <div className="grid grid-cols-4 gap-3 mb-6">
                                <div className="bg-background-surface rounded-xl p-3 text-center">
                                    <Users size={18} className="text-text-muted mx-auto mb-1" />
                                    <p className="text-lg font-bold text-text-primary">{report.totalStudents}</p>
                                    <p className="text-xs text-text-muted">Total</p>
                                </div>
                                <div className="bg-status-success/10 rounded-xl p-3 text-center">
                                    <CheckCircle size={18} className="text-status-success mx-auto mb-1" />
                                    <p className="text-lg font-bold text-status-success">{report.presentCount}</p>
                                    <p className="text-xs text-text-muted">Present</p>
                                </div>
                                <div className="bg-status-warning/10 rounded-xl p-3 text-center">
                                    <AlertCircle size={18} className="text-status-warning mx-auto mb-1" />
                                    <p className="text-lg font-bold text-status-warning">{report.lateCount}</p>
                                    <p className="text-xs text-text-muted">Late</p>
                                </div>
                                <div className="bg-status-error/10 rounded-xl p-3 text-center">
                                    <XCircle size={18} className="text-status-error mx-auto mb-1" />
                                    <p className="text-lg font-bold text-status-error">{report.absentCount}</p>
                                    <p className="text-xs text-text-muted">Absent</p>
                                </div>
                            </div>

                            {/* Student List */}
                            <div className="space-y-2">
                                {report.entries.length === 0 ? (
                                    <p className="text-text-muted text-center py-8">No students enrolled</p>
                                ) : (
                                    report.entries.map((entry) => {
                                        const status = statusConfig[entry.status];
                                        return (
                                            <div
                                                key={entry.studentId}
                                                className="flex items-center gap-4 p-3 bg-background-surface rounded-xl"
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-text-primary truncate">
                                                        {entry.studentName}
                                                    </p>
                                                    <div className="flex items-center gap-1 text-xs text-text-muted mt-0.5">
                                                        <Mail size={10} />
                                                        <span className="truncate">{entry.studentEmail}</span>
                                                    </div>
                                                </div>
                                                {entry.joinedAt && (
                                                    <div className="text-xs text-text-muted flex items-center gap-1">
                                                        <Clock size={10} />
                                                        {formatTime(entry.joinedAt)}
                                                    </div>
                                                )}
                                                <span
                                                    className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${status.className}`}
                                                >
                                                    {status.icon}
                                                    {status.label}
                                                </span>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </>
                    ) : null}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/5">
                    <button
                        onClick={onClose}
                        className="w-full bg-background-surface hover:bg-background-dark text-text-secondary font-medium py-3 rounded-xl transition-all"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
