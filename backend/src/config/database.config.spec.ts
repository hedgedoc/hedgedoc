import mockedEnv from 'mocked-env';

import dbConfig from './database.config';

describe('databaseConfig', () => {
  const dbName = 'test_DB';
  const dbPass = 'password';
  const dbPort = '5432';
  const dbHost = 'localhost';
  const dbUser = 'user_DB';
  const dbType = 'postgres';

  const databaseConfig = {
    HD_DATABASE_TYPE: dbType,
    HD_DATABASE_NAME: dbName,
    HD_DATABASE_PASS: dbPass,
    HD_DATABASE_PORT: dbPort,
    HD_DATABASE_HOST: dbHost,
    HD_DATABASE_USER: dbUser,
  };

  describe('is correctly parsed', () => {
    it('when default database config is passed', () => {
      const restore = mockedEnv(databaseConfig, {
        clear: true,
      });

      const config = dbConfig();

      expect(config.database).toEqual(dbName);
      expect(config.host).toEqual(dbHost);
      expect(config.password).toEqual(dbPass);
      expect(String(config.port)).toEqual(dbPort);
      expect(config.type).toEqual(dbType);
      expect(config.username).toEqual(dbUser);

      restore();
    });

    it('when HD_DATABASE_SSL_ENABLED is true', () => {
      const needsSSL = true;
      const tlsCa = './test/private-api/fixtures/hedgedoc.pem';
      const tlsCaContent = ['test-cert\n'];
      const shouldRejectUnAuth = true;
      const sslCiphers = 'TLS_AES_256...';
      const maxSSLVersion = 'TLSv1.3';
      const minSSLVersion = 'TLSv1';
      const passphrase = 'XSX@W...';

      const tlsConfig = {
        HD_DATABASE_SSL_ENABLED: String(needsSSL),
        HD_DATABASE_SSL_CA_PATH: tlsCa,
        HD_DATABASE_SSL_CERT_PATH: tlsCa,
        HD_DATABASE_SSL_KEY_PATH: tlsCa,
        HD_DATABASE_SSL_REJECT_UNAUTHORIZED: String(shouldRejectUnAuth),
        HD_DATABASE_SSL_CIPHERS: sslCiphers,
        HD_DATABASE_SSL_MAX_VERSION: maxSSLVersion,
        HD_DATABASE_SSL_MIN_VERSION: minSSLVersion,
        HD_DATABASE_SSL_PASSPHRASE: passphrase,
      };

      const envs = {
        ...databaseConfig,
        ...tlsConfig,
      };
      const restore = mockedEnv(envs, { clear: true });
      const config = dbConfig();
      console.log({ config: config });

      expect(config.ssl?.ca).toEqual(tlsCaContent);
      expect(config.ssl?.ciphers).toBe(sslCiphers);
      expect(config.ssl?.key).toBe(tlsCaContent);
      expect(config.ssl?.maxVersion).toBe(maxSSLVersion);
      expect(config.ssl?.minVersion).toBe(minSSLVersion);
      expect(config.ssl?.cert).toBe(tlsCaContent);
      expect(config.ssl?.passphrase).toBe(passphrase);
      expect(config.ssl?.rejectUnauthorized).toBe(shouldRejectUnAuth);
      //       expect(config.ssl).toBeTruthy();

      restore();
    });
  });
});
