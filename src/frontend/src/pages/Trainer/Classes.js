import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { classesAPI } from '../../services/api';
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  UserGroupIcon,
  ClockIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

const TrainerClasses = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: classesData, isLoading, error } = useQuery(
    ['trainer-classes'],
    () => classesAPI.getAll({ trainerId: 'current' }),
    {
      keepPreviousData: true,
    }
  );

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mis Clases</h1>
            <p className="mt-2 text-gray-600">
              Gestiona las clases que impartes
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Nueva Clase
          </button>
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
          <PlusIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No tienes clases creadas</h3>
          <p className="mt-1 text-sm text-gray-500">
            Comienza creando tu primera clase
          </p>
          <div className="mt-6">
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Crear Primera Clase
            </button>
          </div>
        </div>
      )}

      {/* Create Class Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Crear Nueva Clase
              </h3>
              <form className="space-y-4">
                <div>
                  <label className="label">Nombre de la Clase</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Ej: Yoga Matutino"
                  />
                </div>
                <div>
                  <label className="label">Descripción</label>
                  <textarea
                    className="input"
                    rows="3"
                    placeholder="Describe la clase..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Duración (min)</label>
                    <input
                      type="number"
                      className="input"
                      placeholder="60"
                    />
                  </div>
                  <div>
                    <label className="label">Capacidad</label>
                    <input
                      type="number"
                      className="input"
                      placeholder="15"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Precio</label>
                    <input
                      type="number"
                      className="input"
                      placeholder="25"
                    />
                  </div>
                  <div>
                    <label className="label">Dificultad</label>
                    <select className="input">
                      <option value="beginner">Principiante</option>
                      <option value="intermediate">Intermedio</option>
                      <option value="advanced">Avanzado</option>
                      <option value="all_levels">Todos los niveles</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="btn-outline"
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary">
                    Crear Clase
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerClasses;
