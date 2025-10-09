import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';
import { 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  AcademicCapIcon,
  StarIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';

const TrainerProfile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      bio: user?.bio || '',
      specialties: user?.specialties || [],
      hourlyRate: user?.hourlyRate || 0,
      position: user?.position || 'trainer',
    },
  });

  const specialtiesOptions = [
    { value: 'strength_training', label: 'Entrenamiento de Fuerza' },
    { value: 'cardio', label: 'Cardio' },
    { value: 'yoga', label: 'Yoga' },
    { value: 'pilates', label: 'Pilates' },
    { value: 'crossfit', label: 'Crossfit' },
    { value: 'boxing', label: 'Boxeo' },
    { value: 'dance', label: 'Baile' },
    { value: 'swimming', label: 'Natación' },
    { value: 'nutrition', label: 'Nutrición' },
    { value: 'rehabilitation', label: 'Rehabilitación' },
    { value: 'senior_fitness', label: 'Fitness para Adultos Mayores' },
    { value: 'youth_fitness', label: 'Fitness Juvenil' },
  ];

  const positionOptions = [
    { value: 'trainer', label: 'Entrenador' },
    { value: 'senior_trainer', label: 'Entrenador Senior' },
    { value: 'head_trainer', label: 'Entrenador Principal' },
    { value: 'manager', label: 'Gerente' },
  ];

  const onSubmit = async (data) => {
    try {
      // Here you would call the API to update the trainer profile
      // await trainersAPI.update(user.id, data);
      updateUser(data);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  const getPositionText = (position) => {
    const option = positionOptions.find(opt => opt.value === position);
    return option ? option.label : position;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
            <p className="mt-2 text-gray-600">
              Gestiona tu información profesional
            </p>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="btn-primary"
          >
            {isEditing ? 'Cancelar' : 'Editar Perfil'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile Overview */}
        <div className="lg:col-span-1">
          <div className="card">
            <div className="card-body text-center">
              <div className="mx-auto h-24 w-24 rounded-full bg-primary-100 flex items-center justify-center">
                <UserIcon className="h-12 w-12 text-primary-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                {user?.firstName} {user?.lastName}
              </h3>
              <p className="text-sm text-gray-500">{user?.email}</p>
              
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Posición:</span>
                  <span className="font-medium">
                    {getPositionText(user?.position)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">ID Empleado:</span>
                  <span className="font-medium">{user?.employeeId}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Tarifa por hora:</span>
                  <span className="font-medium">${user?.hourlyRate}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Clases totales:</span>
                  <span className="font-medium">{user?.totalClasses || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Horas enseñadas:</span>
                  <span className="font-medium">{user?.totalHours || 0}</span>
                </div>
                {user?.rating && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Calificación:</span>
                    <div className="flex items-center">
                      <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                      <span className="font-medium">
                        {user.rating.average?.toFixed(1)} ({user.rating.count})
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">
                  Información Personal
                </h3>
              </div>
              <div className="card-body space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="label">Nombre</label>
                    <input
                      {...register('firstName', { required: 'El nombre es requerido' })}
                      type="text"
                      disabled={!isEditing}
                      className={`input ${!isEditing ? 'bg-gray-50' : ''} ${errors.firstName ? 'input-error' : ''}`}
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-error-600">{errors.firstName.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="label">Apellido</label>
                    <input
                      {...register('lastName', { required: 'El apellido es requerido' })}
                      type="text"
                      disabled={!isEditing}
                      className={`input ${!isEditing ? 'bg-gray-50' : ''} ${errors.lastName ? 'input-error' : ''}`}
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-error-600">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="label">Correo Electrónico</label>
                  <input
                    {...register('email', { 
                      required: 'El correo es requerido',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Correo electrónico inválido',
                      },
                    })}
                    type="email"
                    disabled={!isEditing}
                    className={`input ${!isEditing ? 'bg-gray-50' : ''} ${errors.email ? 'input-error' : ''}`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-error-600">{errors.email.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="label">Teléfono</label>
                    <input
                      {...register('phone', { required: 'El teléfono es requerido' })}
                      type="tel"
                      disabled={!isEditing}
                      className={`input ${!isEditing ? 'bg-gray-50' : ''} ${errors.phone ? 'input-error' : ''}`}
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-error-600">{errors.phone.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="label">Tarifa por Hora</label>
                    <input
                      {...register('hourlyRate', { 
                        required: 'La tarifa por hora es requerida',
                        min: { value: 0, message: 'La tarifa debe ser positiva' }
                      })}
                      type="number"
                      step="0.01"
                      disabled={!isEditing}
                      className={`input ${!isEditing ? 'bg-gray-50' : ''} ${errors.hourlyRate ? 'input-error' : ''}`}
                    />
                    {errors.hourlyRate && (
                      <p className="mt-1 text-sm text-error-600">{errors.hourlyRate.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="label">Posición</label>
                  <select
                    {...register('position', { required: 'La posición es requerida' })}
                    disabled={!isEditing}
                    className={`input ${!isEditing ? 'bg-gray-50' : ''} ${errors.position ? 'input-error' : ''}`}
                  >
                    {positionOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.position && (
                    <p className="mt-1 text-sm text-error-600">{errors.position.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">
                  Información Profesional
                </h3>
              </div>
              <div className="card-body space-y-4">
                <div>
                  <label className="label">Biografía</label>
                  <textarea
                    {...register('bio')}
                    rows="4"
                    disabled={!isEditing}
                    className={`input ${!isEditing ? 'bg-gray-50' : ''}`}
                    placeholder="Cuéntanos sobre tu experiencia y especialidades..."
                  />
                </div>

                <div>
                  <label className="label">Especialidades</label>
                  <div className="grid grid-cols-2 gap-3">
                    {specialtiesOptions.map((specialty) => (
                      <label key={specialty.value} className="flex items-center">
                        <input
                          {...register('specialties')}
                          type="checkbox"
                          value={specialty.value}
                          disabled={!isEditing}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded disabled:bg-gray-50"
                        />
                        <span className="ml-2 text-sm text-gray-700">{specialty.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            {isEditing && (
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn-outline"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Guardar Cambios
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default TrainerProfile;
