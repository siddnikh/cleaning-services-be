const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.colorize(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} ${level}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/app.log' })
  ]
});

const dbLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, message }) => {
      return `${timestamp} DB: ${message}`;
    }),
    winston.format.colorize({ all: true, colors: { info: 'blue' } })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/db.log' })
  ]
});

module.exports = { logger, dbLogger };
