import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BikeDetailComponent } from './bike-detail.component';

describe('BikeDetailComponent', () => {
  let component: BikeDetailComponent;
  let fixture: ComponentFixture<BikeDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BikeDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BikeDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
