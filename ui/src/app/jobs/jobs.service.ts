import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

import { ErrorHandler, Page } from '../shared/model';

import { JobExecution } from './model/job-execution.model';
import { StepExecution } from './model/step-execution.model';
import { HttpUtils } from '../shared/support/http.utils';

import * as moment from 'moment';
import { ExecutionContext } from './model/execution-context.model';
import { StepExecutionResource } from './model/step-execution-resource.model';
import { CountDetails, StepExecutionHistory, StepExecutionProgress } from './model/step-execution-progress.model';

@Injectable()
export class JobsService {

  private jobExecutionsUrl = '/jobs/executions';
  public jobExecutions: Page<JobExecution>;
  public remotelyLoaded = false;

  constructor(private http: Http, private errorHandler: ErrorHandler) { }

  getJobExecutions(reload?: boolean): Observable<Page<JobExecution>> {
    console.log(`Get Job Executions - reload ${reload}`, this.jobExecutions);
    if (!this.jobExecutions || reload) {
      if (!this.jobExecutions) {
        this.jobExecutions = new Page<JobExecution>();
      }
      console.log('Fetching Job Executions remotely.');
      this.remotelyLoaded = true;

      const params = HttpUtils.getPaginationParams(this.jobExecutions.pageNumber, this.jobExecutions.pageSize);

      return this.http.get(this.jobExecutionsUrl, { search: params })
                    .map(this.extractData.bind(this))
                    .catch(this.errorHandler.handleError);

    } else {
      this.remotelyLoaded = false;
      console.log('Fetching Job Executions from local state.', this.jobExecutions);
      return Observable.of(this.jobExecutions);
    }
  }

  getJobExecution(id: string): Observable<JobExecution> {
    return this.http.get(this.jobExecutionsUrl + '/' + id, {})
      .map(this.extractJobExecutionData.bind(this))
      .catch(this.errorHandler.handleError);
  }

  getStepExecution(jobid: string, stepid: string): Observable<StepExecutionResource> {
    return this.http.get(this.jobExecutionsUrl + '/' + jobid + '/steps/' + stepid, {})
      .map(this.extractStepExecutionData.bind(this))
      .catch(this.errorHandler.handleError);
  }

