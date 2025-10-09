import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { classesAPI } from '../../services/api';
import { 
  CalendarIcon, 
  ClockIcon, 
  UserGroupIcon, 
  StarIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const Classes = () => {
  const [filters, setFilters] = useState({
    category: '',
    difficulty: '',
    search: '',
  });

  const { data: classesData, isLoading, error } = useQuery(
    ['classes', filters],
    () => classesAPI.getAll(filters),
    {
      keepPreviousData: true,
    }
  );

  const categories = [
    { value: '', label: 'Todas las categorías' },
    { value: 'yoga', label: 'Yoga' },
    { value: 'crossfit', label: 'Crossfit' },
    { value: 'pilates', label: 'Pilates' },
    { value: 'cardio', label: 'Cardio' },
    { value: 'strength_training', label: 'Entrenamiento de Fuerza' },
  ];

  const difficulties = [
    { value: '', label: 'Todos los niveles' },
    { value: 'beginner', label: 'Principiante' },
    { value: 'intermediate', label: 'Intermedio' },
    { value: 'advanced', label: 'Avanzado' },
    { value: 'all_levels', label: 'Todos los niveles' },
  ];

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
        <h1 className="text-2xl font-bold text-gray-900">Clases Disponibles</h1>
        <p className="mt-2 text-gray-600">
          Encuentra la clase perfecta para tu entrenamiento
        </p>
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
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
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
              {difficulties.map((difficulty) => (
                <option key={difficulty.value} value={difficulty.value}>
                  {difficulty.label}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ category: '', difficulty: '', search: '' })}
              className="btn-outline w-full"
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
              Limpiar Filtros
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
                <span className={`badge ${getDifficultyColor(classItem.difficulty)}`}>
                  {getDifficultyText(classItem.difficulty)}
                </span>
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
                  {classItem.availableSpots} de {classItem.capacity} cupos disponibles
                </div>
                {classItem.trainer?.rating && (
                  <div className="flex items-center text-sm text-gray-500">
                    <StarIcon className="h-4 w-4 mr-1 text-yellow-400" />
                    {classItem.trainer.rating.average?.toFixed(1)} ({classItem.trainer.rating.count} reseñas)
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-2xl font-bold text-primary-600">
                  ${classItem.price}
                </div>
                <button className="btn-primary btn-sm">
                  Reservar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {classesData?.data?.classes?.length === 0 && (
        <div className="text-center py-12">
          <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron clases</h3>
          <p className="mt-1 text-sm text-gray-500">
            Intenta ajustar los filtros de búsqueda
          </p>
        </div>
      )}
    </div>
  );
};

export default Classes;
