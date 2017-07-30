import {Action} from '@ngrx/store';

/**
 * xxx
 *
 * @author Janne Valkealahti
 */
export class SearchAction implements Action {

  type: string;
  payload: string;

  constructor(type: string, payload: string) {
    this.type = type;
    this.payload = payload
  }
}
