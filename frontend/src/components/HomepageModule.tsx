import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  BellRing,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  ShieldCheck,
  UserRound,
  Users,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import { bookingsApi, dashboardApi, getStoredUser, workersApi } from '../lib/api';

type UserRole = 'Customer' | 'Worker' | 'Manager';

interface BookingRecord {
  id: number;
  order_id?: string;
  service_type?: string;
  wheeler_type?: string;
  status?: string;
  booking_date?: string;
  appointment_date?: string;
}

interface DashboardResponse {
  stats?: {
    total?: number;
    revenue?: number;
    pending?: number;
    completed?: number;
  };
  recentBookings?: BookingRecord[];
}

interface SummaryCard {
  key: string;
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  badgeStyle?: string;
}

const normalizeRole = (value?: string): UserRole => {
  const role = value?.toLowerCase();
  if (role === 'manager') return 'Manager';
  if (role === 'worker') return 'Worker';
  return 'Customer';
};

const cleanDisplayName = (rawName: string, role: UserRole): string => {
  const trimmed = rawName.trim();
  if (!trimmed) return 'User';
  const rolePrefix = new RegExp(`^${role}\\s+`, 'i');
  return trimmed.replace(rolePrefix, '').trim() || trimmed;
};

const isToday = (value?: string | null): boolean => {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
};

