import { createSelector, createFeatureSelector } from '@ngrx/store';
import { ActionReducer } from 'ngx-bootstrap/mini-ngrx';
import { Actions, SEARCH, SEARCH_COMPLETE, SearchAction } from '../action/search-actions';

export interface SearchResultsState {
  items: string[];
}

export interface SearchState {
  query: string;
  loading: boolean;
  results: SearchResultsState
}

const initialState: SearchState = {
  query: '',
  loading: false,
  results: {items: []}
}

export const SearchReducer: ActionReducer<SearchState> = (state: SearchState, action: Actions) => {
  switch (action.type) {
    case SEARCH:
      return Object.assign({}, state, {
        query: action.payload,
        loading: true
      });
    case SEARCH_COMPLETE:
      const items: string[] = [];
      if (action.payload) {
        action.payload.forEach(r => items.push(r.name));
      }
      return Object.assign({}, state, {
        loading: false,
        results: {items: items}
      });
    default:
      return initialState;
  }
};

export const getSearchState = createFeatureSelector<SearchState>('search');
export const selectSearchResults = createSelector(getSearchState, (state: SearchState) => state.results);
export const selectSearchItems = createSelector(selectSearchResults, (state: SearchResultsState) => state.items);
export const getQuery = (state: SearchState) => state.query;
export const selectSearchLoading = createSelector(getSearchState, (state: SearchState) => state.loading);
