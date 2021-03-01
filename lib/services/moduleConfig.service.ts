import { ModuleConfigOptions } from "../types/moduleConfig.interface";
import { isObject as obj } from "lodash";
import { ConfigService } from "./config.service";
import { DEFAULT_CONFIG_OPTIONS } from "../defaults/default.config";

export class ModuleConfigService {
  config: object;

  constructor(
    private internal_config: object,
    private property: string,
    private options?: ModuleConfigOptions
  ) {
    options = { ...DEFAULT_CONFIG_OPTIONS, ...(options ?? {}) };
  }

  async initialize() {
    this.config = this.createPrototypeChain(
      this.internal_config,
      this.property.split(".")
    );
    if (this.options.schema) {
      this.config = await ConfigService.validateSchema(
        this.options.schema,
        this.config,
        `ModuleConfig.${this.property}`
      );
    }
    Object.freeze(this.config);
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
