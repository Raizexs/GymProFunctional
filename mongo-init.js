// MongoDB initialization script
db = db.getSiblingDB('gym-pro-funcional');

// Create collections with validation
db.createCollection('clients', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['firstName', 'lastName', 'email', 'password', 'phone', 'dateOfBirth', 'gender'],
      properties: {
        firstName: { bsonType: 'string', minLength: 2, maxLength: 50 },
        lastName: { bsonType: 'string', minLength: 2, maxLength: 50 },
        email: { bsonType: 'string', pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$' },
        phone: { bsonType: 'string', pattern: '^\\+?[\\d\\s\\-\\(\\)]+$' },
        gender: { enum: ['male', 'female', 'other'] },
        membershipType: { enum: ['basic', 'premium', 'unlimited'] }
      }
    }
  }
});

db.createCollection('trainers', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['firstName', 'lastName', 'email', 'password', 'phone', 'employeeId', 'hireDate', 'hourlyRate'],
      properties: {
        firstName: { bsonType: 'string', minLength: 2, maxLength: 50 },
        lastName: { bsonType: 'string', minLength: 2, maxLength: 50 },
        email: { bsonType: 'string', pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$' },
        phone: { bsonType: 'string', pattern: '^\\+?[\\d\\s\\-\\(\\)]+$' },
        position: { enum: ['trainer', 'senior_trainer', 'head_trainer', 'manager'] },
        hourlyRate: { bsonType: 'number', minimum: 0 }
      }
    }
  }
});

db.createCollection('classes', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'description', 'category', 'difficulty', 'duration', 'capacity', 'price', 'trainer'],
      properties: {
        name: { bsonType: 'string', minLength: 3, maxLength: 100 },
        description: { bsonType: 'string', minLength: 10, maxLength: 500 },
        category: { 
          enum: ['strength_training', 'cardio', 'yoga', 'pilates', 'crossfit', 'boxing', 'dance', 'swimming', 'functional_training', 'hiit', 'spinning', 'zumba', 'body_pump', 'other']
        },
        difficulty: { enum: ['beginner', 'intermediate', 'advanced', 'all_levels'] },
        duration: { bsonType: 'number', minimum: 15, maximum: 180 },
        capacity: { bsonType: 'number', minimum: 1, maximum: 100 },
        price: { bsonType: 'number', minimum: 0 }
      }
    }
  }
});

db.createCollection('reservations', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['client', 'class', 'trainer', 'scheduledDate', 'startTime', 'endTime', 'price'],
      properties: {
        status: { enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no_show'] },
        paymentStatus: { enum: ['pending', 'paid', 'failed', 'refunded'] },
        price: { bsonType: 'number', minimum: 0 }
      }
    }
  }
});

db.createCollection('payments', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['client', 'reservation', 'amount', 'currency', 'paymentMethod', 'status', 'description'],
      properties: {
        amount: { bsonType: 'number', minimum: 0 },
        currency: { enum: ['USD', 'EUR', 'MXN', 'COP'] },
        paymentMethod: { enum: ['card', 'bank_transfer', 'cash', 'stripe', 'paypal'] },
        status: { enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'] }
      }
    }
  }
});

// Create indexes for better performance
db.clients.createIndex({ email: 1 }, { unique: true });
db.clients.createIndex({ phone: 1 });
db.clients.createIndex({ isActive: 1 });

db.trainers.createIndex({ email: 1 }, { unique: true });
db.trainers.createIndex({ employeeId: 1 }, { unique: true });
db.trainers.createIndex({ isActive: 1 });

db.classes.createIndex({ category: 1 });
db.classes.createIndex({ trainer: 1 });
db.classes.createIndex({ isActive: 1 });

db.reservations.createIndex({ client: 1 });
db.reservations.createIndex({ class: 1 });
db.reservations.createIndex({ trainer: 1 });
db.reservations.createIndex({ scheduledDate: 1, startTime: 1 });
db.reservations.createIndex({ status: 1 });

db.payments.createIndex({ client: 1 });
db.payments.createIndex({ reservation: 1 });
db.payments.createIndex({ status: 1 });
db.payments.createIndex({ stripePaymentIntentId: 1 });

print('Database initialized successfully!');
