import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Trash2, CheckCircle, XCircle, Clock, AlertCircle, Filter,
  ChevronLeft, ChevronRight, ChevronDown, Download, Eye, MoreVertical,
  Calendar, User as UserIcon, Wrench, IndianRupee, Hash
} from 'lucide-react';
import { bookingsApi, workersApi, getStoredUser } from '../lib/api';

const statusOptions = ['all', 'Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'];

const statusConfig: Record<string, { bg: string; dot: string; icon: any }> = {
  'Pending': { bg: 'bg-amber-50 text-amber-600 border-amber-200', dot: 'bg-amber-500', icon: Clock },
  'Confirmed': { bg: 'bg-blue-50 text-blue-600 border-blue-200', dot: 'bg-blue-500', icon: CheckCircle },
  'In Progress': { bg: 'bg-purple-50 text-purple-600 border-purple-200', dot: 'bg-purple-500', icon: Clock },
  'Completed': { bg: 'bg-emerald-50 text-emerald-600 border-emerald-200', dot: 'bg-emerald-500', icon: CheckCircle },
  'Cancelled': { bg: 'bg-red-50 text-red-600 border-red-200', dot: 'bg-red-500', icon: XCircle },
};

export default function History() {
  const queryClient = useQueryClient();
  const user = getStoredUser();
  const canManage = user?.role === 'Worker' || user?.role === 'Manager';
  const isManager = user?.role === 'Manager';
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 8;

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['bookings', search],
    queryFn: () => bookingsApi.getAll(search ? { search } : undefined).then(r => r.data),
  });

  const { data: approvedWorkers = [] } = useQuery({
    queryKey: ['approved-workers'],
    queryFn: () => workersApi.getApproved().then(r => r.data),
    enabled: isManager,
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => bookingsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => bookingsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setDeleteId(null);
    },
  });

  const assignMutation = useMutation({
    mutationFn: ({ id, workerId }: { id: number; workerId: number | null }) => bookingsApi.assign(id, workerId as number),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const filtered = (bookings as any[]).filter(b =>
    statusFilter === 'all' || (b.status || 'Pending') === statusFilter
  );

  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / perPage));
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  // Reset page when filter changes
  const handleFilterChange = (s: string) => { setStatusFilter(s); setPage(1); };

  const formatDate = (d: string) => {
    if (!d) return '--';
    return new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  const formatTime = (d: string) => {
    if (!d) return '';
    return new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  // Status counts for filter badges
  const statusCounts = (bookings as any[]).reduce((acc: Record<string, number>, b: any) => {
    const s = b.status || 'Pending';
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Booking History</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {user?.role === 'Customer' ? 'Track your service bookings' : 'Manage and monitor all service bookings'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg">
            {totalCount} {totalCount === 1 ? 'booking' : 'bookings'}
          </span>
        </div>
      </div>

      {/* Search + Filters Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm"
              placeholder="Search by name, order ID, vehicle, service..." />
          </div>

          {/* Status Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {statusOptions.map(s => {
              const count = s === 'all' ? (bookings as any[]).length : (statusCounts[s] || 0);
              const cfg = s !== 'all' ? statusConfig[s] : null;
              return (
                <motion.button key={s} onClick={() => handleFilterChange(s)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                    statusFilter === s
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/20'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}>
                  {cfg && statusFilter !== s && <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />}
                  {s === 'all' ? 'All' : s}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    statusFilter === s ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                  }`}>{count}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-100 overflow-hidden">

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-[3px] border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-400">Loading bookings...</p>
            </div>
          </div>
        ) : !filtered.length ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8" />
            </div>
            <p className="font-semibold text-gray-600">No bookings found</p>
            <p className="text-sm mt-1">Try changing your search or filter criteria</p>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-2 px-5 py-3 border-b border-gray-100 bg-gray-50/60 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              <div className="col-span-1">Order</div>
              <div className="col-span-3">Customer</div>
              <div className="col-span-2">Service</div>
              <div className="col-span-1">Date</div>
              <div className="col-span-1">Status</div>
              {canManage && <div className="col-span-2">Assigned To</div>}
              <div className={`${canManage ? 'col-span-1' : 'col-span-3'} text-right`}>Cost</div>
              {canManage && <div className="col-span-1 text-center">Actions</div>}
            </div>

            {/* Rows */}
            <div className="divide-y divide-gray-50">
              <AnimatePresence mode="popLayout">
                {paged.map((b: any, i: number) => {
                  const status = b.status || 'Pending';
                  const cfg = statusConfig[status] || statusConfig['Pending'];
                  const isExpanded = expandedId === b.id;
                  return (
                    <motion.div key={b.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.02 }}>

                      {/* Main Row */}
                      <div
                        onClick={() => setExpandedId(isExpanded ? null : b.id)}
                        className={`grid grid-cols-12 gap-2 px-5 py-3.5 items-center cursor-pointer transition-all ${
                          isExpanded ? 'bg-blue-50/40' : 'hover:bg-gray-50/60'
                        }`}>
                        <div className="col-span-1">
                          <span className="font-mono text-xs font-bold text-blue-600">{b.order_id || `#${b.id}`}</span>
                        </div>
                        <div className="col-span-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {(b.name || '?')[0].toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{b.name}</p>
                              <p className="text-[11px] text-gray-400 truncate">{b.email}</p>
                            </div>
                          </div>
                        </div>
                        <div className="col-span-2">
                          <p className="text-xs text-gray-700 font-medium truncate">{b.service_type || 'Standard'}</p>
                          <p className="text-[11px] text-gray-400 font-mono">{b.wheeler_type}</p>
                        </div>
                        <div className="col-span-1">
                          <p className="text-xs text-gray-600">{formatDate(b.appointment_date || b.booking_date)}</p>
                          <p className="text-[10px] text-gray-400">{formatTime(b.appointment_date || b.booking_date)}</p>
                        </div>
                        <div className="col-span-1">
                          {canManage ? (
                            <select value={status}
                              onClick={e => e.stopPropagation()}
                              onChange={e => { e.stopPropagation(); updateStatus.mutate({ id: b.id, status: e.target.value }); }}
                              className={`px-2 py-1 rounded-lg text-[11px] font-semibold border outline-none cursor-pointer w-full ${cfg.bg}`}>
                              {statusOptions.filter(s => s !== 'all').map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          ) : (
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold border ${cfg.bg}`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                              {status}
                            </span>
                          )}
                        </div>
                        {canManage && (
                          <div className="col-span-2" onClick={e => e.stopPropagation()}>
                            {isManager ? (
                              <select value={b.assigned_worker_id || ''}
                                onChange={e => {
                                  const val = e.target.value;
                                  assignMutation.mutate({ id: b.id, workerId: val ? Number(val) : null });
                                }}
                                className="w-full px-2 py-1 rounded-lg text-xs font-medium border border-gray-200 outline-none cursor-pointer bg-gray-50/50 hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all">
                                <option value="">Unassigned</option>
                                {(approvedWorkers as any[]).map((w: any) => (
                                  <option key={w.id} value={w.id}>{w.full_name}</option>
                                ))}
                              </select>
                            ) : (
                              <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${b.assigned_worker_name ? 'text-blue-600' : 'text-gray-400'}`}>
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                                  b.assigned_worker_name ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                                }`}>
                                  {b.assigned_worker_name ? b.assigned_worker_name[0].toUpperCase() : '?'}
                                </div>
                                {b.assigned_worker_name || 'Unassigned'}
                              </span>
                            )}
                          </div>
                        )}
                        <div className={`${canManage ? 'col-span-1' : 'col-span-3'} text-right`}>
                          <span className="text-sm font-bold text-gray-900">{'\u20B9'}{b.cost || 0}</span>
                        </div>
                        {canManage && (
                          <div className="col-span-1 flex items-center justify-center gap-1" onClick={e => e.stopPropagation()}>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setExpandedId(isExpanded ? null : b.id)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                              <Eye className="w-3.5 h-3.5" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setDeleteId(b.id)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
                              <Trash2 className="w-3.5 h-3.5" />
                            </motion.button>
                          </div>
                        )}
                      </div>

                      {/* Expanded Detail Row */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden border-t border-blue-100 bg-gradient-to-r from-blue-50/40 to-transparent">
                            <div className="px-5 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="flex items-start gap-2">
                                <Hash className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">Order ID</p>
                                  <p className="text-sm font-bold text-gray-900 font-mono">{b.order_id || `#${b.id}`}</p>
                                </div>
                              </div>
                              <div className="flex items-start gap-2">
                                <Calendar className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">Appointment</p>
                                  <p className="text-sm font-medium text-gray-900">{formatDate(b.appointment_date)} {formatTime(b.appointment_date)}</p>
                                </div>
                              </div>
                              <div className="flex items-start gap-2">
                                <Wrench className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">Vehicle</p>
                                  <p className="text-sm font-medium text-gray-900 font-mono">{b.wheeler_type}</p>
                                </div>
                              </div>
                              <div className="flex items-start gap-2">
                                <IndianRupee className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">Total Cost</p>
                                  <p className="text-sm font-bold text-gray-900">{'\u20B9'}{b.cost || 0}</p>
                                </div>
                              </div>
                              {b.notes && (
                                <div className="col-span-2 md:col-span-4 mt-1 p-3 bg-white rounded-xl border border-gray-100">
                                  <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold mb-1">Notes</p>
                                  <p className="text-xs text-gray-600">{b.notes}</p>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Pagination Footer */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/40">
              <p className="text-xs text-gray-500">
                Showing <span className="font-semibold text-gray-700">{(page - 1) * perPage + 1}</span> to{' '}
                <span className="font-semibold text-gray-700">{Math.min(page * perPage, totalCount)}</span> of{' '}
                <span className="font-semibold text-gray-700">{totalCount}</span> bookings
              </p>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                  <ChevronLeft className="w-3.5 h-3.5" /> Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .map((p, idx, arr) => (
                    <span key={p} className="flex items-center">
                      {idx > 0 && arr[idx - 1] !== p - 1 && (
                        <span className="text-xs text-gray-300 px-1">&hellip;</span>
                      )}
                      <button onClick={() => setPage(p)}
                        className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all ${
                          p === page ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'
                        }`}>
                        {p}
                      </button>
                    </span>
                  ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </>
        )}
      </motion.div>

      {/* Delete Modal */}
      <AnimatePresence>
        {deleteId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setDeleteId(null)}>
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full"
              onClick={e => e.stopPropagation()}>
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
                  <Trash2 className="w-7 h-7 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Delete Booking?</h3>
                <p className="text-sm text-gray-500 mb-6">This action is permanent and cannot be undone.</p>
                <div className="flex gap-3 w-full">
                  <motion.button onClick={() => setDeleteId(null)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-all">
                    Cancel
                  </motion.button>
                  <motion.button onClick={() => deleteId && deleteMutation.mutate(deleteId)}
                    disabled={deleteMutation.isPending}
                    whileHover={{ scale: 1.02, boxShadow: '0 8px 25px -5px rgba(220,38,38,0.4)' }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-all disabled:opacity-50">
                    {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
