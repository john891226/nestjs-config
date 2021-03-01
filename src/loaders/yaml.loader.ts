import { ConfigLoader } from './loaders.interfaces';
import * as path from 'path';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { ConfigOptions } from '../types/config.interface';

export class YamlConfigLoader implements ConfigLoader {
  expandable(file: path.ParsedPath, directory: path.ParsedPath): boolean {
    return file.name == directory.name;
  }
  setOptions(options: ConfigOptions): void {}
  readable(filePath: string): boolean {
    const fStat = fs.statSync(filePath);
    const fExt = path.extname(filePath).toLowerCase();
    return fStat.isFile() && (fExt == '.yml' || fExt == '.yaml'); //
  }
  read(filePath: string): object {
    if (!fs.existsSync(filePath)) throw new Error(`Missing file: ${filePath}`);

    try {
      return yaml.load(fs.readFileSync(filePath, 'utf-8')) as object;
    } catch (e) {
      const as = 6; //
    }
  }
}
