import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {GroupBoxComponent} from './layout/group-box/group-box.component';
import {ElectronService} from './core/service/electron.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, GroupBoxComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  standalone: true
})
export class AppComponent {
  title = 'SwimResultsHelperApplication';

  udpActive: boolean = false;
  livetimingActive: boolean = false;

  constructor(
    private electronService: ElectronService
  ) {
  }

  startUdp() {
    this.udpActive = true;
    this.electronService.startUdpListener();
  }

  stopUdp() {
    this.udpActive = false;
    this.electronService.stopUdpListener();
  }

  startLiveTiming() {
    this.livetimingActive = true;

  }

  stopLiveTiming() {
    this.livetimingActive = false;

  }

  electronInfo() {
    return this.electronService.isElectron ? 'Electron' : 'Web';
  }
}
