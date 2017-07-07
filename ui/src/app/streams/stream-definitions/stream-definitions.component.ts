import { Component, OnInit } from '@angular/core';
import { Page } from '../../shared/model/page';
import { StreamDefinition } from '../model/stream-definition';
import { StreamsService } from '../streams.service';
import { Observable } from 'rxjs/Observable';


@Component({
  selector: 'app-stream-definitions',
  templateUrl: './stream-definitions.component.html',
})
export class StreamDefinitionsComponent implements OnInit {

  streamDefinitions: Page<StreamDefinition>;

  constructor(
    public streamsService: StreamsService) {
  }
  
  public items: Observable<Array<any>>;
  private _items: Array<any>;

  ngOnInit() {
    this._items = [];
    this.items = Observable.of(this._items);
    console.log('hello');
    this.streamsService.getDefinitions().subscribe(
      data => {
        console.log('DATA', data);
//        for (let i of data.items) {
//          this._items.push(i);
//        }
        this.streamDefinitions = data;        
      }
    );
  }

}
