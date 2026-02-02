import { useState, useEffect } from 'react';
import { Calendar, Clock, User, CheckCircle, XCircle, AlertCircle, Loader2, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { studentService, type AttendanceRecord, type AttendanceStatus } from '../../services/studentService';
import { TopHeader } from '../../components/layout';
import { useAuthStore } from '../../stores/authStore';

const statusConfig: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
    PRESENT: {
        label: 'Present',
        icon: <CheckCircle size={16} />,
        className: 'bg-green-100 text-green-700 border-green-300',
    },
    ABSENT: {
        label: 'Absent',
        icon: <XCircle size={16} />,
        className: 'bg-red-100 text-red-700 border-red-300',
    },
    PARTIALLY_PRESENT: {
        label: 'Partial',
        icon: <AlertCircle size={16} />,
        className: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    },
};

const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
    });
};

export const AttendanceHistoryPage: React.FC = () => {
    const { user: _user } = useAuthStore();
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [filterStatus, setFilterStatus] = useState<AttendanceStatus | ''>('');

    const fetchAttendance = async (showRefreshToast = false) => {
        try {
            if (showRefreshToast) setIsRefreshing(true);
            const status = filterStatus || undefined;
            const data = await studentService.getAttendanceHistory(status);
            setRecords(data || []);
            if (showRefreshToast) toast.success('Attendance refreshed');
        } catch (error) {
            console.error('Failed to fetch attendance:', error);
            toast.error('Failed to load attendance history');
            setRecords([]);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchAttendance();
    }, [filterStatus]);

    const presentCount = records.filter((r) => r.attendanceStatus === 'PRESENT').length;
    const absentCount = records.filter((r) => r.attendanceStatus === 'ABSENT').length;
    const partialCount = records.filter((r) => r.attendanceStatus === 'PARTIALLY_PRESENT').length;
    const attendanceRate = records.length > 0
        ? Math.round(((presentCount + partialCount) / records.length) * 100)
        : 0;

    return (
        <div className="min-h-screen">
            <TopHeader
                title="Attendance History"
                onRefresh={() => fetchAttendance(true)}
                isRefreshing={isRefreshing}
            />

            <main className="p-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <p className="text-gray-600 text-sm mb-1">Attendance Rate</p>
                        <p className="text-2xl font-bold text-primary">{attendanceRate}%</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <p className="text-gray-600 text-sm mb-1">Present</p>
                        <p className="text-2xl font-bold text-green-600">{presentCount}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <p className="text-gray-600 text-sm mb-1">Late</p>
                        <p className="text-2xl font-bold text-yellow-600">{partialCount}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <p className="text-gray-600 text-sm mb-1">Absent</p>
                        <p className="text-2xl font-bold text-red-600">{absentCount}</p>
                    </div>
                </div>

                {/* Filter */}
                <div className="flex items-center gap-3 mb-6">
                    <Filter size={18} className="text-gray-500" />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as AttendanceStatus | '')}
                        className="bg-white text-black rounded-lg px-4 py-2 text-sm border border-gray-300 focus:border-primary outline-none"
                    >
                        <option value="">All Records</option>
                        <option value="PRESENT">Present Only</option>
                        <option value="PARTIALLY_PRESENT">Partial Only</option>
                        <option value="ABSENT">Absent Only</option>
                    </select>
                </div>

                {/* Records List */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                        <p className="text-text-secondary">Loading attendance history...</p>
                    </div>
                ) : records.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <h3 className="text-black font-medium mb-1">No Attendance Records</h3>
                        <p className="text-gray-600 text-sm">
                            Your attendance history will appear here after you attend meetings.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {records.map((record) => {
                            const status = statusConfig[record.attendanceStatus] || {
                                label: 'Unknown',
                                icon: <AlertCircle size={16} />,
                                className: 'bg-gray-100 text-gray-700 border-gray-300',
                            };
                            return (
                                <div
                                    key={record.meetingId}
                                    className="bg-white rounded-xl border border-gray-200 p-4 hover:border-primary/30 transition-all"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-semibold text-black truncate">
                                                {record.meetingTitle}
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-gray-600">
                                                <div className="flex items-center gap-1.5">
                                                    <User size={14} className="text-gray-400" />
                                                    <span>{record.lecturerName}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar size={14} className="text-gray-400" />
                                                    <span>{formatDate(record.meetingDate)}</span>
                                                </div>
                                                {record.joinedAt && (
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock size={14} className="text-gray-400" />
                                                        <span>{formatTime(record.joinedAt)}</span>
                                                    </div>
                                                )}
                                                {record.totalTimeInMinutes !== undefined && (
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock size={14} className="text-gray-400" />
                                                        <span>{record.totalTimeInMinutes} mins</span>
                                                    </div>
                                                )}
                                            </div>
                                            {record.attendancePercentage !== undefined && (
                                                <div className="mt-3 flex items-center gap-2">
                                                    <div className="text-xs font-medium text-gray-600">
                                                        Attendance: {record.attendancePercentage.toFixed(1)}%
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <span
                                            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border ${status.className}`}
                                        >
                                            {status.icon}
                                            {status.label}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
};
