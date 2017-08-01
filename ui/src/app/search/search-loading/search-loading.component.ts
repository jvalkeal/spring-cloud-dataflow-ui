import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-search-loading',
  templateUrl: './search-loading.component.html',
  styleUrls: ['./search-loading.component.scss']
})
export class SearchLoadingComponent implements OnInit {

  @Input() searching = false;

  constructor() { }

  ngOnInit() {
  }

}
