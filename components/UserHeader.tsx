import React, { useState, useRef, useEffect } from 'react';
import {
    User,
    LogOut,
    Share2,
    MessageSquare,
    Calendar,
    HelpCircle,
    Bell,
    Plug,
    ChevronRight,
    ChevronDown,
    Users,
    Phone
} from 'lucide-react';
import { Tab, User as UserType } from '../types';

interface UserHeaderProps {
    user: UserType;
    organizationName: string;
    onLogout: () => void;
}

const UserHeader: React.FC<UserHeaderProps> = ({ user, organizationName, onLogout }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <div className="bg-white border-b border-slate-200 px-6 py-3 flex justify-end">
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 hover:bg-slate-50 rounded-lg p-1 transition-colors outline-none"
                >
                    <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-medium text-sm shadow-sm">
                        {getInitials(user.name)}
                    </div>
                    <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                        {/* Header */}
                        <div className="px-4 py-3 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-medium text-lg shadow-sm shrink-0">
                                {getInitials(user.name)}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-medium text-slate-900 truncate">{user.email}</p>
                            </div>
                        </div>

                        <div className="h-px bg-slate-100 my-1" />

                        {/* Section 1 */}
                        <div className="px-2">
                            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors text-left">
                                <User size={18} className="text-slate-500" />
                                My profile
                            </button>
                            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors text-left">
                                <Share2 size={18} className="text-slate-500" />
                                Workspace
                            </button>
                        </div>

                        <div className="h-px bg-slate-100 my-1" />

                        {/* Section 2 */}
                        <div className="px-2">
                            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors text-left">
                                <MessageSquare size={18} className="text-slate-500" />
                                Chat with us
                            </button>
                            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors text-left">
                                <Calendar size={18} className="text-slate-500" />
                                Schedule a call
                            </button>
                            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors text-left">
                                <HelpCircle size={18} className="text-slate-500" />
                                Help
                            </button>
                        </div>

                        <div className="h-px bg-slate-100 my-1" />

                        {/* Section 3 */}
                        <div className="px-2">
                            <button className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors text-left group">
                                <div className="flex items-center gap-3">
                                    <Bell size={18} className="text-slate-500" />
                                    Notification center
                                </div>
                                <ChevronRight size={16} className="text-slate-400 group-hover:text-slate-600" />
                            </button>
                            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors text-left">
                                <Plug size={18} className="text-slate-500" />
                                Integrations
                            </button>

                            <div className="h-px bg-slate-100 my-1" />

                            <button
                                onClick={onLogout}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-orange-600 hover:bg-orange-50 rounded-lg transition-colors text-left font-medium"
                            >
                                <LogOut size={18} />
                                Log Out
                            </button>
                        </div>
                    </div>
            )}
               </div>
        </div>
    );
};

export default UserHeader;
