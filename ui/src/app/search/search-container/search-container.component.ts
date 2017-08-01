import {Component, Input, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {SearchState, selectSearchItems, selectSearchLoading} from '../reducer/search.reducer';
import {Observable} from 'rxjs/Observable';
import {SearchAction} from '../action/search-actions';

@Component({
  selector: 'app-search-container',
  templateUrl: './search-container.component.html',
  styleUrls: ['./search-container.component.scss']
})
export class SearchContainerComponent implements OnInit {

  loadingQuery: Observable<boolean>;
  itemsQuery: Observable<string[]>;

  constructor(private store: Store<SearchState>) {
    this.loadingQuery = store.select(selectSearchLoading);
    this.itemsQuery = store.select(selectSearchItems);
  }

  ngOnInit() {
  }

  search(query: string) {
    this.store.dispatch(new SearchAction(query));
  }
}
