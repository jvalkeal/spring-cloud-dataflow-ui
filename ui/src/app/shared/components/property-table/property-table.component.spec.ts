import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyTableComponent } from './property-table.component';

describe('PropertyTableComponent', () => {
  let component: PropertyTableComponent;
  let fixture: ComponentFixture<PropertyTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PropertyTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PropertyTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
