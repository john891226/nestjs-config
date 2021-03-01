import { ParsedPath } from 'path';
import { ConfigOptions } from '../types/config.interface';

export interface ConfigLoader {
  setOptions(options: ConfigOptions): void;
  readable(path: string): boolean;
  read(filePath: string): object;
  expandable(file: ParsedPath, directory: ParsedPath): boolean;
}
