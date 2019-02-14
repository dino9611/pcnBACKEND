require('dotenv').config();
import bearerToken from 'express-bearer-token';
import bodyParser from 'body-parser';
import cluster from 'cluster';
import express from 'express';
import logger from './log/logger';
import os from 'os';
import {
  AdminRouter,
  HiringPartnerRouter,
  LoginRouter,
  StudentRouter
} from './router';

const workers = os.cpus().length;

if (cluster.isMaster) {
  for (let i = 0; i < workers; ++i) {
    cluster.fork();
  }

  cluster.on('exit', () => {
    cluster.fork();
  });
} else {
  const app = express();
  const port = process.env.PORT || 8080;

  app.set('etag', false);
  app.use((req, res, next) => {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, Accept, Accept-Version, Authorization, Content-Length, Cache-Control, Content-MD5, Content-Type, Date, X-Api-Version, X-Response-Time, X-PINGOTHER, X-CSRF-Token'
    );
    next();
  });

  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use(bearerToken());
  app.use(express.static('./src/public'));

  app.get('/', (req, res) => {
    res.send(
      `Welcome to "Purwadhika Career Network API version : ${
        process.env.VERSION
      }"`
    );
  });

  // list of router
  app.use('/admins', AdminRouter);
  app.use('/hiringpartners', HiringPartnerRouter);
  app.use('/students', StudentRouter);
  app.use('/logins', LoginRouter);

  // list of router

  app.listen(port, '0.0.0.0', () => {
    // console.log(`App running on port ${port}`);
  });
}

process.on('uncaughtException', error => {
  logger.error(JSON.stringify(error));
  process.exit(1);
});

process.on('unhandledRejection', error => {
  logger.error(JSON.stringify(error.message));
  process.exit(1);
});
