import {Action} from '@ngrx/store';

/**
 * xxx
 *
 * @author Janne Valkealahti
 */
export class SearchAction implements Action {

  type: string;
  payload = 'payloadxxx'

  constructor(type: string) {
    this.type = type;
  }
}
