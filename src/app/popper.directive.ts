import { Directive, Input, ElementRef } from '@angular/core';
import { createPopper, Instance, Placement } from '@popperjs/core';

@Directive({
  selector: '[popper]'
})
export class PopperDirective {

  private popper : Instance;

  @Input () text : string;

  constructor(private readonly el: ElementRef) { }

  ngOnInit() {

    let tooltipEl = this.el.nativeElement.getElementsByClassName("tooltip")[0] as HTMLElement

    if (this.text) {
      tooltipEl = document.createElement("div");
      tooltipEl.className = "tooltip";
      tooltipEl.innerText = this.text;
      document.body.appendChild(tooltipEl)
    }
    this.popper = createPopper(this.el.nativeElement, tooltipEl, {
      placement: "right" as Placement
    });
  }

  ngOnDestroy(): void {
    if (!this.popper) {
      return;
    }
    
    this.popper.destroy();
  }

}
