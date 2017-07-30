import {Component, ElementRef, Input, OnInit} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Store} from '@ngrx/store';
import {SearchAction} from '../search-action';

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

  @Input()
  store: Store<any>;

  constructor(private elementRef: ElementRef) {}

  ngOnInit() {
    Observable.fromEvent(this.elementRef.nativeElement, 'keyup')
      .map((e: any) => e.target.value)
      .debounceTime(500)
      .subscribe((text: string) => {
        console.log('SearchBoxComponent', text);
        this.store.dispatch(new SearchAction(SearchBoxComponent.StoreEvents.text));
      });
  }
}
