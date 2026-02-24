import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Car, Loader2, CheckCircle, Wrench } from 'lucide-react';
import { bookingsApi } from '../lib/api';

const schema = z.object({
  customerName: z.string().min(2, 'Customer name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(7, 'Phone number is required'),
  vehicleNumber: z.string().min(2, 'Vehicle number is required'),
  serviceType: z.string().min(1, 'Select a service type'),
  serviceDescription: z.string().min(5, 'Describe the issue'),
  appointmentDate: z.string().min(1, 'Select appointment date'),
  cost: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const serviceTypes = [
  'Oil Change', 'Brake Service', 'Engine Repair', 'Tire Rotation',
  'Battery Replacement', 'AC Service', 'Transmission Repair',
  'Wheel Alignment', 'Full Inspection', 'Body Work', 'Other',
];

export default function NewBooking() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [success, setSuccess] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState('');

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { serviceType: '' },
  });

  const mutation = useMutation({
    mutationFn: (data: any) => bookingsApi.create(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['recent-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setCreatedOrderId(res.data?.order_id || '');
      setSuccess(true);
      reset();
      setTimeout(() => navigate('/history'), 3000);
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate({
      name: data.customerName,
      email: data.email,
      phone: data.phone,
      wheelerType: data.vehicleNumber,
      serviceType: data.serviceType,
      serviceDescription: data.serviceDescription,
      appointmentDate: data.appointmentDate,
      cost: data.cost ? parseFloat(data.cost) : 0,
      notes: data.notes || '',
    });
  };

  if (success) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-20">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
          <CheckCircle className="w-10 h-10 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Created!</h2>
        {createdOrderId && (
          <div className="mb-3 px-4 py-2 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-sm text-gray-500">Your Order ID</p>
            <p className="text-xl font-bold text-blue-600 font-mono tracking-wide">{createdOrderId}</p>
          </div>
        )}
        <p className="text-gray-500">Redirecting to booking history...</p>
      </motion.div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">New Booking</h1>
        <p className="text-gray-500 mt-1">Schedule a new garage service appointment</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

        {mutation.isError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            {(mutation.error as any)?.response?.data?.error || 'Failed to create booking'}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Customer Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Car className="w-4 h-4 text-blue-600" /> Customer Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.div whileHover={{ scale: 1.01 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input {...register('customerName')}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm hover:border-blue-300 hover:shadow-sm"
                  placeholder="John Doe" />
                {errors.customerName && <p className="text-xs text-red-500 mt-1">{errors.customerName.message}</p>}
              </motion.div>
              <motion.div whileHover={{ scale: 1.01 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input {...register('email')} type="email"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm hover:border-blue-300 hover:shadow-sm"
                  placeholder="john@example.com" />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
              </motion.div>
              <motion.div whileHover={{ scale: 1.01 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input {...register('phone')} type="tel"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm hover:border-blue-300 hover:shadow-sm"
                  placeholder="+91 98765 43210" />
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
              </motion.div>
              <motion.div whileHover={{ scale: 1.01 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number *</label>
                <input {...register('vehicleNumber')}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm hover:border-blue-300 hover:shadow-sm"
                  placeholder="KA-01-AB-1234" />
                {errors.vehicleNumber && <p className="text-xs text-red-500 mt-1">{errors.vehicleNumber.message}</p>}
              </motion.div>
            </div>
          </div>

          {/* Service Details */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-blue-600" /> Service Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.div whileHover={{ scale: 1.01 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Type *</label>
                <select {...register('serviceType')}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm hover:border-blue-300 hover:shadow-sm">
                  <option value="">Select service...</option>
                  {serviceTypes.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {errors.serviceType && <p className="text-xs text-red-500 mt-1">{errors.serviceType.message}</p>}
              </motion.div>
              <motion.div whileHover={{ scale: 1.01 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
                <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Date *</label>
                <input {...register('appointmentDate')} type="datetime-local"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm hover:border-blue-300 hover:shadow-sm" />
                {errors.appointmentDate && <p className="text-xs text-red-500 mt-1">{errors.appointmentDate.message}</p>}
              </motion.div>
              <motion.div whileHover={{ scale: 1.01 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }} className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea {...register('serviceDescription')} rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm resize-none hover:border-blue-300 hover:shadow-sm"
                  placeholder="Describe the issue or service needed..." />
                {errors.serviceDescription && <p className="text-xs text-red-500 mt-1">{errors.serviceDescription.message}</p>}
              </motion.div>
              <motion.div whileHover={{ scale: 1.01 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Cost ({'\u20B9'})</label>
                <input {...register('cost')} type="number" step="0.01"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm hover:border-blue-300 hover:shadow-sm"
                  placeholder="0.00" />
              </motion.div>
              <motion.div whileHover={{ scale: 1.01 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <input {...register('notes')}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm hover:border-blue-300 hover:shadow-sm"
                  placeholder="Additional notes..." />
              </motion.div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <motion.button type="submit" disabled={mutation.isPending}
              whileHover={{ scale: 1.03, boxShadow: '0 8px 25px -5px rgba(37,99,235,0.4)' }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 flex items-center justify-center gap-2">
              {mutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {mutation.isPending ? 'Creating...' : 'Create Booking'}
            </motion.button>
            <motion.button type="button" onClick={() => navigate('/history')}
              whileHover={{ scale: 1.03, backgroundColor: '#f9fafb' }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-all">
              Cancel
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
