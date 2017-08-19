import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { StepExecutionProgressComponent } from './step-execution-progress.component';
import { ActivatedRoute } from '@angular/router';
import { ToastyService } from 'ng2-toasty';
import { RouterTestingModule } from '@angular/router/testing';
import { JobsService } from '../jobs.service';
import { MockJobsService } from '../../tests/mocks/jobs';
import { MockActivatedRoute } from '../../tests/mocks/activated-route';
import { JobExecutionStatusComponent } from '../components/job-execution-status.component';
import { DataflowDurationPipe } from '../../shared/pipes/dataflow-duration.pipe';
import { MapValuesPipe } from '../../shared/pipes/map-values-pipe.pipe';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { JOBS_EXECUTIONS_1_STEPS_1 } from '../../tests/mocks/mock-data';
import { MockToastyService } from '../../tests/mocks/toasty';

describe('StepExecutionProgressComponent', () => {
  let component: StepExecutionProgressComponent;
  let fixture: ComponentFixture<StepExecutionProgressComponent>;
  let de: DebugElement;
  let el: HTMLElement;
  let activeRoute: MockActivatedRoute;
  let jobsService: MockJobsService;
  const toastyService = new MockToastyService();

  beforeEach(async(() => {
    jobsService = new MockJobsService();
    activeRoute = new MockActivatedRoute();
    TestBed.configureTestingModule({
      declarations: [
        StepExecutionProgressComponent
      ],
      imports: [
        RouterTestingModule.withRoutes([])
      ],
      providers: [
        { provide: JobsService, useValue: jobsService },
        { provide: ActivatedRoute, useValue: activeRoute },
        { provide: ToastyService, useValue: toastyService }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StepExecutionProgressComponent);
    component = fixture.componentInstance;
  });

  it('should be created', () => {
    activeRoute.testParams = { jobid: '1', stepid: '1' };
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should populate execution progress', () => {
    activeRoute.testParams = { jobid: '1', stepid: '1' };
    fixture.detectChanges();

    de = fixture.debugElement.query(By.css('h1'));
    el = de.nativeElement;
    expect(el.textContent).toContain('Step Execution Progress for Step \'job1step1\'');
  });

  it('back should navigate to step execution details', () => {
    activeRoute.testParams = { jobid: '1', stepid: '1' };
    de = fixture.debugElement.query(By.css('button[type=button]'));
    el = de.nativeElement;
    const navigate = spyOn((<any>component).router, 'navigate');
    fixture.detectChanges();
    el.click();

    expect(navigate).toHaveBeenCalledWith(['jobs/executions/1/1']);
  });
});
