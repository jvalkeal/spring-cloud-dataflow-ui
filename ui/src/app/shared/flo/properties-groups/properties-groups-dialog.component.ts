import { Component, ViewEncapsulation, OnInit, EventEmitter} from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap';
import { FormGroup } from '@angular/forms';
import { of } from 'rxjs';
import { Properties } from 'spring-flo';
import { PropertiesGroupModel } from '../support/properties-group-model';
import PropertiesSource = Properties.PropertiesSource;

@Component({
  selector: 'app-properties-groups-dialog-content',
  templateUrl: 'properties-groups-dialog.component.html',
  styleUrls: [ 'properties-groups-dialog.component.scss' ],
  encapsulation: ViewEncapsulation.None
})
export class PropertiesGroupsDialogComponent implements OnInit {

  public title: string;

  propertiesGroupModels: Array<GroupPropertiesGroupModel> = [];

  propertiesFormGroup: FormGroup;

  groupPropertiesSources: GroupPropertiesSources;

  state: any = {};

  constructor(private bsModalRef: BsModalRef
  ) {
    this.propertiesFormGroup = new FormGroup({});
  }

  handleOk() {
    const properties: Properties.Property[] = [];
    this.propertiesGroupModels.forEach(p => {
      p.getControlsModels().forEach(cm => {
        properties.push(cm.property);
      });
    });
    this.groupPropertiesSources.applyChanges(properties);
    this.bsModalRef.hide();
  }

  handleCancel() {
    this.bsModalRef.hide();
  }

  get okDisabled() {
    return !this.propertiesGroupModels.length > 0
      || !this.propertiesFormGroup
      || this.propertiesFormGroup.invalid
      || !this.propertiesFormGroup.dirty;
  }

  ngOnInit() {
  }

  setData(groupPropertiesSources: GroupPropertiesSources) {
    let first = true;
    groupPropertiesSources.propertiesSources.forEach(ps => {
      this.state[ps.title] = first;
      first = false;
      const model: GroupPropertiesGroupModel  = new GroupPropertiesGroupModel(ps, ps.title);
      model.load();
      model.loadedSubject.subscribe();
      this.propertiesGroupModels.push(model);
    });
    this.groupPropertiesSources = groupPropertiesSources;
  }
}

export class GroupPropertiesGroupModel extends PropertiesGroupModel {

  constructor(propertiesSource: PropertiesSource, public title: string = '') {
    super(propertiesSource);
  }
}

export class GroupPropertiesSource implements PropertiesSource {

  private options: Array<any>;

  constructor(options: Array<any>, public title: string = '') {
    this.options = options;
  }

  getProperties(): Promise<Properties.Property[]> {
    return of(this.options).toPromise();
  }

  applyChanges(properties: Properties.Property[]): void {
  }
}

export class GroupPropertiesSources {

  public confirm = new EventEmitter();

  constructor(public propertiesSources: Array<GroupPropertiesSource>) {
  }

  applyChanges(properties: Properties.Property[]): void {
    this.confirm.emit(properties);
  }
}
