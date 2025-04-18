import {Injectable} from '@angular/core';
import {BehaviorSubject, ReplaySubject, Subject, switchMap, timer} from 'rxjs';
import {Competitor, CurrentHeatModel} from '../model/current-heat.model';
import {ConnectionState, State} from '../model/state.model';
import {ImportService} from './import.service';

@Injectable({
  providedIn: 'root'
})
export class AlgeService {
  private messageSubject = new ReplaySubject<string>();
  public message = this.messageSubject.asObservable();

  private udpActiveSubject = new ReplaySubject<boolean>();
  public udpActive = this.udpActiveSubject.asObservable();

  private currentHeatSubject = new BehaviorSubject<CurrentHeatModel>({
    event: 0,
    heat: 0,
    distance: 0,
    laps: 0,
    runningTime: -1,
    competitors: new Map<number, Competitor>()
  } as CurrentHeatModel);
  public currentHeat = this.currentHeatSubject.asObservable();

  private stateSubject = new BehaviorSubject<State>(State.NOT_RUNNING);
  public state = this.stateSubject.asObservable();

  private algeStateSubject = new BehaviorSubject<ConnectionState>(ConnectionState.DISCONNECTED);
  public algeState = this.algeStateSubject.asObservable();

  private pingSubject = new Subject<void>();

  constructor(
    private importService: ImportService
  ) {
    this.setupTimeoutCheck();
  }

  sendMessage(msg: string) {
    this.messageSubject.next(msg);
  }

  processUdpMessage(msg: string) {
    this.receivePing();

    msg = msg.replaceAll("\r", "")
    let fields = msg.split("\t");

    switch (fields[0]) {
      case "Time":
        if (fields[2] === "RunningTime") {
          this.currentHeatSubject.value.runningTime = Number(fields[3]);
          if (this.stateSubject.value != State.RUNNING && +fields[3] >= 0) {
            this.stateSubject.next(State.RUNNING);
            this.currentHeatSubject.value.competitors.forEach(c => {c.splits = new Map<number, number>(); c.lapM = 0;})

            this.importService.startHeat(this.currentHeatSubject.value.event, this.currentHeatSubject.value.heat);
          }
          if (+fields[3] <= -1) {
            this.stateSubject.next(State.NOT_RUNNING);
          }
        }

        if (fields[2] === "Ready" && this.stateSubject.value != State.READY) {
          this.stateSubject.next(State.READY);
          this.currentHeatSubject.value.competitors.forEach(c => {c.first_name = ""; c.last_name = ""; c.team = ""; c.lap = 0; c.lapM = 0; c.splits = new Map<number, number>();})

          this.importService.stopHeat(this.currentHeatSubject.value.event, this.currentHeatSubject.value.heat);
        }

        if (fields[2] === "LaneTime" && +fields[3] > 0) {
          let lane = Number(fields[1]);
          let c = this.getOrCreateCompetitor(lane);
          c.lap = Number(fields[7]);
          c.lapM = Number(fields[9].split(".")[0]);
          c.splits.set(c.lapM, Number(fields[3]));

          this.importService.laneTime(lane, Number(fields[3]), c.lapM, c.lap === this.currentHeatSubject.value.laps);
        }
        break;
      case "Event":
        if (fields[1] === "EventName") {
          this.currentHeatSubject.value.event = Number(fields[2]);
        }
        if (fields[1] === "Discipline") {
          this.currentHeatSubject.value.style = fields[2];
        }
        break;
      case "Heat":
        if (fields[1] === "HeatNumber") {
          this.currentHeatSubject.value.heat = Number(fields[2]);
        }
        if (fields[1] === "DistanceM") {
          this.currentHeatSubject.value.distance = Number(fields[2]);
        }
        if (fields[1] === "Laps") {
          this.currentHeatSubject.value.laps = Number(fields[2]);
        }
        break;
      case "Meet":
        break;
      case "Competitor":
          let lane = Number(fields[1]);
          let c = this.getOrCreateCompetitor(lane);
          switch (fields[2]) {
            case "FirstName":
              c.first_name = fields[3];
              break
            case "LastName":
              c.last_name = fields[3];
              break
            case "TeamName":
              if (fields[3].length > 0) {
                c.team = fields[3];
              }
              break
            case "ClubName":
              if (fields[3].length > 0) {
                c.team = fields[3];
              }
              break
          }
        break;

    }

  }

  getOrCreateCompetitor(lane: number): Competitor {
    if (!this.currentHeatSubject.value.competitors.has(lane)) {
      this.currentHeatSubject.value.competitors.set(lane, {
        lane: lane,
        first_name: "",
        last_name: "",
        team: "",
        lap: 0,
        lapM: 0,
        splits: new Map<number, number>()
      } as Competitor);
    }
    return this.currentHeatSubject.value.competitors.get(lane)!;
  }

  receivePing() {
    this.algeStateSubject.next(ConnectionState.CONNECTED);
    this.pingSubject.next();
  }

  setUdpActive(active: boolean) {
    this.udpActiveSubject.next(active);
  }

  setCurrentHeat(runningHeat: CurrentHeatModel) {
    this.currentHeatSubject.next(runningHeat);
  }

  private setupTimeoutCheck() {
    this.pingSubject.pipe(
      // Reset the timer on every ping
      switchMap(() => timer(1000)) // 1 second timeout
    ).subscribe(() => {
      // No ping received for 1 second
      this.algeStateSubject.next(ConnectionState.DISCONNECTED);
    });
  }


}
