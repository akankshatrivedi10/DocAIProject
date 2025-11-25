
import React from 'react';
import { CustomerProfile, User } from '../types';
import {
    Building2,
    User as UserIcon,
    Mail,
    Shield,
    CheckCircle,
    ShieldAlert
} from 'lucide-react';

interface CustomerProfileProps {
    profile: CustomerProfile;
    currentUser: User;
}

const CustomerProfilePage: React.FC<CustomerProfileProps> = ({ profile, currentUser }) => {
    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-10">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">My Profile</h2>
                    <p className="text-slate-500 text-sm">Manage your personal information and account settings.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {/* Personal Information */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-6 flex items-center gap-2">
                        <UserIcon size={14} /> Personal Information
                    </h3>

                    <div className="flex items-start gap-6">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                            {currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>

                        <div className="flex-1 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs text-slate-400 block mb-1">Full Name</label>
                                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                                        <span className="font-medium text-slate-800">{currentUser.name}</span>
                                        <button className="text-xs text-blue-600 hover:underline">Edit</button>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400 block mb-1">Email Address</label>
                                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                                        <div className="flex items-center gap-2">
                                            <Mail size={14} className="text-slate-400" />
                                            <span className="font-medium text-slate-800">{currentUser.email}</span>
                                        </div>
                                        <button className="text-xs text-blue-600 hover:underline">Edit</button>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-slate-400 block mb-1">Role & Permissions</label>
                                <div className="flex gap-2">
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
                                        <Shield size={14} />
                                        <span className="text-sm font-medium">{currentUser.role}</span>
                                    </div>
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg border border-purple-100">
                                        <Shield size={14} />
                                        <span className="text-sm font-medium">System: {currentUser.systemRole}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Organization Details */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Building2 size={14} /> Organization
                    </h3>
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="w-12 h-12 bg-white rounded-lg border border-slate-200 flex items-center justify-center text-xl font-bold text-slate-700">
                            {profile.companyName.substring(0, 1)}
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800">{profile.companyName}</h4>
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <span>{profile.domain}</span>
                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                <span className="flex items-center gap-1 text-emerald-600 font-medium">
                                    <CheckCircle size={12} /> Verified
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-center pt-8 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                    <ShieldAlert size={14} />
                    <span>Secure 256-bit SSL Encrypted Connection. All data is processed in AWS us-east-1.</span>
                </div>
            </div>
        </div>
    );
};

export default CustomerProfilePage;
