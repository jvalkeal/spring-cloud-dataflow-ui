import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

/* Feature Modules */
import { AboutModule } from './about/about.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AppsModule } from './apps/apps.module';
import { JobsModule } from './jobs/jobs.module';
import { RuntimeAppsModule } from './runtime/runtime-apps.module';
import { SharedModule } from './shared/shared.module';
import { StreamsModule } from './streams/streams.module';
import { TasksModule } from './tasks/tasks.module';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {SearchModule} from './search/search.module';
import {CurrentSearch} from './search/model/current-search';
import {Store, StoreModule, ActionReducer, Action} from '@ngrx/store';
import {SearchService} from './search/search.service';
import {SearchBoxComponent} from './search/search-box/search-box.component';
import {SearchAction} from './search/search-action';

const SearchReducer: ActionReducer<CurrentSearch> = (state: CurrentSearch, action: SearchAction) => {
  console.log('reducer', state, action);
  switch (action.type) {
    case SearchBoxComponent.StoreEvents.text:
      console.log('return StoreEvents', state);
      return Object.assign({}, state, {
        name: action.payload
      });
    default:
      console.log('return default', state);
      return state;
  }
}
// const storeManager = StoreModule.forRoot({ currentSearch: SearchReducer });
const storeManager = StoreModule.forRoot({ SearchReducer });

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    AboutModule,
    AnalyticsModule,
    AppsModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    JobsModule,
    RuntimeAppsModule,
    SharedModule,
    StreamsModule,
    TasksModule,
    SearchModule,
    StoreModule,
    storeManager
  ],
  bootstrap: [AppComponent],
  providers: [SearchService]
})
export class AppModule { }
