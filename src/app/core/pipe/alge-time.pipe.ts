import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: true,
  name: 'algeTime'
})
export class AlgeTimePipe implements PipeTransform {

  transform(value: number, ...args: unknown[]): unknown {
    if (value < 0) return "--:--:--,--"
    const tStr = value.toString();
    const tL = tStr.length;

    const h = parseInt(tStr.substring(tL - 4, tL - 1)); // milliseconds
    let s = parseInt(tStr.substring(0, tL - 4)); // total seconds

    const m = Math.floor(s / 60);
    const H = Math.floor(m / 60);

    s = s % 60;
    const minutes = m % 60;

    const pad2 = (n: number) => n.toString().padStart(3, '0');
    const pad = (n: number) => n.toString().padStart(2, '0');

    return `${pad(H)}:${pad(minutes)}:${pad(s)},${pad2(h)}`;
  }

}
