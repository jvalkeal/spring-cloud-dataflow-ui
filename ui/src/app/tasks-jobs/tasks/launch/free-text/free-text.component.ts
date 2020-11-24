import {
  ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { TaskLaunchValidator } from '../task-launch.validator';
import { NotificationService } from '../../../../shared/service/notification.service';
import { Task } from '../../../../shared/model/task.model';

/**
 * Free Text Component
 * Provides a rich textarea with a semantic validation of the properties and the arguments.
 *
 * @author Damien Vitrac
 * @author Janne Valkealahti
 */
@Component({
  selector: 'app-task-launch-free-text',
  templateUrl: 'free-text.component.html',
  styleUrls: ['free-text.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FreeTextComponent implements OnInit, OnDestroy {

  @Input() task: Task;
  @Input() properties: Array<string> = [];
  @Input() arguments: Array<string> = [];
  @Output() updateProperties = new EventEmitter();
  @Output() updateArguments = new EventEmitter();
  @Output() exportProperties = new EventEmitter();
  @Output() copyProperties = new EventEmitter();
  @Output() exportArguments = new EventEmitter();
  @Output() copyArguments = new EventEmitter();
  @Output() launch = new EventEmitter<{props: string[], args: string[]}>();

  formGroup: FormGroup;

  alines: Array<any> = [{
    label: 1,
    valid: true,
    message: ''
  }];

  plines: Array<any> = [{
    label: 1,
    valid: true,
    message: ''
  }];

  /**
   * State of the form
   */
  // isLaunchable = false;

  /**
   * State of the form
   */
  isPropertiesExportable = false;
  isArgumentsExportable = false;

  /**
   * Constructor
   * Initialize FormGroup
   */
  constructor(private notificationService: NotificationService) {
    this.formGroup = new FormGroup({
      ainput: new FormControl(),
      pinput: new FormControl(),
      afile: new FormControl(''),
      pfile: new FormControl('')
    });
  }

  ngOnInit() {
    this.formGroup.get('pinput').valueChanges
      .subscribe((value) => {
        this.propertiesValueChanges(value);
      });

    this.formGroup.get('pinput').setValue(this.properties.join('\n'));
    this.formGroup.get('ainput').valueChanges
      .subscribe((value) => {
        this.argumentsValueChanges(value);
      });

    this.formGroup.get('ainput').setValue(this.arguments.join('\n'));
  }

  private getCleanProperties(): string[] {
    return (this.formGroup.get('pinput').value as string)
      .split('\n')
      .filter((line) => (line.replace(' ', '') !== ''));
  }

  private getCleanArguments(): string[] {
    return (this.formGroup.get('ainput').value as string)
      .split('\n')
      .filter((line) => (line.replace(' ', '') !== ''));
  }

  /**
   * On destroy, emit the update event
   */
  ngOnDestroy() {
    this.updateProperties.emit(this.getCleanProperties());
    this.updateArguments.emit(this.getCleanArguments());
  }

  propertiesValueChanges(value: string) {
    let countInvalidProperties = 0;
    let countValidProperties = 0;

    this.plines = (value.toString() || ' ')
      .split('\n')
      .map((line: string, index: number) => {
        const lineClean = line.replace(' ', '');
        const message = TaskLaunchValidator.property(lineClean);
        if (lineClean !== '') {
          if (message === true) {
            countValidProperties++;
          } else {
            countInvalidProperties++;
          }
        }
        return {
          label: (index + 1),
          valid: (message === true),
          message: (message !== true) ? message : ''
        };
      });

    // this.isLaunchable = (countInvalidProperties === 0);
    this.isPropertiesExportable = (countInvalidProperties + countValidProperties) > 0;
  }

  argumentsValueChanges(value: string) {
    let countInvalidArguments = 0;
    let countValidArguments = 0;

    this.alines = (value.toString() || ' ')
      .split('\n')
      .map((line: string, index: number) => {
        const lineClean = line.replace(' ', '');
        const message = TaskLaunchValidator.property(lineClean);
        if (lineClean !== '') {
          if (message === true) {
            countValidArguments++;
          } else {
            countInvalidArguments++;
          }
        }
        return {
          label: (index + 1),
          valid: (message === true),
          message: (message !== true) ? message : ''
        };
      });

    // this.isLaunchable = (countInvalidProperties === 0);
    this.isArgumentsExportable = (countInvalidArguments + countValidArguments) > 0;
  }

  /**
   * Parse and load a file to the properties control
   * Produce an exception when the user cancel the file dialog
   */
  propertiesFileChange(contents) {
    try {
      const reader = new FileReader();
      reader.onloadend = (e) => {
        this.formGroup.get('pinput').setValue(reader.result);
        this.formGroup.get('file').setValue('');
      };
      reader.readAsText(contents.target.files[0]);
    } catch (e) {
    }
  }

  /**
   * Parse and load a file to the arguments control
   * Produce an exception when the user cancel the file dialog
   */
  argumentsFileChange(contents) {
    try {
      const reader = new FileReader();
      reader.onloadend = (e) => {
        this.formGroup.get('ainput').setValue(reader.result);
        this.formGroup.get('file').setValue('');
      };
      reader.readAsText(contents.target.files[0]);
    } catch (e) {
    }
  }

  exportProps() {
    this.exportProperties.emit(this.getCleanProperties());
  }

  exportArgs() {
    this.exportArguments.emit(this.getCleanArguments());
  }

  copyPropsToClipboard() {
    this.copyProperties.emit(this.getCleanProperties());
  }

  copyArgsToClipboard() {
    this.copyArguments.emit(this.getCleanArguments());
  }

  launchTask() {
    this.launch.emit({props: this.getCleanProperties(), args: this.getCleanArguments()});
  }
}
