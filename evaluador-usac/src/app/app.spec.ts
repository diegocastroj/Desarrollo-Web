import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app'; 
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()] // Le damos un teléfono simulado al robot
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    // Le decimos al robot que ahora busque tu nuevo título
    expect(compiled.querySelector('h1')?.textContent).toContain('Lista de Catedráticos de la USAC');
  });
});