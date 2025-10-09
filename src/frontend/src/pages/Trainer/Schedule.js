import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { trainersAPI } from '../../services/api';
import { 
  CalendarIcon, 
  ClockIcon, 
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const TrainerSchedule = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState('day'); // day, week, month

  const { data: scheduleData, isLoading, error } = useQuery(
    ['trainer-schedule', selectedDate],
    () => trainersAPI.getSchedule('current', {
      startDate: selectedDate,
      endDate: selectedDate,
    }),
    {
      keepPreviousData: true,
    }
  );

  const formatTime = (timeString) => {
    return timeString;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircleIcon className="h-5 w-5 text-success-500" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-warning-500" />;
      case 'cancelled':
        return <XCircleIcon className="h-5 w-5 text-error-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'badge-success';
      case 'pending':
        return 'badge-warning';
      case 'cancelled':
        return 'badge-error';
      case 'completed':
        return 'badge-primary';
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
      case 'completed':
        return 'Completada';
      default:
        return status;
    }
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
        <p className="text-error-600">Error al cargar el horario</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mi Horario</h1>
            <p className="mt-2 text-gray-600">
              Gestiona tus clases y disponibilidad
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              className="input w-32"
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
            >
              <option value="day">Día</option>
              <option value="week">Semana</option>
              <option value="month">Mes</option>
            </select>
            <input
              type="date"
              className="input"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Schedule View */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Clases del {new Date(selectedDate).toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </h3>
        </div>
        
        <div className="p-6">
          {scheduleData?.data?.schedule?.length > 0 ? (
            <div className="space-y-4">
              {scheduleData.data.schedule.map((reservation) => (
                <div key={reservation._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(reservation.status)}
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">
                            {reservation.class?.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {reservation.client?.firstName} {reservation.client?.lastName}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div className="flex items-center text-sm text-gray-500">
                          <ClockIcon className="h-4 w-4 mr-2" />
                          {formatTime(reservation.startTime)} - {formatTime(reservation.endTime)}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <UserGroupIcon className="h-4 w-4 mr-2" />
                          {reservation.client?.email}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          ${reservation.price}
                        </div>
                      </div>

                      {reservation.notes && (
                        <div className="mt-3">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Notas:</span> {reservation.notes}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end space-y-2">
                      <span className={`badge ${getStatusColor(reservation.status)}`}>
                        {getStatusText(reservation.status)}
                      </span>
                      
                      {reservation.status === 'confirmed' && (
                        <button className="btn-success btn-sm">
                          Check-in
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay clases programadas</h3>
              <p className="mt-1 text-sm text-gray-500">
                No tienes clases programadas para esta fecha
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Availability Settings */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Configurar Disponibilidad
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Establece tus horarios de disponibilidad para cada día de la semana
        </p>
        
        <div className="space-y-4">
          {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((day, index) => (
            <div key={day} className="flex items-center space-x-4">
              <div className="w-20 text-sm font-medium text-gray-700">
                {day}
              </div>
              <div className="flex-1 flex items-center space-x-2">
                <input
                  type="time"
                  className="input w-32"
                  placeholder="Inicio"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="time"
                  className="input w-32"
                  placeholder="Fin"
                />
                <button className="btn-outline btn-sm">
                  Agregar
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 flex justify-end">
          <button className="btn-primary">
            Guardar Disponibilidad
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrainerSchedule;
