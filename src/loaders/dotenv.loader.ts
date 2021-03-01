import { ConfigLoader } from './loaders.interfaces';
import * as path from 'path';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { ConfigOptions } from '../types/config.interface';
import * as _ from 'lodash';
import * as dotenv from 'dotenv';

export class EnvConfigLoader implements ConfigLoader {
  fileNames: string[];
  active: boolean;

  expandable(file: path.ParsedPath, directory: path.ParsedPath): boolean {
    return true;
  }
  setOptions(options: ConfigOptions): void {
    this.active = !options.ignoreEnvFile;
    this.fileNames = _.isArray(options.envFilePath)
      ? options.envFilePath
      : [options.envFilePath];
  }
  readable(filePath: string): boolean {
    if (!this.active) return false;

    const fExt = path.parse(filePath);
    return this.fileNames.indexOf(fExt.name) != -1;
  }
  read(filePath: string): object {
    return dotenv.parse(fs.readFileSync(filePath));
  }
}
