import {Component, Input} from '@angular/core';
import {NgIf} from '@angular/common';

@Component({
  selector: 'sr-group-box',
  imports: [
    NgIf
  ],
  templateUrl: './group-box.component.html',
  styleUrl: './group-box.component.scss',
  standalone: true
})
export class GroupBoxComponent {
  @Input() boxTitle?: string;
}
