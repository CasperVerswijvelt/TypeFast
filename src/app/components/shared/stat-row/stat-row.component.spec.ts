import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { StatRowComponent } from './stat-row.component';

@Component({
  imports: [StatRowComponent],
  template: `
    <table>
      <tr
        app-stat-row
        [label]="label()"
        [value]="value()"
        [valueCapitalize]="valueCapitalize()"
        [titleHover]="titleHover()"
        [hasTooltip]="hasTooltip()"
      >
        <span class="content">tooltip body</span>
      </tr>
    </table>
  `,
})
class HostComponent {
  readonly label = signal('Word accuracy');
  readonly value = signal('98.50%');
  readonly valueCapitalize = signal(false);
  readonly titleHover = signal(false);
  readonly hasTooltip = signal(true);
}

describe('StatRowComponent', () => {
  function build() {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('renders label in <th> and value in <td>', () => {
    const fixture = build();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('th')?.textContent?.trim()).toBe('Word accuracy');
    expect(host.querySelector('td')?.textContent).toContain('98.50%');
  });

  it('shows the popper-tooltip slot when hasTooltip is true', () => {
    const fixture = build();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('.info-icon-tooltip-container')).toBeTruthy();
    expect(host.querySelector('.tooltip')?.textContent).toContain(
      'tooltip body',
    );
  });

  it('hides the tooltip wrapper when hasTooltip is false', () => {
    const fixture = build();
    fixture.componentInstance.hasTooltip.set(false);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('.info-icon-tooltip-container')).toBeNull();
  });

  it('sets the title attribute only when titleHover is true', () => {
    const fixture = build();
    const td = fixture.nativeElement.querySelector(
      'td',
    ) as HTMLTableCellElement;
    expect(td.getAttribute('title')).toBeNull();

    fixture.componentInstance.titleHover.set(true);
    fixture.detectChanges();
    expect(td.getAttribute('title')).toBe('98.50%');
  });

  it('toggles the capitalize class via valueCapitalize', () => {
    const fixture = build();
    const td = fixture.nativeElement.querySelector(
      'td',
    ) as HTMLTableCellElement;
    expect(td.classList.contains('capitalize')).toBeFalse();

    fixture.componentInstance.valueCapitalize.set(true);
    fixture.detectChanges();
    expect(td.classList.contains('capitalize')).toBeTrue();
  });
});
