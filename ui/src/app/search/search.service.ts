import { Injectable } from '@angular/core';
import { Response, Http } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { SearchResult } from './model/search-result';

/**
 * xxx
 *
 * @author Janne Valkealahti
 */
@Injectable()
export class SearchService {

  constructor(private http: Http) { }

  search(query: string): Observable<SearchResult[]> {
    return this.http.get('/tasks/definitions')
      .map((response: Response) => {
        const body = response.json();
        if (query && body._embedded && body._embedded.taskDefinitionResourceList) {
          return body._embedded.taskDefinitionResourceList
            .filter(jsonItem => query && jsonItem.name.includes(query))
            .map(jsonItem => {
              return {name: jsonItem.name};
            });
        }
      });
  }

}
