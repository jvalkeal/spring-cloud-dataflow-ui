import {Person, Pojo2} from "./pojos";
import {Json} from "../json";

describe('Json', () => {
  beforeEach(() => {
  });

  it('serialize', () => {
    const person = new Person();
    person.firstName = 'John';
    person.last = 'Doe';
    const json = Json.stringify(person);
    expect(json).toBe('{"firstName":"John","lastName":"Doe"}');
  });

  it('serialize2', () => {
    const pojo2 = new Pojo2();
    pojo2.pojo1value1 = 'pojo1value1';
    pojo2.pojo1value2 = 'pojo1value2';
    pojo2.pojo2value1 = 'pojo2value1';
    const json = Json.stringify(pojo2);
    expect(json).toBe('{"pojo2value1":"pojo2value1","pojo1value1":"pojo1value1","pojo1value2":"pojo1value2"}');
  });

  it('deserialize', () => {
    const person: Person = Json.parse<Person>('{"firstName": "John", "lastName": "Doe"}', Person);
    expect(person.firstName).toBe('John');
    expect(person.last).toBe('Doe');
  });

  it('deserialize2', () => {
    const pojo2: Pojo2 = Json.parse<Pojo2>('{"pojo1value1":"pojo1value1","pojo1value2":"pojo1value2","pojo2value1":"pojo2value1"}', Pojo2);
    expect(pojo2.pojo1value1).toBe('pojo1value1');
    expect(pojo2.pojo1value2).toBe('pojo1value2');
    expect(pojo2.pojo2value1).toBe('pojo2value1');
  });
});
