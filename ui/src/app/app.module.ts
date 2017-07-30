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
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SearchModule } from './search/search.module';
import { SearchService } from './search/search.service';

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
    SearchModule
  ],
  bootstrap: [AppComponent],
  providers: [SearchService]
})
export class AppModule { }
