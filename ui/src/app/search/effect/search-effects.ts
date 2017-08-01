import { Injectable } from '@angular/core';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import { SearchService } from '../search.service';
import { SearchResult } from '../model/search-result';
import {SEARCH, SEARCH_COMPLETE, SearchAction, SearchCompleteAction} from '../action/search-actions';

/**
 * Effects related to search functionality.
   *
 * @author Janne Valkealahti
 */
@Injectable()
export class SearchEffects {

  /**
   *
   * @type {Observable<SearchCompleteAction>}
   */
  @Effect()
  search$: Observable<SearchCompleteAction> = this.actions
    .ofType(SEARCH)
    .debounceTime(500)
    .map(toPayload)
    .switchMap((payload) => this.searchService.search(payload))
    .map(results => new SearchCompleteAction(results));

  @Effect({ dispatch: false })
  complete$: Observable<SearchResult[]> = this.actions
    .ofType(SEARCH_COMPLETE)
    .map(toPayload)
    .do(payload => {
      console.log('EFFECT2', payload);
    });

  constructor(
    private actions: Actions,
    private searchService: SearchService
  ) {}
}
