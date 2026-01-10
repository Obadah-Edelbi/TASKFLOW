import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatTicketComponent } from './creat-ticket.component';

describe('CreatTicketComponent', () => {
  let component: CreatTicketComponent;
  let fixture: ComponentFixture<CreatTicketComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreatTicketComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreatTicketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
