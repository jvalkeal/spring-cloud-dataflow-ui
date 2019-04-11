import { Component, ViewEncapsulation, OnInit, EventEmitter} from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap';
import { FormGroup } from '@angular/forms';
import { of } from 'rxjs';
import { Properties } from 'spring-flo';
import { PropertiesGroupModel } from '../support/properties-group-model';
import PropertiesSource = Properties.PropertiesSource;
// import {StreamAppPropertiesSource} from '../../../streams/components/flo/properties/stream-properties-source';
// import {StreamsService} from '../../../streams/streams.service';

@Component({
  selector: 'app-properties-groups-dialog-content',
  templateUrl: 'properties-groups-dialog.component.html',
  styleUrls: [ 'properties-groups-dialog.component.scss' ],
  encapsulation: ViewEncapsulation.None
})
export class PropertiesGroupsDialogComponent implements OnInit {

  public title: string;

  propertiesGroupModels: Array<GroupPropertiesGroupModel> = [];

  // propertiesGroupModel: PropertiesGroupModel;

  propertiesFormGroup: FormGroup;

  groupPropertiesSources: GroupPropertiesSources;

  state: any = {}

  constructor(private bsModalRef: BsModalRef
  ) {
    this.propertiesFormGroup = new FormGroup({});
  }

  handleOk() {
    // this.propertiesGroupModel.applyChanges();
    const properties: Properties.Property[] = [];
    this.propertiesGroupModels.forEach(p => {
      // const pp = p.getControlsModels().map(cm => cm.property);
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
    return false;
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


  // setData(propertiesSource: PropertiesSource) {
  //   this.propertiesGroupModel = new PropertiesGroupModel(propertiesSource);
  //   this.propertiesGroupModel.load();
  //   this.propertiesGroupModel.loadedSubject.subscribe();
  // }
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
    // this.confirm.emit(properties);
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
