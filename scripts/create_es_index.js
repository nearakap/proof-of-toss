import appConfig from '../src/data/config.json';

import log4js from 'log4js';
var argv = require('yargs-parser')(process.argv.slice(2));

log4js.configure({
  appenders: {
    elasticsearch: { type: 'stdout' },
  },
  categories: { default: { appenders: ['elasticsearch'], level: 'debug' } }
});

const logger = log4js.getLogger('elasticsearch');

import AwsEsClient from '../src/util/esClient';

const esClient = new AwsEsClient(
  { log: 'error' },
  appConfig.elasticsearch.esNode,
  appConfig.elasticsearch.region,
  appConfig.elasticsearch.accessKeyId,
  appConfig.elasticsearch.secretAccessKey,
  appConfig.elasticsearch.useSSL
);

const tagMapping = {
  'properties': {
    'name': {'type': 'text'},
    'locale': {'type': 'keyword'},
  }
};

const eventMapping = {
  'properties': {
    'name': {'type': 'text'},
    'description': {'type': 'text'},
    'address': {'type': 'keyword'},
    'createdBy': {'type': 'keyword'},
    'createdAt': {'type': 'date'},
    'locale': {'type': 'keyword'},
    'category': {'type': 'keyword'},
    'startDate': {'type': 'date'},
    'endDate': {'type': 'date'},
    'sourceUrl': {'type': 'text'},
    'tag': {'type': 'nested'},
  }
};

(async (callback) => {
  const fatal = function() {
    let _fatal = logger.fatal.bind(logger);

    for (let key in arguments) {
      if (arguments.hasOwnProperty(key)) {
        _fatal = _fatal.bind(logger, arguments[key]);
      }
    }

    _fatal();

    callback();
    process.exit(1);
  };

  const createIndex = async (force = false) => {
    try {
      let eventIndexExists = await esClient.indices.exists({index: 'toss_event'});
      let tagIndexExists = await esClient.indices.exists({index: 'toss_tag'});

      if (eventIndexExists && force) {
        await esClient.indices.delete({index: 'toss_event'});
        eventIndexExists = false;
      }
      if (tagIndexExists && force) {
        await esClient.indices.delete({index: 'toss_tag'});
        tagIndexExists = false;
      }

      eventIndexExists || await esClient.indices.create({
        index: 'toss_event',
        body: {
          'mappings': {
            'event': eventMapping,
          }
        },
      });

      tagIndexExists || await esClient.indices.create({
        index: 'toss_tag',
        body: {
          'mappings': {
            'tag': tagMapping,
          }
        },
      });
    } catch (error) {
      fatal(error, 'failed to create index! exiting');
    }
  };

  const updateMappings = async () => {
    try {
      await esClient.indices.putMapping({
        index: 'toss_tag',
        type: 'tag',
        body: tagMapping,
      });

      await esClient.indices.putMapping({
        index: 'toss_event',
        type: 'event',
        body: eventMapping,
      });
    } catch (error) {
      fatal(error, 'failed to update mappings! exiting');
    }
  };

  await esClient.ping({
    // ping usually has a 3000ms timeout
    requestTimeout: 5000
  }).then(() => {
    logger.info('elasticsearch cluster is up');
  }).catch((error) => {
    fatal(error, 'elasticsearch cluster is down! exiting');
  });

  await createIndex(argv['force'] === true);
  await updateMappings();

})(() => { logger.trace('Exit...'); }).catch((error) => { logger.fatal(error); });