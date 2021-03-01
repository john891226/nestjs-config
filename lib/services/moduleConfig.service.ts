import { ModuleConfigOptions } from "../types/moduleConfig.interface";
import { isObject as obj } from "lodash";
import { ConfigModule } from "../config.module";
import { ConfigService } from "./config.service";
import { DEFAULT_CONFIG_OPTIONS } from "../defaults/default.config";

export class ModuleConfigService {
  readonly config: object;

  constructor(vars: object, property: string, config?: ModuleConfigOptions) {
    config = { ...DEFAULT_CONFIG_OPTIONS, ...(config ?? {}) };
    this.config = this.createPrototypeChain(vars, property.split("."));
    if (config.schema) {
      const valid = ConfigService.validateSchema(
        config.schema,
        this.config,
        `ModuleConfig.${property}`
      );
    }
  }

  createPrototypeChain(root: object, path: string[]) {
    const prop = path.shift();
    if (!prop) return {};
    if (!(prop in root)) throw new Error(`Missing property: ${prop}`);

    if (!obj(root[prop]))
      throw new Error(`Property: ${prop}, is not an object`);

    let scope = root[prop];
    for (const key in scope) {
      if (
        Object.prototype.hasOwnProperty.call(scope, key) &&
        Object.prototype.hasOwnProperty.call(root, key) &&
        obj(scope[key]) &&
        obj(root[key])
      ) {
        scope[key] = this.extend(scope[key], root[key]);
      }
    }

    this.extend(scope, root);

    if (path.length == 0) return scope;
    else {
      return this.createPrototypeChain(scope, path);
    }
  }

  private extend(child: object, parent: object): object {
    return Object.setPrototypeOf(child, parent);
  }
}
