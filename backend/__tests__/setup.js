import mongoose from "mongoose";

// Cerrar conexión después de todos los tests
afterAll(async () => {
  await mongoose.connection.close();
});
