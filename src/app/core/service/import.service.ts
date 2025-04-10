import { Injectable } from '@angular/core';
import {BehaviorSubject, ReplaySubject} from 'rxjs';
import {ImportConfig} from '../model/import-config.model';
import {ConnectionState} from '../model/state.model';

@Injectable({
  providedIn: 'root'
})
export class ImportService {
  private configSubject = new BehaviorSubject<ImportConfig>({apiUrl: "https://api.swimresults.de/", password: ""} as ImportConfig);
  public config = this.configSubject.asObservable();

  private liveTimingActiveSubject = new ReplaySubject<boolean>();
  public liveTimingActive = this.liveTimingActiveSubject.asObservable();

  private srStateSubject = new BehaviorSubject<ConnectionState>(ConnectionState.DISCONNECTED);
  public srState = this.srStateSubject.asObservable();

  constructor() { }

  saveConfig(config: ImportConfig) {
    this.configSubject.next(config);
  }

  setLiveTimingActive(active: boolean) {
    this.liveTimingActiveSubject.next(active);
  }
}
