import mongoose from "mongoose";

// Cerrar conexión después de todos los tests
afterAll(async () => {
  // Cerrar todas las conexiones de mongoose
  await mongoose.disconnect();

  // Dar tiempo para que se cierren las operaciones pendientes
  await new Promise((resolve) => setTimeout(resolve, 500));
});
