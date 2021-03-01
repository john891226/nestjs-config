import { ConfigOptions } from '../types/config.interface';

export const DEFAULT_CONFIG_OPTIONS: ConfigOptions = {
  dir: 'config',
  base: process.cwd(),
  global: true,
  ignoreEnvVars: false,
  cache: false,
  envFilePath: '.env',
  ignoreEnvFile: false,
};
