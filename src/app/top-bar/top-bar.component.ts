import { Component } from '@angular/core';



@Component({
  selector: 'app-top-bar',
  standalone: false,
  templateUrl: './top-bar.component.html',
  styleUrl: './top-bar.component.css'
})
export class TopBarComponent {

  pageLinks = {
    RoutePlanning: "Route Planning",
    LiveStatus: "Live Status"
  };
  private selectedLink = this.pageLinks.RoutePlanning;
  public selectLink(linkText: string) {
    this.selectedLink = linkText;
  }
}
