## Description
---
Configuration module for [Nest](https://github.com/nestjs/nest) based on: [dotenv](https://github.com/motdotla/dotenv) (to load process environment variables), [YAML](https://github.com/nodeca/js-yaml) (to load .yml|.yaml configuration files);

Allows reading recursively a config folder and loading all configuration files to a unique object, creating a prototype chain for configuration properties inheritance;
## Installation
```bash
yarn add @atlasjs/config
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
    |   db.yml
    |   users.yml
    |   .env

```
db.yml
```yml
dbname: db
port: 5432
host: db.host
username: user
password: pass
schemas:
  - public
  - config
```
.env
```ini
root=root
passw=root
port=3000
```
users/db.yml
```yml
dbname: users
schemas:
  - users
```
users/users.yml
```yml
strategies:
  - local
  - jwt
```
users/.env
```ini
CACHE=1
```
1. Import ConfigModule into root application
```ts
import { ConfigModule } from '@atlasjs/config';
@Module({
  imports: [
    ConfigModule.forRoot({})
  ]
})
export class AppModule {}
```
3. Import ConfigModule into another child module
```ts
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
4. Inject ConfigProvider into ModuleProvider
```ts
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
5. Result
```ts
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





