import { Observable, of } from 'rxjs';
import {
  ValuedConfigurationMetadataProperty, ValuedConfigurationMetadataPropertyList
} from '../../shared/model/detailed-app.model';
import { TaskLaunchConfig } from '../../shared/model/task.model';
import { TaskLaunchService } from '../../tasks-jobs/tasks/launch/task-launch.service';
import { ApplicationType } from '../../shared/model/app.model';
import { CTR_OPTIONS } from '../data/task';

export class TaskLaunchServiceMock {
  static mock: any = null;

  config(id: string): Observable<TaskLaunchConfig> {
    const config = new TaskLaunchConfig();
    config.id = id;
    config.platform = {
      id: 'platform',
      name: 'platform',
      form: 'select',
      type: 'java.lang.String',
      defaultValue: '',
      values: [
        {
          key: 'local',
          name: 'local',
          type: 'Local',
          options: []
        }
      ]
    };
    config.apps = [
      {
        origin: 'timestamp',
        name: 't1',
        type: 'task',
        version: '2.1.0.RELEASE',
        versions: [],
        options: [],
        optionsState: {
          isLoading: false,
          isOnError: false,
          isInvalid: false
        }
      },
      {
        origin: 'timestamp',
        name: 't2',
        type: 'task',
        version: '2.1.0.RELEASE',
        versions: [],
        options: [],
        optionsState: {
          isLoading: false,
          isOnError: false,
          isInvalid: false
        }
      }
    ];
    config.ctr = {
      options: ValuedConfigurationMetadataPropertyList.parse(CTR_OPTIONS),
      optionsState: {
        isLoading: false,
        isOnError: false
      }
    };
    config.deployers = [
      {
        id: 'memory',
        name: 'memory',
        form: 'autocomplete',
        type: 'java.lang.Integer',
        value: null,
        defaultValue: null,
        suffix: 'MB'
      }
    ];
    config.deploymentProperties = [];

    return of(config);
  }

  ctrOptions(): Observable<ValuedConfigurationMetadataProperty[]> {
    return of([]);
  }

  appDetails(type: ApplicationType, name: string, version: string): Observable<Array<any>> {
    return of([]);
  }

  static get provider() {
    if (!TaskLaunchServiceMock.mock) {
      TaskLaunchServiceMock.mock = new TaskLaunchServiceMock();
    }
    return { provide: TaskLaunchService, useValue: TaskLaunchServiceMock.mock };
  }
}
