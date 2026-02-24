import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, CheckCircle, XCircle, Clock, AlertCircle, Mail, Phone, Loader2 } from 'lucide-react';
import { workersApi } from '../lib/api';

export default function ManageWorkers() {
  const queryClient = useQueryClient();

  const { data: workers = [], isLoading } = useQuery({
    queryKey: ['workers'],
    queryFn: () => workersApi.getAll().then(r => r.data),
  });

  const approveMutation = useMutation({
    mutationFn: (id: number) => workersApi.approve(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workers'] }),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: number) => workersApi.reject(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workers'] }),
  });

  const statusBadge = (status: string) => {
    const map: Record<string, { bg: string; icon: any; label: string }> = {
      'Pending': { bg: 'bg-amber-100 text-amber-700', icon: Clock, label: 'Pending Approval' },
      'Approved': { bg: 'bg-emerald-100 text-emerald-700', icon: CheckCircle, label: 'Approved' },
      'Rejected': { bg: 'bg-red-100 text-red-700', icon: XCircle, label: 'Rejected' },
    };
    return map[status] || { bg: 'bg-gray-100 text-gray-700', icon: AlertCircle, label: status };
  };

  const formatDate = (d: string) => {
    if (!d) return '--';
    return new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const pendingCount = (workers as any[]).filter(w => w.approval_status === 'Pending').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="w-8 h-8 text-violet-600" /> Manage Workers
          </h1>
          <p className="text-gray-500 mt-1">Approve or reject worker registrations</p>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl">
            <Clock className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-semibold text-amber-700">{pendingCount} pending</span>
          </div>
        )}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-3 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !(workers as any[]).length ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Users className="w-12 h-12 mb-3" />
            <p className="font-medium">No workers registered yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50/80">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-500">Worker</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-500">Contact</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-500">Registered</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-500">Status</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {(workers as any[]).map((w: any) => {
                    const badge = statusBadge(w.approval_status || 'Pending');
                    const BadgeIcon = badge.icon;
                    return (
                      <motion.tr key={w.id}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                              {(w.full_name || w.email || '?')[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{w.full_name || 'Unnamed'}</p>
                              <p className="text-xs text-gray-400">ID: {w.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            <p className="flex items-center gap-1.5 text-gray-600">
                              <Mail className="w-3.5 h-3.5 text-gray-400" /> {w.email}
                            </p>
                            {w.phone && (
                              <p className="flex items-center gap-1.5 text-gray-600">
                                <Phone className="w-3.5 h-3.5 text-gray-400" /> {w.phone}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-500 text-xs">{formatDate(w.created_at)}</td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${badge.bg}`}>
                            <BadgeIcon className="w-3.5 h-3.5" /> {badge.label}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center gap-2">
                            {w.approval_status === 'Pending' && (
                              <>
                                <motion.button onClick={() => approveMutation.mutate(w.id)}
                                  disabled={approveMutation.isPending}
                                  whileHover={{ scale: 1.08, boxShadow: '0 4px 15px -3px rgba(16,185,129,0.3)' }}
                                  whileTap={{ scale: 0.93 }}
                                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold transition-all disabled:opacity-50">
                                  {approveMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                                  Approve
                                </motion.button>
                                <motion.button onClick={() => rejectMutation.mutate(w.id)}
                                  disabled={rejectMutation.isPending}
                                  whileHover={{ scale: 1.08, boxShadow: '0 4px 15px -3px rgba(220,38,38,0.3)' }}
                                  whileTap={{ scale: 0.93 }}
                                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 text-xs font-semibold transition-all disabled:opacity-50">
                                  {rejectMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                                  Reject
                                </motion.button>
                              </>
                            )}
                            {w.approval_status === 'Approved' && (
                              <motion.button onClick={() => rejectMutation.mutate(w.id)}
                                disabled={rejectMutation.isPending}
                                whileHover={{ scale: 1.08, boxShadow: '0 4px 15px -3px rgba(220,38,38,0.3)' }}
                                whileTap={{ scale: 0.93 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 text-xs font-semibold transition-all disabled:opacity-50">
                                <XCircle className="w-3.5 h-3.5" /> Revoke
                              </motion.button>
                            )}
                            {w.approval_status === 'Rejected' && (
                              <motion.button onClick={() => approveMutation.mutate(w.id)}
                                disabled={approveMutation.isPending}
                                whileHover={{ scale: 1.08, boxShadow: '0 4px 15px -3px rgba(16,185,129,0.3)' }}
                                whileTap={{ scale: 0.93 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold transition-all disabled:opacity-50">
                                <CheckCircle className="w-3.5 h-3.5" /> Approve
                              </motion.button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
