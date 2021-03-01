import { Injectable, Logger } from '@nestjs/common';
import { ConfigOptions } from '../types/config.interface';
import * as path from 'path';
import * as fs from 'fs';
import { ConfigLoader } from '../loaders/loaders.interfaces';
import * as _ from 'lodash';
import loaders from '../loaders.config';
import { Schema } from 'joi';
import { ModuleConfigService } from './moduleConfig.service';
import { ModuleConfigOptions } from '../types/moduleConfig.interface';

@Injectable()
export class ConfigService {
  private cache: object = {};
  private modules: Record<string, ModuleConfigService> = {};
  readonly config: any;

  constructor(
    private internal_config: object = {},
    private readonly OPTIONS: ConfigOptions,
  ) {
    let th = this;

    this.config = new Proxy(this, {
      get(t, p) {
        return t.get(p as string);
      },
    });
  }

  private get(prop: string) {
    let vars = this.internal_config[prop] ?? this.getEnvVar(prop);
    if (vars == null) throw new Error(`Missing property: "${prop}"`);
    return vars;
  }

  private getEnvVar(prop: string) {
    if (this.OPTIONS.ignoreEnvVars) return null;
    const envVar = this.cache[prop] ?? process.env[prop];
    if (this.OPTIONS.cache && !!(envVar ?? false)) this.cache[prop] = envVar;
    return envVar;
  }

  initializeModule(
    module: string,
    config?: ModuleConfigOptions,
  ): ModuleConfigService {
    if (module in this.modules) return this.modules[module];

    return (this.modules[module] = new ModuleConfigService(
      this.internal_config,
      module,
      config,
    ));
  }

  static async initialize(config: ConfigOptions) {
    const absoluteDir = path.resolve(config.base, config.dir);

    let vars = {};

    if (!fs.existsSync(absoluteDir))
      Logger.debug(`Missing config folder: "${absoluteDir}"`);

    const stats = fs.statSync(absoluteDir);
    if (!stats.isDirectory())
      Logger.debug(`Path: "${absoluteDir}" isnt a folder`);

    const filesConfig = await this.read(
      absoluteDir,
      loaders.map((cls) => {
        const i = new cls();
        i.setOptions(config);
        return i;
      }),
    );

    vars = { ...vars, ...filesConfig };

    if (config.schema) {
      await this.validateSchema(config.schema, vars, 'ProjectConfig');
    }

    return new this(vars, config);
  }

  static async validateSchema(
    schema: Schema,
    value: any,
    context: string = 'ConfigModule',
  ) {
    const { error } = schema.validate(value);

    if (error) {
      Logger.error(`Invalid configuration: ${error.message}`, null, context);
      throw error;
    }

    return true;
  }

  private static async read(
    pPath: string,
    readers: Array<ConfigLoader>,
    res: object = {},
  ): Promise<object> {
    const files = fs.readdirSync(pPath);
    const pdir = path.parse(pPath);

    for (const child of files) {
      const childPath = path.resolve(pPath, child);
      const parsed = path.parse(child);
      const childStats = fs.statSync(childPath);

      if (childStats.isFile()) {
        const reader = readers.find((rd) => rd.readable(childPath));
        if (!reader) continue;

        const fileCfg = await reader.read(childPath);
        if (_.isObject(fileCfg))
          _.merge(
            res,
            reader.expandable(parsed, pdir)
              ? fileCfg
              : {
                  [parsed.name]: fileCfg,
                },
          );
      } else if (childStats.isDirectory()) {
        const dirCfg = await this.read(childPath, readers);

        if (_.isObject(dirCfg))
          _.merge(res, {
            [parsed.name]: dirCfg,
          });
      }
    }

    return res;
  }
}
