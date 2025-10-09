import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { adminAPI } from '../../services/api';
import { 
  DocumentChartBarIcon, 
  CalendarIcon,
  ArrowDownTrayIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

const AdminReports = () => {
  const [reportType, setReportType] = useState('revenue');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const { data: reportData, isLoading, error } = useQuery(
    ['admin-reports', reportType, dateRange],
    () => adminAPI.getReports({
      type: reportType,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    }),
    {
      keepPreviousData: true,
    }
  );

  const reportTypes = [
    { value: 'revenue', label: 'Reporte de Ingresos' },
    { value: 'attendance', label: 'Análisis de Asistencia' },
    { value: 'classes', label: 'Rendimiento de Clases' },
    { value: 'trainers', label: 'Rendimiento de Entrenadores' },
  ];

  const handleDateChange = (key, value) => {
    setDateRange(prev => ({ ...prev, [key]: value }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

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
        <p className="text-error-600">Error al cargar el reporte</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reportes y Análisis</h1>
            <p className="mt-2 text-gray-600">
              Genera reportes detallados del gimnasio
            </p>
          </div>
          <button className="btn-primary">
            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
            Exportar PDF
          </button>
        </div>
      </div>

      {/* Report Controls */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Report Type */}
          <div>
            <label className="label">Tipo de Reporte</label>
            <select
              className="input"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              {reportTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="label">Fecha de Inicio</label>
            <input
              type="date"
              className="input"
              value={dateRange.startDate}
              onChange={(e) => handleDateChange('startDate', e.target.value)}
            />
          </div>

          {/* End Date */}
          <div>
            <label className="label">Fecha de Fin</label>
            <input
              type="date"
              className="input"
              value={dateRange.endDate}
              onChange={(e) => handleDateChange('endDate', e.target.value)}
            />
          </div>

          {/* Generate Button */}
          <div className="flex items-end">
            <button className="btn-primary w-full">
              <FunnelIcon className="h-4 w-4 mr-2" />
              Generar Reporte
            </button>
          </div>
        </div>
      </div>

      {/* Report Content */}
      {reportData?.data && (
        <div className="space-y-6">
          {/* Revenue Report */}
          {reportType === 'revenue' && (
            <div className="space-y-6">
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-medium text-gray-900">
                    Resumen de Ingresos
                  </h3>
                </div>
                <div className="card-body">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary-600">
                        {formatCurrency(reportData.data.revenueData?.reduce((sum, item) => sum + item.totalRevenue, 0) || 0)}
                      </div>
                      <div className="text-sm text-gray-500">Ingresos Totales</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-success-600">
                        {reportData.data.revenueData?.reduce((sum, item) => sum + item.transactionCount, 0) || 0}
                      </div>
                      <div className="text-sm text-gray-500">Transacciones</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-warning-600">
                        {formatCurrency(reportData.data.revenueData?.reduce((sum, item) => sum + item.averageTransaction, 0) / (reportData.data.revenueData?.length || 1) || 0)}
                      </div>
                      <div className="text-sm text-gray-500">Promedio por Transacción</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-medium text-gray-900">
                    Ingresos por Mes
                  </h3>
                </div>
                <div className="card-body">
                  <div className="space-y-4">
                    {reportData.data.revenueData?.map((item) => (
                      <div key={`${item._id.year}-${item._id.month}`} className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {new Date(item._id.year, item._id.month - 1).toLocaleDateString('es-ES', { 
                              year: 'numeric', 
                              month: 'long' 
                            })}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.transactionCount} transacciones
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-gray-900">
                            {formatCurrency(item.totalRevenue)}
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
          )}

          {/* Attendance Report */}
          {reportType === 'attendance' && (
            <div className="space-y-6">
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-medium text-gray-900">
                    Resumen de Asistencia
                  </h3>
                </div>
                <div className="card-body">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {reportData.data.attendanceData?.map((item) => (
                      <div key={item._id} className="text-center">
                        <div className="text-3xl font-bold text-primary-600">
                          {item.count}
                        </div>
                        <div className="text-sm text-gray-500 capitalize">
                          {item._id === 'completed' ? 'Completadas' : 
                           item._id === 'cancelled' ? 'Canceladas' :
                           item._id === 'pending' ? 'Pendientes' : item._id}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Classes Report */}
          {reportType === 'classes' && (
            <div className="space-y-6">
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-medium text-gray-900">
                    Rendimiento de Clases
                  </h3>
                </div>
                <div className="card-body">
                  <div className="space-y-4">
                    {reportData.data.classData?.map((classItem) => (
                      <div key={classItem.name} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">
                              {classItem.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {classItem.category} • {classItem.bookings} reservas
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-semibold text-gray-900">
                              {Math.round(classItem.occupancyRate)}%
                            </div>
                            <div className="text-sm text-gray-500">
                              Ocupación
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full"
                            style={{ width: `${Math.min(classItem.occupancyRate, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Trainers Report */}
          {reportType === 'trainers' && (
            <div className="space-y-6">
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-medium text-gray-900">
                    Rendimiento de Entrenadores
                  </h3>
                </div>
                <div className="card-body">
                  <div className="space-y-4">
                    {reportData.data.trainerData?.map((trainer) => (
                      <div key={trainer.name} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">
                              {trainer.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {trainer.position} • {trainer.classes} clases
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-semibold text-gray-900">
                              {trainer.rating?.toFixed(1) || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">
                              Calificación
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* No Data */}
      {!reportData?.data && (
        <div className="text-center py-12">
          <DocumentChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay datos disponibles</h3>
          <p className="mt-1 text-sm text-gray-500">
            Selecciona un tipo de reporte y rango de fechas para generar el análisis
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminReports;
