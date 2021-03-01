import { ConfigLoader } from './loaders.interfaces';
import * as path from 'path';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { ConfigOptions } from '../types/config.interface';
import * as _ from 'lodash';

export class ScriptConfigLoader implements ConfigLoader {
  options: ConfigOptions;
  expandable(file: path.ParsedPath, directory: path.ParsedPath): boolean {
    return file.name == directory.name;
  }
  setOptions(options: ConfigOptions): void {
    this.options = options;
  }
  readable(filePath: string): boolean {
    const fStat = fs.statSync(filePath);
    const fExt = path.extname(filePath).toLowerCase();
    return fStat.isFile() && fExt == '.ts';
  }
  async read(filePath: string): Promise<object> {
    const prj = this.options.base;
    const relativeFilePath = path.relative(prj, filePath);
    const fileSts = fs.statSync(filePath);
    const parsed = path.parse(filePath);
    const tsConfigBf = fs.readFileSync(path.resolve(prj, 'tsconfig.json'));
    let outDir;
    try {
      outDir = JSON.parse(tsConfigBf.toString()).compilerOptions.outDir;
    } catch (e) {
      outDir = './dist';
    }
    const scriptPath = path.resolve(
      prj,
      outDir,
      relativeFilePath.replace('.ts', ''),
    );
    let exported = (await import(scriptPath)).default;

    if (_.isFunction(exported)) {
      exported = await exported();
    }

    return exported;
  }
}
