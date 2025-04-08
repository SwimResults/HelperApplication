import {Injectable, NgZone} from '@angular/core';

// If you import a module but never use any of the imported values other than as TypeScript types,
// the resulting javascript file will look as if you never imported the module at all.
import {ipcRenderer, webFrame} from 'electron';
import * as childProcess from 'child_process';
import * as fs from 'fs';
import * as dgram from 'node:dgram';
import {AlgeService} from './alge.service';

@Injectable({
  providedIn: 'root'
})
export class ElectronService {
  ipcRenderer!: typeof ipcRenderer;
  webFrame!: typeof webFrame;
  childProcess!: typeof childProcess;
  fs!: typeof fs;
  dgram!: typeof dgram;
  socket!: dgram.Socket;

  constructor(
    private algeService: AlgeService,
    private ngZone: NgZone
  ) {
    // Conditional imports
    if (this.isElectron) {
      this.ipcRenderer = (window as any).require('electron').ipcRenderer;
      this.webFrame = (window as any).require('electron').webFrame;

      this.fs = (window as any).require('fs');

      this.childProcess = (window as any).require('child_process');
      this.childProcess.exec('node -v', (error, stdout, stderr) => {
        if (error) {
          console.error(`error: ${error.message}`);
          return;
        }
        if (stderr) {
          console.error(`stderr: ${stderr}`);
          return;
        }
        console.log(`stdout:\n${stdout}`);
      });

      // Notes :
      // * A NodeJS's dependency imported with 'window.require' MUST BE present in `dependencies` of both `app/package.json`
      // and `package.json (root folder)` in order to make it work here in Electron's Renderer process (src folder)
      // because it will loaded at runtime by Electron.
      // * A NodeJS's dependency imported with TS module import (ex: import { Dropbox } from 'dropbox') CAN only be present
      // in `dependencies` of `package.json (root folder)` because it is loaded during build phase and does not need to be
      // in the final bundle. Reminder : only if not used in Electron's Main process (app folder)

      // If you want to use a NodeJS 3rd party deps in Renderer process,
      // ipcRenderer.invoke can serve many common use cases.
      // https://www.electronjs.org/docs/latest/api/ipc-renderer#ipcrendererinvokechannel-args
    }
  }

  stopUdpListener() {
    this.socket.close();
    this.algeService.setUdpActive(false);
  }

  startUdpListener(port: number, address: string) {
    this.dgram = (window as any).require('node:dgram')

    this.socket = this.dgram.createSocket({ type: 'udp4', reuseAddr: true });
    let socket = this.socket;
    this.socket.on('message', (msg, info) => {
      console.log("log");
      console.log(msg.toString());
      this.processMessage(msg.toString());
    });

    this.socket.on('listening', () => {
      let address = socket.address();
      console.log("listening on :" + address.address + ":" + address.port);
    });

    try {
      this.socket.bind(port, address, () => {
        console.log("callback")
        this.ngZone.run(() => {
          this.algeService.setUdpActive(true);
        });
      });
    } catch (e) {
      console.log("binding port failed")
      console.log(e)
      return;
    }

  }

  processMessage(msg: string) {
    console.log("send to alge service")
    this.ngZone.run(() => {
      this.algeService.sendMessage(msg);
      this.algeService.processUdpMessage(msg);
    })
  }

  get isElectron(): boolean {
    return !!(window && window.process && window.process.type);
  }
}
