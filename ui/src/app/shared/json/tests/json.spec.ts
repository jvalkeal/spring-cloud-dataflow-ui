import {Person} from "./pojos";
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

  it('deserialize', () => {
    const person: Person = Json.parse<Person>('{"firstName": "John", "lastName": "Doe"}', Person);
    expect(person.firstName).toBe('John');
    expect(person.last).toBe('Doe');
  });
});
