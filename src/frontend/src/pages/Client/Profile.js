import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';
import { 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  CalendarIcon,
  HeartIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const Profile = () => {
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
      dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
      gender: user?.gender || '',
      fitnessGoals: user?.fitnessGoals || [],
      emergencyContact: user?.emergencyContact || {
        name: '',
        phone: '',
        relationship: '',
      },
    },
  });

  const fitnessGoalsOptions = [
    { value: 'weight_loss', label: 'Pérdida de peso' },
    { value: 'muscle_gain', label: 'Ganancia de músculo' },
    { value: 'endurance', label: 'Resistencia' },
    { value: 'flexibility', label: 'Flexibilidad' },
    { value: 'strength', label: 'Fuerza' },
    { value: 'general_fitness', label: 'Fitness general' },
  ];

  const onSubmit = async (data) => {
    try {
      // Here you would call the API to update the user profile
      // await clientsAPI.update(user.id, data);
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

  const getGenderText = (gender) => {
    switch (gender) {
      case 'male':
        return 'Masculino';
      case 'female':
        return 'Femenino';
      case 'other':
        return 'Otro';
      default:
        return gender;
    }
  };

  const getMembershipText = (membership) => {
    switch (membership) {
      case 'basic':
        return 'Básica';
      case 'premium':
        return 'Premium';
      case 'unlimited':
        return 'Ilimitada';
      default:
        return membership;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
            <p className="mt-2 text-gray-600">
              Gestiona tu información personal y preferencias
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
                  <span className="text-gray-500">Membresía:</span>
                  <span className="font-medium">
                    {getMembershipText(user?.membershipType)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Miembro desde:</span>
                  <span className="font-medium">
                    {user?.membershipStartDate ? 
                      new Date(user.membershipStartDate).toLocaleDateString('es-ES') : 
                      'N/A'
                    }
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Clases totales:</span>
                  <span className="font-medium">{user?.totalWorkouts || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Horas entrenadas:</span>
                  <span className="font-medium">{user?.totalHours || 0}</span>
                </div>
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
                    <label className="label">Fecha de Nacimiento</label>
                    <input
                      {...register('dateOfBirth', { required: 'La fecha de nacimiento es requerida' })}
                      type="date"
                      disabled={!isEditing}
                      className={`input ${!isEditing ? 'bg-gray-50' : ''} ${errors.dateOfBirth ? 'input-error' : ''}`}
                    />
                    {errors.dateOfBirth && (
                      <p className="mt-1 text-sm text-error-600">{errors.dateOfBirth.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="label">Género</label>
                  <select
                    {...register('gender', { required: 'El género es requerido' })}
                    disabled={!isEditing}
                    className={`input ${!isEditing ? 'bg-gray-50' : ''} ${errors.gender ? 'input-error' : ''}`}
                  >
                    <option value="">Selecciona tu género</option>
                    <option value="male">Masculino</option>
                    <option value="female">Femenino</option>
                    <option value="other">Otro</option>
                  </select>
                  {errors.gender && (
                    <p className="mt-1 text-sm text-error-600">{errors.gender.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Fitness Goals */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">
                  Objetivos de Fitness
                </h3>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-2 gap-3">
                  {fitnessGoalsOptions.map((goal) => (
                    <label key={goal.value} className="flex items-center">
                      <input
                        {...register('fitnessGoals')}
                        type="checkbox"
                        value={goal.value}
                        disabled={!isEditing}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded disabled:bg-gray-50"
                      />
                      <span className="ml-2 text-sm text-gray-700">{goal.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">
                  Contacto de Emergencia
                </h3>
              </div>
              <div className="card-body space-y-4">
                <div>
                  <label className="label">Nombre del Contacto</label>
                  <input
                    {...register('emergencyContact.name', { required: 'El nombre del contacto es requerido' })}
                    type="text"
                    disabled={!isEditing}
                    className={`input ${!isEditing ? 'bg-gray-50' : ''} ${errors.emergencyContact?.name ? 'input-error' : ''}`}
                  />
                  {errors.emergencyContact?.name && (
                    <p className="mt-1 text-sm text-error-600">{errors.emergencyContact.name.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="label">Teléfono del Contacto</label>
                    <input
                      {...register('emergencyContact.phone', { required: 'El teléfono del contacto es requerido' })}
                      type="tel"
                      disabled={!isEditing}
                      className={`input ${!isEditing ? 'bg-gray-50' : ''} ${errors.emergencyContact?.phone ? 'input-error' : ''}`}
                    />
                    {errors.emergencyContact?.phone && (
                      <p className="mt-1 text-sm text-error-600">{errors.emergencyContact.phone.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="label">Relación</label>
                    <input
                      {...register('emergencyContact.relationship', { required: 'La relación es requerida' })}
                      type="text"
                      disabled={!isEditing}
                      className={`input ${!isEditing ? 'bg-gray-50' : ''} ${errors.emergencyContact?.relationship ? 'input-error' : ''}`}
                    />
                    {errors.emergencyContact?.relationship && (
                      <p className="mt-1 text-sm text-error-600">{errors.emergencyContact.relationship.message}</p>
                    )}
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

export default Profile;
