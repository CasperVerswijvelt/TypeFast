import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PreferenceToggleComponent } from './preference-toggle.component';

describe('PreferenceToggleComponent', () => {
  let fixture: ComponentFixture<PreferenceToggleComponent>;
  let host: HTMLElement;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    fixture = TestBed.createComponent(PreferenceToggleComponent);
    fixture.componentRef.setInput('label', 'Reverse scroll');
    fixture.componentRef.setInput('value', false);
    fixture.detectChanges();
    host = fixture.nativeElement as HTMLElement;
  });

  it('renders the label and the toggle in its initial state', async () => {
    await fixture.whenStable();
    const label = host.querySelector('.preferences-toggle-label');
    const checkbox = host.querySelector<HTMLInputElement>(
      'input[type="checkbox"]',
    );
    expect(label?.textContent?.trim()).toBe('Reverse scroll');
    expect(checkbox).toBeTruthy();
    expect(checkbox?.checked).toBeFalse();
  });

  it('reflects the value() input on the checkbox', async () => {
    fixture.componentRef.setInput('value', true);
    fixture.detectChanges();
    // ngModel writes the model value via a microtask, so we need to wait
    // for it to settle before reading the DOM.
    await fixture.whenStable();
    const checkbox = host.querySelector<HTMLInputElement>(
      'input[type="checkbox"]',
    );
    expect(checkbox?.checked).toBeTrue();
  });

  it('emits toggled with the new checked state when the user toggles the checkbox', () => {
    const emitted: boolean[] = [];
    fixture.componentRef.instance.toggled.subscribe((v) => emitted.push(v));

    const checkbox = host.querySelector<HTMLInputElement>(
      'input[type="checkbox"]',
    )!;
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event('change'));

    expect(emitted).toEqual([true]);
  });

  it('applies preferences-entry-main when mainEntry is true', () => {
    fixture.componentRef.setInput('mainEntry', true);
    fixture.detectChanges();
    expect(host.classList.contains('preferences-entry-main')).toBeTrue();
  });

  it('omits preferences-entry-main when mainEntry is false', () => {
    fixture.componentRef.setInput('mainEntry', false);
    fixture.detectChanges();
    expect(host.classList.contains('preferences-entry-main')).toBeFalse();
  });

  it('appends extraClass when provided', () => {
    fixture.componentRef.setInput('extraClass', 'my-extra');
    fixture.detectChanges();
    expect(host.classList.contains('my-extra')).toBeTrue();
  });
});
