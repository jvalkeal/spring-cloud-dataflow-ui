import { Action } from '@ngrx/store';
import { SearchResult } from '../model/search-result';

export const SEARCH = 'searchactions:search';
export const SEARCH_COMPLETE = 'searchactions:searchcomplete';

/**
 * xxx
 *
 * @author Janne Valkealahti
 */
export class SearchAction implements Action {
  readonly type = SEARCH;

  constructor(public payload: string) {}
}

/**
 * xxx
 *
 * @author Janne Valkealahti
 */
export class SearchCompleteAction implements Action {
  readonly type = SEARCH_COMPLETE;

  constructor(public payload: SearchResult[]) {}
}

export type Actions =
  | SearchAction
  | SearchCompleteAction
