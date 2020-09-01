import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { StopComponent } from '../../executions/stop/stop.component';
import { ConfirmComponent } from '../../../shared/component/confirm/confirm.component';
import { LogComponent } from '../../executions/execution/log/log.component';
import { RoleDirective } from '../../../security/directive/role.directive';
import { FormsModule } from '@angular/forms';
import { ClarityModule } from '@clr/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SecurityServiceMock } from '../../../tests/api/security.service.mock';
import { AboutServiceMock } from '../../../tests/api/about.service.mock';
import { NotificationServiceMock } from '../../../tests/service/notification.service.mock';
import { JobServiceMock } from '../../../tests/api/job.service.mock';
import { TaskServiceMock } from '../../../tests/api/task.service.mock';
import { ToolsServiceMock } from '../../../tests/service/task-tools.service.mock';
import { StepComponent } from './step.component';
import { SettingsServiceMock } from '../../../tests/service/settings.service.mock';

describe('tasks-jobs/jobs/step/step.component.ts', () => {

  let component: StepComponent;
  let fixture: ComponentFixture<StepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        StepComponent,
        StopComponent,
        ConfirmComponent,
        LogComponent,
        RoleDirective
      ],
      imports: [
        FormsModule,
        ClarityModule,
        RouterTestingModule.withRoutes([]),
        BrowserAnimationsModule,
      ],
      providers: [
        SecurityServiceMock.provider,
        AboutServiceMock.provider,
        NotificationServiceMock.provider,
        JobServiceMock.provider,
        TaskServiceMock.provider,
        ToolsServiceMock.provider,
        SettingsServiceMock.provider,
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StepComponent);
    component = fixture.componentInstance;
    NotificationServiceMock.mock.clearAll();
  });

  it('should be created', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

});
