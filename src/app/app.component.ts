import { Component } from '@angular/core';
import { MatSnackBar } from "@angular/material";
import { Observable } from 'rxjs/Observable';

import { SwUpdate, SwPush } from "@angular/service-worker";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  
  constructor(private snackBar: MatSnackBar,
              private ngsw: SwUpdate,
              private ngswPush: SwPush) {

    console.log(this.ngsw);
  }

  updateNetworkStatusUI() {
    if (navigator.onLine) {
      // You might be online
      (document.querySelector("body") as any).style = "";
    } else {
      // 100% Sure you are offline
      (document.querySelector("body") as any).style = "filter: grayscale(1)";
    }
  }

  subscribeToPush() {
    
    if ('Notification' in window) {
      Notification.requestPermission( permission => {
        if (permission === "granted") {
          this.ngswPush.requestSubscription({ serverPublicKey: "replace-with-your-public-key"})
            // .subscribe( (registration: SwPush ) => {
            //   console.log(registration);
            //   //TODO Send that object to our server
            // })
        }
      })
    }
  }

  checkForUpdates(){
    // Checking SW Update Status
    if (this.ngsw.isEnabled) {

        this.ngsw.available.subscribe(() => {

            if(confirm("New version available. Load New Version?")) {

                window.location.reload();
            }
        });
    }       
    this.ngsw.checkForUpdate();
  }

  ngOnInit() {
    // Checking for updates
    this.checkForUpdates();

    // Checking Network Status
    this.updateNetworkStatusUI();
    window.addEventListener("online", this.updateNetworkStatusUI);
    window.addEventListener("offline", this.updateNetworkStatusUI);

    // Checking Installation Status
    if ((navigator as any).standalone==false) {
      // This is an iOS device and we are in the browser
      this.snackBar.open("You can add this PWA to the Home Screen", 
          "", { duration: 3000 });
    }
    if ((navigator as any).standalone==undefined) {
      // It's not iOS
      if (window.matchMedia("(display-mode: browser").matches) {
        // We are in the browser
        window.addEventListener("beforeinstallprompt", event => {
          event.preventDefault();
          const sb = this.snackBar.open("Do you want to install this App?", "Install", 
            {duration: 5000});
          sb.onAction().subscribe( () => {
             (event as any).prompt();
             (event as any).userChoice.then( result => {
                if (result.outcome == "dismissed") {
                  //TODO: Track no installation 
                } else {
                  //TODO: It was installed
                }
             });
          });
          return false;
        });
      }
    }
  }
}
