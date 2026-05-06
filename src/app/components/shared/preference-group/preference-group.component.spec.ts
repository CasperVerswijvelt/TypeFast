import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PreferenceGroupComponent } from './preference-group.component';

describe('PreferenceGroupComponent', () => {
  let fixture: ComponentFixture<PreferenceGroupComponent>;
  let host: HTMLElement;

  function setup(currentOpen: string, groupKey = 'general') {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    fixture = TestBed.createComponent(PreferenceGroupComponent);
    fixture.componentRef.setInput('groupKey', groupKey);
    fixture.componentRef.setInput('title', 'General');
    fixture.componentRef.setInput('currentOpen', currentOpen);
    fixture.detectChanges();
    host = fixture.nativeElement as HTMLElement;
  }

  it('renders the title and toggle button collapsed by default', () => {
    setup('');
    const btn = host.querySelector<HTMLButtonElement>(
      '.preferences-group-title',
    );
    expect(btn?.textContent).toContain('General');
    expect(btn?.getAttribute('aria-expanded')).toBe('false');
    expect(
      host
        .querySelector('.preferences-group')
        ?.classList.contains('preferences-group-opened'),
    ).toBeFalse();
  });

  it('marks the group expanded when currentOpen matches groupKey', () => {
    setup('general', 'general');
    const btn = host.querySelector<HTMLButtonElement>(
      '.preferences-group-title',
    );
    expect(btn?.getAttribute('aria-expanded')).toBe('true');
    expect(
      host
        .querySelector('.preferences-group')
        ?.classList.contains('preferences-group-opened'),
    ).toBeTrue();
  });

  it('emits toggled with the groupKey when the title is clicked', () => {
    setup('', 'appearance');
    const emitted: string[] = [];
    fixture.componentRef.instance.toggled.subscribe((v) => emitted.push(v));

    host.querySelector<HTMLButtonElement>('.preferences-group-title')!.click();

    expect(emitted).toEqual(['appearance']);
  });

  it('shows the optional valueText when provided', () => {
    setup('');
    fixture.componentRef.setInput('valueText', 'Dark');
    fixture.detectChanges();
    expect(
      host.querySelector('.preferences-group-title-value')?.textContent?.trim(),
    ).toBe('Dark');
  });

  it('wires entriesId to the aria-controls attribute', () => {
    setup('');
    const btn = host.querySelector<HTMLButtonElement>(
      '.preferences-group-title',
    );
    const entries = host.querySelector('.preferences-group-entries');
    expect(btn?.getAttribute('aria-controls')).toBe(
      entries?.getAttribute('id'),
    );
  });
});
