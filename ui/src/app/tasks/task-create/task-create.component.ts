import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ToastyService, ToastyConfig, ToastOptions, ToastData } from 'ng2-toasty';
import { Subscription } from 'rxjs/Subscription';
import { TasksService } from '../tasks.service';
import { AppInfo, AppInfoOptions } from '../model/app-info';

@Component({
  selector: 'app-task-create',
  templateUrl: './task-create.component.html',
})
export class TaskCreateComponent implements OnInit {

  id: string;
  private sub: any;
  form: FormGroup;
  busy: Subscription;
//  deploymentProperties = new FormControl("", validateDeploymentProperties);
  definitionName = new FormControl("");
  appInfo: AppInfo;

  constructor(
    private tasksService: TasksService,
    private route: ActivatedRoute,
    private router: Router,
    private toastyService: ToastyService,
    fb: FormBuilder
  ) {
      this.form = fb.group({
        "definitionName": this.definitionName
      });
  }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
        this.id = params['id'];
        this.busy = this.tasksService.getAppInfo(this.id).subscribe(
          data => {
            this.appInfo = data;
            this.toastyService.success('App info loaded.');
          }
       );       
     });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  back() {
    this.router.navigate(['tasks/apps']);
  }
  
  submitTaskDefinition() {
    console.log('submitTaskDefinition ' + this.form)	  
  }
  
}
