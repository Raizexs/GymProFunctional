import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { CalendarIcon, ClockIcon, UserGroupIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

const ClientDashboard = () => {
  const { user } = useAuth();

  const stats = [
    {
      name: 'Clases Reservadas',
      value: '12',
      change: '+2',
      changeType: 'positive',
      icon: CalendarIcon,
    },
    {
      name: 'Horas Entrenadas',
      value: '24',
      change: '+4',
      changeType: 'positive',
      icon: ClockIcon,
    },
    {
      name: 'Clases Completadas',
      value: '10',
      change: '+1',
      changeType: 'positive',
      icon: UserGroupIcon,
    },
    {
      name: 'Total Gastado',
      value: '$240',
      change: '+$40',
      changeType: 'positive',
      icon: CurrencyDollarIcon,
    },
  ];

  const recentReservations = [
    {
      id: 1,
      className: 'Yoga Matutino',
      trainer: 'María González',
      date: '2024-01-15',
      time: '08:00',
      status: 'confirmed',
    },
    {
      id: 2,
      className: 'Crossfit',
      trainer: 'Carlos Ruiz',
      date: '2024-01-16',
      time: '18:00',
      status: 'pending',
    },
    {
      id: 3,
      className: 'Pilates',
      trainer: 'Ana Martínez',
      date: '2024-01-17',
      time: '10:00',
      status: 'confirmed',
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'badge-success';
      case 'pending':
        return 'badge-warning';
      case 'cancelled':
        return 'badge-error';
      default:
        return 'badge-secondary';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmada';
      case 'pending':
        return 'Pendiente';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          ¡Bienvenido, {user?.firstName}!
        </h1>
        <p className="mt-2 text-gray-600">
          Aquí tienes un resumen de tu actividad en el gimnasio.
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

      {/* Recent Reservations */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Reservas Recientes
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Tus próximas clases programadas
          </p>
        </div>
        <div className="card-body">
          <div className="flow-root">
            <ul className="-my-5 divide-y divide-gray-200">
              {recentReservations.map((reservation) => (
                <li key={reservation.id} className="py-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <CalendarIcon className="h-6 w-6 text-primary-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {reservation.className}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {reservation.trainer} • {reservation.date} a las {reservation.time}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className={`badge ${getStatusColor(reservation.status)}`}>
                        {getStatusText(reservation.status)}
                      </span>
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="card">
          <div className="card-body text-center">
            <CalendarIcon className="mx-auto h-12 w-12 text-primary-600" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Reservar Clase
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Encuentra y reserva tu próxima clase
            </p>
            <div className="mt-4">
              <button className="btn-primary btn-sm">
                Ver Clases Disponibles
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body text-center">
            <UserGroupIcon className="mx-auto h-12 w-12 text-primary-600" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Mi Perfil
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Actualiza tu información personal
            </p>
            <div className="mt-4">
              <button className="btn-primary btn-sm">
                Editar Perfil
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body text-center">
            <CurrencyDollarIcon className="mx-auto h-12 w-12 text-primary-600" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Mis Pagos
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Revisa tu historial de pagos
            </p>
            <div className="mt-4">
              <button className="btn-primary btn-sm">
                Ver Pagos
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
