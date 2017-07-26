import {Component, OnInit, OnDestroy, ContentChildren, QueryList, forwardRef, ViewChildren} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TasksService } from '../tasks.service';
import { PropertyTableComponent } from '../../shared/components/property-table/property-table.component';

@Component({
  selector: 'app-task-launch',
  templateUrl: './task-launch.component.html',
})
export class TaskLaunchComponent implements OnInit, OnDestroy {

  id: string;
  private sub: any;
  @ViewChildren(PropertyTableComponent) propertyTables;

  constructor(
    private tasksService: TasksService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.id = params['id'];
    });
   }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  back() {
    this.router.navigate(['tasks/definitions']);
  }

  launch(name: string) {
    const taskArguments = [];
    const taskProperties = [];
    this.propertyTables.toArray().forEach(t => {
      if (t.id === 'arguments') {
        t.getProperties().forEach(item => {
          taskArguments.push(item.key + '=' + item.value);
        });
      }
      if (t.id === 'properties') {
        t.getProperties().forEach(item => {
          taskProperties.push(item.key + '=' + item.value);
        });
      }
    });
    this.tasksService.launchDefinition(name, taskArguments.join(','), taskProperties.join(',')).subscribe();
    this.router.navigate(['tasks/definitions']);
  }
}
