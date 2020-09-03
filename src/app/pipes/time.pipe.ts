import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'time',
})
export class TimePipe implements PipeTransform {
  transform(value: number): string {
    let seconds = value % 60;
    let minutes = ((value - seconds) % 3600) / 60;
    let hours = (value - minutes * 60 - seconds) / 3600;

    return `${hours > 0 ? hours + ':' : ''}${
      hours > 0 ? this.pad(minutes) + ':' : minutes > 0 ? minutes + ':' : ''
    }${minutes > 0 || hours > 0 ? this.pad(seconds) : seconds + ''}`;
  }

  pad(value: number) {
    let res = value + '';
    while (res.length < 2) {
      res = '0' + res;
    }

    return res;
  }
}
