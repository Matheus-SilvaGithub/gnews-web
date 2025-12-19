import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GNewsResponse } from '../models/article.model';

@Injectable({
  providedIn: 'root'
})
export class GnewsService {

  private apiKey = '';
  private baseUrl = '/gnews/top-headlines';

  constructor(private http: HttpClient) {}

  getTopHeadlines(
    category: string = 'general',
    lang: string = 'en',
    country?: string,
    max: number = 10,
    page: number = 1,
    q?: string
  ): Observable<GNewsResponse> {

    let params = new HttpParams()
      .set('category', category)
      .set('apikey', this.apiKey)
      .set('max', max)
      .set('page', page)
      .set('lang', lang);

    if (country) params = params.set('country', country);
    if (q) params = params.set('q', q);

    return this.http.get<GNewsResponse>(this.baseUrl, { params });
  }
}
