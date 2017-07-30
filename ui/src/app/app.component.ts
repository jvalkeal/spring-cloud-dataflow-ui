import { Component, OnInit } from '@angular/core';
import {ToastyService, ToastyConfig, ToastOptions, ToastData} from 'ng2-toasty';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs/Observable';
import {CurrentSearch} from './search/model/current-search';
import {SearchResult} from './search/model/search-result';
import {SearchService} from "./search/search.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {

  private state: CurrentSearch;
  private currentSearch: Observable<CurrentSearch>;
  private searchResults: SearchResult[] = [];

  constructor(
      private toastyConfig: ToastyConfig,
      private store: Store<CurrentSearch>,
      private searchService: SearchService) {
    this.toastyConfig.theme = 'bootstrap';
    this.toastyConfig.limit = 5;
    this.toastyConfig.showClose = true;
    this.toastyConfig.position  =  'top-right';
    this.toastyConfig.timeout   = 3000;
    this.currentSearch = this.store.select<CurrentSearch>(s => {
      console.log('select', s);
      return s;
    });
    this.searchService.searchResults.subscribe(
      (results: SearchResult[]) => {
        console.log('XXX1');
        if (results) {
          results.forEach(r => {
            console.log('XXX2', r.id, r.title);
          });
        }
        this.searchResults = results;
        },
      e => {
        console.error('e1', e);
      },
      () => {
        console.log('complete1');
      });
  }

  ngOnInit() {
    this.currentSearch.subscribe((state: CurrentSearch) => {
      console.log('state', state);
      this.state = state;
      this.searchService.search(state);
    }, e => {
      console.error('e2', e);
    }, () => {
      console.log('complete2');
    });
  }

}
