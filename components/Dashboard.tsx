import React from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertCircle, RefreshCw, Database, Code2, Zap, TrendingUp } from 'lucide-react';
import { Org, ConnectionStatus } from '../types';
import { Card } from './ui';

interface DashboardProps {
    orgs: Org[];
}

const Dashboard: React.FC<DashboardProps> = ({ orgs }) => {
    const connectedOrgs = orgs.filter(o => o.status === ConnectionStatus.CONNECTED).length;
    const totalMetadata = orgs.reduce((acc, org) => acc + (org.metadataSummary ? (org.metadataSummary.objects.length + org.metadataSummary.apexClasses.length + org.metadataSummary.flows.length) : 0), 0);

    return (
        <div className="space-y-8">
            {/* Hero Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    icon={<Database size={32} />}
                    title="Connected Orgs"
                    value={connectedOrgs}
                    subtitle={`${orgs.length} total configured`}
                    gradient="from-blue-500 to-indigo-600"
                    delay={0}
                />
                <StatCard
                    icon={<Code2 size={32} />}
                    title="Total Metadata Items"
                    value={totalMetadata.toLocaleString()}
                    subtitle="Across all orgs"
                    gradient="from-purple-500 to-pink-600"
                    delay={0.1}
                />
                <StatCard
                    icon={<Shield size={32} />}
                    title="System Status"
                    value="Operational"
                    subtitle="AWS Backend Ready"
                    gradient="from-emerald-500 to-teal-600"
                    delay={0.2}
                    pulsing
                />
            </div>

            {/* Recent Sync Jobs */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <Card className="overflow-hidden">
                    <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                                <TrendingUp size={20} className="text-blue-600" />
                                Recent Sync Jobs
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">Real-time metadata synchronization status</p>
                        </div>
                        <motion.div
                            className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-slate-200 shadow-sm"
                            whileHover={{ scale: 1.05 }}
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-xs font-semibold text-slate-700">Live</span>
                        </motion.div>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {orgs.length === 0 && (
                            <motion.div
                                className="p-12 text-center"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <Database size={48} className="mx-auto mb-4 text-slate-300" />
                                <p className="text-slate-500 font-medium">No sync jobs found</p>
                                <p className="text-xs text-slate-400 mt-1">Connect an org from the Integrations tab to start syncing metadata</p>
                            </motion.div>
                        )}
                        {orgs.map((org, index) => (
                            <SyncJobRow key={org.id} org={org} index={index} />
                        ))}
                    </div>
                </Card>
            </motion.div>
        </div>
    );
};

// Stat Card Component
const StatCard = ({ icon, title, value, subtitle, gradient, delay, pulsing }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, type: "spring", stiffness: 300, damping: 25 }}
    >
        <Card hoverEffect className="relative overflow-hidden p-6">
            {/* Gradient Background */}
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} rounded-full blur-3xl opacity-20 -mr-8 -mt-8`} />

            {/* Icon */}
            <motion.div
                className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg mb-4 relative z-10`}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
                {icon}
            </motion.div>

            {/* Content */}
            <div className="relative z-10">
                <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wide mb-1">{title}</h3>
                <div className="flex items-baseline gap-2">
                    <div className="text-4xl font-black text-slate-900">{value}</div>
                    {pulsing && (
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                    )}
                </div>
                <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
            </div>
        </Card>
    </motion.div>
);

// Sync Job Row Component
const SyncJobRow = ({ org, index }: { org: Org; index: number }) => (
    <motion.div
        className="p-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors group"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 + index * 0.05 }}
    >
        <div className="flex items-center gap-4 flex-1">
            {/* Status Icon */}
            <motion.div
                className={`p-3 rounded-xl ${org.syncState.isSyncing
                        ? 'bg-blue-100 text-blue-600'
                        : org.status === ConnectionStatus.ERROR
                            ? 'bg-red-100 text-red-600'
                            : 'bg-emerald-100 text-emerald-600'
                    }`}
                whileHover={{ scale: 1.1, rotate: org.syncState.isSyncing ? 360 : 0 }}
                transition={{ duration: 0.6 }}
            >
                {org.status === ConnectionStatus.ERROR ? (
                    <AlertCircle size={20} />
                ) : (
                    <RefreshCw size={20} className={org.syncState.isSyncing ? 'animate-spin' : ''} />
                )}
            </motion.div>

            {/* Org Info */}
            <div className="flex-1">
                <div className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                    {org.name} <span className="text-slate-400">({org.alias})</span>
                </div>
                <div className="text-sm text-slate-500 mt-0.5">{org.syncState.stage}</div>
            </div>
        </div>

        {/* Progress */}
        <div className="flex flex-col items-end min-w-[140px]">
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                <motion.div
                    className={`h-full transition-all duration-500 ${org.status === ConnectionStatus.ERROR
                            ? 'bg-gradient-to-r from-red-500 to-red-600'
                            : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                        }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${org.syncState.progress}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                />
            </div>
            <span className="text-xs text-slate-500 mt-1.5 font-medium">{org.syncState.progress}% complete</span>
        </div>
    </motion.div>
);

export default Dashboard;
