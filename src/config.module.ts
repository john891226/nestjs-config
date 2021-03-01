import { ConfigService } from './services/config.service';
import { DynamicModule } from '@nestjs/common';
import { ConfigOptions } from './types/config.interface';
import { DEFAULT_CONFIG_OPTIONS } from './defaults/default.config';
import { ModuleConfigOptions } from './types/moduleConfig.interface';
import { isArray } from 'lodash';

function defaultConfig(config?: ConfigOptions) {
  return { ...DEFAULT_CONFIG_OPTIONS, ...(config ?? {}) };
}

export class ConfigModule {
  static forRoot(config?: ConfigOptions): DynamicModule {
    config = defaultConfig(config);

    return {
      global: config.global,
      module: ConfigModule,
      providers: [
        ConfigService,
        {
          provide: ConfigService,
          async useFactory() {
            return await ConfigService.initialize(config);
          },
        },
        {
          provide: 'CONFIG',
          useExisting: ConfigService,
        },
      ],
      exports: [ConfigService],
    };
  }

  static async forModule(
    moduleName: string | string[],
    config?: ModuleConfigOptions,
  ): Promise<DynamicModule> {
    const modules = isArray(moduleName) ? moduleName : [moduleName];

    return {
      module: ConfigModule,
      providers: modules.map((m) => ({
        provide: m,
        useFactory(service: ConfigService) {
          return service.initializeModule(m, config);
        },
        inject: [ConfigService],
      })),
      exports: modules,
    };
  }
}
