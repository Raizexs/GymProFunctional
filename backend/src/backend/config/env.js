import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Obtener __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar .env desde la raíz del proyecto backend (sube 3 niveles: config -> backend -> src -> backend)
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

// Exportar por si se necesita
export default process.env;
