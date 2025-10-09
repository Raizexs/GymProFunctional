import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { reservationsAPI } from '../../services/api';
import { 
  CalendarIcon, 
  ClockIcon, 
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const Reservations = () => {
  const [statusFilter, setStatusFilter] = useState('');

  const { data: reservationsData, isLoading, error } = useQuery(
    ['reservations', statusFilter],
    () => reservationsAPI.getAll({ status: statusFilter }),
    {
      keepPreviousData: true,
    }
  );

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircleIcon className="h-5 w-5 text-success-500" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-warning-500" />;
      case 'cancelled':
        return <XMarkIcon className="h-5 w-5 text-error-500" />;
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-success-600" />;
      default:
        return <ExclamationTriangleIcon className="h-5 w-5 text-gray-500" />;
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const canCancel = (reservation) => {
    if (reservation.status === 'cancelled' || reservation.status === 'completed') {
      return false;
    }
    
    const reservationDate = new Date(reservation.scheduledDate);
    const now = new Date();
    const hoursUntilClass = (reservationDate - now) / (1000 * 60 * 60);
    
    return hoursUntilClass > 2;
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
        <p className="text-error-600">Error al cargar las reservas</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900">Mis Reservas</h1>
        <p className="mt-2 text-gray-600">
          Gestiona tus reservas de clases
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center space-x-4">
          <label className="label">Filtrar por estado:</label>
          <select
            className="input w-48"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="pending">Pendientes</option>
            <option value="confirmed">Confirmadas</option>
            <option value="completed">Completadas</option>
            <option value="cancelled">Canceladas</option>
          </select>
        </div>
      </div>

      {/* Reservations List */}
      <div className="space-y-4">
        {reservationsData?.data?.reservations?.map((reservation) => (
          <div key={reservation._id} className="card">
            <div className="card-body">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(reservation.status)}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {reservation.class?.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {reservation.trainer?.firstName} {reservation.trainer?.lastName}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="flex items-center text-sm text-gray-500">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {formatDate(reservation.scheduledDate)}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <ClockIcon className="h-4 w-4 mr-2" />
                      {reservation.startTime} - {reservation.endTime}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="font-medium">${reservation.price}</span>
                    </div>
                  </div>

                  {reservation.notes && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Notas:</span> {reservation.notes}
                      </p>
                    </div>
                  )}

                  {reservation.cancellationReason && (
                    <div className="mt-3">
                      <p className="text-sm text-error-600">
                        <span className="font-medium">Motivo de cancelación:</span> {reservation.cancellationReason}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end space-y-2">
                  <span className={`badge ${getStatusColor(reservation.status)}`}>
                    {getStatusText(reservation.status)}
                  </span>
                  
                  {reservation.paymentStatus && (
                    <span className={`badge ${
                      reservation.paymentStatus === 'paid' ? 'badge-success' : 'badge-warning'
                    }`}>
                      {reservation.paymentStatus === 'paid' ? 'Pagado' : 'Pendiente de pago'}
                    </span>
                  )}

                  <div className="flex space-x-2">
                    {canCancel(reservation) && (
                      <button className="btn-error btn-sm">
                        Cancelar
                      </button>
                    )}
                    
                    {reservation.status === 'completed' && !reservation.feedback?.rating && (
                      <button className="btn-primary btn-sm">
                        Calificar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {reservationsData?.data?.reservations?.length === 0 && (
        <div className="text-center py-12">
          <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No tienes reservas</h3>
          <p className="mt-1 text-sm text-gray-500">
            Comienza reservando tu primera clase
          </p>
          <div className="mt-6">
            <button className="btn-primary">
              Ver Clases Disponibles
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reservations;
