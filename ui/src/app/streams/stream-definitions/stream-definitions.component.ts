import { Component, OnInit, ViewChild } from '@angular/core';
import { Page } from '../../shared/model/page';
import { StreamDefinition } from '../model/stream-definition';
import { StreamsService } from '../streams.service';
import { Observable } from 'rxjs/Observable';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastyService, ToastyConfig, ToastOptions, ToastData } from 'ng2-toasty';
import { Router, ActivatedRoute, Params } from '@angular/router';


@Component({
  selector: 'app-stream-definitions',
  templateUrl: './stream-definitions.component.html',
})
export class StreamDefinitionsComponent implements OnInit {

  streamDefinitions: Page<StreamDefinition>;
  streamDefinitionToDestroy: StreamDefinition;

  @ViewChild('childModal')
  public childModal:ModalDirective;

  constructor(
    public streamsService: StreamsService,
    private toastyService: ToastyService,
    private router: Router) {
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
        for (let i of data.items) {
          this._items.push(i);
        }
        this.streamDefinitions = data;        
      }
    );
  }
  
  details(item:StreamDefinition, index:number) {
    console.log(index, item);
    this.router.navigate(['streams/definitions/' + item.name]);
  }

  undeploy(item:StreamDefinition, index:number) {
    console.log(index, item);
    this.streamsService.undeployDefinition(item).subscribe(
      data => {
        this.cancel();
        this.toastyService.success('Successfully undeployed stream definition "'
          + item.name + '"');
      },
      error => {}
    );    
  }

  deploy(item:StreamDefinition, index:number) {
    console.log(index, item);
    this.router.navigate(['streams/definitions/' + item.name + '/deploy']);
  }

  destroy(item:StreamDefinition, index:number) {
    console.log(index, item);
    this.streamDefinitionToDestroy = item;
    this.showChildModal();
  }

  expandItem(item:StreamDefinition) {
    console.log(item);
    item.active = !item.active;
  }
  
  isExpanded(item:StreamDefinition):Boolean {
    return !item.active;
  }

  public showChildModal():void {
    this.childModal.show();
  }
 
  public hideChildModal():void {
    this.childModal.hide();
  }

  public proceed(streamDefinition: StreamDefinition): void {
    console.log('Proceeding to destroy definition...', streamDefinition)
    this.streamsService.destroyDefinition(streamDefinition).subscribe(
      data => {
        this.cancel();
        this.toastyService.success('Successfully destroyed stream definition "'
          + streamDefinition.name + '"');
      },
      error => {}
    );
  }

  public cancel = function() {
    this.hideChildModal();
  };

}