  getStepExecutionProgress(jobid: string, stepid: string): Observable<StepExecutionProgress> {
    return this.http.get(this.jobExecutionsUrl + '/' + jobid + '/steps/' + stepid + '/progress', {})
      .map(this.extractStepExecutionProgressData.bind(this))
      .catch(this.errorHandler.handleError);
  }
  private extractStepExecutionProgressData(response: Response): StepExecutionProgress {
    const stepExecutionProgress: StepExecutionProgress = new StepExecutionProgress();
    const body = response.json();
    stepExecutionProgress.percentageComplete = body.percentageComplete;
    stepExecutionProgress.finished = body.finished;
    stepExecutionProgress.duration = body.duration;
    const stepExecutionItem = body.stepExecution;
    const stepExecution: StepExecution = new StepExecution();
    stepExecution.id = stepExecutionItem.id;
    stepExecution.name = stepExecutionItem.stepName;
    stepExecution.status = stepExecutionItem.status;
    stepExecution.readCount = stepExecutionItem.readCount;
    stepExecution.writeCount = stepExecutionItem.writeCount;
    stepExecution.commitCount = stepExecutionItem.commitCount;
    stepExecution.rollbackCount = stepExecutionItem.rollbackCount;
    stepExecution.readSkipCount = stepExecutionItem.readSkipCount;
    stepExecution.processSkipCount = stepExecutionItem.processSkipCount;
    stepExecution.writeSkipCount = stepExecutionItem.writeSkipCount;
    stepExecution.filterCount = stepExecutionItem.filterCount;
    stepExecution.skipCount = stepExecutionItem.skipCount;
    stepExecution.startTime = moment.utc(stepExecutionItem.startTime, 'Y-MM-DD[T]HH:mm:ss.SSS[Z]');
    stepExecution.endTime = moment.utc(stepExecutionItem.endTime, 'Y-MM-DD[T]HH:mm:ss.SSS[Z]');
    const values = new Array<Map<string, string>>();
    stepExecutionItem.executionContext.values.forEach(item => {
      const map = new Map<string, string>();
      for (const prop in item) {
        if (item.hasOwnProperty(prop)) {
          map.set(prop, item[prop]);
        }
      }
      values.push(map);
    });
    stepExecution.executionContext = new ExecutionContext(
      stepExecutionItem.executionContext.dirty,
      stepExecutionItem.executionContext.empty,
      values);
    stepExecution.exitCode = stepExecutionItem.exitStatus.exitCode;
    stepExecution.exitMessage = stepExecutionItem.exitStatus.exitDescription;
    stepExecutionProgress.stepExecution = stepExecution;
    const stepExecutionHistory: StepExecutionHistory = new StepExecutionHistory();
    stepExecutionHistory.stepName = body.stepExecutionHistory.stepName;
    stepExecutionHistory.count = body.stepExecutionHistory.count;

    stepExecutionHistory.commitCount = new CountDetails();
    stepExecutionHistory.commitCount.count = body.stepExecutionHistory.commitCount.count;
    stepExecutionHistory.commitCount.min = body.stepExecutionHistory.commitCount.min;
    stepExecutionHistory.commitCount.max = body.stepExecutionHistory.commitCount.max;
    stepExecutionHistory.commitCount.mean = body.stepExecutionHistory.commitCount.mean;
    stepExecutionHistory.commitCount.standardDeviation = body.stepExecutionHistory.commitCount.standardDeviation;

    stepExecutionHistory.rollbackCount = new CountDetails();
    stepExecutionHistory.rollbackCount.count = body.stepExecutionHistory.rollbackCount.count;
    stepExecutionHistory.rollbackCount.min = body.stepExecutionHistory.rollbackCount.min;
    stepExecutionHistory.rollbackCount.max = body.stepExecutionHistory.rollbackCount.max;
    stepExecutionHistory.rollbackCount.mean = body.stepExecutionHistory.rollbackCount.mean;
    stepExecutionHistory.rollbackCount.standardDeviation = body.stepExecutionHistory.rollbackCount.standardDeviation;

    stepExecutionHistory.readCount = new CountDetails();
    stepExecutionHistory.readCount.count = body.stepExecutionHistory.readCount.count;
    stepExecutionHistory.readCount.min = body.stepExecutionHistory.readCount.min;
    stepExecutionHistory.readCount.max = body.stepExecutionHistory.readCount.max;
    stepExecutionHistory.readCount.mean = body.stepExecutionHistory.readCount.mean;
    stepExecutionHistory.readCount.standardDeviation = body.stepExecutionHistory.readCount.standardDeviation;

    stepExecutionHistory.writeCount = new CountDetails();
    stepExecutionHistory.writeCount.count = body.stepExecutionHistory.writeCount.count;
    stepExecutionHistory.writeCount.min = body.stepExecutionHistory.writeCount.min;
    stepExecutionHistory.writeCount.max = body.stepExecutionHistory.writeCount.max;
    stepExecutionHistory.writeCount.mean = body.stepExecutionHistory.writeCount.mean;
    stepExecutionHistory.writeCount.standardDeviation = body.stepExecutionHistory.writeCount.standardDeviation;

    stepExecutionHistory.filterCount = new CountDetails();
    stepExecutionHistory.filterCount.count = body.stepExecutionHistory.filterCount.count;
    stepExecutionHistory.filterCount.min = body.stepExecutionHistory.filterCount.min;
    stepExecutionHistory.filterCount.max = body.stepExecutionHistory.filterCount.max;
    stepExecutionHistory.filterCount.mean = body.stepExecutionHistory.filterCount.mean;
    stepExecutionHistory.filterCount.standardDeviation = body.stepExecutionHistory.filterCount.standardDeviation;

    stepExecutionHistory.readSkipCount = new CountDetails();
    stepExecutionHistory.readSkipCount.count = body.stepExecutionHistory.readSkipCount.count;
    stepExecutionHistory.readSkipCount.min = body.stepExecutionHistory.readSkipCount.min;
    stepExecutionHistory.readSkipCount.max = body.stepExecutionHistory.readSkipCount.max;
    stepExecutionHistory.readSkipCount.mean = body.stepExecutionHistory.readSkipCount.mean;
    stepExecutionHistory.readSkipCount.standardDeviation = body.stepExecutionHistory.readSkipCount.standardDeviation;

    stepExecutionHistory.writeSkipCount = new CountDetails();
    stepExecutionHistory.writeSkipCount.count = body.stepExecutionHistory.writeSkipCount.count;
    stepExecutionHistory.writeSkipCount.min = body.stepExecutionHistory.writeSkipCount.min;
    stepExecutionHistory.writeSkipCount.max = body.stepExecutionHistory.writeSkipCount.max;
    stepExecutionHistory.writeSkipCount.mean = body.stepExecutionHistory.writeSkipCount.mean;
    stepExecutionHistory.writeSkipCount.standardDeviation = body.stepExecutionHistory.writeSkipCount.standardDeviation;

    stepExecutionHistory.processSkipCount = new CountDetails();
    stepExecutionHistory.processSkipCount.count = body.stepExecutionHistory.processSkipCount.count;
    stepExecutionHistory.processSkipCount.min = body.stepExecutionHistory.processSkipCount.min;
    stepExecutionHistory.processSkipCount.max = body.stepExecutionHistory.processSkipCount.max;
    stepExecutionHistory.processSkipCount.mean = body.stepExecutionHistory.processSkipCount.mean;
    stepExecutionHistory.processSkipCount.standardDeviation = body.stepExecutionHistory.processSkipCount.standardDeviation;

    stepExecutionHistory.duration = new CountDetails();
    stepExecutionHistory.duration.count = body.stepExecutionHistory.duration.count;
    stepExecutionHistory.duration.min = body.stepExecutionHistory.duration.min;
    stepExecutionHistory.duration.max = body.stepExecutionHistory.duration.max;
    stepExecutionHistory.duration.mean = body.stepExecutionHistory.duration.mean;
    stepExecutionHistory.duration.standardDeviation = body.stepExecutionHistory.duration.standardDeviation;

    stepExecutionHistory.durationPerRead = new CountDetails();
    stepExecutionHistory.durationPerRead.count = body.stepExecutionHistory.durationPerRead.count;
    stepExecutionHistory.durationPerRead.min = body.stepExecutionHistory.durationPerRead.min;
    stepExecutionHistory.durationPerRead.max = body.stepExecutionHistory.durationPerRead.max;
    stepExecutionHistory.durationPerRead.mean = body.stepExecutionHistory.durationPerRead.mean;
    stepExecutionHistory.durationPerRead.standardDeviation = body.stepExecutionHistory.durationPerRead.standardDeviation;

    stepExecutionProgress.stepExecutionHistory = stepExecutionHistory;
    return stepExecutionProgress;
  }

