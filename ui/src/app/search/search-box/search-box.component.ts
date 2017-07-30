import {Component, ElementRef, Input, OnInit} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Store} from '@ngrx/store';
import {SearchAction} from '../search-action';
import {CurrentSearch} from "../model/current-search";
import {SearchResult} from "../model/search-result";
import {SearchService} from "../search.service";

/**
 * Component providing functionality to enter text which using
 * a search service will asynchronously query search results and
 * shows those in a drop-down list. These results will provide
 * a links to appropriate items in UI.
 *
 * @author Janne Valkealahti
 */
@Component({
  selector: 'app-search-box',
  templateUrl: './search-box.component.html',
  styleUrls: ['./search-box.component.scss']
})
export class SearchBoxComponent implements OnInit {

  static StoreEvents = {
    text: 'SearchBoxComponent:TEXT_CHANGED'
  };

  private state: CurrentSearch;
  private currentSearch: Observable<CurrentSearch>;
  private searchResults: SearchResult[] = [];

  constructor(private elementRef: ElementRef,
              private store: Store<CurrentSearch>,
              private searchService: SearchService) {
    this.currentSearch = this.store.select<CurrentSearch>(s => {
      return s;
    });
    this.searchService.searchResults.subscribe(
      (results: SearchResult[]) => {
        if (results) {
          results.forEach(r => {
            console.log('XXX', r.id, r.title);
          });
        }
        this.searchResults = results;
      });
  }

  ngOnInit() {
    Observable.fromEvent(this.elementRef.nativeElement, 'keyup')
      .map((e: any) => e.target.value)
      .debounceTime(500)
      .subscribe((text: string) => {
        console.log('SEARCH', text);
        this.store.dispatch(new SearchAction(SearchBoxComponent.StoreEvents.text));
      });

    this.currentSearch.subscribe((state: CurrentSearch) => {
      this.state = state;
      this.searchService.search(state);
    });
  }
}
