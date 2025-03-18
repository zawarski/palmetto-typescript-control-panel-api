import 'reflect-metadata';
import 'typeorm-aurora-data-api-driver';
import awsParamStore from 'aws-param-store';
import { DataSource, EntityManager } from 'typeorm';
import { palmettoConfig, paramsStoreOption } from './connection_config';

let PalmettoDataSource: DataSource;
const region = process.env.DB_REGION || 'us-east-1';

const paramsStorePalmetto = paramsStoreOption.mysql;

const getPalmettoDBConnection = async (): Promise<EntityManager> => {
  if (PalmettoDataSource && PalmettoDataSource.isInitialized) {
    console.log('Already Palmetto Connection Created! Using Same Connection!');
    return PalmettoDataSource.manager;
  } else {
    try {
      console.log('No Palmetto DB Connection Found! Creating New Connection!');
      const configFile = { ...palmettoConfig, secretArn: '', resourceArn: '' };
      const resourceArn = await awsParamStore.getParameter(paramsStorePalmetto.resourceArn, { region });
      const secretArn = await awsParamStore.getParameter(paramsStorePalmetto.secretArn, { region });
      configFile.secretArn = secretArn.Value;
      configFile.resourceArn = resourceArn.Value;
      PalmettoDataSource = new DataSource(configFile);
    } catch (error) {
      console.log('Error in creating Palmetto connection', error);
    }
    return await PalmettoDataSource.initialize()
      .then(() => {
        console.log('New Palmetto DB Created!');
        return PalmettoDataSource.manager;
      })
      .catch((e) => {
        console.debug('Error Occurred in Palmetto DB creation', e);
        throw e;
      });
  }
};

export { getPalmettoDBConnection };
