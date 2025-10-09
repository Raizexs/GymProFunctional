import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { 
  CalendarIcon, 
  ClockIcon, 
  UserGroupIcon, 
  StarIcon,
  ChartBarIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

const TrainerDashboard = () => {
  const { user } = useAuth();

  const stats = [
    {
      name: 'Clases Programadas',
      value: '24',
      change: '+3',
      changeType: 'positive',
      icon: CalendarIcon,
    },
    {
      name: 'Horas Enseñadas',
      value: '48',
      change: '+8',
      changeType: 'positive',
      icon: ClockIcon,
    },
    {
      name: 'Estudiantes Activos',
      value: '32',
      change: '+5',
      changeType: 'positive',
      icon: UserGroupIcon,
    },
    {
      name: 'Calificación Promedio',
      value: '4.8',
      change: '+0.2',
      changeType: 'positive',
      icon: StarIcon,
    },
  ];

  const upcomingClasses = [
    {
      id: 1,
      className: 'Yoga Matutino',
      date: '2024-01-15',
      time: '08:00',
      students: 12,
      capacity: 15,
    },
    {
      id: 2,
      className: 'Crossfit',
      date: '2024-01-15',
      time: '18:00',
      students: 8,
      capacity: 12,
    },
    {
      id: 3,
      className: 'Pilates',
      date: '2024-01-16',
      time: '10:00',
      students: 10,
      capacity: 10,
    },
  ];

  const recentFeedback = [
    {
      id: 1,
      studentName: 'María González',
      className: 'Yoga Matutino',
      rating: 5,
      comment: 'Excelente clase, muy relajante.',
      date: '2024-01-14',
    },
    {
      id: 2,
      studentName: 'Carlos Ruiz',
      className: 'Crossfit',
      rating: 4,
      comment: 'Muy buena intensidad, me encantó.',
      date: '2024-01-13',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          ¡Bienvenido, {user?.firstName}!
        </h1>
        <p className="mt-2 text-gray-600">
          Aquí tienes un resumen de tu actividad como entrenador.
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Upcoming Classes */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Próximas Clases
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Tus clases programadas para los próximos días
            </p>
          </div>
          <div className="card-body">
            <div className="flow-root">
              <ul className="-my-5 divide-y divide-gray-200">
                {upcomingClasses.map((classItem) => (
                  <li key={classItem.id} className="py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <AcademicCapIcon className="h-6 w-6 text-primary-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {classItem.className}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {new Date(classItem.date).toLocaleDateString('es-ES')} a las {classItem.time}
                        </p>
                      </div>
                      <div className="flex-shrink-0 text-sm text-gray-500">
                        {classItem.students}/{classItem.capacity} estudiantes
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
                Ver Horario Completo
              </button>
            </div>
          </div>
        </div>

        {/* Recent Feedback */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Feedback Reciente
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Comentarios de tus estudiantes
            </p>
          </div>
          <div className="card-body">
            <div className="flow-root">
              <ul className="-my-5 divide-y divide-gray-200">
                {recentFeedback.map((feedback) => (
                  <li key={feedback.id} className="py-4">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <UserGroupIcon className="h-6 w-6 text-gray-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900">
                            {feedback.studentName}
                          </p>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <StarIcon
                                key={i}
                                className={`h-4 w-4 ${
                                  i < feedback.rating ? 'text-yellow-400' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {feedback.className}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          "{feedback.comment}"
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(feedback.date).toLocaleDateString('es-ES')}
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="card">
          <div className="card-body text-center">
            <AcademicCapIcon className="mx-auto h-12 w-12 text-primary-600" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Mis Clases
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Gestiona tus clases y horarios
            </p>
            <div className="mt-4">
              <button className="btn-primary btn-sm">
                Ver Mis Clases
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body text-center">
            <CalendarIcon className="mx-auto h-12 w-12 text-primary-600" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Mi Horario
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Configura tu disponibilidad
            </p>
            <div className="mt-4">
              <button className="btn-primary btn-sm">
                Ver Horario
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body text-center">
            <ChartBarIcon className="mx-auto h-12 w-12 text-primary-600" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Estadísticas
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Revisa tu rendimiento
            </p>
            <div className="mt-4">
              <button className="btn-primary btn-sm">
                Ver Estadísticas
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainerDashboard;
