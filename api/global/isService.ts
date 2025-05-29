import { Logger, SetMetadata } from "@nestjs/common";
import * as lodash from "lodash";

export const services: string[] = [];

export const isService = (): MethodDecorator => {
  return (target, key, descriptor) => {
    const name = lodash.snakeCase(
      target.constructor.name.replace(/Service$/g, ""),
    );
    services.push(`${name}.${key as any}`);
    SetMetadata("isService", key)(target, key, descriptor);
  };
};
