import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {GroupBoxComponent} from './layout/group-box/group-box.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, GroupBoxComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  standalone: true
})
export class AppComponent {
  title = 'SwimResultsHelperApplication';
}
