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

  search(query: CurrentSearch): Observable<SearchResult[]> {
    console.log('QUERY', query);
    this.http.get('/tasks/definitions')
      .map((response: Response) => {
        const body = response.json();
        if (query && body._embedded && body._embedded.taskDefinitionResourceList) {
          return body._embedded.taskDefinitionResourceList
            .filter(jsonItem => query.name && jsonItem.name.includes(query.name))
            .map(jsonItem => {
              return {id: 'id', title: jsonItem.name};
            });
        }
      })
      .subscribe((results: SearchResult[]) => this.searchResults.next(results));

    // this.http.get('/apps')
    //   .map((response: Response) => {
    //     const body = response.json();
    //     if (body._embedded && body._embedded.appRegistrationResourceList) {
    //       return body._embedded.appRegistrationResourceList.map(jsonItem => {
    //         return {id: 'id', title: jsonItem.name};
    //       });
    //     } else {
    //       return Observable.empty();
    //     }
    //   })
    //   .subscribe((results: SearchResult[]) => this.searchResults.next(results));

    return this.searchResults;
  }

}
