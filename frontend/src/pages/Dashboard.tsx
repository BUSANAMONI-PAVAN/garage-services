import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Car, CalendarCheck, Clock, AlertCircle, IndianRupee,
  ArrowUpRight, ArrowDownRight, ChevronLeft, ChevronRight,
  Users, Activity, BarChart3
} from 'lucide-react';
import { dashboardApi, getStoredUser } from '../lib/api';

export default function Dashboard() {
  const user = getStoredUser();
  const isManager = user?.role === 'Manager';
  const [recentPage, setRecentPage] = useState(1);
  const perPage = 5;

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.getStats().then(r => r.data),
  });

  const recent = stats?.recentBookings || [];
  const serviceSummary = stats?.serviceSummary || [];
  const scopeLabel = user?.role === 'Customer' ? 'Your' : user?.role === 'Worker' ? 'Assigned' : 'Total';

  const totalCount = recent.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / perPage));
  const paged = recent.slice((recentPage - 1) * perPage, recentPage * perPage);

  const statCards = [
    {
      key: 'bookings', label: scopeLabel + ' Bookings', value: stats?.stats?.total ?? 0,
      icon: CalendarCheck, bgLight: 'bg-blue-50',
      textColor: 'text-blue-600', trend: '+12%', up: true,
    },
    {
      key: 'revenue', label: 'Revenue', value: '₹' + (stats?.stats?.revenue ?? 0).toLocaleString('en-IN'),
      icon: IndianRupee, bgLight: 'bg-emerald-50',
      textColor: 'text-emerald-600', trend: '+8%', up: true,
    },
    {
      key: 'pending', label: 'Pending', value: stats?.stats?.pending ?? 0,
      icon: Clock, bgLight: 'bg-amber-50',
      textColor: 'text-amber-600', trend: '-3%', up: false,
    },
    {
      key: 'completed', label: 'Completed', value: stats?.stats?.completed ?? 0,
      icon: Car, bgLight: 'bg-violet-50',
      textColor: 'text-violet-600', trend: '+15%', up: true,
    },
  ];

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      'Pending': 'bg-amber-50 text-amber-600 border-amber-200',
      'Confirmed': 'bg-blue-50 text-blue-600 border-blue-200',
      'In Progress': 'bg-purple-50 text-purple-600 border-purple-200',
      'Completed': 'bg-emerald-50 text-emerald-600 border-emerald-200',
      'Cancelled': 'bg-red-50 text-red-600 border-red-200',
    };
    return map[status] || 'bg-gray-50 text-gray-600 border-gray-200';
  };

  const totalServices = serviceSummary.reduce((a: number, s: any) => a + (s.count || 0), 0) || 1;
  const serviceColors = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-violet-500', 'bg-rose-500', 'bg-cyan-500'];

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {isManager ? 'Complete overview of your garage operations' :
             user?.role === 'Worker' ? 'Your assigned work overview' :
             'Track your service bookings'}
          </p>
        </div>
        <span className="text-xs text-gray-400 hidden sm:block">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
      </div>

      {/* Stats Grid */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((c) => {
          const Icon = c.icon;
          return (
            <motion.div key={c.key} variants={item}
              whileHover={{ y: -2, boxShadow: '0 8px 30px -8px rgba(0,0,0,0.08)' }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="bg-white rounded-2xl p-5 border border-gray-100 cursor-default">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-11 h-11 rounded-xl ${c.bgLight} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${c.textColor}`} />
                </div>
                <div className={`flex items-center gap-0.5 text-xs font-semibold ${c.up ? 'text-emerald-600' : 'text-red-500'}`}>
                  {c.up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  {c.trend}
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {statsLoading ? <span className="inline-block w-16 h-7 bg-gray-100 rounded animate-pulse" /> : c.value}
              </p>
              <p className="text-xs text-gray-500 mt-1 font-medium">{c.label}</p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Recent Bookings Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden">

          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-bold text-gray-900">Recent Bookings</h2>
              <span className="text-[11px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full font-medium">{totalCount} total</span>
            </div>
          </div>

          {statsLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-[3px] border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !recent.length ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <AlertCircle className="w-10 h-10 mb-2" />
              <p className="text-sm font-medium">No bookings yet</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/60">
                      <th className="text-left py-3 px-5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="text-left py-3 px-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
                      <th className="text-left py-3 px-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Service</th>
                      <th className="text-left py-3 px-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Vehicle</th>
                      <th className="text-left py-3 px-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      {(isManager || user?.role === 'Worker') && (
                        <th className="text-left py-3 px-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Assigned</th>
                      )}
                      <th className="text-right py-3 px-5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence mode="popLayout">
                      {paged.map((b: any, i: number) => (
                        <motion.tr key={b.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors">
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                {(b.name || '?')[0].toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-gray-900 text-sm truncate">{b.name}</p>
                                <p className="text-[11px] text-gray-400 truncate">{b.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-3">
                            <span className="font-mono text-xs font-bold text-blue-600">{b.order_id || `#${b.id}`}</span>
                          </td>
                          <td className="py-3.5 px-3 text-gray-600 text-xs">{b.service_type || 'Standard'}</td>
                          <td className="py-3.5 px-3 text-gray-500 text-xs font-mono">{b.wheeler_type}</td>
                          <td className="py-3.5 px-3">
                            <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusBadge(b.status || 'Pending')}`}>
                              {b.status || 'Pending'}
                            </span>
                          </td>
                          {(isManager || user?.role === 'Worker') && (
                            <td className="py-3.5 px-3">
                              <span className={`text-xs font-medium ${b.assigned_worker_name ? 'text-blue-600' : 'text-gray-400'}`}>
                                {b.assigned_worker_name || 'Unassigned'}
                              </span>
                            </td>
                          )}
                          <td className="py-3.5 px-5 text-right">
                            <span className="font-semibold text-gray-900 text-sm">₹{b.cost || 0}</span>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                  <button onClick={() => setRecentPage(p => Math.max(1, p - 1))} disabled={recentPage === 1}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                      <button key={p} onClick={() => setRecentPage(p)}
                        className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all ${
                          p === recentPage ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'
                        }`}>
                        {p < 10 ? `0${p}` : p}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setRecentPage(p => Math.min(totalPages, p + 1))} disabled={recentPage === totalPages}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </motion.div>

        {/* Right Sidebar */}
        <div className="space-y-5">
          {/* Service Breakdown */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">Service Breakdown</h3>
              <BarChart3 className="w-4 h-4 text-gray-400" />
            </div>
            <div className="space-y-3">
              {serviceSummary.length > 0 ? serviceSummary.slice(0, 5).map((s: any, i: number) => {
                const pct = Math.round((s.count / totalServices) * 100);
                return (
                  <div key={s.service_type || i}>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-medium text-gray-700 truncate mr-2">{s.service_type || 'Other'}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">{s.count}</span>
                        <span className="text-gray-500 font-semibold w-8 text-right">{pct}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }}
                        className={`h-full rounded-full ${serviceColors[i % serviceColors.length]}`} />
                    </div>
                  </div>
                );
              }) : (
                <p className="text-xs text-gray-400 text-center py-4">No service data yet</p>
              )}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: CalendarCheck, label: 'New Booking', href: '/booking', color: 'text-blue-600 bg-blue-50' },
                { icon: Activity, label: 'History', href: '/history', color: 'text-emerald-600 bg-emerald-50' },
                ...(isManager ? [
                  { icon: Users, label: 'Workers', href: '/manage-workers', color: 'text-violet-600 bg-violet-50' },
                  { icon: BarChart3, label: 'Settings', href: '/settings', color: 'text-amber-600 bg-amber-50' },
                ] : []),
              ].map((action) => {
                const AIcon = action.icon;
                return (
                  <motion.a key={action.label} href={action.href}
                    whileHover={{ scale: 1.03, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all cursor-pointer">
                    <div className={`w-9 h-9 rounded-lg ${action.color} flex items-center justify-center`}>
                      <AIcon className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-semibold text-gray-600">{action.label}</span>
                  </motion.a>
                );
              })}
            </div>
          </motion.div>

          {/* Activity Timeline */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">Recent Activity</h3>
              <Activity className="w-4 h-4 text-gray-400" />
            </div>
            <div className="space-y-3">
              {recent.slice(0, 4).map((b: any, i: number) => (
                <div key={b.id} className="flex items-start gap-3">
                  <div className="relative">
                    <div className={`w-2 h-2 rounded-full mt-1.5 ${
                      b.status === 'Completed' ? 'bg-emerald-500' :
                      b.status === 'In Progress' ? 'bg-purple-500' :
                      b.status === 'Cancelled' ? 'bg-red-500' :
                      'bg-amber-500'
                    }`} />
                    {i < Math.min(recent.length, 4) - 1 && (
                      <div className="absolute top-3 left-[3px] w-px h-full bg-gray-100" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 pb-3">
                    <p className="text-xs font-medium text-gray-900 truncate">{b.name}</p>
                    <p className="text-[11px] text-gray-400">{b.service_type} &middot; {b.status || 'Pending'}</p>
                  </div>
                </div>
              ))}
              {!recent.length && (
                <p className="text-xs text-gray-400 text-center py-2">No activity yet</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
