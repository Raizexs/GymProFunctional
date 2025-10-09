import React from 'react';
import { useQuery } from 'react-query';
import { adminAPI } from '../../services/api';
import { 
  UsersIcon, 
  AcademicCapIcon, 
  CurrencyDollarIcon, 
  CalendarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const { data: dashboardData, isLoading, error } = useQuery(
    ['admin-dashboard'],
    () => adminAPI.getDashboard(),
    {
      keepPreviousData: true,
    }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-error-600">Error al cargar el dashboard</p>
      </div>
    );
  }

  const stats = [
    {
      name: 'Total Clientes',
      value: dashboardData?.data?.overview?.totalClients || 0,
      change: '+12',
      changeType: 'positive',
      icon: UsersIcon,
    },
    {
      name: 'Total Entrenadores',
      value: dashboardData?.data?.overview?.totalTrainers || 0,
      change: '+2',
      changeType: 'positive',
      icon: AcademicCapIcon,
    },
    {
      name: 'Total Clases',
      value: dashboardData?.data?.overview?.totalClasses || 0,
      change: '+5',
      changeType: 'positive',
      icon: CalendarIcon,
    },
    {
      name: 'Ingresos del Mes',
      value: `$${dashboardData?.data?.overview?.recentRevenue || 0}`,
      change: '+15%',
      changeType: 'positive',
      icon: CurrencyDollarIcon,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Administrativo</h1>
        <p className="mt-2 text-gray-600">
          Resumen general del gimnasio
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className="h-8 w-8 text-primary-600" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        stat.changeType === 'positive' ? 'text-success-600' : 'text-error-600'
                      }`}>
                        {stat.changeType === 'positive' ? (
                          <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                        ) : (
                          <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
                        )}
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Reservations */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Reservas Recientes
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Últimas reservas realizadas
            </p>
          </div>
          <div className="card-body">
            <div className="flow-root">
              <ul className="-my-5 divide-y divide-gray-200">
                {dashboardData?.data?.recentReservations?.slice(0, 5).map((reservation) => (
                  <li key={reservation._id} className="py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <CalendarIcon className="h-6 w-6 text-primary-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {reservation.class?.name}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {reservation.client?.firstName} {reservation.client?.lastName} • {reservation.trainer?.firstName} {reservation.trainer?.lastName}
                        </p>
                      </div>
                      <div className="flex-shrink-0 text-sm text-gray-500">
                        {new Date(reservation.scheduledDate).toLocaleDateString('es-ES')}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="card-footer">
            <div className="flex justify-end">
              <button className="btn-primary btn-sm">
                Ver Todas las Reservas
              </button>
            </div>
          </div>
        </div>

        {/* Top Trainers */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Top Entrenadores
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Entrenadores con mejor rendimiento
            </p>
          </div>
          <div className="card-body">
            <div className="flow-root">
              <ul className="-my-5 divide-y divide-gray-200">
                {dashboardData?.data?.topTrainers?.slice(0, 5).map((trainer, index) => (
                  <li key={trainer._id} className="py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary-600">
                            #{index + 1}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {trainer.name}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {trainer.classes} clases • Rating: {trainer.rating?.toFixed(1) || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Class Occupancy */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Ocupación de Clases
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Clases con mayor demanda
          </p>
        </div>
        <div className="card-body">
          <div className="space-y-4">
            {dashboardData?.data?.classOccupancy?.slice(0, 5).map((classItem) => (
              <div key={classItem.name} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {classItem.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {classItem.bookings}/{classItem.capacity} estudiantes
                    </p>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${Math.min((classItem.bookings / classItem.capacity) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
                <div className="ml-4 text-sm text-gray-500">
                  {Math.round((classItem.bookings / classItem.capacity) * 100)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pending Payments */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Pagos Pendientes
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Pagos que requieren atención
          </p>
        </div>
        <div className="card-body">
          {dashboardData?.data?.pendingPayments?.length > 0 ? (
            <div className="flow-root">
              <ul className="-my-5 divide-y divide-gray-200">
                {dashboardData.data.pendingPayments.slice(0, 5).map((payment) => (
                  <li key={payment._id} className="py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-warning-100 flex items-center justify-center">
                          <CurrencyDollarIcon className="h-6 w-6 text-warning-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {payment.client?.firstName} {payment.client?.lastName}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {payment.reservation?.class?.name} • ${payment.amount / 100}
                        </p>
                      </div>
                      <div className="flex-shrink-0 text-sm text-gray-500">
                        {new Date(payment.createdAt).toLocaleDateString('es-ES')}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="text-center py-8">
              <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay pagos pendientes</h3>
              <p className="mt-1 text-sm text-gray-500">
                Todos los pagos están al día
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
