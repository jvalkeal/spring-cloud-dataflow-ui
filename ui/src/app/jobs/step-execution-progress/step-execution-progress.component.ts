import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastyService } from 'ng2-toasty';
import { JobsService } from '../jobs.service';
import { StepExecutionProgress } from '../model/step-execution-progress.model';

@Component({
  selector: 'app-step-execution-progress',
  templateUrl: './step-execution-progress.component.html'
})
export class StepExecutionProgressComponent implements OnInit {

  jobid: string;
  stepid: string;
  private sub: any;
  stepExecutionProgress: StepExecutionProgress;

  constructor(
    private jobsService: JobsService,
    private toastyService: ToastyService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.jobid = params['jobid'];
      this.stepid = params['stepid'];
      this.jobsService.getStepExecutionProgress(this.jobid, this.stepid).subscribe(
        data => {
          this.stepExecutionProgress = data;
        },
        error => {
          console.log('error while loading Step Execution Progress', error);
          this.toastyService.error(error);
        });
    });
  }

  back() {
    this.router.navigate(['jobs/executions/' + this.jobid + '/' + this.stepid]);
  }
}
