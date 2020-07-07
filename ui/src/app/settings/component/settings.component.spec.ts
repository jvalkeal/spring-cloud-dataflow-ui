import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { HttpClientModule } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import { ClarityModule } from '@clr/angular';
import { SettingsComponent } from './settings.component';
import * as fromSettings from '../store/settings.reducer';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;
  let mockStore: MockStore;

  const initialState = {
    [fromSettings.settingsFeatureKey]: {
      settings: [
        { name: fromSettings.themeActiveKey, value: fromSettings.themeActiveDefault }
      ]
    }
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        ClarityModule,
        StoreModule.forRoot({})
      ],
      providers: [
        provideMockStore({ initialState })
      ],
      declarations: [
        SettingsComponent
      ]
    })
    .compileComponents();
    mockStore = TestBed.inject(MockStore);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
