import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { NgxPaginationModule } from 'ngx-pagination';

import { TasksComponent } from './tasks.component';
import { TaskAppsComponent } from './task-apps/task-apps.component';
import { TaskDefinitionsComponent } from './task-definitions/task-definitions.component';
import { TaskCreateComposedTaskComponent } from './task-create-composed-task/task-create-composed-task.component';
import { TaskExecutionsComponent } from './task-executions/task-executions.component';
import { TaskExecutionsDetailsComponent } from './task-details/task-details.component';
import { TasksService } from './tasks.service';
import { TasksRoutingModule } from './tasks-routing.module';

@NgModule({
  imports: [
    TasksRoutingModule,
    SharedModule,
    NgxPaginationModule
  ],
  declarations: [
    TasksComponent,
    TaskAppsComponent,
    TaskDefinitionsComponent,
    TaskCreateComposedTaskComponent,
    TaskExecutionsComponent,
    TaskExecutionsDetailsComponent
  ],
  providers: [
    TasksService
  ]
})
export class TasksModule { }
