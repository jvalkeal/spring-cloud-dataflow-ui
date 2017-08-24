import { JsonObject, JsonProperty } from 'ta-json';

@JsonObject()
export class Person {

  @JsonProperty()
  public firstName: string;

  @JsonProperty()
  public lastName: string;

  public get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  // Note this parameterized constructor
  constructor(fullName: string) {
    let [firstName, lastName] = fullName.split(" ");
    this.firstName = firstName;
    this.lastName = lastName;
  }
}