const toDisplayDate = (value?: string | null): string => {
  if (!value) return 'No date available';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'No date available';
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const statusBadgeStyle = (status: string): string => {
  const normalized = status.toLowerCase();
  if (normalized === 'completed') return 'bg-emerald-500/25 text-emerald-100 border-emerald-300/40';
  if (normalized === 'in progress') return 'bg-blue-500/25 text-blue-100 border-blue-300/40';
  if (normalized === 'pending') return 'bg-amber-500/25 text-amber-100 border-amber-300/40';
  return 'bg-slate-500/25 text-slate-100 border-slate-300/40';
};

export default function HomepageModule() {
  const user = getStoredUser();
  const role = normalizeRole(user?.role);
  const rawName = user?.fullName?.trim() || user?.username?.trim() || user?.email?.split('@')[0] || 'User';
  const name = cleanDisplayName(rawName, role);

  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ['homepage-dashboard', role],
    queryFn: () => dashboardApi.getStats().then((res) => res.data as DashboardResponse),
  });

  const needsBookings = role === 'Worker' || role === 'Manager';
  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ['homepage-bookings', role],
    queryFn: () =>
      bookingsApi.getAll().then((res) => (Array.isArray(res.data) ? (res.data as BookingRecord[]) : [])),
    enabled: needsBookings,
  });

  const { data: approvedWorkers = [], isLoading: workersLoading } = useQuery({
    queryKey: ['homepage-approved-workers'],
    queryFn: () => workersApi.getApproved().then((res) => (Array.isArray(res.data) ? res.data : [])),
    enabled: role === 'Manager',
  });

  const latestBooking = (dashboardData?.recentBookings || [])[0];
  const pendingRepairs = Number(dashboardData?.stats?.pending ?? 0);
  const totalTasksToday = useMemo(
    () => bookings.filter((booking) => isToday(booking.booking_date || booking.appointment_date)).length,
    [bookings]
  );
  const pendingWork = useMemo(
    () =>
      bookings.filter((booking) => {
        const status = (booking.status || 'Pending').toLowerCase();
        return status !== 'completed' && status !== 'cancelled';
      }).length,
    [bookings]
  );
  const completedRepairsToday = useMemo(
    () =>
      bookings.filter((booking) => {
        const status = (booking.status || '').toLowerCase();
        return status === 'completed' && isToday(booking.booking_date || booking.appointment_date);
      }).length,
    [bookings]
  );
  const activeWorkersCount = approvedWorkers.length;
  const customerStatus = latestBooking?.status || 'Pending';
  const customerBookingRef = latestBooking ? latestBooking.order_id || `#${latestBooking.id}` : 'No booking yet';
  const customerBookingDetails = latestBooking
    ? `${latestBooking.service_type || 'General Service'} - ${latestBooking.wheeler_type || 'Vehicle details pending'}`
    : 'Create a booking to start tracking your service request.';
  const customerUpdate = latestBooking
    ? `Latest update (${toDisplayDate(latestBooking.booking_date || latestBooking.appointment_date)}): your request is ${customerStatus}.`
    : 'No update notification yet. You will see live updates after booking.';

  const welcomeContent = useMemo(() => {
    if (role === 'Worker') {
      return {
        title: `Welcome ${name}`,
        subtitle: `You have ${totalTasksToday} tasks today and ${pendingWork} pending works to complete.`,
      };
    }
    if (role === 'Manager') {
      return {
        title: `Welcome back Manager ${name}`,
        subtitle: `We have ${pendingRepairs} pending repair requests and ${completedRepairsToday} completed today.`,
      };
    }
    return {
      title: `Welcome ${name}`,
      subtitle: 'Here is the status of your service request.',
    };
  }, [completedRepairsToday, name, pendingRepairs, pendingWork, role, totalTasksToday]);

  const cards: SummaryCard[] = useMemo(() => {
    if (role === 'Worker') {
      return [
        {
          key: 'worker-total-today',
          label: 'Total Tasks Assigned Today',
          value: String(totalTasksToday),
          detail: 'Tasks scheduled for today',
          icon: ClipboardList,
        },
        {
          key: 'worker-pending',
          label: 'Pending Tasks Remaining',
          value: String(pendingWork),
          detail: 'Works still in progress or pending',
          icon: Clock3,
        },
      ];
    }
    if (role === 'Manager') {
      return [
        {
          key: 'manager-pending',
          label: 'Total Pending Repairs',
          value: String(pendingRepairs),
          detail: 'Open requests waiting for completion',
          icon: Clock3,
        },
        {
          key: 'manager-completed-today',
          label: 'Completed Repairs Today',
          value: String(completedRepairsToday),
          detail: 'Jobs completed on the current day',
          icon: CheckCircle2,
        },
        {
          key: 'manager-workers',
          label: 'Active Workers Count',
          value: String(activeWorkersCount),
          detail: 'Approved workers currently available',
          icon: Users,
        },
      ];
    }
    return [
      {
        key: 'customer-status',
        label: 'Current Service Status',
        value: customerStatus,
        detail: 'Real-time progress of your latest request',
        icon: ShieldCheck,
        badgeStyle: statusBadgeStyle(customerStatus),
      },
      {
        key: 'customer-booking',
        label: 'Booking Details',
        value: customerBookingRef,
        detail: customerBookingDetails,
        icon: CalendarDays,
      },
      {
        key: 'customer-update',
        label: 'Latest Update Notification',
        value: latestBooking ? 'Updated' : 'Waiting',
        detail: customerUpdate,
        icon: BellRing,
      },
    ];
  }, [
    activeWorkersCount,
    completedRepairsToday,
    customerBookingDetails,
    customerBookingRef,
    customerStatus,
    customerUpdate,
    latestBooking,
    pendingRepairs,
    pendingWork,
    role,
    totalTasksToday,
  ]);

  const isLoading = dashboardLoading || (needsBookings && bookingsLoading) || (role === 'Manager' && workersLoading);
  const RoleIcon = role === 'Manager' ? Users : role === 'Worker' ? Wrench : UserRound;

  return (
    <section className="relative min-h-screen -mt-16 pt-16 overflow-hidden shadow-2xl">
      <img
        src="/manager-dashboard.jpg"
        alt="Garage manager dashboard interior"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-black/55" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/50 to-black/75" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-6xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/90"
          >
            <RoleIcon className="h-4 w-4" /> {role} Homepage
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.35 }}
            className="mx-auto mt-5 max-w-4xl text-2xl font-bold leading-snug text-white sm:text-3xl lg:text-4xl"
          >
            {welcomeContent.title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.35 }}
            className="mx-auto mt-2 max-w-4xl text-sm font-medium text-white/90 sm:text-base"
          >
            {isLoading ? 'Loading your live homepage metrics...' : welcomeContent.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.35 }}
            className={`mx-auto mt-8 grid max-w-5xl gap-4 ${
              role === 'Worker' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            }`}
          >
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.key}
                  className="rounded-2xl border border-white/20 bg-white/10 p-5 text-left shadow-lg backdrop-blur-md"
                >
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/75">{card.label}</p>
                  {card.badgeStyle ? (
                    <span className={`mt-3 inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${card.badgeStyle}`}>
                      {card.value}
                    </span>
                  ) : (
                    <p className="mt-2 text-2xl font-bold text-white">{card.value}</p>
                  )}
                  <p className="mt-3 text-sm leading-relaxed text-white/80">{card.detail}</p>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
