import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Definir formato personalizado
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Formato para consola
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

// Transport para errores (rotación diaria)
const errorFileTransport = new DailyRotateFile({
  filename: path.join(__dirname, "../../../logs/error-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  level: "error",
  maxFiles: "30d",
  maxSize: "20m",
  format: customFormat,
});

// Transport para todos los logs (rotación diaria)
const combinedFileTransport = new DailyRotateFile({
  filename: path.join(__dirname, "../../../logs/combined-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  maxFiles: "14d",
  maxSize: "20m",
  format: customFormat,
});

// Transport para consola
const consoleTransport = new winston.transports.Console({
  format: consoleFormat,
});

// Crear logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  transports: [errorFileTransport, combinedFileTransport],
  // No agregar consola en producción
  silent: false,
});

// Agregar consola solo en desarrollo
if (process.env.NODE_ENV !== "production") {
  logger.add(consoleTransport);
}

// Stream para Morgan (HTTP logging)
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

export default logger;
