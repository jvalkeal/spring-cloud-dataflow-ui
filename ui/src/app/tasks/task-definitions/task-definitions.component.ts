import { Component, OnInit, ViewChild } from '@angular/core';
import { PopoverDirective } from 'ngx-bootstrap/popover';
import { Subscription } from 'rxjs/Subscription';
import { ToastyService, ToastyConfig, ToastOptions, ToastData } from 'ng2-toasty';
import { Page } from '../../shared/model/page';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { TaskDefinition } from '../model/task-definition';
import { TasksService } from '../tasks.service';

@Component({
  selector: 'app-task-definition',
  templateUrl: './task-definitions.component.html',
})
export class TaskDefinitionsComponent implements OnInit {

  taskDefinitions: Page<TaskDefinition>;
  busy: Subscription;

  @ViewChild('childPopover')
  public childPopover: PopoverDirective;

  constructor(
    private tasksService: TasksService,
    private toastyService: ToastyService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadTaskDefinitions();
  }

  /**
   * Used for requesting a new page. The past is page number is
   * 1-index-based. It will be converted to a zero-index-based
   * page number under the hood.
   *
   * @param page 1-index-based
   */
  getPage(page: number) {
    console.log(`Getting page ${page}.`)
    this.tasksService.taskDefinitions.pageNumber = page - 1;
    this.loadTaskDefinitions();
  }

  loadTaskDefinitions() {
    console.log('Loading Task Definitions...', this.taskDefinitions);

    this.busy = this.tasksService.getDefinitions().subscribe(
      data => {
        this.taskDefinitions = data;
        this.toastyService.success('Task definitions loaded.');
      }
    );
  }

  bulkDefineTasks() {
    this.router.navigate(['tasks/bulk-define-tasks']);
  }
}
