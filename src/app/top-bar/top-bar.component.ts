import { Component, OnInit } from '@angular/core';
import { KeyValue } from '@angular/common';
import { RoutePlanningComponent } from '../route-planning/route-planning.component';


@Component({
  selector: 'app-top-bar',
  standalone: false,
  templateUrl: './top-bar.component.html',
  styleUrl: './top-bar.component.css'
})
export class TopBarComponent implements OnInit {

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

  ngOnInit(): void {
    this.selectedLink = localStorage.getItem("selectedLink") ?? this.pages.RoutePlanning.pageTitle;
  }

  public selectLink(linkText: string) {
    this.selectedLink = linkText;
    localStorage.setItem("selectedLink", linkText);
  }

  /**used so the keyvalue pipe doesn't sort the pages alphabetically */
  public doNotSort = (
    a: KeyValue<string, { pageLink: string; pageTitle: string }>,
    b: KeyValue<string, { pageLink: string; pageTitle: string }>
  ): number => {
    return 0;
  }
}
