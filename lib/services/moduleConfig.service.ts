import { ModuleConfigOptions } from "../types/moduleConfig.interface";
import { isObject as obj } from "lodash";
import { ConfigService } from "./config.service";
import { DEFAULT_CONFIG_OPTIONS } from "../defaults/default.config";

export class ModuleConfigService {
  config: object;
  private internal_config: object;

  constructor(
    private owner: ConfigService,
    private initial_config: object,
    private property: string,
    private options?: ModuleConfigOptions
  ) {
    this.options = { ...DEFAULT_CONFIG_OPTIONS, ...(options ?? {}) };
  }

  async initialize() {
    this.internal_config = this.createPrototypeChain(
      this.initial_config,
      this.property.split(".")
    );
    if (this.options.schema) {
      this.internal_config = await ConfigService.validateSchema(
        this.options.schema,
        this.config,
        `ModuleConfig.${this.property}`
      );
    }
    // this.config = cfg;
    this.config = new Proxy(this, {
      get(t, p: string) {
        let vars = t.internal_config[p] ?? t.owner.getEnvVar(p);
        if (vars == null || vars == undefined)
          throw new Error(`Missing property: "${p}"`);
        return vars;
      },
    });
  }

  createPrototypeChain(root: object, path: string[]): object {
    const prop = path.shift();
    if (!prop) return root;
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
