import mongoose from "mongoose";

// Aumentar timeout para CI
jest.setTimeout(15000);

// Cerrar conexión después de todos los tests
afterAll(async () => {
  await mongoose.connection.close();
});
