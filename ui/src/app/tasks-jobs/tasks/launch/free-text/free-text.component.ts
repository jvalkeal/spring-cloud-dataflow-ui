import {
  ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { TaskLaunchValidator } from '../task-launch.validator';
import { NotificationService } from '../../../../shared/service/notification.service';
import { Task } from '../../../../shared/model/task.model';

/**
 * Free Text Component
 * Provides a rich textarea with a semantic validation of the properties
 *
 * @author Damien Vitrac
 */
@Component({
  selector: 'app-task-launch-free-text',
  templateUrl: 'free-text.component.html',
  styleUrls: ['free-text.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FreeTextComponent implements OnInit, OnDestroy {

  /**
   * Task
   */
  @Input() task: Task;

  /**
   * Properties to load
   */
  @Input() properties: Array<string> = [];

  /**
   * Emit on destroy component with the current value
   */
  @Output() update = new EventEmitter();

  /**
   * Emit for request export
   */
  @Output() exportProperties = new EventEmitter();

  /**
   * Emit for request copy
   */
  @Output() copyProperties = new EventEmitter();

  /**
   * Emit for request deploy
   */
  @Output() deploy = new EventEmitter();

  /**
   * Form
   */
  formGroup: FormGroup;

  /**
   * Line of the textarea
   */
  lines: Array<any> = [{
    label: 1,
    valid: true,
    message: ''
  }];

  /**
   * State of the form
   */
  isSubmittable = false;

  /**
   * State of the form
   */
  isExportable = false;

  /**
   * Constructor
   * Initialize FormGroup
   */
  constructor(private notificationService: NotificationService) {
    this.formGroup = new FormGroup({
      ainput: new FormControl(),
      pinput: new FormControl(),
      file: new FormControl('')
    });
  }

  /**
   * On Init
   */
  ngOnInit() {
    this.formGroup.get('pinput').valueChanges
      .subscribe((value) => {
        this.valueChanges(value);
      });

    this.formGroup.get('pinput').setValue(this.properties.join('\n'));
  }

  private getCleanProperties() {
    return this.formGroup.get('pinput').value.toString()
      .split('\n')
      .filter((line) => (line.replace(' ', '') !== ''));
  }

  /**
   * On destroy, emit the update event
   */
  ngOnDestroy() {
    this.update.emit(this.getCleanProperties());
  }

  /**
   * Textarea value Change
   */
  valueChanges(value: string) {
    let countInvalidProperties = 0;
    let countValidProperties = 0;

    this.lines = (value.toString() || ' ')
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

    this.isSubmittable = (countInvalidProperties === 0);
    this.isExportable = (countInvalidProperties + countValidProperties) > 0;
  }

  /**
   * Parse and load a file to the properties control
   * Produce an exception when the user cancel the file dialog
   *
   * @param {Blob} contents File
   */
  fileChange(contents) {
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
   * Emit a request export
   */
  exportProps() {
    this.exportProperties.emit(this.getCleanProperties());
  }

  /**
   * Copye to clipboard
   */
  copyToClipboard() {
    this.copyProperties.emit(this.getCleanProperties());
  }

  /**
   * Emit a request deploy
   */
  deployStream() {
    if (!this.isSubmittable) {
      this.notificationService.error('Invalid properties', 'Some line(s) are invalid.');
    } else {
      this.deploy.emit(this.getCleanProperties());
    }
  }

}
