import { Component } from '@angular/core';
import { KeyValue } from '@angular/common';


@Component({
  selector: 'app-top-bar',
  standalone: false,
  templateUrl: './top-bar.component.html',
  styleUrl: './top-bar.component.css'
})
export class TopBarComponent {

  pages = {
    RoutePlanning: {
      pageLink: "/route-planning",
      pageTitle: "Route Planning"
    },
    LiveStatus: {
      pageLink: "/live-status",
      pageTitle: "Live Status"
    },
    Zones: {
      pageLink: "/zones",
      pageTitle: "Zones"
    }
  };

  pageTitles = {
    RoutePlanning: "Route Planning",
    LiveStatus: "Live Status",
    Zones: "Zones",
  }
  public selectedLink = this.pages.RoutePlanning.pageTitle;
  public selectLink(linkText: string) {
    this.selectedLink = linkText;
  }

  /**used so the keyvalue pipe doesn't sort the pages alphabetically */
  public doNotSort = (
    a: KeyValue<string, { pageLink: string; pageTitle: string }>,
    b: KeyValue<string, { pageLink: string; pageTitle: string }>
  ): number => {
    return 0;
  }
}
