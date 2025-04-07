import {Injectable, NgZone} from '@angular/core';
import {BehaviorSubject, distinctUntilChanged, ReplaySubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AlgeService {
  private messageSubject = new ReplaySubject<string>();
  public message = this.messageSubject.asObservable();

  private liveTimingActiveSubject = new ReplaySubject<boolean>();
  public liveTimingActive = this.liveTimingActiveSubject.asObservable();

  private udpActiveSubject = new ReplaySubject<boolean>();
  public udpActive = this.udpActiveSubject.asObservable();

  constructor(
    private ngZone: NgZone
  ) { }

  sendMessage(msg: string) {
    console.log("send message")
    this.ngZone.run(() => {
      this.messageSubject.next(msg);
    })
  }

  setUdpActive(active: boolean) {
    this.udpActiveSubject.next(active);
  }

  setLiveTimingActive(active: boolean) {
    this.liveTimingActiveSubject.next(active);
  }

}
