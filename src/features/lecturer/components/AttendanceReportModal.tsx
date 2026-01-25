import { useState, useEffect } from 'react';
import { X, Loader2, CheckCircle, XCircle, AlertCircle, Users, Clock, Mail, Download } from 'lucide-react';
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
        className: 'text-green-700 bg-green-100',
    },
    ABSENT: {
        label: 'Absent',
        icon: <XCircle size={14} />,
        className: 'text-red-700 bg-red-100',
    },
    PARTIALLY_PRESENT: {
        label: 'Partial',
        icon: <AlertCircle size={14} />,
        className: 'text-yellow-700 bg-yellow-100',
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

const generateCSV = (report: AttendanceReport): string => {
    const headers = ['Student Name', 'Email', 'Status', 'Joined At', 'Left At'];
    const rows = (report.entries || []).map((entry) => [
        entry.studentName,
        entry.studentEmail,
        entry.status,
        entry.joinedAt ? new Date(entry.joinedAt).toLocaleString() : '-',
        entry.leftAt ? new Date(entry.leftAt).toLocaleString() : '-',
    ]);

    const csvContent = [
        [`Meeting: ${report.meetingTitle}`],
        [`Total Students: ${report.totalStudents}`],
        [`Present: ${report.presentCount}`, `Partial: ${report.partialCount}`, `Absent: ${report.absentCount}`],
        [],
        headers,
        ...rows,
    ]
        .map((row) => row.map((cell) => `"${cell}"`).join(','))
        .join('\n');

    return csvContent;
};

const downloadCSV = (report: AttendanceReport): void => {
    const csvContent = generateCSV(report);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const fileName = `Attendance_${report.meetingTitle}_${new Date().toISOString().split('T')[0]}.csv`;

    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Report downloaded successfully');
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
            <div className="bg-white rounded-2xl max-w-2xl w-full border border-gray-200 max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-xl font-semibold text-black">Attendance Report</h2>
                        <p className="text-sm text-gray-600 mt-1">{meetingTitle}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-black transition-all"
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
                            <XCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
                            <p className="text-gray-600">{error}</p>
                        </div>
                    ) : report ? (
                        <>
                            {/* Stats */}
                            <div className="grid grid-cols-4 gap-3 mb-6">
                                <div className="bg-gray-100 rounded-xl p-3 text-center">
                                    <Users size={18} className="text-gray-400 mx-auto mb-1" />
                                    <p className="text-lg font-bold text-black">{report.totalStudents || 0}</p>
                                    <p className="text-xs text-gray-500">Total</p>
                                </div>
                                <div className="bg-green-100 rounded-xl p-3 text-center">
                                    <CheckCircle size={18} className="text-green-600 mx-auto mb-1" />
                                    <p className="text-lg font-bold text-green-600">{report.presentCount || 0}</p>
                                    <p className="text-xs text-gray-500">Present</p>
                                </div>
                                <div className="bg-yellow-100 rounded-xl p-3 text-center">
                                    <AlertCircle size={18} className="text-yellow-600 mx-auto mb-1" />
                                    <p className="text-lg font-bold text-yellow-600">{report.partialCount || 0}</p>
                                    <p className="text-xs text-gray-500">Late</p>
                                </div>
                                <div className="bg-red-100 rounded-xl p-3 text-center">
                                    <XCircle size={18} className="text-red-600 mx-auto mb-1" />
                                    <p className="text-lg font-bold text-red-600">{report.absentCount || 0}</p>
                                    <p className="text-xs text-gray-500">Absent</p>
                                </div>
                            </div>

                            {/* Student List */}
                            <div className="space-y-2">
                                {!report.entries || report.entries.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">No students enrolled</p>
                                ) : (
                                    report.entries.map((entry) => {
                                        const status = statusConfig[entry.status] || {
                                            label: 'Unknown',
                                            icon: <AlertCircle size={14} />,
                                            className: 'text-gray-700 bg-gray-100',
                                        };
                                        return (
                                            <div
                                                key={entry.studentId}
                                                className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl"
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-black truncate">
                                                        {entry.studentName}
                                                    </p>
                                                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                                                        <Mail size={10} />
                                                        <span className="truncate">{entry.studentEmail}</span>
                                                    </div>
                                                </div>
                                                {entry.joinedAt && (
                                                    <div className="text-xs text-gray-500 flex items-center gap-1">
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
                <div className="p-4 border-t border-gray-200 flex gap-3">
                    {report && (
                        <button
                            onClick={() => downloadCSV(report)}
                            className="flex-1 bg-primary hover:bg-primary-hover text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                            <Download size={18} />
                            Download CSV
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-xl transition-all"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
