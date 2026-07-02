import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { env } from './env';
import { RequestContext } from '../shared/context/requestContext';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const level = () => {
  const isDevelopment = env.NODE_ENV === 'development';
  return isDevelopment ? 'debug' : 'info';
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// Custom format to automatically pull requestId and correlationId from context
const contextFormat = winston.format((info) => {
  const context = RequestContext.current();
  if (context) {
    info.requestId = context.requestId;
    info.correlationId = context.correlationId;
    if (context.user) {
      info.userId = context.user.id;
      info.userRole = context.user.role;
    }
  }
  return info;
});

const format = winston.format.combine(
  contextFormat(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const consoleFormat = winston.format.printf(
  (info) => {
    const reqId = info.requestId as string | undefined;
    const userId = info.userId as string | undefined;
    const ctxString = reqId ? ` [ReqID: ${reqId.substring(0, 8)}]` : '';
    const userString = userId ? ` [User: ${userId.substring(0, 8)} (${info.userRole})]` : '';
    return `[${info.timestamp}] [${info.level}]:${ctxString}${userString} ${info.message}${info.stack ? `\n${info.stack}` : ''}`;
  }
);

const transports: winston.transport[] = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize({ all: true }),
      consoleFormat
    ),
  }),
  new DailyRotateFile({
    filename: 'logs/error-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    level: 'error',
  }),
  new DailyRotateFile({
    filename: 'logs/combined-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
  }),
];

export const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
});

export default logger;
