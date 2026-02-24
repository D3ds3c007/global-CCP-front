import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../../components/sidebar/sidebar';

@Component({
  selector: 'app-back-office-layout',
  standalone: true,
  imports: [
    Sidebar,
    RouterOutlet
  ],
  templateUrl: './back-office-layout.html',
  styleUrls: ['./back-office-layout.css'],
})
export class BackOfficeLayout {}