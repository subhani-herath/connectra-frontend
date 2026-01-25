import { NavLink, useNavigate } from 'react-router-dom';
import {
    GraduationCap,
    BookOpen,
    Settings,
    LogOut,
    LayoutDashboard,
    Calendar,
    Users,
    ChevronLeft,
    ChevronRight,
    Plus,
    ClipboardList,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../stores/authStore';
import { clsx } from 'clsx';

interface SidebarProps {
    isCollapsed: boolean;
    onToggle: () => void;
}

interface NavItem {
    to: string;
    icon: React.ReactNode;
    label: string;
}

const roleConfig: Record<string, { icon: React.ReactNode; label: string; items: NavItem[] }> = {
    STUDENT: {
        icon: <GraduationCap className="w-5 h-5" />,
        label: 'Student',
        items: [
            { to: '/student/meetings', icon: <Calendar size={20} />, label: 'My Meetings' },
            { to: '/student/attendance', icon: <ClipboardList size={20} />, label: 'Attendance' },
        ],
    },
    LECTURER: {
        icon: <BookOpen className="w-5 h-5" />,
        label: 'Lecturer',
        items: [
            { to: '/lecturer/dashboard', icon: <LayoutDashboard size={20} />, label: 'My Meetings' },
            { to: '/lecturer/create-meeting', icon: <Plus size={20} />, label: 'New Meeting' },
        ],
    },
    ADMIN: {
        icon: <Settings className="w-5 h-5" />,
        label: 'Admin',
        items: [
            { to: '/admin/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
            { to: '/admin/lecturers', icon: <Users size={20} />, label: 'Lecturers' },
        ],
    },
};

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const role = user?.role || 'STUDENT';
    const config = roleConfig[role] || roleConfig.STUDENT;

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully');
        navigate('/login');
    };

    return (
        <aside
            className={clsx(
                'fixed left-0 top-0 h-screen bg-white border-r border-gray-200 flex flex-col z-40 transition-all duration-300 ease-in-out',
                isCollapsed ? 'w-16' : 'w-60'
            )}
        >
            {/* Logo */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-lg">C</span>
                    </div>
                    {!isCollapsed && (
                        <span className="text-xl font-bold text-black whitespace-nowrap">
                            Connectra
                        </span>
                    )}
                </div>
            </div>

            {/* User Info */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/40 flex items-center justify-center flex-shrink-0 text-primary">
                        {config.icon}
                    </div>
                    {!isCollapsed && (
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-black truncate">
                                {user?.firstName} {user?.lastName}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {config.items.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            clsx(
                                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative',
                                isActive
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-black'
                            )
                        }
                    >
                        {({ isActive }) => (
                            <>
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-primary to-primary-light rounded-r-full" />
                                )}
                                <span className="flex-shrink-0">{item.icon}</span>
                                {!isCollapsed && (
                                    <span className="font-medium whitespace-nowrap">{item.label}</span>
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Bottom Actions */}
            <div className="p-3 border-t border-gray-200 space-y-1">
                {/* Toggle Button */}
                <button
                    onClick={onToggle}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-black transition-all"
                >
                    {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                    {!isCollapsed && <span className="font-medium">Collapse</span>}
                </button>

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-red-100 hover:text-red-600 transition-all"
                >
                    <LogOut size={20} />
                    {!isCollapsed && <span className="font-medium">Logout</span>}
                </button>
            </div>
        </aside>
    );
};
