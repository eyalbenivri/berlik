import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class SampleService {

  sampleBaseUrl = "api/sample";
  constructor(private http: HttpClient) { }

  getList() {
    return this.http.get(this.sampleBaseUrl);
  }
}
