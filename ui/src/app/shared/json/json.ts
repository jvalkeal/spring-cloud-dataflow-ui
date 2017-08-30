import {ObjectDefinition, objectDefinitions, PropertyDefinition} from "./json-deserialize";
import {IDynamicObject, JsonValue, JsonValueArray, JsonValueObject} from "./types";

export class Json {

  public static parse<T>(json: string, type?: Function): T {
    return this.deserialize<T>(JSON.parse(json), type);
  }

  public static deserialize<T>(object: any, type?: Function): T {
    return deserialize(object, type);
  }

  public static stringify(object: any): string {
    return JSON.stringify(this.serialize(object));
  }

  public static serialize(value: any): any {
    return serialize(value);
  }
}

export function deserialize(object: JsonValue, type?: Function): any {
  if (object && object.constructor === Array) {
    return (object as JsonValueArray).map(o => deserializeRootObject(o, type));
  }

  return deserializeRootObject(object, type);
}

function deserializeRootObject(object:JsonValue, objectType:Function = Object):any {
  if (!objectDefinitions.has(objectType)) {
    return object;
  }

  const values = object as JsonValueObject;
  const [type, ...superTypes] = getTypedInheritanceChain(objectType, values);
  const output = Object.create(type.prototype);
  const definitions = [...superTypes.reverse(), type].map(t => objectDefinitions.get(t)).filter(t => !!t) as ObjectDefinition[];

  definitions.forEach(d => {
    d.properties.forEach((p, key) => {
      if (!p.type) {
        throw new Error(`Cannot deserialize property '${key}' without type!`);
      }

      const value = values[p.serializedName];

      if (value == undefined) {
        return;
      }

      if (p.array || p.set) {
        output[key] = deserializeArray(value, p);
        if (p.set) {
          output[key] = new Set<any>(output[key]);
        }
        return;
      }

      output[key] = deserializeObject(value, p);
    });
  });

  return output;
}

function deserializeArray(array:JsonValue, definition:PropertyDefinition):any {
  return (array as JsonValueArray).map(v => deserializeObject(v, definition));
}

function deserializeObject(object:JsonValue, definition:PropertyDefinition):any {
  const primitive = definition.type === String || definition.type === Boolean || definition.type === Number;
  const value:any = object;

  if (!primitive) {
    const objDefinition = objectDefinitions.get(definition.type);

    if (objDefinition) {
      return deserialize(value, definition.type);
    }
  }

  return value;
}

export function getInheritanceChain(type:Object):Function[] {
  if (!type) {
    return [];
  }
  const parent = Object.getPrototypeOf(type);
  return [type.constructor].concat(getInheritanceChain(parent));
}

function getChildClassDefinitions(parentType:Function):[Function, ObjectDefinition][] {
  const childDefs:[Function, ObjectDefinition][] = [];

  objectDefinitions.forEach((def, type) => {
    const superClass = Object.getPrototypeOf(type.prototype).constructor;
    if (superClass === parentType) {
      childDefs.push([type, def]);
    }
  });

  return childDefs;
}

export function getTypedInheritanceChain(type:Function, object?:JsonValueObject):Function[] {
  const parentDef = objectDefinitions.get(type);

  let childDefs:[Function, ObjectDefinition][] = [];

  let actualType:Function | undefined;

  while (childDefs.length !== 0 && !actualType) {
    const [t, def] = childDefs.shift()!; // We are checking the length in the loop so an assertion here is fine.
    childDefs = childDefs.concat(getChildClassDefinitions(t));
  }

  if (!actualType) {
    actualType = type;
  }

  const inheritanceChain = new Set<Function>(getInheritanceChain(Object.create(actualType.prototype)));
  return Array.from(inheritanceChain).filter(t => objectDefinitions.has(t));
}

export function serialize(value:IDynamicObject | IDynamicObject[], type?:Function):JsonValue {
  if (value.constructor === Array) {
    return (value as any[]).map(o => serializeRootObject(o, type));
  }

  return serializeRootObject(value as IDynamicObject, type);
}

function serializeRootObject(object:IDynamicObject, type:Function = Object.getPrototypeOf(object).constructor):JsonValue {
  const inheritanceChain = getTypedInheritanceChain(type);

  if (inheritanceChain.length === 0) {
    return object;
  }

  const definitions = inheritanceChain
    .map(t => objectDefinitions.get(t))
    .filter(t => !!t) as ObjectDefinition[]; // Typescript doesn't yet support the undefined filter

  const output:IDynamicObject = {};

  definitions.forEach(d => {
    d.properties.forEach((p, key) => {
      if (!p.type) {
        throw new Error(`Cannot serialize property '${key}' without type!`);
      }

      const value = object[key];

      if (value == undefined) {
        return;
      }

      if (p.set) {
        output[p.serializedName] = serializeArray(Array.from(value || []), p);
        return;
      }

      if (p.array) {
        output[p.serializedName] = serializeArray(value, p);
        return;
      }

      output[p.serializedName] = serializeObject(value, p);
    });
  });

  return output;
}

function serializeArray(array:IDynamicObject[], definition:PropertyDefinition):JsonValue {
  return array.map(v => serializeObject(v, definition));
}

function serializeObject(object:IDynamicObject, definition:PropertyDefinition):JsonValue {
  const primitive = definition.type === String || definition.type === Boolean || definition.type === Number;
  const value:any = object;

  // const converter = definition.converter || propertyConverters.get(definition.type);
  // if (converter) {
  //   return converter.serialize(value);
  // }

  if (!primitive) {
    const objDefinition = objectDefinitions.get(definition.type);

    if (objDefinition) {
      if (value instanceof definition.type) {
        return serialize(value);
      }
      return serialize(value, definition.type);
    }
  }

  return value;
}
