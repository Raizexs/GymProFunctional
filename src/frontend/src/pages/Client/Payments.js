import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { paymentsAPI } from '../../services/api';
import { 
  CreditCardIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const Payments = () => {
  const [statusFilter, setStatusFilter] = useState('');

  const { data: paymentsData, isLoading, error } = useQuery(
    ['payments', statusFilter],
    () => paymentsAPI.getAll({ status: statusFilter }),
    {
      keepPreviousData: true,
    }
  );

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-success-500" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-warning-500" />;
      case 'failed':
        return <XCircleIcon className="h-5 w-5 text-error-500" />;
      case 'refunded':
        return <ArrowPathIcon className="h-5 w-5 text-blue-500" />;
      default:
        return <ExclamationTriangleIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'badge-success';
      case 'pending':
        return 'badge-warning';
      case 'failed':
        return 'badge-error';
      case 'refunded':
        return 'badge-primary';
      default:
        return 'badge-secondary';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Completado';
      case 'pending':
        return 'Pendiente';
      case 'failed':
        return 'Fallido';
      case 'refunded':
        return 'Reembolsado';
      default:
        return status;
    }
  };

  const getPaymentMethodText = (method) => {
    switch (method) {
      case 'stripe':
        return 'Tarjeta de Crédito';
      case 'card':
        return 'Tarjeta';
      case 'bank_transfer':
        return 'Transferencia Bancaria';
      case 'cash':
        return 'Efectivo';
      case 'paypal':
        return 'PayPal';
      default:
        return method;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAmount = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency,
    }).format(amount / 100); // Assuming amount is in cents
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
        <p className="text-error-600">Error al cargar los pagos</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900">Mis Pagos</h1>
        <p className="mt-2 text-gray-600">
          Historial de pagos y transacciones
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-8 w-8 text-success-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pagos Completados
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {paymentsData?.data?.payments?.filter(p => p.status === 'completed').length || 0}
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
                <ClockIcon className="h-8 w-8 text-warning-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pagos Pendientes
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {paymentsData?.data?.payments?.filter(p => p.status === 'pending').length || 0}
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
                <XCircleIcon className="h-8 w-8 text-error-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pagos Fallidos
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {paymentsData?.data?.payments?.filter(p => p.status === 'failed').length || 0}
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
                <CreditCardIcon className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Gastado
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatAmount(
                      paymentsData?.data?.payments
                        ?.filter(p => p.status === 'completed')
                        ?.reduce((sum, p) => sum + p.amount, 0) || 0
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
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
            <option value="completed">Completados</option>
            <option value="pending">Pendientes</option>
            <option value="failed">Fallidos</option>
            <option value="refunded">Reembolsados</option>
          </select>
        </div>
      </div>

      {/* Payments List */}
      <div className="space-y-4">
        {paymentsData?.data?.payments?.map((payment) => (
          <div key={payment._id} className="card">
            <div className="card-body">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(payment.status)}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {payment.description}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {payment.reservation?.class?.name} • {payment.reservation?.trainer?.firstName} {payment.reservation?.trainer?.lastName}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="text-sm text-gray-500">
                      <span className="font-medium">Fecha:</span> {formatDate(payment.createdAt)}
                    </div>
                    <div className="text-sm text-gray-500">
                      <span className="font-medium">Método:</span> {getPaymentMethodText(payment.paymentMethod)}
                    </div>
                    <div className="text-sm text-gray-500">
                      <span className="font-medium">ID de Transacción:</span> {payment.transactionId || 'N/A'}
                    </div>
                  </div>

                  {payment.failureReason && (
                    <div className="mt-3">
                      <p className="text-sm text-error-600">
                        <span className="font-medium">Motivo del fallo:</span> {payment.failureReason}
                      </p>
                    </div>
                  )}

                  {payment.refundReason && (
                    <div className="mt-3">
                      <p className="text-sm text-blue-600">
                        <span className="font-medium">Motivo del reembolso:</span> {payment.refundReason}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end space-y-2">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {formatAmount(payment.amount, payment.currency)}
                    </div>
                    {payment.refundAmount > 0 && (
                      <div className="text-sm text-blue-600">
                        Reembolsado: {formatAmount(payment.refundAmount, payment.currency)}
                      </div>
                    )}
                  </div>
                  
                  <span className={`badge ${getStatusColor(payment.status)}`}>
                    {getStatusText(payment.status)}
                  </span>

                  {payment.receiptUrl && (
                    <a
                      href={payment.receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline btn-sm"
                    >
                      Ver Recibo
                    </a>
                  )}

                  {payment.status === 'completed' && payment.refundAmount === 0 && (
                    <button className="btn-error btn-sm">
                      Solicitar Reembolso
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {paymentsData?.data?.payments?.length === 0 && (
        <div className="text-center py-12">
          <CreditCardIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No tienes pagos</h3>
          <p className="mt-1 text-sm text-gray-500">
            Los pagos aparecerán aquí cuando realices reservas
          </p>
        </div>
      )}
    </div>
  );
};

export default Payments;
