import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {GroupBoxComponent} from './layout/group-box/group-box.component';
import {ElectronService} from './core/service/electron.service';
import {AlgeService} from './core/service/alge.service';
import {Subscription} from 'rxjs';
import {FormsModule} from '@angular/forms';
import {Competitor, CurrentHeatModel} from './core/model/current-heat.model';
import {ConnectionState, State} from './core/model/state.model';
import {AlgeTimePipe} from './core/pipe/alge-time.pipe';
import {ImportService} from './core/service/import.service';
import {ImportConfig} from './core/model/import-config.model';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, GroupBoxComponent, FormsModule, AlgeTimePipe, TranslatePipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  standalone: true
})
export class AppComponent {
  title = 'SwimResultsHelperApplication';

  messageSubscription: Subscription;
  udpActiveSubscription: Subscription;
  currentHeatSubscription: Subscription;
  stateSubscription: Subscription;
  algeStateSubscription: Subscription;

  liveTimingActiveSubscription: Subscription;
  importConfigSubscription: Subscription;
  srStateSubscription: Subscription;

  udpActive: boolean = false;
  liveTimingActive: boolean = false;

  currentHeat: CurrentHeatModel = {} as CurrentHeatModel;
  state: State = State.NOT_RUNNING;
  algeState: ConnectionState = ConnectionState.DISCONNECTED;

  importConfig: ImportConfig = {} as ImportConfig;
  srState: ConnectionState | string = ConnectionState.DISCONNECTED;

  messages: string[] = [];

  udpPort: number = 26;
  udpAddress: string = "0.0.0.0";

  collectLog: boolean = false;

  constructor(
    private electronService: ElectronService,
    private algeService: AlgeService,
    private importService: ImportService,
    private translateService: TranslateService
  ) {
    this.messageSubscription = this.algeService.message.subscribe(msg => {
      if (this.collectLog)
        this.messages = [msg, ...this.messages];
    })

    this.udpActiveSubscription = this.algeService.udpActive.subscribe(state => {
      this.udpActive = state;
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

    // ---

    this.liveTimingActiveSubscription = this.importService.liveTimingActive.subscribe(state => {
      this.liveTimingActive = state;
    })

    this.srStateSubscription = this.importService.srState.subscribe(state => {
      this.srState = state;
    })

    this.importConfigSubscription = this.importService.config.subscribe(config => {
      this.importConfig = config;
    })
  }

  startUdp() {
    this.electronService.startUdpListener(this.udpPort, this.udpAddress);
  }

  stopUdp() {
    this.electronService.stopUdpListener();
  }

  startLiveTiming() {
    if (this.currentHeat) {
      this.algeService.setCurrentHeat(this.currentHeat);
    }
    this.importService.setLiveTimingActive(true);
  }

  stopLiveTiming() {
    this.importService.setLiveTimingActive(false);

  }

  electronInfo() {
    return this.electronService.isElectron ? 'Electron' : 'Web';
  }

  saveConfig() {
    this.importService.saveConfig(this.importConfig);
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

  getClassForConnectionState(state: ConnectionState | string): string {
    switch (state) {
      case ConnectionState.CONNECTED:
        return "success"
      case "OK":
        return "success"
      case ConnectionState.DISCONNECTED:
        return "error"
      default:
        return "info";
    }
  }

  protected readonly State = State;

  getAvailableMeters(): number[] {
    if (!this.currentHeat.competitors || this.currentHeat.competitors.size <= 0) return [];
    return Array.from(new Set(Array.from(this.currentHeat.competitors.values()).map(c => {
      return Array.from(c.splits.keys());
    }).reduce((acc, curr) => {
      return acc.concat(curr);
    }))).sort();
  }

  getCompetitorsSorted(): Competitor[] {
    return Array.from(this.currentHeat.competitors.values()).sort((a, b) => {
      return a.lane - b.lane;
    });
  }

  changeLanguage(lang: string) {
    this.translateService.use(lang);
  }

  toggleLog() {
    this.collectLog = !this.collectLog;
  }
}
