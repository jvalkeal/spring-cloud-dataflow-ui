import {ActionReducer} from 'ngx-bootstrap/mini-ngrx';
import {SearchBoxComponent} from '../search-box/search-box.component';
import {CurrentSearch} from '../model/current-search';
import {SearchAction} from '../search-action';

export const SearchReducer: ActionReducer<CurrentSearch> = (state: CurrentSearch, action: SearchAction) => {
  console.log('REDUCE', state, action);
  switch (action.type) {
    case SearchBoxComponent.StoreEvents.text:
      // return {name: action.payload};
      return Object.assign({}, state, {
        name: action.payload
      });
    default:
      return state;
  }
}
