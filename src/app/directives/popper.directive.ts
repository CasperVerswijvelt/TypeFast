import { Directive, Input, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { createPopper, Instance, Placement } from '@popperjs/core';

@Directive({
  selector: '[popper]',
  standalone: true,
})
export class PopperDirective implements OnInit, OnDestroy {
  private popper: Instance | null = null;
  private tooltipEl: HTMLElement | null = null;
  private ownsTooltip = false;

  @Input() text: string;
  @Input() placement: Placement = 'right';

  constructor(private readonly el: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    let tooltipEl =
      this.el.nativeElement.querySelector<HTMLElement>('.tooltip');

    if (this.text) {
      tooltipEl = document.createElement('div');
      tooltipEl.className = 'tooltip';
      tooltipEl.innerText = this.text;
      this.el.nativeElement.appendChild(tooltipEl);
      this.ownsTooltip = true;
    }

    if (!tooltipEl) return;

    // popover="manual" lifts the tooltip into the top layer when shown,
    // so it escapes any ancestor's overflow/clip context (including a
    // <dialog> opened with showModal()).
    tooltipEl.setAttribute('popover', 'manual');
    this.tooltipEl = tooltipEl;

    const host = this.el.nativeElement;
    host.addEventListener('mouseenter', this.show);
    host.addEventListener('mouseleave', this.hide);
    host.addEventListener('focusin', this.show);
    host.addEventListener('focusout', this.hide);
  }

  ngOnDestroy(): void {
    const host = this.el.nativeElement;
    host.removeEventListener('mouseenter', this.show);
    host.removeEventListener('mouseleave', this.hide);
    host.removeEventListener('focusin', this.show);
    host.removeEventListener('focusout', this.hide);
    this.popper?.destroy();
    this.popper = null;
    if (this.ownsTooltip) this.tooltipEl?.remove();
  }

  private readonly show = (): void => {
    if (!this.tooltipEl) return;
    this.tooltipEl.showPopover();
    this.popper = createPopper(this.el.nativeElement, this.tooltipEl, {
      placement: this.placement,
      strategy: 'fixed',
      modifiers: [
        { name: 'preventOverflow', options: { padding: 8 } },
        {
          name: 'flip',
          options: { fallbackPlacements: ['left', 'top', 'bottom'] },
        },
      ],
    });
  };

  private readonly hide = (): void => {
    if (!this.tooltipEl) return;
    this.popper?.destroy();
    this.popper = null;
    this.tooltipEl.hidePopover();
  };
}
