import { JsonDeserialize } from '../json-deserialize';
import { JsonProperty } from '../json-decorators';

@JsonDeserialize.as()
export class Person {

  @JsonProperty()
  public firstName: string;

  @JsonProperty({value: 'lastName'})
  public last: string;

}

export class Pojo1 {

}

export class Pojo2 extends Pojo1 {

}
