import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotorcycleViewerComponent } from './motorcycle-viewer.component';

describe('MotorcycleViewerComponent', () => {
  let component: MotorcycleViewerComponent;
  let fixture: ComponentFixture<MotorcycleViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MotorcycleViewerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MotorcycleViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
