import { Component, OnInit } from '@angular/core';
import { Task } from "../task";
import { TaskService } from "../task.service";

interface Alert {
  type: string;
  message: string;
  task: string;
}

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.sass']
})
export class TasksComponent implements OnInit {
 tasks: Task[] = [];
 alerts: Alert[] = [];
 selectedTask?: Task;
 currentSortingFunction: string = 'Date Added';
 tasksCount: number = 0;

  constructor(private taskService: TaskService) {
 }

 ngOnInit() {
   this.getTasks();
 }

 checkLocalSorting(): void {
   switch (localStorage.getItem('sorting')) {
     case 'Z-A':
       this.currentSortingFunction = 'Z-A';
       break;
     case 'Date Added':
       this.currentSortingFunction = 'Date Added';
       break;
     case 'Due Date':
       this.currentSortingFunction = 'Due Date';
       break;
     case 'Completed':
       this.currentSortingFunction = 'Completed';
       break;
     case 'A-Z':
       this.currentSortingFunction = 'A-Z';
       break;
   }
   this.sortTasks();
 }

  getTasks(): void {
    this.taskService.getTasks()
      .subscribe(tasks => {
        this.tasks = tasks;
        this.tasksCount = this.tasks.length;
        this.checkLocalSorting();
      })
  }

  //Checks current sorting function, then switches it to the next. After switching, it is then called to sort tasks
  toggleSorting(): void {
    switch (this.currentSortingFunction) {
      case 'Z-A':
        this.currentSortingFunction = 'Date Added';
        localStorage.setItem('sorting', 'Date Added');
        break;
      case 'Date Added':
        this.currentSortingFunction = 'Due Date';
        localStorage.setItem('sorting', 'Due Date');
        break;
      case 'Due Date':
        this.currentSortingFunction = 'Completed';
        localStorage.setItem('sorting', 'Completed');
        break;
      case 'Completed':
        this.currentSortingFunction = 'A-Z';
        localStorage.setItem('sorting', 'A-Z');
        break;
      case 'A-Z':
        this.currentSortingFunction = 'Z-A';
        localStorage.setItem('sorting', 'Z-A');
        break;
    }
    this.sortTasks();
  }

  sortAlphaAsc(): void {
    this.tasks.sort((a, b) => a.name.localeCompare(b.name));
  }

  sortAlphaDesc(): void {
    this.tasks.sort((a, b) => b.name.localeCompare(a.name));
  }

  sortCompleted(): void {
    //sort date first supercedes to keep original "date" sort when toggling
    this.sortDate()
    this.tasks.sort((a, b) => {
      if (a.completed === b.completed) {
        return 0;
      } else if (a.completed) {
        return 1;
      } else {
        return -1;
      }
    });
  }

  //Sort by ID technically
  sortDate(): void {
    this.tasks.sort((a, b) => a.id - b.id);
  }

  //First converts our string to a Date object, and compares if the string is empty, will set it as null
  //Then compares and sorts the empty/null dates first, then sorts the ones with dueDates on top, so the
  //earliest date is pushed to top of list.
  sortDueDate(): void {
    this.tasks.sort((a, b) => {
      const dateA = a.dueDate ? new Date(a.dueDate) : null;
      const dateB = b.dueDate ? new Date(b.dueDate) : null;
      if (!dateA && !dateB) {
        return 0;
      } else if (!dateA) {
        return 1;
      } else if (!dateB) {
        return -1;
      } else {
        return dateA.getTime() - dateB.getTime();
      }
    });
  }

  //Checks current sorting function, then calls its associated function
  sortTasks(): void {
    switch (this.currentSortingFunction) {
      case 'Date Added':
        this.sortDate();
        break;
      case 'Due Date':
        this.sortDueDate();
        break;
      case 'Completed':
        this.sortCompleted();
        break;
      case 'A-Z':
        this.sortAlphaAsc();
        break;
      case 'Z-A':
        this.sortAlphaDesc();
        break;
    }
  }

  onSelect(task: Task): void {
    this.selectedTask = task;
  }

  removeSelectedTask(): void {
   this.selectedTask = undefined;
  }

  openNewTask(): void {
    const today: Date = new Date();
    const formattedDate: string = today.toISOString().slice(0, 10);
    this.selectedTask = {
      id: -1,
      name: '',
      description: '',
      dateAdded: formattedDate,
      dueDate: '',
      completed: false
    }
  }

  renderNewTask(task: Task): void {
    this.tasks.push(task);
    this.tasksCount += 1;
    this.sortTasks();
    this.addAlertMessage('success', `Task Successfully Created: `,  `${task.name}`)
  }

  destroyTask(task: Task): void {
    this.tasks = this.tasks.filter(t => t !== task);
    this.tasksCount -= 1;
    this.addAlertMessage('warning',`Task Deleted: `, `${task.name}`)
  }

  toggleCompleteTask(task: Task, event: Event): void {
    //stops the outer div click event from tiggering
    event.stopPropagation();
    const completedTask = Object.assign({}, task, { completed: !task.completed });
    const toggle = task.completed ? 'UNCOMPLETE' : 'COMPLETE';
    this.taskService.patchTask(completedTask).subscribe(
      t => {
        // Checks if response is undefined. If undefined it means no valid response from server, thus item wasn't
        // successfully created
        if (!JSON.stringify(t)) {
          this.addAlertMessage('danger', `${toggle} TASK FAILED!`, ``)
        } else {
          task.completed = !task.completed;
        }
        this.sortTasks();
      });
  }

  close(alert: Alert) {
    this.alerts.splice(this.alerts.indexOf(alert), 1);
  }

  addAlertMessage(type: string, message: string, task: string) {
    if (this.alerts.length >= 3) {
      this.alerts.shift(); // Remove the first item
    }
    this.alerts.push({
      type: type,
      message: message,
      task: task
    })
    // Add a delay of 5 seconds before removing the alert
    setTimeout(() => {
      const index: number = this.alerts.findIndex(alert => alert.message === message);
      if (index >= 0) {
        this.alerts.splice(index, 1);
      }
    }, 5000);
  }


}
