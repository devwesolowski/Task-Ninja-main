import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Task } from "./task";
import {catchError, map, tap, Observable, of} from "rxjs";


@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private tasksURL = 'https://task-server-4wqn.onrender.com/tasks';  // URL to web api
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private http: HttpClient) {

  }

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.tasksURL)
      .pipe(
        catchError(this.handleError<Task[]>(`getTasks`, []))
      )
  }


  postTask(task: Task): Observable<Task> {
    return this.http.post<Task>(this.tasksURL, task, this.httpOptions)
      .pipe(
        catchError(this.handleError<Task>(`postTask`))
      )
  }

  patchTask(task: Task): Observable<any> {
  return this.http.patch(`${this.tasksURL}/${task.id}`, task, this.httpOptions)
    .pipe(
      catchError(this.handleError<any>(`updateTask`))
    )
  }

  deleteTask(id: number): Observable<Task> {
    return this.http.delete<Task>(`${this.tasksURL}/${id}`, this.httpOptions)
      .pipe(
        catchError(this.handleError<Task>(`deleteTask`))
      )
  }

  /** COURTESY OF GOOGLE *chefs kiss*
   * Handle Http operation that failed.
   * Let the app continue.
   *
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      console.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

}
