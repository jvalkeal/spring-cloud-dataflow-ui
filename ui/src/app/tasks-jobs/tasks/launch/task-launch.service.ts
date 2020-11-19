import { Injectable } from '@angular/core';
import { from, Observable, of, pipe, zip } from 'rxjs';
import { map, mergeMap, flatMap, distinct } from 'rxjs/operators';
import { Task, TaskLaunchConfig } from '../../../shared/model/task.model';
import { TaskService } from '../../../shared/api/task.service';
import { App, ApplicationType } from '../../../shared/model/app.model';
import { AppService } from '../../../shared/api/app.service';
import { ConfigurationMetadataProperty, DetailedApp } from '../../../shared/model/detailed-app.model';
import { Utils } from '../../../flo/shared/support/utils';
import { ToolsService } from '../../../flo/task/tools.service';
import get from 'lodash.get';
import set from 'lodash.set';
import { Platform } from '../../../shared/model/platform.model';

@Injectable()
export class TaskLaunchService {

  /**
   * Platform key validation
   */
  public static platform = {
    is: (key: string): boolean => {
      return /^(spring\.cloud\.dataflow\.task\.platformName)$/.test(key);
    }
  };

  /**
   * Deployer key validation
   */
  public static deployer = {
    keyEdit: 'spring.cloud.deployer.',
    is: (key: string): boolean => {
      return /^(deployer\.)/.test(key);
    },
    extract: (key: string): string => {
      const result = key.split('.');
      if (result.length < 3) {
        return '';
      }
      return result.slice(2, result.length)
        .join('.');
    },
  };

  /**
   * Version key validation
   */
  public static version = {
    keyEdit: 'version',
    is: (key: string): boolean => {
      return /^(version\.)/.test(key);
    }
  };

  /**
   * App key validation
   */
  public static app = {
    is: (key: string): boolean => {
      return /^(app\.)/.test(key);
    },
    extract: (key: string): string => {
      const result = key.split('.');
      if (result.length < 3) {
        return '';
      }
      return result.slice(2, result.length)
        .join('.');
    }
  };

  constructor(
    private taskService: TaskService,
    private appService: AppService,
    private toolsService: ToolsService) {
  }

  config(id: string): Observable<TaskLaunchConfig> {

    return this.taskService.getTask(id, true)
      .pipe(flatMap((task: Task) => {
        const taskConversion = this.toolsService.parseTaskTextToGraph(task.dslText);
        const platforms = this.taskService.getPlatforms();
        // this.appService.getAppVersions('', ApplicationType.task);
        return zip(of(task), taskConversion, platforms);
      }))
      .pipe(flatMap(([task, taskConversion, platforms]) => {

        console.log('TEST1', ApplicationType.task.toString());

        const appNames = taskConversion.graph.nodes
          .filter(node => node.name !== 'START' && node.name !== 'END')
          .map(node => {
            return get(node, 'name') as string;
          });
        const appVersions = from(appNames)
          .pipe(distinct())
          .pipe(mergeMap(
            // ApplicationType.task
            appName => this.appService.getAppVersions(appName, 'task' as any)
              .pipe(map(apps => {
                return apps.reduce((mapAccumulator, app) => {
                  const a = mapAccumulator.get(app.name);
                  if (a) {
                    if (app.defaultVersion) {
                      a.version = app.version;
                    } else {
                      a.versions = [...a.versions, ...[app.version]];
                    }
                  } else {
                    mapAccumulator.set(app.name, {
                      version: app.defaultVersion ? app.version : null,
                      versions: app.defaultVersion ? [] : [app.version]
                    });
                  }
                  return mapAccumulator;
                }, new Map<string, { version: string, versions: string[]}>());
              }))
          ))
          ;
        const ctrOptions = this.taskService.getCtrOptions();

        return zip(of(task), of(taskConversion), of(platforms), appVersions, ctrOptions);
      }))
      .pipe(map(([task, taskConversion, platforms, appVersions, ctrOptions]) => {
        const c = new TaskLaunchConfig();
        c.id = id;

        // console.log('XXX1', task);
        // console.log('XXX2', taskConversion);
        // console.log('XXX3', platforms);
        // console.log('XXX4', appVersions);
        // console.log('XXX5', ctrOptions);

        c.apps = taskConversion.graph.nodes
          .filter(node => node.name !== 'START' && node.name !== 'END')
          .map(node => {
            const n = get(node, 'name') as string;

            return {
              origin: get(node, 'name'),
              name: get(node.metadata, 'label') || get(node, 'name'),
              type: 'task',
              version: appVersions.get(n).version,
              versions: appVersions.get(n).versions,
              options: null,
              optionsState: {
                isLoading: false,
                isOnError: false,
                isInvalid: false
              }
            };
          });

        c.deployers = [
          {
            id: 'memory',
            name: 'memory',
            form: 'autocomplete',
            type: 'java.lang.Integer',
            value: null,
            defaultValue: null,
            suffix: 'MB'
          },
          {
            id: 'cpu',
            name: 'cpu',
            form: 'autocomplete',
            type: 'java.lang.Integer',
            value: null,
            defaultValue: null,
            suffix: 'Core(s)'
          },
          {
            id: 'disk',
            name: 'disk',
            form: 'autocomplete',
            type: 'java.lang.Integer',
            value: null,
            defaultValue: null,
            suffix: 'MB'
          }
        ];

        c.platform = {
          id: 'platform',
          name: 'platform',
          form: 'select',
          type: 'java.lang.String',
          defaultValue: '',
          values: platforms.map((platform: Platform) => {
            return {
              key: platform.name,
              name: platform.name,
              type: platform.type,
              options: platform.options
            };
          })
        };
        c.ctr = ctrOptions;
        return c;
      }))
      ;
  }

  appDetails(type: ApplicationType, name: string, version: string): Observable<Array<any>> {
    return this.appService.getApp(name, type, version)
      .pipe(map((app: DetailedApp) => {
        return app.options
          .map((option: ConfigurationMetadataProperty) => {
            const opt = {
              id: option.id,
              name: option.name,
              description: option.description,
              shortDescription: option.shortDescription,
              deprecation: option.deprecation,
              sourceType: option.sourceType,
              isDeprecated: option.isDeprecated,
              type: option.type,
              defaultValue: option.defaultValue,
              isSemantic: true
            };
            if (opt.sourceType === Utils.SCRIPTABLE_TRANSFORM_SOURCE_TYPE) {
              switch (opt.name.toLowerCase()) {
                case 'language':
                  set(opt, 'valueOptions', ['groovy', 'javascript', 'ruby', 'python']);
                  break;
                case 'script':
                  set(opt, 'code', { langPropertyName: 'scriptable-transformer.language' });
                  break;
              }
            } else if (opt.sourceType === Utils.RX_JAVA_PROCESSOR_SOURCE_TYPE) {
              if (opt.name.toLowerCase() === 'code') {
                set(opt, 'code', { language: 'java' });
              }
            }
            if (opt.type) {
              switch (opt.type) {
                case 'java.util.concurrent.TimeUnit':
                  set(opt, 'valueOptions', [
                    'NANOSECONDS',
                    'MICROSECONDS',
                    'MILLISECONDS',
                    'SECONDS',
                    'MINUTES',
                    'HOURS',
                    'DAYS'
                  ]);
              }
            }
            return opt;
          });
      }));
  }

}
