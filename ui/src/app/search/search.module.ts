import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { SearchEffects } from './effect/search-effects';
import { SearchInputComponent } from './search-input/search-input.component';
import { SearchReducer } from './reducer/search.reducer';
import { SearchContainerComponent } from './search-container/search-container.component';
import { SearchDropdownComponent } from './search-dropdown/search-dropdown.component';
import { SearchLoadingComponent } from './search-loading/search-loading.component';
import { SearchService } from './search.service';

@NgModule({
  imports: [
    CommonModule,
    StoreModule.forFeature('search', SearchReducer),
    EffectsModule.forFeature([SearchEffects])
  ],
  declarations: [
    SearchInputComponent,
    SearchContainerComponent,
    SearchDropdownComponent,
    SearchLoadingComponent
  ],
  exports: [
    SearchInputComponent,
    SearchContainerComponent,
    SearchDropdownComponent,
    SearchLoadingComponent
  ],
  providers: [
    SearchService
  ]
})
export class SearchModule { }
