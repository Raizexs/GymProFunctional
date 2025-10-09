import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { classesAPI } from '../../services/api';
import { 
  AcademicCapIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  UserGroupIcon,
  ClockIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

const AdminClasses = () => {
  const [filters, setFilters] = useState({
    category: '',
    difficulty: '',
    search: '',
    isActive: '',
  });

  const { data: classesData, isLoading, error } = useQuery(
    ['admin-classes', filters],
    () => classesAPI.getAll(filters),
    {
      keepPreviousData: true,
    }
  );

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner':
        return 'badge-success';
      case 'intermediate':
        return 'badge-warning';
      case 'advanced':
        return 'badge-error';
      default:
        return 'badge-secondary';
    }
  };

  const getDifficultyText = (difficulty) => {
    switch (difficulty) {
      case 'beginner':
        return 'Principiante';
      case 'intermediate':
        return 'Intermedio';
      case 'advanced':
        return 'Avanzado';
      case 'all_levels':
        return 'Todos los niveles';
      default:
        return difficulty;
    }
  };

  const getStatusColor = (isActive) => {
    return isActive ? 'badge-success' : 'badge-error';
  };

  const getStatusText = (isActive) => {
    return isActive ? 'Activa' : 'Inactiva';
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
        <p className="text-error-600">Error al cargar las clases</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Clases</h1>
            <p className="mt-2 text-gray-600">
              Administra todas las clases del gimnasio
            </p>
          </div>
          <button className="btn-primary">
            <PlusIcon className="h-5 w-5 mr-2" />
            Nueva Clase
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
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
                placeholder="Buscar clases..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="label">Categoría</label>
            <select
              className="input"
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="">Todas las categorías</option>
              <option value="yoga">Yoga</option>
              <option value="crossfit">Crossfit</option>
              <option value="pilates">Pilates</option>
              <option value="cardio">Cardio</option>
              <option value="strength_training">Entrenamiento de Fuerza</option>
            </select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <label className="label">Dificultad</label>
            <select
              className="input"
              value={filters.difficulty}
              onChange={(e) => handleFilterChange('difficulty', e.target.value)}
            >
              <option value="">Todos los niveles</option>
              <option value="beginner">Principiante</option>
              <option value="intermediate">Intermedio</option>
              <option value="advanced">Avanzado</option>
              <option value="all_levels">Todos los niveles</option>
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
              <option value="true">Activas</option>
              <option value="false">Inactivas</option>
            </select>
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ category: '', difficulty: '', search: '', isActive: '' })}
              className="btn-outline w-full"
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
              Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {classesData?.data?.classes?.map((classItem) => (
          <div key={classItem._id} className="card hover:shadow-lg transition-shadow">
            <div className="card-body">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {classItem.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {classItem.description}
                  </p>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <span className={`badge ${getDifficultyColor(classItem.difficulty)}`}>
                    {getDifficultyText(classItem.difficulty)}
                  </span>
                  <span className={`badge ${getStatusColor(classItem.isActive)}`}>
                    {getStatusText(classItem.isActive)}
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center text-sm text-gray-500">
                  <UserGroupIcon className="h-4 w-4 mr-2" />
                  {classItem.trainer?.firstName} {classItem.trainer?.lastName}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <ClockIcon className="h-4 w-4 mr-2" />
                  {classItem.duration} minutos
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <UserGroupIcon className="h-4 w-4 mr-2" />
                  Capacidad: {classItem.capacity} estudiantes
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                  ${classItem.price} por clase
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  {classItem.totalBookings} reservas totales
                </div>
                <div className="flex space-x-2">
                  <button className="btn-outline btn-sm">
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  <button className="btn-outline btn-sm">
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button className="btn-error btn-sm">
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {classesData?.data?.classes?.length === 0 && (
        <div className="text-center py-12">
          <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron clases</h3>
          <p className="mt-1 text-sm text-gray-500">
            Intenta ajustar los filtros de búsqueda
          </p>
        </div>
      )}

      {/* Pagination */}
      {classesData?.data?.pagination && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Mostrando {((classesData.data.pagination.current - 1) * 10) + 1} a{' '}
              {Math.min(classesData.data.pagination.current * 10, classesData.data.pagination.total)} de{' '}
              {classesData.data.pagination.total} resultados
            </div>
            <div className="flex space-x-2">
              <button
                disabled={classesData.data.pagination.current === 1}
                className="btn-outline btn-sm disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                disabled={classesData.data.pagination.current === classesData.data.pagination.pages}
                className="btn-outline btn-sm disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminClasses;
