import {
  AfterContentInit, Component, ContentChildren, Directive, forwardRef, Input, OnInit, QueryList,
  ViewChild
} from '@angular/core';
import {ModalDirective} from 'ngx-bootstrap';
import {NG_VALIDATORS, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-property-table',
  templateUrl: './property-table.component.html',
  styleUrls: ['./property-table.component.scss']
})
export class PropertyTableComponent implements OnInit {

  @Input() titleText: string;
  @Input() emptyText: string;
  @Input() addText: string;

  @ViewChild('childModal')
  public childModal: ModalDirective;

  private properties: Array<PropertyTableItem>;
  singleForm: FormGroup;
  bulkForm: FormGroup;
  bulkProperties = new FormControl('', validateProperties);
  singlePropertyKey = new FormControl('', validateKeyOrValueRequired);
  singlePropertyValue = new FormControl('', validateKeyOrValueRequired);

  constructor(fb: FormBuilder) {
    this.properties = new Array();
    this.singleForm = fb.group({
      'singlePropertyKey': this.singlePropertyKey,
      'singlePropertyValue': this.singlePropertyValue
    });
    this.bulkForm = fb.group({
      'bulkProperties': this.bulkProperties
    });
  }

  ngOnInit() {
  }

  getProperties(): Array<PropertyTableItem> {
    return this.properties;
  }

  addProperty() {
    this.showChildModal();
  }

  public showChildModal(): void {
    this.childModal.show();
  }

  public hideChildModal(): void {
    this.childModal.hide();
  }

  cancel(): void {
    this.hideChildModal();
    this.clear();
  }

  clear(): void {
    this.singlePropertyKey.setValue('');
    this.singlePropertyValue.setValue('');
    this.bulkProperties.setValue('');
  }

  submitBulkProperties(): void {
    if (this.bulkProperties.value) {
      for (const prop of this.bulkProperties.value.split('\n')) {
        if (prop && prop.length > 0 && !prop.startsWith('#')) {
          const keyValue = prop.split('=');
          if (keyValue.length === 2) {
            this.properties.push(new PropertyTableItem(keyValue[0], keyValue[1]));
          }
        }
      }
    }

    this.cancel();
  }

  submitSingleProperty(): void {
    this.properties.push(new PropertyTableItem(this.singlePropertyKey.value, this.singlePropertyValue.value));
    this.cancel();
  }

  displayFileContents(event: any) {
    const file: File = event.target.files[0];
    const reader: FileReader = new FileReader();
    const _form = this.bulkForm;
    reader.onloadend = function(e){
      _form.patchValue({bulkProperties: reader.result});
    }
    reader.readAsText(file);
  }
}

export class PropertyTableItem {

  key: string;
  value: string;

  constructor(key: string, value: string) {
    this.key = key;
    this.value = value;
  }
}

export function validateProperties(formControl: FormControl) {
  const properties = formControl.value.split('\n');

  if (properties) {
    for (const prop of properties) {
      if (prop && prop.length > 0 && !prop.startsWith('#')) {
        const keyValue = prop.split('=');
        if (keyValue.length !== 2) {
          return {validateProperties: {reason: 'Invalid property "' + prop + '" must contain a single "=".' }};
        }
      }
    }
  }
  return null;
}

function validateKeyOrValueRequired(formControl: FormControl) {
  if (formControl.value.length > 0) {
    return null;
  }
  else {
    return {reason: 'Must be set'};
  }
}

@Component({
  selector: 'tab',
  styles: [`
    .pane{
      padding: 1em;
    }
  `],
  template: `
    <div [hidden]="!active" class="pane">
      <ng-content></ng-content>
    </div>
  `
})
export class Tab {
  @Input('tabTitle') title: string;
  @Input() active = false;
}

@Component({
  selector: 'tabs',
  template: `
    <ul class="nav nav-tabs">
      <li *ngFor="let tab of tabs" (click)="selectTab(tab)" [class.active]="tab.active">
        {{tab.title}}
      </li>
    </ul>
    <ng-content></ng-content>
  `
})
export class Tabs implements AfterContentInit {

  @ContentChildren(Tab) tabs: QueryList<Tab>;

  ngAfterContentInit() {
    const activeTabs = this.tabs.filter((tab) => tab.active);
    if (activeTabs.length === 0) {
      this.selectTab(this.tabs.first);
    }
  }

  selectTab(tab: Tab) {
    this.tabs.toArray().forEach((t) => t.active = false);
    tab.active = true;
  }
}


