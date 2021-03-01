import { EnvConfigLoader } from './loaders/dotenv.loader';
import { ScriptConfigLoader } from './loaders/ts.loader';
import { YamlConfigLoader } from './loaders/yaml.loader';

export default [YamlConfigLoader, EnvConfigLoader, ScriptConfigLoader];
