import { Observable, of } from 'rxjs';
import { ValuedConfigurationMetadataPropertyList } from '../../shared/model/detailed-app.model';
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
        origin: 'string',
        name: 'string',
        type: 'string',
        version: 'string',
        versions: [],
        options: [],
        optionsState: {
          isLoading: false,
          isOnError: false,
          isInvalid: false
        }
      }
    ];
    config.ctr = ValuedConfigurationMetadataPropertyList.parse(CTR_OPTIONS);
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

    return of(config);
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
