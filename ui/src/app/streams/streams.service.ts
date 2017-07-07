import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Page } from '../shared/model/page';
import { StreamDefinition } from './model/stream-definition';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

@Injectable()
export class StreamsService {

  public streamDefinitions: Page<StreamDefinition>;

  private streamDefinitionsUrl = '/streams/definitions';

  constructor(private http: Http) { }

  getDefinitions(): Observable<Page<StreamDefinition>> {
    return this.http.get(this.streamDefinitionsUrl)
                    .map(this.extractData.bind(this))
                    .catch(this.handleError);
  }

  private extractData(res: Response) : Page<StreamDefinition> {
    const body = res.json();
    let items: StreamDefinition[];
    if (body._embedded && body._embedded.streamDefinitionResourceList) {
      items = body._embedded.streamDefinitionResourceList as StreamDefinition[];
    }
    else {
      items = [];
    }

    let page = new Page<StreamDefinition>();
    page.items = items;
    page.totalElements = items.length;

    this.streamDefinitions = page;

    console.log('Extracted Stream Definitions:', this.streamDefinitions);
    return page;
  }


  private handleError (error: Response | any) {
    // In a real world app, you might use a remote logging infrastructure
    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    console.error(errMsg);
    return Observable.throw(errMsg);
  }
}
