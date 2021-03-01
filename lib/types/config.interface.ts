import { Schema } from 'joi';

export interface ConfigOptions {
  /**
   *  If "true", defines module as global
   */
  global?: boolean;
  /**
   *  Base project folder for all relative folders defaults to proccess.cwd()
   */
  base?: string;
  /**
   *  Configuration foldername ( {base}/{dir} ) to search all config files
   */
  dir?: string;
  /**
   * Class used to validate project configuration schema using class-validator
   */
  schema?: Schema;
  /**
   * If "true", ignores search on system environment vars
   */
  ignoreEnvVars?: boolean;
  /**
   * If "true", enables caching envars loading from proccess.env
   */
  cache?: boolean;
  /**
   * If "true", disable loading .env|{envFilePath} envars files to configuration object
   */
  ignoreEnvFile?: false;
  /**
   * Envfiles names to load into configuration ex: [.development, .env,] | .env
   */
  envFilePath?: string | string[];
}
