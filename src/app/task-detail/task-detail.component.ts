import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TaskService } from "../task.service";
import { Task } from "../task";
import {Location} from "@angular/common";
import { DatePipe } from '@angular/common';
import {NgbDateStruct} from "@ng-bootstrap/ng-bootstrap";


@Component({
  selector: 'app-task-detail',
  templateUrl: './task-detail.component.html',
  styleUrls: ['./task-detail.component.sass'],
  providers: [DatePipe]
})
export class TaskDetailComponent {
  @Input() task?: Task;
  @Output() closeDetailEvent = new EventEmitter<Task[]>();
  @Output() newTaskAddedEvent = new EventEmitter<Task>();
  @Output() deleteTaskEvent = new EventEmitter<Task>();
  @Output() updateTaskEvent = new EventEmitter<string>();
  @Output() alertEvent = new EventEmitter<string>;


  constructor(private taskService: TaskService) {
  }

  //Uses logic for now to emit an event to reset selected task in tasks component
  closeDetails(): void {
    this.closeDetailEvent.emit();
  }

  addTask(name: string, description: string, dateAdded: string, dueDate: string): void {
    name = name.trim();
    description = description.trim();
    const completed: boolean = false;
    this.taskService.postTask({name, description, dateAdded, dueDate, completed} as Task)
      .subscribe(task => {
        // Checks if response is undefined. If undefined it means no valid response from server, thus item wasn't
        // successfully created
         if (!JSON.stringify(task)) {
           this.alertEvent.emit('ADD NEW TASK FAILED!')
          } else {
           this.newTaskAddedEvent.emit(task);
          }
      })
  }

  updateTask(task: Task, name: string, description: string, dueDate: string): void {
    task.name = name;
    task.description = description;
    task.dueDate = dueDate;
    this.taskService.patchTask(task).subscribe(
      task => {
        if (!JSON.stringify(task)) {
          this.alertEvent.emit('UPDATE TASK FAILED!')
        } else {
          this.updateTaskEvent.emit(task.name);
        }
      })
  }

  deleteTask(task: Task): void {
    this.taskService.deleteTask(task.id).subscribe(
      t => {
        if (!JSON.stringify(t)) {
          this.alertEvent.emit('DELETE TASK FAILED!')
        } else {
          this.deleteTaskEvent.emit(task);
        }
      }
    );
  }

}
