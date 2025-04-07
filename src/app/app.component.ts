import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {GroupBoxComponent} from './layout/group-box/group-box.component';
import {ElectronService} from './core/service/electron.service';
import {AlgeService} from './core/service/alge.service';
import {Subscription} from 'rxjs';
import {NgForOf} from '@angular/common';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, GroupBoxComponent, NgForOf, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  standalone: true
})
export class AppComponent {
  title = 'SwimResultsHelperApplication';

  messageSubscription: Subscription;
  udpActiveSubscription: Subscription;
  liveTimingActiveSubscription: Subscription;

  udpActive: boolean = false;
  liveTimingActive: boolean = false;

  messages: string[] = [];

  udpPort: number = 26;
  udpAddress: string = "0.0.0.0";

  constructor(
    private electronService: ElectronService,
    private algeService: AlgeService
  ) {
    this.messageSubscription = this.algeService.message.subscribe(msg => {
      console.log("received message update:")
      console.log(msg)
      this.messages = [msg, ...this.messages];
    })

    this.udpActiveSubscription = this.algeService.udpActive.subscribe(state => {
      this.udpActive = state;
    })

    this.liveTimingActiveSubscription = this.algeService.liveTimingActive.subscribe(state => {
      this.liveTimingActive = state;
    })
  }

  startUdp() {
    this.electronService.startUdpListener(this.udpPort, this.udpAddress);
  }

  stopUdp() {
    this.electronService.stopUdpListener();
  }

  startLiveTiming() {
    this.algeService.setLiveTimingActive(true);
  }

  stopLiveTiming() {
    this.algeService.setLiveTimingActive(false);

  }

  electronInfo() {
    return this.electronService.isElectron ? 'Electron' : 'Web';
  }

  saveConfig() {

  }
}
