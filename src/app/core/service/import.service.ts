import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, PartialObserver, throwError} from 'rxjs';
import {ImportConfig} from '../model/import-config.model';
import {ConnectionState} from '../model/state.model';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ImportService {
  private configSubject = new BehaviorSubject<ImportConfig>({
    apiUrl: "https://api-dev.swimresults.de/",
    password: ""
  } as ImportConfig);
  public config = this.configSubject.asObservable();

  private liveTimingActiveSubject = new BehaviorSubject<boolean>(false);
  public liveTimingActive = this.liveTimingActiveSubject.asObservable();

  private srStateSubject = new BehaviorSubject<ConnectionState | string>(ConnectionState.DISCONNECTED);
  public srState = this.srStateSubject.asObservable();

  constructor(
    private httpClient: HttpClient
  ) {
  }

  saveConfig(config: ImportConfig) {
    this.configSubject.next(config);
  }

  setLiveTimingActive(active: boolean) {
    this.liveTimingActiveSubject.next(active);
  }

  log(msg: string) {
    console.log(msg);
  }

  post(url: string, data: any): Observable<any> {
    return this.httpClient.post(url, data, { responseType: "text" });
  }

  sendData(data: any): Observable<string> {
    if (this.liveTimingActiveSubject.value) {
      return this.post(this.configSubject.value.apiUrl + "import/v1/alge", data);
    } else {
      console.log("blocked sending because of inactive live timing");
      return throwError(() => new Error("live timing is not active."));
    }
  }


  startHeat(event: number, heat: number) {
    this.log(`start heat: E: ${event} H: ${heat}`);

    let json = {
      'password': this.configSubject.value.password,
      'action': 'START',
      'event': event,
      'heat': heat
    }

    this.sendData(json).subscribe({
      next: value => {
        console.log("response: " + value);
        this.srStateSubject.next(value);
      }
    })
  }

  laneTime(lane: number, time: number, meter: number, done: boolean) {
    let doneString = done ? "yes" : "";
    this.log(`lane time (${lane}): ${time} ${meter}m ${doneString}`)

    let json = {
      'password': this.configSubject.value.password,
      'action': 'time',
      'lane': lane,
      'time': time,
      'meter': meter,
      'finished': doneString
    }

    this.sendData(json).subscribe(this.handleResponse)
  }

  stopHeat(event: number, heat: number) {
    this.log(`stop heat: E: ${event} H: ${heat}`)

    let json = {
      'password': this.configSubject.value.password,
      'action': 'STOP'
    }

    this.sendData(json).subscribe(this.handleResponse)
  }

  handleResponse: PartialObserver<string> = {
    next: value => {
      console.log("response: " + value);
      this.srStateSubject.next(value);
    },
    error: _ => {
      this.srStateSubject.next(ConnectionState.DISCONNECTED);
    }
  }
}
