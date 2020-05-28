import { Directive, Input, ElementRef } from '@angular/core';
import { createPopper, Instance } from '@popperjs/core';

@Directive({
  selector: '[popper]'
})
export class PopperDirective {

  private popper : Instance;

  constructor(private readonly el: ElementRef) { }

  ngOnInit() {
    this.popper = createPopper(this.el.nativeElement, this.el.nativeElement.getElementsByClassName("tooltip")[0] as HTMLElement);
  }

  ngOnDestroy(): void {
    if (!this.popper) {
      return;
    }
    
    this.popper.destroy();
  }

}
