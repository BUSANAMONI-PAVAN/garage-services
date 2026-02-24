import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Mail, Phone, Shield, User, UserCheck, UserX, Hash } from 'lucide-react';
import { authApi, getStoredUser } from '../lib/api';

export default function Profile() {
  const cachedUser = getStoredUser();
  const { data } = useQuery({
    queryKey: ['profile'],
    queryFn: () => authApi.me().then((r) => r.data),
    staleTime: 60_000,
  });

  const user = data || cachedUser;

  const info = [
    { label: 'Full Name', value: user?.fullName || user?.username || '—', icon: User },
    { label: 'Email', value: user?.email || '—', icon: Mail },
    { label: 'Phone', value: user?.phone || '—', icon: Phone },
    { label: 'Role', value: user?.role || '—', icon: Shield },
    { label: 'Username', value: user?.username || '—', icon: Hash },
    { label: 'Approval Status', value: (user as any)?.approvalStatus || (user as any)?.approval_status || (user?.role === 'Manager' ? 'Approved' : '—'), icon: (user as any)?.approvalStatus === 'Approved' ? UserCheck : UserX },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="rounded-3xl bg-white shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-10 text-white">
          <p className="text-xs uppercase tracking-[0.2em] font-semibold mb-2">Profile</p>
          <h1 className="text-3xl font-bold leading-tight">{user?.fullName || user?.email || 'User'}</h1>
          <p className="text-white/80 mt-1">{user?.role || '—'} • {(user as any)?.approvalStatus || 'Active'}</p>
        </div>
        <div className="p-6 grid gap-4 sm:grid-cols-2">
          {info.map((item) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50/60 px-4 py-3"
              >
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-inner text-gray-600">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{item.label}</p>
                  <p className="text-sm font-semibold text-gray-900 truncate">{item.value}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
