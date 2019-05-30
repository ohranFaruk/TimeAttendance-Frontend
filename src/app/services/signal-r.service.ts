import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Subject } from 'rxjs';
import * as signalR from "@aspnet/signalr";


@Injectable({
  providedIn: 'root'
})
export class SignalRService {



  private userSource = new Subject<any>();
  user$ = this.userSource.asObservable();

  private usersSource = new Subject<any>();
  users$ = this.usersSource.asObservable();

  public connection;

  constructor() { }

  listen() {
    this.connection = new signalR.HubConnectionBuilder().withUrl(environment.apiUrl + "/userLogHub").build();
    this.connection.start().then(() => {
      this.listenForChanges();
      console.log("connected");
    }, function (err) {
      console.log("connection failed");
    });

    this.connection.onclose(() => {
      console.log("disconnected");
      if (this.connection.state == 0) {
        let interval = setInterval(() => {
          this.connection.start().then(() => {
            this.listenForChanges();
            console.log("connected");
            clearInterval(interval);
          }, function (err) {
            console.log("connection failed");
          });
        }, 10000);
      }
    });
  }

  private listenForChanges() {
    this.connection.on("ChangedUser", (user: any) => {
      this.userSource.next(user);
    });

    this.connection.on("CurrentUsers", (users: Array<any>) => {
      this.usersSource.next(new Array(users));
    });
  }

}



