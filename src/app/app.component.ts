import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {GroupBoxComponent} from './layout/group-box/group-box.component';
import {ElectronService} from './core/service/electron.service';
import {AlgeService} from './core/service/alge.service';
import {Subscription} from 'rxjs';
import {FormsModule} from '@angular/forms';
import {CurrentHeat} from './core/model/current.heat';
import {ConnectionState, State} from './core/model/state.model';
import {AlgeTimePipe} from './core/pipe/alge-time.pipe';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, GroupBoxComponent, FormsModule, AlgeTimePipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  standalone: true
})
export class AppComponent {
  title = 'SwimResultsHelperApplication';

  messageSubscription: Subscription;
  udpActiveSubscription: Subscription;
  liveTimingActiveSubscription: Subscription;
  currentHeatSubscription: Subscription;
  stateSubscription: Subscription;
  algeStateSubscription: Subscription;

  udpActive: boolean = false;
  liveTimingActive: boolean = false;

  currentHeat: CurrentHeat = {} as CurrentHeat;
  state: State = State.NOT_RUNNING;
  algeState: ConnectionState = ConnectionState.DISCONNECTED;
  srState: ConnectionState = ConnectionState.DISCONNECTED;

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

    this.currentHeatSubscription = this.algeService.currentHeat.subscribe(heat => {
      this.currentHeat = heat;
    })

    this.stateSubscription = this.algeService.state.subscribe(state => {
      this.state = state;
    })

    this.algeStateSubscription = this.algeService.algeState.subscribe(state => {
      this.algeState = state;
    })
  }

  startUdp() {
    this.electronService.startUdpListener(this.udpPort, this.udpAddress);
  }

  stopUdp() {
    this.electronService.stopUdpListener();
  }

  startLiveTiming() {
    this.algeService.setLiveTimingActive(true, this.currentHeat);
  }

  stopLiveTiming() {
    this.algeService.setLiveTimingActive(false);

  }

  electronInfo() {
    return this.electronService.isElectron ? 'Electron' : 'Web';
  }

  saveConfig() {

  }

  getClassForState(state: State): string {
    switch (state) {
      case State.NOT_RUNNING:
        return "error"
      case State.READY:
        return "warn"
      case State.RUNNING:
        return "success"
      default:
        return "info";
    }
  }

  getClassForConnectionState(state: ConnectionState): string {
    switch (state) {
      case ConnectionState.CONNECTED:
        return "success"
      case ConnectionState.DISCONNECTED:
        return "error"
      default:
        return "info";
    }
  }

  protected readonly State = State;

  getAvailableMeters(): number[] {
    return Array.from(new Set(Array.from(this.currentHeat.competitors.values()).map(c => {
      return Array.from(c.splits.keys());
    }).reduce((acc, curr) => {
      return acc.concat(curr);
    }))).sort();
  }
}
