export class JsonDeserialize {

  public static as(): ClassDecorator {
    return function (target: Function): void {
      getDefinition(target);
    }
  }
}

export class ObjectDefinition {

  public properties: Map<string, PropertyDefinition>;

  constructor() {
    this.properties = new Map<string, PropertyDefinition>();
  }

  public getProperty(key: string): PropertyDefinition {
    let property = this.properties.get(key);
    if (!property) {
      property = new PropertyDefinition();
      this.properties.set(key, property);
    }
    return property;
  }

}

export class PropertyDefinition {

  public type:Function;
  public serializedName: string;
  public array:boolean = false;
  public set:boolean = false;
}

export const objectDefinitions: Map<Function, ObjectDefinition> = new Map<Function, ObjectDefinition>();

export function getDefinition(target: Function): ObjectDefinition {
  let definition = objectDefinitions.get(target);
  if (!definition) {
    definition = new ObjectDefinition();
    objectDefinitions.set(target, definition);
  }
  return definition;
}
