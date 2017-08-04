import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs/Observable';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { BusyModule } from 'tixif-ngx-busy';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastyService } from 'ng2-toasty';
import { Router } from '@angular/router';
import { TasksService } from '../tasks.service';
import { Page } from '../../shared/model/page';
import { AppRegistration } from '../../shared/model/app-registration';
import { ApplicationType } from '../../shared/model/application-type';
import { TaskAppsComponent } from './task-apps.component';

describe('TaskAppsComponent', () => {
  let component: TaskAppsComponent;
  let fixture: ComponentFixture<TaskAppsComponent>;
  let de: DebugElement;
  let el: HTMLElement;
  let tasksService: TasksService;

  beforeEach(async(() => {
    const tasksServiceStub = {
      getTaskAppRegistrations: function () {
        const p = new Page<AppRegistration>();
        p.items.push(new AppRegistration('fakename', ApplicationType.task, 'fakeuri'));
        return Observable.of(p);
      }
    };
    const toastyServiceStub = {
      success: function () {
      },
      error: function () {
      }
    };
    const routerStub = {};

    TestBed.configureTestingModule({
      declarations: [
        TaskAppsComponent
      ],
      imports: [
        BusyModule,
        NgxPaginationModule
      ],
      providers: [
        { provide: TasksService, useValue: tasksServiceStub },
        { provide: ToastyService, useValue: toastyServiceStub },
        { provide: Router, useValue: routerStub }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskAppsComponent);
    component = fixture.componentInstance;
    tasksService = TestBed.get(TasksService);
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('task application registered', () => {
    de = fixture.debugElement.query(By.css('tbody'));
    el = de.nativeElement;
    expect(el.textContent).toContain('fakename');
    expect(el.textContent).toContain('fakeuri');
  });
});
