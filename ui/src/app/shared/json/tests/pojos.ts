import { JsonDeserializeClass } from '../json-deserialize';
import { JsonProperty } from '../json-decorators';

@JsonDeserializeClass()
export class Person {

  @JsonProperty()
  public firstName: string;

  @JsonProperty({value: 'lastName'})
  public last: string;

}

@JsonDeserializeClass()
export class Pojo1 {

  @JsonProperty()
  public pojo1value1: string;

  @JsonProperty()
  public pojo1value2: string;

}

@JsonDeserializeClass()
export class Pojo2 extends Pojo1 {

  @JsonProperty()
  public pojo2value1: string;
}

