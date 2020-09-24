import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {
  clientId: string = "";

  constructor() { }

  ngOnInit(): void {
  }

  onClick() {
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${this.clientId}&scope=gist`;
  }

}
