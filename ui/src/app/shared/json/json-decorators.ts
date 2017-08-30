import "reflect-metadata";
import {getDefinition} from "./json-deserialize";

export function JsonProperty(params?: JsonPropertyParams): PropertyDecorator {
  return function (target: any, key: string): void {
    const type = Reflect.getMetadata("design:type", target, key);
    const property = getDefinition(target.constructor).getProperty(key);
    if (params && params.value) {
      property.serializedName = params.value;
    } else {
      property.serializedName = key;
    }
    property.array = type === Array;
    property.set = type === Set;
    if (!property.array && !property.set && !property.type) {
      property.type = type;
    }
  };
}

export interface JsonPropertyParams {
  value?: string;
}
