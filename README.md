## Description
---
Configuration module for [Nest](https://github.com/nestjs/nest) based on: [dotenv](https://github.com/motdotla/dotenv) (to load process environment variables), [YAML](https://github.com/nodeca/js-yaml) (to load .yml|.yaml configuration files);

Allows reading recursively a config folder and loading all configuration files to a unique object, creating a prototype chain for configuration properties inheritance;
## Installation
```bash
yarn add nestjs-config-module
```
## Stay in touch
---
- Author - [John Paul](john891226@gmail.com)

## Usage
---
1. Create configuration folder structure: Example
```
config
|   db.yml
|   .env
|-- users
|    |   db.yml
|    |   users.yml
|    |   .env
```

config/db.yml

```
dbname: db
port: 5432
host: db.host
username: user
password: pass
schemas:
  - public
  - config
```

config/.env

```ini
root=root
passw=root
port=3000
```

config/users/db.yml

```
dbname: users
schemas:
  - users
```
config/users/users.yml

```
strategies:
  - local
  - jwt
```
config/users/.env

```
CACHE=1
```
1. Import ConfigModule into root application
```
import { ConfigModule } from 'nestjs-config-module';
@Module({
  imports: [
    ConfigModule.forRoot({})
  ]
})
export class AppModule {}
```
1. Import ConfigModule into another child module
```
@Module({
  imports: [
    /***
     * Allows pass a path ex: users.schema
     * */
    ConfigModule.forModule('users')
  ]
})
export class UsersModule {}
```
1. Inject ConfigProvider into ModuleProvider
```
@Injectable()
export class UsersService {
  constructor(
    /***
     * Project general configuration 
     * (use only when its required, otherwise ignore injection)
     * */
    private project_config: ConfigService,
    /***
     * Module specific configuration using protoype chaining
     * */
    @Inject('users') private module_config: ModuleConfigService,
  ) {}
  getHello(): string {
    const dbname = this.module_config.config.dbname;
    return 'Hello World!'; //
  }
}

```
1. Result
```
console.log(this.module_config.config)
```
### Output
```json
{
    "strategies": ["local", "jwt"],
    "CACHE": "1",
    "db":{
        "dbname": "users",
        "schemas": ["public", "config", "users"],
        "__proto__": {
            "dbname": "db",
            "port": 5432,
            "host": "db.host",
            "username": "user",
            "password": "pass",
            "schemas": ["public", "config"]
        }
    },
    "__proto__": {
        "root": "root",
        "passw": "root",
        "port": 3000,
        "db": {
            "dbname": "db",
            "port": 5432,
            "host": "db.host",
            "username": "user",
            "password": "pass",
            "schemas": ["public", "config"]
        },
        "users": {...}
    }
}
```





