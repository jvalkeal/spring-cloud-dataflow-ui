import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit,
  Output, ViewChild
} from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup } from '@angular/forms';
import { map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { Properties } from 'spring-flo';
import { TaskLaunchService } from '../task-launch.service';
import { TaskLaunchValidator } from '../task-launch.validator';
import { NotificationService } from '../../../../shared/service/notification.service';
import { TaskLaunchConfig } from '../../../../shared/model/task.model';
import {
  GroupPropertiesSource, GroupPropertiesSources, PropertiesGroupsDialogComponent
} from '../../../../flo/shared/properties-groups/properties-groups-dialog.component';
import { App } from '../../../../shared/model/app.model';
import { PropertiesDialogComponent } from '../../../../flo/shared/properties/properties-dialog.component';
import { StreamAppPropertiesSource, StreamHead } from '../../../../flo/stream/properties/stream-properties-source';

export class AppPropertiesSource implements StreamAppPropertiesSource {

  private options: Array<any>;
  public confirm = new EventEmitter();

  constructor(options: Array<any>) {
    this.options = options;
  }

  getStreamHead(): StreamHead {
    return { presentStreamNames: [] };
  }

  getProperties(): Promise<Properties.Property[]> {
    return of(this.options).toPromise();
  }

  applyChanges(properties: Properties.Property[]): void {
    this.confirm.emit(properties);
  }

}

export interface Builder {
  taskLaunchConfig: TaskLaunchConfig;
  formGroup: FormGroup;
  // builderDeploymentProperties: any;
  builderAppsProperties: any;

  deployers: FormArray;
  appsVersion: FormGroup;
  globalControls: FormArray;
  specificPlatformControls: FormArray;

  builderDeploymentProperties: {
    global: any[];
    apps: {};
  };

  ctrProperties: any[];
  // ctrControls: any;

  errors: {
    global: [],
    app: []
  };
}

@Component({
  selector: 'app-task-launch-builder',
  templateUrl: 'builder.component.html',
  styleUrls: ['builder.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BuilderComponent implements OnInit, OnDestroy {

  @ViewChild('appPropertiesModal', { static: true }) appPropertiesModal: PropertiesDialogComponent;
  @ViewChild('groupsPropertiesModal', { static: true }) groupsPropertiesModal: PropertiesGroupsDialogComponent;
  @ViewChild('ctrPropertiesModal', { static: true }) ctrPropertiesModal: PropertiesGroupsDialogComponent;

  /**
   * Stream ID
   */
  @Input() id: string;

  /**
   * Emits on destroy component with the current value
   */
  @Output() update = new EventEmitter();

  /**
   * Emit for request export
   */
  @Output() exportProperties = new EventEmitter();

  /**
   * Emit for request launch
   */
  @Output() launch = new EventEmitter();

  /**
   * Emit for request copy
   */
  @Output() copyProperties = new EventEmitter();

  /**
   * Properties to load
   */
  @Input() properties: Array<string> = [];

  /**
   * Is Deployed
   */
  @Input() isDeployed = false;

  /**
   * Builder observable
   * Contains the form and the input data
   */
  // builder$: Observable<any>;
  builder$: Observable<Builder>;

  /**
   * Builder Reference
   */
  refBuilder;

  /**
   * States
   */
  state: any = {
    platform: true,
    deployer: true,
    app: true,
    specificPlatform: true,
    ctr: true,
    arguments: true
  };

  constructor(private taskLaunchService: TaskLaunchService,
              private changeDetector: ChangeDetectorRef,
              private notificationService: NotificationService) {
  }

  /**
   * On Init
   */
  ngOnInit() {
    this.builder$ = this.taskLaunchService
      .config(this.id)
      .pipe(map((taskLaunchConfig) => this.build(taskLaunchConfig)))
      .pipe(map((builder) => this.populate(builder)))
      .pipe(map((builder) => this.populateApp(builder)));
  }

  /**
   * On Destroy
   */
  ngOnDestroy() {
    if (this.refBuilder) {
      this.update.emit(this.getProperties());
    }
  }

  /**
   * Return an array of properties
   * @returns {Array<string>}
   */
  private getProperties(): Array<string> {
    const result: Array<string> = [];
    const isEmpty = (control: AbstractControl) => !control || (control.value === '' || control.value === null);
    const deployers: FormArray = this.refBuilder.formGroup.get('deployers') as FormArray;
    const appsVersion: FormGroup = this.refBuilder.formGroup.get('appsVersion') as FormGroup;
    const global: FormArray = this.refBuilder.formGroup.get('global') as FormArray;
    const specificPlatform: FormArray = this.refBuilder.formGroup.get('specificPlatform') as FormArray;

    // Platform
    if (!isEmpty(this.refBuilder.formGroup.get('platform'))) {
      result.push(`spring.cloud.dataflow.task.platformName=${this.refBuilder.formGroup.get('platform').value}`);
    }

    // Deployers
    this.refBuilder.taskLaunchConfig.deployers.forEach((deployer, index) => {
      if (!isEmpty(deployers.controls[index].get('global'))) {
        result.push(`deployer.*.${deployer.id}=${deployers.controls[index].get('global').value}`);
      }
      this.refBuilder.taskLaunchConfig.apps.forEach((app) => {
        if (!isEmpty(deployers.controls[index].get(app.name))) {
          result.push(`deployer.${app.name}.${deployer.id}=${deployers.controls[index].get(app.name).value}`);
        }
      });
    });

    // Dynamic Form
    [specificPlatform, global].forEach((arr, index) => {
      const keyStart = (!index) ? 'deployer' : 'app';
      arr.controls.forEach((line: FormGroup) => {
        if (!isEmpty(line.get('property'))) {
          const key = line.get('property').value;
          if (!isEmpty(line.get('global'))) {
            result.push(`${keyStart}.*.${key}=${line.get('global').value}`);
          }
          this.refBuilder.taskLaunchConfig.apps.forEach((app) => {
            if (!isEmpty(line.get(app.name))) {
              result.push(`${keyStart}.${app.name}.${key}=${line.get(app.name).value}`);
            }
          });
        }
      });
    });

    // Apps Version (appsVersion)
    this.refBuilder.taskLaunchConfig.apps.forEach((app) => {
      if (!isEmpty(appsVersion.get(app.name))) {
        result.push(`version.${app.name}=${appsVersion.get(app.name).value}`);
      }
      // App deployment props set via modal
      this.getDeploymentProperties(this.refBuilder.builderDeploymentProperties, app.name).forEach((keyValue) => {
        result.push(`deployer.${app.name}.${keyValue.key.replace(/spring.cloud.deployer./, '')}=${keyValue.value}`);
      });
    });

    // Apps Properties
    Object.keys(this.refBuilder.builderAppsProperties).forEach((key: string) => {
      this.getAppProperties(this.refBuilder.builderAppsProperties, key).forEach((keyValue) => {
        result.push(`app.${key}.${keyValue.key}=${keyValue.value}`);
      });
    });

    // Global deployment props set via modal
    this.getDeploymentProperties(this.refBuilder.builderDeploymentProperties).forEach((keyValue) => {
      result.push(`deployer.*.${keyValue.key.replace(/spring.cloud.deployer./, '')}=${keyValue.value}`);
    });

    // Errors
    this.refBuilder.errors.global.forEach((error) => {
      result.push(error);
    });
    this.refBuilder.errors.app.forEach((error) => {
      result.push(error);
    });

    return result;
  }

  private updateFormArray(builder, array: FormArray, appKey: string, key: string, value) {
    let group: FormGroup;
    const lines = array.controls
      .filter((formGroup: FormGroup) => key === formGroup.get('property').value);

    if (lines.length > 0) {
      group = lines[0] as FormGroup;
    } else {
      group = new FormGroup({
        property: new FormControl('', [TaskLaunchValidator.key]),
        global: new FormControl('')
      }, { validators: TaskLaunchValidator.keyRequired });
      builder.taskLaunchConfig.apps.forEach((app) => {
        group.addControl(app.name, new FormControl(''));
      });
      array.push(group);
    }
    group.get('property').setValue(key);
    group.get(appKey === '*' ? 'global' : appKey).setValue(value);
  }

  /**
   * Populate values app
   */
  private populateApp(builder?: any) {
    builder = builder || this.refBuilder;
    if (!builder) {
      return false;
    }
    builder.formGroup.get('global').controls = [];
    builder.errors.app = [];
    const appNames: Array<string> = builder.taskLaunchConfig.apps.map((app, index) => {
      const appInfo = builder.taskLaunchConfig.apps[index];
      builder.builderAppsProperties[app.name] = (appInfo && appInfo.options)
        ? builder.builderAppsProperties[app.name] = appInfo.options
          .map((property) => Object.assign({}, property))
        : [];
      return app.name;
    });
    const add = (array: FormArray) => {
      const group = new FormGroup({
        property: new FormControl('', [TaskLaunchValidator.key]),
        global: new FormControl('')
      }, { validators: TaskLaunchValidator.keyRequired });

      builder.taskLaunchConfig.apps.forEach((app) => {
        group.addControl(app.name, new FormControl(''));
      });
      array.push(group);
    };
    this.properties.forEach((line: string) => {
      const arr = line.split(/=(.*)/);
      const key = arr[0] as string;
      const value = arr[1] as string;
      const appKey = key.split('.')[1];
      if (TaskLaunchService.app.is(key)) {
        const keyReduce = TaskLaunchService.app.extract(key);
        if ((appKey !== '*' && appNames.indexOf(appKey) === -1) || keyReduce === '') {
          // Error: app not found
          builder.errors.app.push(line);
        } else {
          let free = true;
          if (appNames.indexOf(appKey) > -1) {
            const appProperties = builder.taskLaunchConfig.apps[appNames.indexOf(appKey)];
            if (appProperties.options && !appProperties.optionsState.isInvalid) {
              const option = builder.builderAppsProperties[appKey].find(opt => {
                return opt.name === keyReduce || opt.id === keyReduce;
              });
              if (option) {
                option.value = value;
                free = false;
              }
            }
          }
          if (free) {
            this.updateFormArray(builder, builder.formGroup.get('global') as FormArray, appKey, keyReduce, value);
          }
        }
      }
    });
    add(builder.formGroup.get('global'));
    return builder;
  }

  /**
   * Populate values
   */
  private populate(builder) {
    this.refBuilder = builder;

    const appNames: Array<string> = builder.taskLaunchConfig.apps.map(app => app.name);
    const deployerKeys: Array<string> = builder.taskLaunchConfig.deployers.map(deployer => deployer.name);
    builder.errors.global = [];

    // we need to iterate twice to get a possible platform name set
    // as it's needed later and we don't control order of these properties
    this.properties.some((line: string) => {
      const arr = line.split(/=(.*)/);
      const key = arr[0] as string;
      const value = arr[1] as string;
      if (TaskLaunchService.platform.is(key)) {
        builder.formGroup.get('platform').setValue(value);
        const platform = builder.taskLaunchConfig.platform.values.find(p => p.name === value);
        builder.builderDeploymentProperties.global = [];
        builder.taskLaunchConfig.apps.forEach((app: any) => {
          builder.builderDeploymentProperties.apps[app.name] = [];
        });
        if (platform) {
          platform.options.forEach(o => {
            builder.builderDeploymentProperties.global.push(Object.assign({ isSemantic: true }, o));
            builder.taskLaunchConfig.apps.forEach((app: any) => {
              builder.builderDeploymentProperties.apps[app.name].push(Object.assign({ isSemantic: true }, o));
            });
          });
        }
        // got it, break from loop
        return true;
      }
      return false;
    });

    this.properties.forEach((line: string) => {
      const arr = line.split(/=(.*)/);
      const key = arr[0] as string;
      const value = arr[1] as string;
      const appKey = key.split('.')[1];
      if (TaskLaunchService.platform.is(key)) {
        // consume but don't do anything, otherwise error is added
        // platform value is set in first iteration
      } else if (TaskLaunchService.deployer.is(key)) {
        // Deployer
        const keyReduce = TaskLaunchService.deployer.extract(key);
        if ((appKey !== '*' && appNames.indexOf(appKey) === -1) || keyReduce === '') {
          // Error: app not found / * not found
          builder.errors.global.push(line);
        } else {
          if (deployerKeys.indexOf(keyReduce) > -1) {
            builder.formGroup.get('deployers')
              .controls[deployerKeys.indexOf(keyReduce)]
              .get(appKey === '*' ? 'global' : appKey).setValue(value);
          } else {
            const keymatch = 'spring.cloud.deployer.' + keyReduce;
            // go through deployment properties for global and apps and
            // mark match if it looks property is handled by modal, otherwise
            // it belong to form array
            let match = false;
            if (key.indexOf('deployer.*.') > -1) {
              builder.builderDeploymentProperties.global.forEach(p => {
                if (keymatch === p.id) {
                  match = true;
                  p.value = value;
                }
              });
            } else if (key.indexOf('deployer.' + appKey + '.') > -1) {
              builder.builderDeploymentProperties.apps[appKey].forEach(p => {
                if (keymatch === p.id) {
                  match = true;
                  p.value = value;
                }
              });
            }

            if (!match) {
              this.updateFormArray(builder, builder.formGroup.get('specificPlatform') as FormArray, appKey,
                keyReduce, value);
            }
          }
        }
      } else if (TaskLaunchService.version.is(key)) {
        // Version
        if (appNames.indexOf(appKey) === -1) {
          // Error: app not found
          builder.errors.global.push(line);
        } else {
          const app = this.refBuilder.taskLaunchConfig.apps.find((appConfig: any) => appConfig.name === appKey);
          // Populate if it's not the default version
          if (!app || app.version !== value) {
            builder.formGroup.get('appsVersion').get(appKey).setValue(value);
          }
        }
      } else if (!TaskLaunchService.app.is(key)) {
        // Invalid Key
        builder.errors.global.push(line);
      }
    });
    return builder;
  }

  /**
   * Build the Group Form
   */
  private build(taskLaunchConfig: TaskLaunchConfig): Builder {
    const formGroup: FormGroup = new FormGroup({});

    const getValue = (defaultValue) => !defaultValue ? '' : defaultValue;
    const builderAppsProperties = {};
    const builderDeploymentProperties = { global: [], apps: {} };
    const ctrProperties = [];

    // Platform
    const platformControl = new FormControl(getValue(taskLaunchConfig.platform.defaultValue),
      (formControl: FormControl) => {
        if (this.isErrorPlatform(taskLaunchConfig.platform.values, formControl.value)) {
          return { invalid: true };
        }
        if (taskLaunchConfig.platform.values.length > 1 && !formControl.value) {
          return { invalid: true };
        }
        return null;
      });

    const defaultPlatform = taskLaunchConfig.platform.values.length === 1 ?
      taskLaunchConfig.platform.values[0] : null;

    const populateDeployerProperties = (value) => {
      builderDeploymentProperties.global = [];
      taskLaunchConfig.apps.forEach((app: any) => {
        builderDeploymentProperties.apps[app.name] = [];
      });
      const platform = taskLaunchConfig.platform.values.find(p => p.name === value);
      if (platform) {
        platform.options.forEach(o => {
          builderDeploymentProperties.global.push(Object.assign({ isSemantic: true }, o));
          taskLaunchConfig.apps.forEach((app: any) => {
            builderDeploymentProperties.apps[app.name].push(Object.assign({ isSemantic: true }, o));
          });
        });
      }
    };

    if (defaultPlatform) {
      populateDeployerProperties(defaultPlatform.name);
    }

    // ctr
    taskLaunchConfig.ctr.forEach(o => {
      ctrProperties.push(Object.assign({ isSemantic: true }, o));
    });

    platformControl.valueChanges.subscribe((value) => {
      if (!defaultPlatform) {
        populateDeployerProperties(value);
      }
    });

    formGroup.addControl('platform', platformControl);

    // Deployers
    const deployers = new FormArray([]);
    taskLaunchConfig.deployers.forEach((deployer: any) => {
      const groupDeployer: FormGroup = new FormGroup({});
      const validators = [];
      if (deployer.type === 'java.lang.Integer') {
        validators.push(TaskLaunchValidator.number);
      }
      groupDeployer.addControl('global', new FormControl(getValue(deployer.defaultValue), validators));
      taskLaunchConfig.apps.forEach((app: any) => {
        groupDeployer.addControl(app.name, new FormControl('', validators));
      });
      deployers.push(groupDeployer);
    });

    // Applications
    const appsVersion = new FormGroup({});
    taskLaunchConfig.apps.forEach((app: any) => {
      builderAppsProperties[app.name] = [];
      const control = new FormControl(null,
        (formControl: FormControl) => {
          if (this.isErrorVersion(app, formControl.value)) {
            return { invalid: true };
          }
          return null;
        });
      control.valueChanges.subscribe((value) => {
        builderAppsProperties[app.name] = [];
        if (this.isErrorVersion(app, value)) {
          app.optionsState.isInvalid = true;
          app.options = null;
          this.changeDetector.markForCheck();
        } else {
          app.optionsState.isInvalid = false;
          app.optionsState.isOnError = false;
          app.optionsState.isLoading = true;
          this.taskLaunchService.appDetails(app.type, app.origin, value).subscribe((options) => {
            app.options = options;
          }, (error) => {
            app.options = [];
            app.optionsState.isOnError = true;
          }, () => {
            app.optionsState.isLoading = false;
            this.changeDetector.markForCheck();
            this.populateApp();
          });
        }
      });
      control.setValue(getValue(app.defaultValue));
      appsVersion.addControl(app.name, control);
    });

    // Useful methods for FormArray
    const add = (array: FormArray) => {
      const group = new FormGroup({
        property: new FormControl('', [TaskLaunchValidator.key]),
        global: new FormControl('')
      }, { validators: TaskLaunchValidator.keyRequired });

      taskLaunchConfig.apps.forEach((app) => {
        group.addControl(app.name, new FormControl(''));
      });
      array.push(group);
    };
    const isEmpty = (dictionary): boolean => Object.entries(dictionary).every((a) => a[1] === '');
    const clean = (val: Array<any>, array: FormArray) => {
      const toRemove = val.map((a, index) =>
        ((index < (val.length - 1) && isEmpty(a)) ? index : null)).filter((a) => a != null);

      toRemove.reverse().forEach((a) => {
        array.removeAt(a);
      });
      if (!isEmpty(val[val.length - 1])) {
        return add(array);
      }
    };

    // Dynamic App properties
    const globalControls: FormArray = new FormArray([]);
    add(globalControls);
    globalControls.valueChanges.subscribe((val: Array<any>) => {
      clean(val, globalControls);
    });

    // Dynamic Platform properties
    const specificPlatformControls: FormArray = new FormArray([]);
    add(specificPlatformControls);
    specificPlatformControls.valueChanges.subscribe((val: Array<any>) => {
      clean(val, specificPlatformControls);
    });

    // const ctrControls: FormArray = new FormArray([]);

    formGroup.addControl('deployers', deployers);
    formGroup.addControl('appsVersion', appsVersion);
    formGroup.addControl('global', globalControls);
    formGroup.addControl('specificPlatform', specificPlatformControls);

    return {
      formGroup,
      builderAppsProperties,
      builderDeploymentProperties,
      taskLaunchConfig,

      deployers,
      appsVersion,
      globalControls,
      specificPlatformControls,
      // ctrControls,
      ctrProperties,

      errors: {
        global: [],
        app: []
      }
    };
  }

  /**
   * Return true if the version is not invalid
   *
   * @param {any} app
   * @param {string} version
   * @returns {boolean}
   */
  isErrorVersion(app: any, version: string): boolean {
    return version !== '' && !app.versions.find(v => v.version === version);
  }

  /**
   * Return true if the builder is valid
   * @param builder
   * @returns {boolean}
   */
  isSubmittable(builder): boolean {
    if (!builder) {
      return false;
    }
    return builder.formGroup.valid;
  }

  /**
   * Return true if the platform is on error
   *
   * @param {Array<any>} platforms
   * @param {string} platform
   * @returns {boolean}
   */
  isErrorPlatform(platforms: Array<any>, platform: string): boolean {
    return (platform !== '' && !platforms.find(p => p.key === platform))
      || (platform === '' && platforms.length > 1);
  }

  /**
   * Return true if the platform is invalid (invalid value)
   *
   * @param {Array<any>} platforms
   * @param {string} platform
   * @returns {boolean}
   */
  isInvalidPlatform(platforms: Array<any>, platform: string): boolean {
    return (platform !== '' && !platforms.find(p => p.key === platform));
  }

  /**
   * Generate a tooltip
   *
   * @param taskLaunchConfig
   * @param control
   * @returns {string}
   */
  tooltip(taskLaunchConfig, control: AbstractControl): string {
    const arr = [];
    if (control instanceof FormGroup) {
      if (control.get('property')) {
        if (control.get('property') && control.get('property').invalid) {
          arr.push(`The field "property" is not valid.`);
        }
      }
      if (control.get('global') && control.get('global').invalid) {
        arr.push(`The field "global" is not valid.`);
      }
      taskLaunchConfig.apps.forEach((app) => {
        if (control.get(app.name).invalid) {
          arr.push(`The field "${app.name}" is not valid.`);
        }
      });
    } else {

    }
    return arr.join('<br />');
  }

  /**
   * Load the deployment properties of an app or global
   *
   * @param {{}} builderDeploymentProperties
   * @param {string} appId
   * @returns {Array}
   */
  getDeploymentProperties(builderDeploymentProperties: { global: any[], apps: any }, appId?: string): Array<{ key: string, value: any }> {
    const deploymentProperties = appId ? builderDeploymentProperties.apps[appId] : builderDeploymentProperties.global;
    if (!deploymentProperties) {
      return [];
    }

    return deploymentProperties.map((property: Properties.Property) => {
      if (property.value !== null && property.value !== undefined && property.value.toString() !== ''
        && property.value !== property.defaultValue) {
        return {
          key: `${property.id}`,
          value: property.value
        };
      }
      return null;
    }).filter((app) => app !== null);
  }

  /**
   * Open Deployment Properties modal for an app or global
   *
   * @param builder
   * @param {string} appId
   * @param app
   */
  openDeploymentProperties(builder, appId?: string) {
    const options = appId ? builder.builderDeploymentProperties.apps[appId] : builder.builderDeploymentProperties.global;

    // jee.foo.bar-xxx -> jee.foo
    const deduceKey = (key) => {
      return key.substring(0, key.lastIndexOf('.'));
    };

    // grouping all properties by a deduced key
    const groupBy = (items, key) => items.reduce(
      (result, item) => {
        const groupKey = deduceKey(item[key]);
        return ({
          ...result,
          [groupKey]: [...(result[groupKey] || []), item],
        });
      }, {}
    );

    // setup groups and sort alphabetically by group titles
    let groupedPropertiesSources: Array<GroupPropertiesSource> = [];
    const groupedEntries: { [s: string]: Array<any>; } = groupBy(options, 'id');
    Object.entries(groupedEntries).forEach(v => {
      const groupedPropertiesSource = new GroupPropertiesSource(Object.assign([], v[1]
        .map((property) => Object.assign({}, property))), v[0]);
      groupedPropertiesSources.push(groupedPropertiesSource);
    });
    groupedPropertiesSources = groupedPropertiesSources.sort(((a, b) => {
      return a.title === b.title ? 0 : a.title < b.title ? -1 : 1;
    }));
    const groupPropertiesSources = new GroupPropertiesSources(groupedPropertiesSources);

    // get new props from modal
    groupPropertiesSources.confirm.subscribe((properties: Array<any>) => {
      if (appId) {
        builder.builderDeploymentProperties.apps[appId] = properties;
      } else {
        builder.builderDeploymentProperties.global = properties;
      }
      this.changeDetector.markForCheck();
    });
    this.groupsPropertiesModal.setData(groupPropertiesSources);
    this.groupsPropertiesModal.title = `Deployment properties for platform`;
    this.groupsPropertiesModal.isOpen = true;
  }

  getCtrProperties(ctrProperties: any[]): Array<{ key: string, value: any }> {
    if (!ctrProperties) {
      return [];
    }

    return ctrProperties.map((property: Properties.Property) => {
      if (property.value !== null && property.value !== undefined && property.value.toString() !== ''
        && property.value !== property.defaultValue) {
        return {
          key: `${property.id}`,
          value: property.value
        };
      }
      return null;
    }).filter(p => p !== null);
  }

  openCtrProperties(builder: Builder) {
    const options = builder.ctrProperties;

    // jee.foo.bar-xxx -> jee.foo
    const deduceKey = (key) => {
      return key.substring(0, key.lastIndexOf('.'));
    };

    // grouping all properties by a deduced key
    const groupBy = (items, key) => items.reduce(
      (result, item) => {
        const groupKey = deduceKey(item[key]);
        return ({
          ...result,
          [groupKey]: [...(result[groupKey] || []), item],
        });
      }, {}
    );

    // setup groups and sort alphabetically by group titles
    let groupedPropertiesSources: Array<GroupPropertiesSource> = [];
    const groupedEntries: { [s: string]: Array<any>; } = groupBy(options, 'id');
    Object.entries(groupedEntries).forEach(v => {
      const groupedPropertiesSource = new GroupPropertiesSource(Object.assign([], v[1]
        .map((property) => Object.assign({}, property))), v[0]);
      groupedPropertiesSources.push(groupedPropertiesSource);
    });
    groupedPropertiesSources = groupedPropertiesSources.sort(((a, b) => {
      return a.title === b.title ? 0 : a.title < b.title ? -1 : 1;
    }));
    const groupPropertiesSources = new GroupPropertiesSources(groupedPropertiesSources);

    // get new props from modal
    groupPropertiesSources.confirm.subscribe((properties: Array<any>) => {
      builder.ctrProperties = properties;
      this.changeDetector.markForCheck();
    });
    this.ctrPropertiesModal.setData(groupPropertiesSources);
    this.ctrPropertiesModal.title = `Ctr properties`;
    this.ctrPropertiesModal.isOpen = true;
  }

  /**
   * Load the properties of an app
   *
   * @param {{}} builderAppsProperties
   * @param {string} appId
   * @returns {Array}
   */
  getAppProperties(builderAppsProperties: {}, appId: string): Array<{ key: string, value: any }> {
    const appProperties = builderAppsProperties[appId];
    if (!appProperties) {
      return [];
    }
    return appProperties.map((property: Properties.Property) => {
      if (property.value !== null && property.value !== undefined && property.value.toString() !== ''
        && property.value !== property.defaultValue) {
        if (property.id.startsWith(`${appId}.`)) {
          return {
            key: `${property.name}`,
            value: property.value
          };
        } else {
          return {
            key: `${property.id}`,
            value: property.value
          };
        }
      }
      return null;
    }).filter((app) => app !== null);
  }

  /**
   * Open Application Properties modal
   *
   * @param builder
   * @param app
   */
  openApp(builder, app: any) {
    const version = builder.formGroup.get('appsVersion').get(app.name).value || app.version;
    const options = builder.builderAppsProperties[app.name] ? builder.builderAppsProperties[app.name] : app.options;
    const appPropertiesSource = new AppPropertiesSource(Object.assign([], options
      .map((property) => Object.assign({}, property))));
    appPropertiesSource.confirm.subscribe((properties: Array<any>) => {
      builder.builderAppsProperties[app.name] = properties;
      this.changeDetector.markForCheck();
    });
    this.appPropertiesModal.app = new App();
    this.appPropertiesModal.app.name = app.name;
    this.appPropertiesModal.app.type = app.type;
    this.appPropertiesModal.app.version = version;
    this.appPropertiesModal.setData(appPropertiesSource);
    this.appPropertiesModal.isOpen = true;
  }

  /**
   * Remove an error property
   */
  removeError(value: { type: string, index: number }) {
    const errors = this.refBuilder.errors[value.type];
    if (errors[value.index]) {
      errors.splice(value.index, 1);
    }
    this.properties = this.getProperties();
  }

  /**
   * Emit a request deploy
   */
  launchTask() {
    if (!this.isSubmittable(this.refBuilder)) {
      this.notificationService.error('An error occurred', 'Some field(s) are invalid.');
    } else {
      this.launch.emit(this.getProperties());
    }
  }

  /**
   * Emit a request export
   */
  exportProps() {
    this.exportProperties.emit(this.getProperties());
  }

  /**
   * Copye to clipboard
   */
  copyToClipboard() {
    this.copyProperties.emit(this.getProperties());
  }

}
