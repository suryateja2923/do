import morgan from 'morgan';
import { logger } from '../config/logger';
import { env } from '../config/env';

const stream = {
  write: (message: string) => logger.http(message.trim()),
};

const skip = () => {
  return env.NODE_ENV === 'test';
};

export const loggerMiddleware = morgan(
  ':remote-addr - :method :url :status - :response-time ms',
  { stream, skip }
);

export default loggerMiddleware;
