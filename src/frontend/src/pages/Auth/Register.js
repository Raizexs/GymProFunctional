import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState('client');
  const { register: registerUser, loading } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    const result = await registerUser({ ...data, userType });
    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 text-center">
          Crear Cuenta
        </h2>
        <p className="mt-2 text-sm text-gray-600 text-center">
          Únete a Gym Pro Funcional
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        {/* User Type Selection */}
        <div>
          <label className="label">Tipo de Usuario</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setUserType('client')}
              className={`p-3 text-sm font-medium rounded-md border ${
                userType === 'client'
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Cliente
            </button>
            <button
              type="button"
              onClick={() => setUserType('trainer')}
              className={`p-3 text-sm font-medium rounded-md border ${
                userType === 'trainer'
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Entrenador
            </button>
          </div>
        </div>

        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="label">
              Nombre
            </label>
            <input
              {...register('firstName', {
                required: 'El nombre es requerido',
                minLength: {
                  value: 2,
                  message: 'El nombre debe tener al menos 2 caracteres',
                },
              })}
              type="text"
              autoComplete="given-name"
              className={`input ${errors.firstName ? 'input-error' : ''}`}
              placeholder="Tu nombre"
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-error-600">{errors.firstName.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="lastName" className="label">
              Apellido
            </label>
            <input
              {...register('lastName', {
                required: 'El apellido es requerido',
                minLength: {
                  value: 2,
                  message: 'El apellido debe tener al menos 2 caracteres',
                },
              })}
              type="text"
              autoComplete="family-name"
              className={`input ${errors.lastName ? 'input-error' : ''}`}
              placeholder="Tu apellido"
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-error-600">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="label">
            Correo Electrónico
          </label>
          <input
            {...register('email', {
              required: 'El correo electrónico es requerido',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Correo electrónico inválido',
              },
            })}
            type="email"
            autoComplete="email"
            className={`input ${errors.email ? 'input-error' : ''}`}
            placeholder="tu@email.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-error-600">{errors.email.message}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="label">
            Teléfono
          </label>
          <input
            {...register('phone', {
              required: 'El teléfono es requerido',
              pattern: {
                value: /^\+?[\d\s\-\(\)]+$/,
                message: 'Número de teléfono inválido',
              },
            })}
            type="tel"
            autoComplete="tel"
            className={`input ${errors.phone ? 'input-error' : ''}`}
            placeholder="+1 (555) 123-4567"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-error-600">{errors.phone.message}</p>
          )}
        </div>

        {/* Date of Birth */}
        <div>
          <label htmlFor="dateOfBirth" className="label">
            Fecha de Nacimiento
          </label>
          <input
            {...register('dateOfBirth', {
              required: 'La fecha de nacimiento es requerida',
            })}
            type="date"
            className={`input ${errors.dateOfBirth ? 'input-error' : ''}`}
          />
          {errors.dateOfBirth && (
            <p className="mt-1 text-sm text-error-600">{errors.dateOfBirth.message}</p>
          )}
        </div>

        {/* Gender */}
        <div>
          <label className="label">Género</label>
          <select
            {...register('gender', {
              required: 'El género es requerido',
            })}
            className={`input ${errors.gender ? 'input-error' : ''}`}
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

        {/* Emergency Contact */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Contacto de Emergencia</h3>
          
          <div>
            <label htmlFor="emergencyContact.name" className="label">
              Nombre del Contacto
            </label>
            <input
              {...register('emergencyContact.name', {
                required: 'El nombre del contacto de emergencia es requerido',
              })}
              type="text"
              className={`input ${errors.emergencyContact?.name ? 'input-error' : ''}`}
              placeholder="Nombre completo"
            />
            {errors.emergencyContact?.name && (
              <p className="mt-1 text-sm text-error-600">
                {errors.emergencyContact.name.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="emergencyContact.phone" className="label">
              Teléfono del Contacto
            </label>
            <input
              {...register('emergencyContact.phone', {
                required: 'El teléfono del contacto de emergencia es requerido',
                pattern: {
                  value: /^\+?[\d\s\-\(\)]+$/,
                  message: 'Número de teléfono inválido',
                },
              })}
              type="tel"
              className={`input ${errors.emergencyContact?.phone ? 'input-error' : ''}`}
              placeholder="+1 (555) 123-4567"
            />
            {errors.emergencyContact?.phone && (
              <p className="mt-1 text-sm text-error-600">
                {errors.emergencyContact.phone.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="emergencyContact.relationship" className="label">
              Relación
            </label>
            <input
              {...register('emergencyContact.relationship', {
                required: 'La relación es requerida',
              })}
              type="text"
              className={`input ${errors.emergencyContact?.relationship ? 'input-error' : ''}`}
              placeholder="Ej: Padre, Madre, Esposo/a, Hermano/a"
            />
            {errors.emergencyContact?.relationship && (
              <p className="mt-1 text-sm text-error-600">
                {errors.emergencyContact.relationship.message}
              </p>
            )}
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="label">
            Contraseña
          </label>
          <div className="relative">
            <input
              {...register('password', {
                required: 'La contraseña es requerida',
                minLength: {
                  value: 6,
                  message: 'La contraseña debe tener al menos 6 caracteres',
                },
              })}
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              className={`input pr-10 ${errors.password ? 'input-error' : ''}`}
              placeholder="Mínimo 6 caracteres"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5 text-gray-400" />
              ) : (
                <EyeIcon className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-error-600">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="label">
            Confirmar Contraseña
          </label>
          <input
            {...register('confirmPassword', {
              required: 'Confirma tu contraseña',
              validate: (value) =>
                value === password || 'Las contraseñas no coinciden',
            })}
            type="password"
            autoComplete="new-password"
            className={`input ${errors.confirmPassword ? 'input-error' : ''}`}
            placeholder="Confirma tu contraseña"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-error-600">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Terms and Conditions */}
        <div className="flex items-center">
          <input
            {...register('acceptTerms', {
              required: 'Debes aceptar los términos y condiciones',
            })}
            id="acceptTerms"
            type="checkbox"
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-900">
            Acepto los{' '}
            <Link to="/terms" className="text-primary-600 hover:text-primary-500">
              términos y condiciones
            </Link>{' '}
            y la{' '}
            <Link to="/privacy" className="text-primary-600 hover:text-primary-500">
              política de privacidad
            </Link>
          </label>
        </div>
        {errors.acceptTerms && (
          <p className="text-sm text-error-600">{errors.acceptTerms.message}</p>
        )}

        {/* Submit button */}
        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary btn-lg"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="loading-spinner mr-2"></div>
                Creando cuenta...
              </div>
            ) : (
              'Crear Cuenta'
            )}
          </button>
        </div>

        {/* Login link */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            ¿Ya tienes una cuenta?{' '}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Register;
