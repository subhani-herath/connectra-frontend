import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation } from 'react-router-dom';
import {
    Plus,
    Trash2,
    Search,
    User,
    Mail,
    Lock,
    Loader2,
    X,
    AlertTriangle,
    Edit2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../stores/authStore';
import { adminService, type Lecturer, type CreateLecturerRequest } from '../../services/adminService';
import { Input } from '../../components/ui/Input';
import { TopHeader } from '../../components/layout';
import { EditLecturerModal } from './components/EditLecturerModal';

export const AdminDashboard: React.FC = () => {
    const { user } = useAuthStore();
    const location = useLocation();
    const isLecturerTab = location.pathname === '/admin/lecturers';
    const [lecturers, setLecturers] = useState<Lecturer[]>([]);
    const [filteredLecturers, setFilteredLecturers] = useState<Lecturer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<Lecturer | null>(null);
    const [editingLecturer, setEditingLecturer] = useState<Lecturer | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CreateLecturerRequest>();

    const fetchLecturers = async (showRefreshToast = false) => {
        try {
            if (showRefreshToast) setIsRefreshing(true);
            const data = await adminService.getLecturers();
            setLecturers(data);
            setFilteredLecturers(data);
            if (showRefreshToast) toast.success('Lecturers refreshed');
        } catch (error) {
            console.error('Failed to fetch lecturers:', error);
            toast.error('Failed to load lecturers');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchLecturers();
    }, []);

    // Filter lecturers based on search
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredLecturers(lecturers);
        } else {
            const query = searchQuery.toLowerCase();
            setFilteredLecturers(
                lecturers.filter(
                    (l) =>
                        l.firstName.toLowerCase().includes(query) ||
                        l.lastName.toLowerCase().includes(query) ||
                        l.email.toLowerCase().includes(query)
                )
            );
        }
    }, [searchQuery, lecturers]);

    const handleCreate = async (data: CreateLecturerRequest) => {
        setIsCreating(true);
        try {
            await adminService.createLecturer(data);
            toast.success('Lecturer account created!');
            reset();
            setShowCreateModal(false);
            fetchLecturers();
        } catch (error: unknown) {
            const axiosError = error as { response?: { data?: { message?: string } } };
            toast.error(axiosError.response?.data?.message || 'Failed to create lecturer');
        } finally {
            setIsCreating(false);
        }
    };

    const handleDelete = async (lecturer: Lecturer) => {
        try {
            await adminService.deleteLecturer(lecturer.id);
            toast.success(`${lecturer.firstName} ${lecturer.lastName} removed`);
            setDeleteConfirm(null);
            fetchLecturers();
        } catch (error) {
            toast.error('Failed to delete lecturer');
        }
    };

    return (
        <div className="min-h-screen">
            <TopHeader
                title={"Hi, " + user?.firstName}
                onRefresh={() => fetchLecturers(true)}
                isRefreshing={isRefreshing}
                actions={
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white font-medium transition-all"
                    >
                        <Plus size={18} />
                        Add Lecturer
                    </button>
                }
            />

            <main className="p-6">
                {/* Search */}
                <div className="mb-6">
                    <div className="relative max-w-md">
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                            size={18}
                        />
                        <input
                            type="text"
                            placeholder="Search lecturers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-background-card text-text-primary rounded-lg border border-white/5 pl-10 pr-4 py-2.5 outline-none focus:border-primary transition-all placeholder:text-text-muted"
                        />
                    </div>
                </div>

                {/* Stats - Only show on Dashboard tab */}
                {!isLecturerTab && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-background-card rounded-xl border border-white/5 p-5">
                            <p className="text-sm text-text-secondary mb-1">Total Lecturers</p>
                            <p className="text-3xl font-bold text-text-primary">{lecturers.length}</p>
                        </div>
                        <div className="bg-background-card rounded-xl border border-white/5 p-5">
                            <p className="text-sm text-text-secondary mb-1">Search Results</p>
                            <p className="text-3xl font-bold text-primary">{filteredLecturers.length}</p>
                        </div>
                        <div className="bg-background-card rounded-xl border border-white/5 p-5">
                            <p className="text-sm text-text-secondary mb-1">Role</p>
                            <p className="text-3xl font-bold text-status-success">ADMIN</p>
                        </div>
                    </div>
                )}

                {/* Lecturer List */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                        <p className="text-text-secondary">Loading lecturers...</p>
                    </div>
                ) : filteredLecturers.length === 0 ? (
                    <div className="bg-background-card rounded-xl border border-white/5 p-8 text-center">
                        <User className="w-12 h-12 text-text-muted mx-auto mb-3" />
                        <h3 className="text-text-primary font-medium mb-1">
                            {searchQuery ? 'No Matching Lecturers' : 'No Lecturers Yet'}
                        </h3>
                        <p className="text-text-secondary text-sm mb-4">
                            {searchQuery
                                ? 'Try a different search term'
                                : 'Add your first lecturer to get started.'}
                        </p>
                        {!searchQuery && (
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white font-medium transition-all"
                            >
                                <Plus size={18} />
                                Add Lecturer
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="bg-background-card rounded-xl border border-white/5 overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/5">
                                    <th className="text-left text-sm font-medium text-text-secondary px-6 py-4">
                                        Name
                                    </th>
                                    <th className="text-left text-sm font-medium text-text-secondary px-6 py-4">
                                        Email
                                    </th>
                                    <th className="text-right text-sm font-medium text-text-secondary px-6 py-4">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLecturers.map((lecturer) => (
                                    <tr
                                        key={lecturer.id}
                                        className="border-b border-white/5 last:border-0 hover:bg-background-surface/50 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                                    <User size={18} className="text-primary" />
                                                </div>
                                                <span className="text-text-primary font-medium">
                                                    {lecturer.firstName} {lecturer.lastName}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-text-secondary">{lecturer.email}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => setEditingLecturer(lecturer)}
                                                    className="p-2 rounded-lg hover:bg-primary/20 text-text-muted hover:text-primary transition-all"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirm(lecturer)}
                                                    className="p-2 rounded-lg hover:bg-status-error/20 text-text-muted hover:text-status-error transition-all"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-background-card rounded-2xl p-6 max-w-md w-full border border-white/10">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-semibold text-text-primary">Add New Lecturer</h3>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="p-1 rounded hover:bg-background-surface text-text-muted"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit(handleCreate)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="First Name"
                                    placeholder="John"
                                    icon={<User size={18} />}
                                    error={errors.firstName?.message}
                                    {...register('firstName', { required: 'Required' })}
                                />
                                <Input
                                    label="Last Name"
                                    placeholder="Doe"
                                    error={errors.lastName?.message}
                                    {...register('lastName', { required: 'Required' })}
                                />
                            </div>

                            <Input
                                label="Email"
                                type="email"
                                placeholder="lecturer@uwu.ac.lk"
                                icon={<Mail size={18} />}
                                error={errors.email?.message}
                                {...register('email', {
                                    required: 'Email is required',
                                    pattern: {
                                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                        message: 'Invalid email address',
                                    },
                                })}
                            />

                            <Input
                                label="Password"
                                type="password"
                                placeholder="••••••••"
                                icon={<Lock size={18} />}
                                error={errors.password?.message}
                                {...register('password', {
                                    required: 'Password is required',
                                    minLength: { value: 6, message: 'Min 6 characters' },
                                })}
                            />

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 bg-background-surface hover:bg-background-surface/80 text-text-secondary font-medium py-2.5 rounded-lg transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreating}
                                    className="flex-1 bg-primary hover:bg-primary-hover text-white font-medium py-2.5 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isCreating ? (
                                        <Loader2 className="animate-spin" size={18} />
                                    ) : (
                                        'Create Account'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-background-card rounded-2xl p-6 max-w-sm w-full border border-white/10 text-center">
                        <div className="w-16 h-16 rounded-full bg-status-error/20 flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-8 h-8 text-status-error" />
                        </div>
                        <h3 className="text-xl font-semibold text-text-primary mb-2">Delete Lecturer?</h3>
                        <p className="text-text-secondary mb-6">
                            Are you sure you want to remove{' '}
                            <span className="text-text-primary font-medium">
                                {deleteConfirm.firstName} {deleteConfirm.lastName}
                            </span>
                            ? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="flex-1 bg-background-surface hover:bg-background-surface/80 text-text-secondary font-medium py-2.5 rounded-lg transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(deleteConfirm)}
                                className="flex-1 bg-status-error hover:bg-status-error/80 text-white font-medium py-2.5 rounded-lg transition-all"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Lecturer Modal */}
            {editingLecturer && (
                <EditLecturerModal
                    lecturer={editingLecturer}
                    isOpen={!!editingLecturer}
                    onClose={() => setEditingLecturer(null)}
                    onUpdated={() => fetchLecturers()}
                />
            )}
        </div>
    );
};
