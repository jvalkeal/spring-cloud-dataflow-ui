import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxPaginationModule } from 'ngx-pagination';
import { BusyModule } from 'tixif-ngx-busy';
import {ModalDirective, ModalModule, PopoverModule} from 'ngx-bootstrap';
import { ToastyService } from 'ng2-toasty';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { RolesDirective } from '../auth/directives/roles.directive';
import { AppsComponent } from './apps.component';
import { MockToastyService } from '../tests/mocks/toasty';
import { AppsService } from './apps.service';
import { TriStateButtonComponent } from '../shared/components/tri-state-button.component';
import { TriStateCheckboxComponent } from '../shared/components/tri-state-checkbox.component';
import { MockAuthService } from '../tests/mocks/auth';
import { AuthService } from '../auth/auth.service';
import { MockAppsService } from '../tests/mocks/apps';

describe('AppsComponent', () => {
  let component: AppsComponent;
  let fixture: ComponentFixture<AppsComponent>;
  const toastyService = new MockToastyService();
  const authService = new MockAuthService();

  beforeEach(async(() => {
    const appsService = new MockAppsService();
    TestBed.configureTestingModule({
      declarations: [
        TriStateButtonComponent,
        TriStateCheckboxComponent,
        RolesDirective,
        AppsComponent
      ],
      imports: [
        FormsModule,
        ReactiveFormsModule,
        BusyModule,
        NgxPaginationModule,
        ModalModule.forRoot(),
        // PopoverModule.forRoot(),
        RouterTestingModule.withRoutes([])
      ],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: AppsService, useValue: appsService },
        { provide: ToastyService, useValue: toastyService }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppsComponent);
    component = fixture.componentInstance;
  });

  it('should be created', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
