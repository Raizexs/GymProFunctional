import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { adminAPI } from '../../services/api';
import { 
  UsersIcon, 
  AcademicCapIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';

const AdminUsers = () => {
  const [filters, setFilters] = useState({
    type: '',
    search: '',
    isActive: '',
  });

  const { data: usersData, isLoading, error } = useQuery(
    ['admin-users', filters],
    () => adminAPI.getUsers(filters),
    {
      keepPreviousData: true,
    }
  );

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getStatusColor = (isActive) => {
    return isActive ? 'badge-success' : 'badge-error';
  };

  const getStatusText = (isActive) => {
    return isActive ? 'Activo' : 'Inactivo';
  };

  const getUserTypeText = (userType) => {
    switch (userType) {
      case 'client':
        return 'Cliente';
      case 'trainer':
        return 'Entrenador';
      case 'admin':
        return 'Administrador';
      default:
        return userType;
    }
  };

  const getUserTypeIcon = (userType) => {
    switch (userType) {
      case 'client':
        return <UsersIcon className="h-5 w-5" />;
      case 'trainer':
        return <AcademicCapIcon className="h-5 w-5" />;
      default:
        return <UsersIcon className="h-5 w-5" />;
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
        <p className="text-error-600">Error al cargar los usuarios</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
            <p className="mt-2 text-gray-600">
              Administra clientes y entrenadores
            </p>
          </div>
          <button className="btn-primary">
            <UserPlusIcon className="h-5 w-5 mr-2" />
            Nuevo Usuario
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Search */}
          <div>
            <label className="label">Buscar</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="input pl-10"
                placeholder="Buscar usuarios..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <label className="label">Tipo de Usuario</label>
            <select
              className="input"
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
            >
              <option value="">Todos los tipos</option>
              <option value="client">Clientes</option>
              <option value="trainer">Entrenadores</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="label">Estado</label>
            <select
              className="input"
              value={filters.isActive}
              onChange={(e) => handleFilterChange('isActive', e.target.value)}
            >
              <option value="">Todos los estados</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </select>
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ type: '', search: '', isActive: '' })}
              className="btn-outline w-full"
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Usuario</th>
                <th className="table-header-cell">Tipo</th>
                <th className="table-header-cell">Email</th>
                <th className="table-header-cell">Teléfono</th>
                <th className="table-header-cell">Estado</th>
                <th className="table-header-cell">Fecha de Registro</th>
                <th className="table-header-cell">Acciones</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {usersData?.data?.users?.map((user) => (
                <tr key={user._id} className="table-row">
                  <td className="table-cell">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          {getUserTypeIcon(user.userType)}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </div>
                        {user.employeeId && (
                          <div className="text-sm text-gray-500">
                            ID: {user.employeeId}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className="badge badge-primary">
                      {getUserTypeText(user.userType)}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="text-sm text-gray-900">{user.email}</div>
                  </td>
                  <td className="table-cell">
                    <div className="text-sm text-gray-900">{user.phone}</div>
                  </td>
                  <td className="table-cell">
                    <span className={`badge ${getStatusColor(user.isActive)}`}>
                      {getStatusText(user.isActive)}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="text-sm text-gray-900">
                      {new Date(user.createdAt).toLocaleDateString('es-ES')}
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center space-x-2">
                      <button className="btn-outline btn-sm">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button className="btn-outline btn-sm">
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button 
                        className={`btn-sm ${user.isActive ? 'btn-error' : 'btn-success'}`}
                      >
                        {user.isActive ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {usersData?.data?.pagination && (
          <div className="card-footer">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Mostrando {((usersData.data.pagination.current - 1) * 10) + 1} a{' '}
                {Math.min(usersData.data.pagination.current * 10, usersData.data.pagination.total)} de{' '}
                {usersData.data.pagination.total} resultados
              </div>
              <div className="flex space-x-2">
                <button
                  disabled={usersData.data.pagination.current === 1}
                  className="btn-outline btn-sm disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  disabled={usersData.data.pagination.current === usersData.data.pagination.pages}
                  className="btn-outline btn-sm disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* No Results */}
      {usersData?.data?.users?.length === 0 && (
        <div className="text-center py-12">
          <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron usuarios</h3>
          <p className="mt-1 text-sm text-gray-500">
            Intenta ajustar los filtros de búsqueda
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
