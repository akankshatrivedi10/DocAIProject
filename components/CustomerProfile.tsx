
import React from 'react';
import { CustomerProfile, UserRole } from '../types';
import { 
  Building2, 
  CreditCard, 
  Users, 
  Activity, 
  CheckCircle, 
  Download, 
  ShieldAlert, 
  Crown 
} from 'lucide-react';

interface CustomerProfileProps {
  profile: CustomerProfile;
}

const CustomerProfilePage: React.FC<CustomerProfileProps> = ({ profile }) => {
  const daysRemaining = profile.subscription.trialEndDate 
    ? Math.ceil((new Date(profile.subscription.trialEndDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) 
    : 0;

  const trialProgress = 100 - ((daysRemaining / 30) * 100);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Organization Settings</h2>
          <p className="text-slate-500 text-sm">Manage your team, subscription, and billing details.</p>
        </div>
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border shadow-sm">
            <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-lg flex items-center justify-center font-bold text-lg">
                {profile.companyName.substring(0, 1)}
            </div>
            <div>
                <div className="font-semibold text-slate-800">{profile.companyName}</div>
                <div className="text-xs text-slate-500">{profile.domain}</div>
            </div>
        </div>
      </div>

      {/* Trial / Subscription Banner */}
      {profile.subscription.status === 'Trialing' && (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10"><Crown size={120} /></div>
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Crown size={24} className="text-yellow-300" />
                        {profile.subscription.plan} Plan Trial
                    </h3>
                    <p className="text-indigo-100 mt-1 max-w-xl">
                        You have full access to all features including Apex analysis, Workflow visualization, and unlimited metadata sync.
                    </p>
                    <div className="mt-4 flex items-center gap-3">
                         <div className="w-full md:w-64 bg-indigo-900/50 rounded-full h-2">
                             <div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${trialProgress}%` }}></div>
                         </div>
                         <span className="font-mono text-sm font-medium">{daysRemaining} days left</span>
                    </div>
                </div>
                <button className="px-6 py-3 bg-white text-indigo-700 font-bold rounded-lg shadow-sm hover:bg-indigo-50 transition-colors whitespace-nowrap">
                    Upgrade Now & Save 20%
                </button>
            </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Subscription Card */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
              <h3 className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-4 flex items-center gap-2">
                  <CreditCard size={14} /> Subscription
              </h3>
              <div className="flex-1 space-y-4">
                  <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Current Plan</span>
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded uppercase">{profile.subscription.plan}</span>
                  </div>
                  <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Status</span>
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded uppercase">{profile.subscription.status}</span>
                  </div>
                  <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Seats Used</span>
                      <span className="text-sm font-medium text-slate-800">{profile.subscription.seatsUsed} / {profile.subscription.seatsTotal}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${(profile.subscription.seatsUsed / profile.subscription.seatsTotal) * 100}%` }}></div>
                  </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-500">Next billing date: {new Date(profile.subscription.endDate).toLocaleDateString()}</p>
                  <button className="text-indigo-600 text-sm font-medium mt-2 hover:underline">Manage Subscription</button>
              </div>
          </div>

          {/* Usage Metrics */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
              <h3 className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Activity size={14} /> Monthly Usage
              </h3>
              <div className="flex-1 space-y-4">
                 <div className="flex items-center justify-between">
                     <span className="text-sm text-slate-600">Connected Orgs</span>
                     <span className="font-mono text-slate-800">{profile.usage.connectedOrgs}</span>
                 </div>
                 <div className="flex items-center justify-between">
                     <span className="text-sm text-slate-600">Metadata Items</span>
                     <span className="font-mono text-slate-800">{profile.usage.metadataItemsAnalyzed}</span>
                 </div>
                 <div className="flex items-center justify-between">
                     <span className="text-sm text-slate-600">Docs Generated</span>
                     <span className="font-mono text-slate-800">{profile.usage.documentsGenerated}</span>
                 </div>
                 <div className="flex items-center justify-between">
                     <span className="text-sm text-slate-600">Storage Used</span>
                     <span className="font-mono text-slate-800">{profile.usage.storageUsedMB} MB</span>
                 </div>
                 <div className="flex items-center justify-between border-t border-slate-100 pt-2">
                     <span className="text-sm text-slate-600">API Calls</span>
                     <span className="font-mono text-slate-800">{profile.usage.apiCallsThisMonth}</span>
                 </div>
              </div>
          </div>

          {/* Company Details */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
              <h3 className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Building2 size={14} /> Company Profile
              </h3>
              <div className="flex-1 space-y-4">
                  <div>
                      <label className="text-xs text-slate-400 block mb-1">Company Name</label>
                      <div className="text-sm font-medium text-slate-800">{profile.companyName}</div>
                  </div>
                  <div>
                      <label className="text-xs text-slate-400 block mb-1">Industry</label>
                      <div className="text-sm font-medium text-slate-800">{profile.industry}</div>
                  </div>
                  <div>
                      <label className="text-xs text-slate-400 block mb-1">Domain Verification</label>
                      <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
                          <CheckCircle size={14} /> Verified ({profile.domain})
                      </div>
                  </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100">
                  <button className="text-slate-500 text-sm hover:text-slate-800">Edit Company Info</button>
              </div>
          </div>
      </div>

      {/* Team Members */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                  <Users size={18} /> Team Members
              </h3>
              <button className="px-3 py-1.5 bg-blue-50 text-blue-600 text-sm font-medium rounded hover:bg-blue-100 transition-colors">
                  Invite User
              </button>
          </div>
          <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                  <tr>
                      <th className="px-6 py-3">User</th>
                      <th className="px-6 py-3">Role</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Last Login</th>
                      <th className="px-6 py-3 text-right">Action</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                  {profile.users.map(user => (
                      <tr key={user.id} className="hover:bg-slate-50/50">
                          <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs">
                                      {user.name.split(' ').map(n => n[0]).join('')}
                                  </div>
                                  <div>
                                      <div className="font-medium text-slate-800">{user.name}</div>
                                      <div className="text-xs text-slate-500">{user.email}</div>
                                  </div>
                              </div>
                          </td>
                          <td className="px-6 py-4">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                                  {user.role}
                              </span>
                          </td>
                          <td className="px-6 py-4">
                              {user.status === 'Active' ? (
                                  <span className="text-emerald-600 flex items-center gap-1 text-xs font-medium"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div> Active</span>
                              ) : (
                                  <span className="text-slate-400 flex items-center gap-1 text-xs font-medium"><div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div> Invited</span>
                              )}
                          </td>
                          <td className="px-6 py-4 text-slate-500">
                              {user.lastLogin ? user.lastLogin.toLocaleDateString() : 'Never'}
                          </td>
                          <td className="px-6 py-4 text-right text-slate-400 hover:text-blue-600 cursor-pointer">
                              Edit
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>
      </div>

      {/* Billing History */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                  <Download size={18} /> Billing History
              </h3>
          </div>
          <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                  <tr>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Description</th>
                      <th className="px-6 py-3">Amount</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 text-right">Invoice</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                  {profile.transactions.map(tx => (
                      <tr key={tx.id} className="hover:bg-slate-50/50">
                          <td className="px-6 py-4 text-slate-600">{new Date(tx.date).toLocaleDateString()}</td>
                          <td className="px-6 py-4 font-medium text-slate-800">{tx.description}</td>
                          <td className="px-6 py-4 text-slate-600">{tx.currency} {tx.amount.toFixed(2)}</td>
                          <td className="px-6 py-4">
                              <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded text-xs font-medium">{tx.status}</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                              <button className="text-blue-600 hover:underline text-xs">Download PDF</button>
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>
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
