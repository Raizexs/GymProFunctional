import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { statisticsAPI } from '../../services/api';
import { 
  ChartBarIcon, 
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  UsersIcon,
  AcademicCapIcon,
  CurrencyDollarIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

const AdminStatistics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  const { data: overviewData, isLoading: overviewLoading } = useQuery(
    ['statistics-overview'],
    () => statisticsAPI.getOverview(),
    {
      keepPreviousData: true,
    }
  );

  const { data: revenueData, isLoading: revenueLoading } = useQuery(
    ['statistics-revenue', selectedPeriod],
    () => statisticsAPI.getRevenue({ groupBy: selectedPeriod === '30d' ? 'day' : 'month' }),
    {
      keepPreviousData: true,
    }
  );

  const { data: attendanceData, isLoading: attendanceLoading } = useQuery(
    ['statistics-attendance'],
    () => statisticsAPI.getAttendance(),
    {
      keepPreviousData: true,
    }
  );

  const { data: clientsData, isLoading: clientsLoading } = useQuery(
    ['statistics-clients'],
    () => statisticsAPI.getClients(),
    {
      keepPreviousData: true,
    }
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  if (overviewLoading || revenueLoading || attendanceLoading || clientsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Estadísticas del Gimnasio</h1>
            <p className="mt-2 text-gray-600">
              Análisis detallado del rendimiento del gimnasio
            </p>
          </div>
          <select
            className="input w-48"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="7d">Últimos 7 días</option>
            <option value="30d">Últimos 30 días</option>
            <option value="90d">Últimos 90 días</option>
            <option value="1y">Último año</option>
          </select>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Clientes
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {overviewData?.data?.overview?.totalClients || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AcademicCapIcon className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Entrenadores
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {overviewData?.data?.overview?.totalTrainers || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CalendarIcon className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Clases
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {overviewData?.data?.overview?.totalClasses || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Ingresos Totales
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {formatCurrency(overviewData?.data?.overview?.totalRevenue || 0)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Popular Classes */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">
              Clases Más Populares
            </h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {overviewData?.data?.popularClasses?.slice(0, 5).map((classItem, index) => (
                <div key={classItem.name} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-600">
                        {index + 1}
                      </span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {classItem.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {classItem.category}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {classItem.bookings} reservas
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Trainers */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">
              Top Entrenadores
            </h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {overviewData?.data?.topTrainers?.slice(0, 5).map((trainer, index) => (
                <div key={trainer.name} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-600">
                        {index + 1}
                      </span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {trainer.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {trainer.classes} clases
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    ⭐ {trainer.rating?.toFixed(1) || 'N/A'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Class Occupancy */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">
            Ocupación de Clases
          </h3>
        </div>
        <div className="card-body">
          <div className="space-y-4">
            {overviewData?.data?.classOccupancy?.slice(0, 10).map((classItem) => (
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

      {/* Client Demographics */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">
              Demografía de Clientes
            </h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {clientsData?.data?.clientDemographics?.map((demo) => (
                <div key={demo._id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-4 h-4 bg-primary-600 rounded-full"></div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 capitalize">
                        {demo._id === 'male' ? 'Masculino' : 
                         demo._id === 'female' ? 'Femenino' : 
                         demo._id === 'other' ? 'Otro' : demo._id}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {demo.count} clientes
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">
              Distribución de Membresías
            </h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {clientsData?.data?.membershipDistribution?.map((membership) => (
                <div key={membership._id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-4 h-4 bg-primary-600 rounded-full"></div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 capitalize">
                        {membership._id === 'basic' ? 'Básica' : 
                         membership._id === 'premium' ? 'Premium' : 
                         membership._id === 'unlimited' ? 'Ilimitada' : membership._id}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {membership.count} clientes
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">
            Ingresos por Período
          </h3>
        </div>
        <div className="card-body">
          <div className="space-y-4">
            {revenueData?.data?.revenueData?.slice(0, 10).map((item) => (
              <div key={`${item._id.year}-${item._id.month || item._id.day}`} className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {item._id.month ? 
                      new Date(item._id.year, item._id.month - 1).toLocaleDateString('es-ES', { 
                        year: 'numeric', 
                        month: 'long' 
                      }) :
                      new Date(item._id.year, 0, item._id.day).toLocaleDateString('es-ES', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })
                    }
                  </div>
                  <div className="text-sm text-gray-500">
                    {item.transactionCount} transacciones
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">
                    {formatCurrency(item.revenue)}
                  </div>
                  <div className="text-sm text-gray-500">
                    Promedio: {formatCurrency(item.averageTransaction)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStatistics;
