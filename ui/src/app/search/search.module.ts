import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { SearchBoxComponent } from './search-box/search-box.component';
import {SearchReducer} from './reducer/search.reducer';

@NgModule({
  imports: [
    CommonModule,
    StoreModule.forRoot({ currentSearch: SearchReducer })
  ],
  declarations: [
    SearchBoxComponent
  ],
  exports: [
    SearchBoxComponent
  ]
})
export class SearchModule { }
