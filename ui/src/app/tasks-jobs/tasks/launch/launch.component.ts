import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { DateTime } from 'luxon';
import { saveAs } from 'file-saver';
import { Task } from '../../../shared/model/task.model';
import { NotificationService } from '../../../shared/service/notification.service';
import { HttpError } from '../../../shared/model/error.model';
import { LoggerService } from '../../../shared/service/logger.service';
import { ClipboardCopyService } from '../../../shared/service/clipboard-copy.service';
import { TaskService } from '../../../shared/api/task.service';
import { TaskLaunchService } from './task-launch.service';

@Component({
  selector: 'app-launch',
  templateUrl: './launch.component.html',
  providers: [
    TaskLaunchService
  ],
  styles: []
})
export class LaunchComponent implements OnInit, OnDestroy {

  task: Task;
  loading = true;
  isLaunching = false;
  state: any = { view: 'builder' };
  ngUnsubscribe$: Subject<any> = new Subject();
  properties: Array<string> = [];
  ignoreProperties: Array<string> = [];

  constructor(
    private route: ActivatedRoute,
    private notificationService: NotificationService,
    private loggerService: LoggerService,
    private taskService: TaskService,
    private router: Router,
    private clipboardCopyService: ClipboardCopyService) {
  }

  /**
   * Initialize compoment
   * Subscribe to route params and load a config for a task
   */
  ngOnInit() {
    this.route.params
      .pipe(
        mergeMap(
          params => {
            this.task = new Task();
            this.task.name = params.name;
            return this.taskService.getTask(params.name, true);
          }
        ),
        map((task: Task) => {
          let parameters = '';
          if (task.lastTaskExecution && task.lastTaskExecution.deploymentProperties) {
            parameters = Object.keys(task.lastTaskExecution.deploymentProperties)
              .map(key => (task.lastTaskExecution.deploymentProperties[key] === '******')
                ? ''
                : `${key}=${task.lastTaskExecution.deploymentProperties[key]}`
              )
              .filter(param => !!param)
              .join('\n');
          }
          return {
            task,
            parameters
          };
        }),
        mergeMap(
          ({ task, parameters }) => this.taskService.getPlatforms().pipe(
            map(platforms => ({
              platforms,
              task,
              parameters
            }))
          )
        )
      )
      .subscribe(({ task, parameters, platforms }) => {
        this.task = task;
        this.loading = false;
      }, (error) => {
        this.notificationService.error('An error occurred', error);
        if (HttpError.is404(error)) {
          this.router.navigate(['/tasks-jobs/tasks']);
        }
      });
  }

  /**
   * On Destroy operations
   */
  ngOnDestroy() {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  /**
   * Update the properties
   */
  update(value: Array<string>) {
    this.properties = value.sort();
  }

  /**
   * Run export file
   * Update the properties
   * @param value Array of properties
   */
  runExport(value: Array<string>) {
    this.update(value);
    if (this.properties.length === 0) {
      this.notificationService.error('An error occured', 'There are no properties to export.');
    } else {
      const propertiesText = this.properties.join('\n');
      const date = DateTime.local().toFormat('yyyy-MM-HHmmss');
      const filename = `${this.task.name}_${date}.txt`;
      const blob = new Blob([propertiesText], { type: 'text/plain' });
      saveAs(blob, filename);
    }
  }

  /**
   * Run copy to clipboard
   * Update the properties
   * @param value Array of properties
   */
  runCopy(value: Array<string>) {
    this.update(value);
    if (this.properties.length === 0) {
      this.notificationService.error('An error occured', 'There are no properties to copy.');
    } else {
      const propertiesText = this.properties.join('\n');
      this.clipboardCopyService.executeCopy(propertiesText);
      this.notificationService.success('Copy to clipboard', 'The properties have been copied to your clipboard.');
    }
  }

  /**
   * Run launch
   * Update the properties
   * @param value Array of properties
   */
  runLaunch(value: Array<string>) {
    this.isLaunching = true;
    this.update(value);
    const prepared = this.prepareParams(this.task.name, [], this.properties);
    this.taskService.launch(prepared.name, prepared.args, prepared.props)
      .subscribe(() => {
          this.notificationService.success('Launch success', `Successfully launched task definition "${this.task.name}"`);
          this.router.navigate(['/tasks-jobs/tasks']);
        },
        error => {
          const err = error.message ? error.message : error.toString();
          this.notificationService.error('An error occurred', err ? err : 'An error occurred during the task launch.');
        });
  }

  prepareParams(name: string, args: Array<string>, props: Array<string>): any {
    return {
      name,
      args: args.filter((a) => a !== '').join(' '),
      props: props.filter((a) => a !== '').join(', ')
    };
  }
}
