import { JSON } from 'ta-json';
import { Person } from "./person";

describe('Person', () => {

  // beforeEach(() => {
  // });

  it('create an instance', () => {
    let person = new Person("Edward Carroll");
    const json = JSON.stringify(person);
    expect(json).toBe('{"firstName":"Edward","lastName":"Carroll"}');
    person = JSON.parse<Person>('{"firstName":"John","lastName":"Doe"}', Person);
    expect(person instanceof Person).toBe(true);
    expect(person.fullName).toBe('John Doe');
  });

});