  private extractStepExecutionData(response: Response): StepExecutionResource {
    const body = response.json();
    const stepExecutionItem = body.stepExecution;
    const stepExecutionResource: StepExecutionResource = new StepExecutionResource();
    const stepExecution: StepExecution = new StepExecution();
    stepExecution.id = stepExecutionItem.id;
    stepExecution.name = stepExecutionItem.stepName;
    stepExecution.status = stepExecutionItem.status;
    stepExecution.readCount = stepExecutionItem.readCount;
    stepExecution.writeCount = stepExecutionItem.writeCount;
    stepExecution.commitCount = stepExecutionItem.commitCount;
    stepExecution.rollbackCount = stepExecutionItem.rollbackCount;
    stepExecution.readSkipCount = stepExecutionItem.readSkipCount;
    stepExecution.processSkipCount = stepExecutionItem.processSkipCount;
    stepExecution.writeSkipCount = stepExecutionItem.writeSkipCount;
    stepExecution.filterCount = stepExecutionItem.filterCount;
    stepExecution.skipCount = stepExecutionItem.skipCount;
    stepExecution.startTime = moment.utc(stepExecutionItem.startTime, 'Y-MM-DD[T]HH:mm:ss.SSS[Z]');
    stepExecution.endTime = moment.utc(stepExecutionItem.endTime, 'Y-MM-DD[T]HH:mm:ss.SSS[Z]');
    const values = new Array<Map<string, string>>();
    stepExecutionItem.executionContext.values.forEach(item => {
      const map = new Map<string, string>();
      for (const prop in item) {
        if (item.hasOwnProperty(prop)) {
          map.set(prop, item[prop]);
        }
      }
      values.push(map);
    });
    stepExecution.executionContext = new ExecutionContext(
      stepExecutionItem.executionContext.dirty,
      stepExecutionItem.executionContext.empty,
      values);
    stepExecution.exitCode = stepExecutionItem.exitStatus.exitCode;
    stepExecution.exitMessage = stepExecutionItem.exitStatus.exitDescription;
    stepExecutionResource.jobExecutionId = body.jobExecutionId;
    stepExecutionResource.stepExecution = stepExecution;
    stepExecutionResource.stepType = body.stepType;
    return stepExecutionResource;
  }

