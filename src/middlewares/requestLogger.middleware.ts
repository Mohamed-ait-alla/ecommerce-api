import morgan, { type StreamOptions } from "morgan";
import { logger } from "../utils/logger.js";
import { env } from "../validators/env.validator.js";

const stream: StreamOptions = {
    write: (message) => logger.info(message.trim()),
};

const skip = () => env.NODE_ENV === 'test';

export const requestLogger = morgan(
    env.NODE_ENV === 'production' ? 'combined' : 'dev',
    {
        stream,
        skip,
    },
);
