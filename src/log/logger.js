import winston, { format } from 'winston';
const { combine, timestamp, label, printf } = format;

const myFormat = printf(info => `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`);

const logger = winston.createLogger({
  level: 'info',

  // format: winston.format.json(),
  format: combine(label({ label: 'Oneform Backend' }), timestamp(), myFormat),
  transports: [
    //
    // - Write to all logs with level `info` and below to `combined.log`
    // - Write all logs error (and below) to `error.log`.
    //
    new winston.transports.File({
      filename: './src/log/error.log',
      level: 'error'
    }),
    new winston.transports.File({ filename: './src/log/combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple()
    })
  );
}

const customLogger = {};

customLogger.error = function error (message) {
  if (process.env.NODE_ENV === 'production') {
    logger.error(message);
  } else {
    console.log(message);
  }
};

customLogger.info = function info (message) {
  if (process.env.NODE_ENV === 'production') {
    logger.info(message);
  } else {
    console.log(message);
  }
};

export default customLogger;