  private extractJobExecutionData(response: Response): JobExecution {
    const jsonItem = response.json();
    const jobExecution: JobExecution = new JobExecution();
    jobExecution.name = jsonItem.name;
    jobExecution.startTime = moment(jsonItem.jobExecution.startTime);
    jobExecution.endTime = moment(jsonItem.jobExecution.endTime);
    jobExecution.stepExecutionCount = jsonItem.stepExecutionCount;
    jobExecution.status = jsonItem.jobExecution.status;
    jobExecution.exitCode = jsonItem.jobExecution.exitStatus.exitCode;
    jobExecution.exitMessage = jsonItem.jobExecution.exitStatus.exitDescription;
    jobExecution.jobExecutionId = jsonItem.jobExecution.id;
    jobExecution.taskExecutionId = jsonItem.taskExecutionId;
    jobExecution.jobInstanceId = jsonItem.jobExecution.jobInstance.id;
    jobExecution.jobParametersString = jsonItem.jobParametersString;

    jsonItem.jobExecution.stepExecutions.forEach( stepExecutionItem => {
        const stepExecution = new StepExecution();
        stepExecution.id = stepExecutionItem.id;
        stepExecution.name = stepExecutionItem.stepName;
        stepExecution.readCount = stepExecutionItem.readCount;
        stepExecution.writeCount = stepExecutionItem.writeCount;
        stepExecution.commitCount = stepExecutionItem.commitCount;
        stepExecution.rollbackCount = stepExecutionItem.rollbackCount;
        stepExecution.readSkipCount = stepExecutionItem.readSkipCount;
        stepExecution.processSkipCount = stepExecutionItem.processSkipCount;
        stepExecution.writeSkipCount = stepExecutionItem.writeSkipCount;
        stepExecution.filterCount = stepExecutionItem.filterCount;
        stepExecution.skipCount = stepExecutionItem.skipCount;
        stepExecution.startTime = moment.utc(stepExecutionItem.startTime, 'Y-MM-DD[T]HH:mm:ss.SSS[Z]');
        stepExecution.endTime = moment.utc(stepExecutionItem.endTime, 'Y-MM-DD[T]HH:mm:ss.SSS[Z]');
        stepExecution.status = stepExecutionItem.status;
        jobExecution.stepExecutions.push(stepExecution);
      }
    );

    jobExecution.restartable = jsonItem.restartable;
    jobExecution.abandonable = jsonItem.abandonable;
    jobExecution.stoppable = jsonItem.stoppable;
    jobExecution.defined = jsonItem.defined;
    return jobExecution;
  }

  private extractData(response: Response): Page<JobExecution> {
    const body = response.json();
    const items: JobExecution[] = [];

    if (body._embedded && body._embedded.jobExecutionResourceList) {
      for (const jsonItem of body._embedded.jobExecutionResourceList) {
        const jobExecution: JobExecution = new JobExecution();
        jobExecution.name = jsonItem.name;
        jobExecution.startTime = moment(jsonItem.jobExecution.startTime);
        jobExecution.stepExecutionCount = jsonItem.stepExecutionCount;
        jobExecution.status = jsonItem.jobExecution.status;
        jobExecution.jobExecutionId = jsonItem.jobExecution.id;
        jobExecution.taskExecutionId = jsonItem.taskExecutionId;
        jobExecution.jobInstanceId = jsonItem.jobExecution.jobInstance.id;

        jobExecution.restartable = jsonItem.restartable;
        jobExecution.abandonable = jsonItem.abandonable;
        jobExecution.stoppable = jsonItem.stoppable;
        jobExecution.defined = jsonItem.defined;

        items.push(jobExecution);
      }
    }

    const page = new Page<JobExecution>();
    page.items = items;
    page.totalElements = body.page.totalElements;
    page.pageNumber = body.page.number;
    page.pageSize = body.page.size;
    page.totalPages = body.page.totalPages;

    this.jobExecutions.update(page);
    return this.jobExecutions;
  }
}
