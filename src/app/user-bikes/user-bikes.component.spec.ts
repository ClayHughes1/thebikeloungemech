import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserBikesComponent } from './user-bikes.component';

describe('UserBikesComponent', () => {
  let component: UserBikesComponent;
  let fixture: ComponentFixture<UserBikesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserBikesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserBikesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
