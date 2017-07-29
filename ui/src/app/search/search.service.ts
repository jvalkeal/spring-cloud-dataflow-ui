import { Injectable } from '@angular/core';
import {Response, Http} from '@angular/http';
import {Observable, BehaviorSubject} from 'rxjs/Rx';
import {SearchResult} from './model/search-result';
import {CurrentSearch} from './model/current-search';

/**
 * xxx
 *
 * @author Janne Valkealahti
 */
@Injectable()
export class SearchService {

  searchResults: BehaviorSubject<SearchResult[]> = new BehaviorSubject<SearchResult[]>([]);

  constructor(private http: Http) { }

  search(query: CurrentSearch): Observable<SearchResult[]>  {
    console.log('search', query);
    const ss: SearchResult[] = [];
    ss.push({id: 'id', title: 'title'});
    this.searchResults.next(ss);
    return this.searchResults;
  }

}
