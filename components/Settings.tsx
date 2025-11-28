import React, { useState } from 'react';
import { Settings as SettingsIcon, CreditCard, TrendingUp, Database, FileText, Zap, Calendar, DollarSign, User, Mail, Building, UserPlus, Trash2, Shield } from 'lucide-react';
import { CustomerProfile, SystemRole, User as UserType } from '../types';

interface SettingsProps {
    customerProfile: CustomerProfile;
    currentUser: UserType;
}

const Settings: React.FC<SettingsProps> = ({ customerProfile, currentUser }) => {
    const [activeTab, setActiveTab] = useState<'usage' | 'billing' | 'account' | 'users'>('usage');
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const isAdmin = currentUser.systemRole === SystemRole.ADMIN;

    // Calculate usage percentages
    const apiUsagePercent = (customerProfile.usage.apiCallsThisMonth / customerProfile.limits.maxApiCalls) * 100;
    const storagePercent = (customerProfile.usage.storageUsedMB / customerProfile.limits.maxStorageMB) * 100;
    const docsPercent = (customerProfile.usage.documentsGenerated / customerProfile.limits.maxDocuments) * 100;

    return (
        <div className="h-full flex flex-col">
            {/* ... */}
            <div className="flex-1 overflow-y-auto">
                {activeTab === 'usage' && (
                    <div className="space-y-6">
                        {/* ... */}
                        {/* Usage Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* API Calls */}
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-blue-50 rounded-lg">
                                        <Zap className="text-blue-600" size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium">API Calls</p>
                                        <p className="text-lg font-bold text-slate-800">
                                            {customerProfile.usage.apiCallsThisMonth.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                    <div
                                        className="bg-blue-600 h-full transition-all duration-500"
                                        style={{ width: `${Math.min(apiUsagePercent, 100)}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-slate-500 mt-2">
                                    {customerProfile.limits.maxApiCalls.toLocaleString()} limit
                                </p>
                            </div>

                            {/* Storage */}
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-purple-50 rounded-lg">
                                        <Database className="text-purple-600" size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium">Storage</p>
                                        <p className="text-lg font-bold text-slate-800">
                                            {customerProfile.usage.storageUsedMB} MB
                                        </p>
                                    </div>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                    <div
                                        className="bg-purple-600 h-full transition-all duration-500"
                                        style={{ width: `${Math.min(storagePercent, 100)}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-slate-500 mt-2">
                                    {customerProfile.limits.maxStorageMB} MB limit
                                </p>
                            </div>

                            {/* Documents */}
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-emerald-50 rounded-lg">
                                        <FileText className="text-emerald-600" size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium">Documents</p>
                                        <p className="text-lg font-bold text-slate-800">
                                            {customerProfile.usage.documentsGenerated}
                                        </p>
                                    </div>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                    <div
                                        className="bg-emerald-600 h-full transition-all duration-500"
                                        style={{ width: `${Math.min(docsPercent, 100)}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-slate-500 mt-2">
                                    {customerProfile.limits.maxDocuments} limit
                                </p>
                            </div>
                        </div>

                        {/* Usage Alerts */}
                        {(apiUsagePercent > 80 || storagePercent > 80 || docsPercent > 80) && (
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                                <h4 className="font-semibold text-amber-900 mb-2">⚠️ Usage Alert</h4>
                                <p className="text-sm text-amber-800">
                                    You're approaching your plan limits. Consider upgrading to avoid service interruption.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'billing' && (
                    <div className="space-y-6">
                        {/* Payment Method */}
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                <CreditCard size={18} />
                                Payment Method
                            </h3>
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded flex items-center justify-center text-white text-xs font-bold">
                                        VISA
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-800">•••• •••• •••• 4242</p>
                                        <p className="text-xs text-slate-500">Expires 12/2025</p>
                                    </div>
                                </div>
                                <button className="text-sm text-blue-600 hover:underline font-medium">
                                    Update
                                </button>
                            </div>
                        </div>

                        {/* Billing History */}
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                <Calendar size={18} />
                                Billing History
                            </h3>
                            <div className="space-y-3">
                                {[
                                    { date: 'Nov 1, 2025', amount: '$99.00', status: 'Paid', invoice: 'INV-2025-11' },
                                    { date: 'Oct 1, 2025', amount: '$99.00', status: 'Paid', invoice: 'INV-2025-10' },
                                    { date: 'Sep 1, 2025', amount: '$99.00', status: 'Paid', invoice: 'INV-2025-09' },
                                ].map((bill, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-slate-100 rounded">
                                                <DollarSign size={16} className="text-slate-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-800">{bill.amount}</p>
                                                <p className="text-xs text-slate-500">{bill.date}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                                {bill.status}
                                            </span>
                                            <button className="text-sm text-blue-600 hover:underline">
                                                Download
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Next Billing */}
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                            <h4 className="font-semibold text-blue-900 mb-1">Next Billing Date</h4>
                            <p className="text-sm text-blue-800">
                                Your next payment of <strong>$99.00</strong> will be charged on <strong>December 1, 2025</strong>
                            </p>
                        </div>
                    </div>
                )}

                {activeTab === 'account' && (
                    <div className="space-y-6">
                        {/* Account Information */}
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                <User size={18} />
                                Account Information
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <User size={16} className="text-slate-400" />
                                        <div>
                                            <p className="text-xs text-slate-500">Name</p>
                                            <p className="font-medium text-slate-800">{currentUser.name}</p>
                                        </div>
                                    </div>
                                    <button className="text-sm text-blue-600 hover:underline">Edit</button>
                                </div>
                                <div className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Mail size={16} className="text-slate-400" />
                                        <div>
                                            <p className="text-xs text-slate-500">Email</p>
                                            <p className="font-medium text-slate-800">{currentUser.email}</p>
                                        </div>
                                    </div>
                                    <button className="text-sm text-blue-600 hover:underline">Edit</button>
                                </div>
                                <div className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Building size={16} className="text-slate-400" />
                                        <div>
                                            <p className="text-xs text-slate-500">Company</p>
                                            <p className="font-medium text-slate-800">{customerProfile.companyName}</p>
                                        </div>
                                    </div>
                                    <button className="text-sm text-blue-600 hover:underline">Edit</button>
                                </div>
                            </div>
                        </div>

                        {/* Danger Zone */}
                        <div className="bg-white p-6 rounded-xl border border-red-200 shadow-sm">
                            <h3 className="font-semibold text-red-800 mb-4">Danger Zone</h3>
                            <div className="space-y-3">
                                <button className="w-full text-left p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                                    <p className="font-medium text-slate-800">Cancel Subscription</p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Your subscription will remain active until the end of the billing period
                                    </p>
                                </button>
                                <button className="w-full text-left p-3 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                                    <p className="font-medium text-red-800">Delete Account</p>
                                    <p className="text-xs text-red-600 mt-1">
                                        Permanently delete your account and all associated data
                                    </p>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'users' && isAdmin && (
                    <div className="space-y-6">
                        {/* Add User Button */}
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-800">Organization Users</h3>
                                <p className="text-sm text-slate-500">Manage users and their access levels</p>
                            </div>
                            <button
                                onClick={() => setShowAddUserModal(true)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center gap-2"
                            >
                                <UserPlus size={16} />
                                Add User
                            </button>
                        </div>

                        {/* Users List */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Last Login</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {customerProfile.users.map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-xs font-bold">
                                                        {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-slate-800">{user.name}</div>
                                                        <div className="text-xs text-slate-500">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    {user.systemRole === SystemRole.ADMIN && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                                                            <Shield size={12} />
                                                            Admin
                                                        </span>
                                                    )}
                                                    <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                                        {user.role}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${user.status === 'Active' ? 'bg-green-100 text-green-700' :
                                                    user.status === 'Invited' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {user.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                {user.id !== currentUser.id && (
                                                    <button className="text-red-600 hover:text-red-800 flex items-center gap-1 ml-auto">
                                                        <Trash2 size={14} />
                                                        Remove
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* User Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white p-4 rounded-xl border border-slate-200">
                                <div className="text-2xl font-bold text-slate-800">{customerProfile.users.length}</div>
                                <div className="text-sm text-slate-500">Total Users</div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-slate-200">
                                <div className="text-2xl font-bold text-green-600">
                                    {customerProfile.users.filter(u => u.status === 'Active').length}
                                </div>
                                <div className="text-sm text-slate-500">Active Users</div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-slate-200">
                                <div className="text-2xl font-bold text-purple-600">
                                    {customerProfile.users.filter(u => u.systemRole === SystemRole.ADMIN).length}
                                </div>
                                <div className="text-sm text-slate-500">Administrators</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Settings;
