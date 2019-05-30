import { Component, OnInit } from '@angular/core';
import { SignalRService } from 'src/app/services/signal-r.service';
import { _ } from 'underscore';


@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {

  public usersGroups = [];
  date: any;
  currentUser: any;
  splitedGroups = [];

  constructor(private signalRService: SignalRService) {}

  ngOnInit() {
    this.clock();
    this.signalRService.listen();
    this.listenChanges();
    this.listenUserChanges();
  }

  clock(){
    this.date = new Date();
    setInterval(() => {
      this.date = new Date();
    }, 1000);
  }

  splitGroups(groups){
    let groupedArray = groups;
    
    this.splitedGroups = [];
    for (var i=0; i<groupedArray.length; i+=2) {
         this.splitedGroups.push(groupedArray.slice(i,i+2));
    }

  
  }

  listenChanges() {
    this.signalRService.users$.subscribe(
      users => {
        this.usersGroups=[];
        let groupedUsers = _.groupBy(users[0], function (user) {
          return user.department;
        });

        for (var key in groupedUsers) {
          if(key.toLowerCase() != "betx"){
          groupedUsers[key].name = key;
          groupedUsers[key].users = groupedUsers[key];
          this.usersGroups.push(groupedUsers[key])
          }
        }
        this.splitGroups(this.usersGroups);
      });
  }

  onUserChanged(user) {
    this.usersGroups.forEach(departmnet => {
      if (departmnet.name == user.department) {
        departmnet.users.forEach(usr => {
          if (usr.id == user.userId) {
            usr.reason = user.reason;
            usr.timeStamp = user.timeStamp;
          }
        });
      }
    });
    this.splitGroups(this.usersGroups);
  }

  listenUserChanges() {
    this.signalRService.user$.subscribe(
      user => {
        this.currentUser = user;
        this.onUserChanged(user);
        setTimeout(() => {
          this.currentUser = null;
        }, 5000);
      });

  }
}
