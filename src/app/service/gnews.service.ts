import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, shareReplay, catchError, throwError } from 'rxjs';
import { GNewsResponse } from '../models/article.model';

@Injectable({
  providedIn: 'root'
})
export class GnewsService {

  private apiKey = '3b8c8fc973fa2acaedbec56b1c88c343';
  private baseUrl = '/gnews';

  private cache = new Map<string, Observable<GNewsResponse>>();

  constructor(private http: HttpClient) {}

  getTopHeadlines(
    category: string,
    lang: string,
    country?: string,
    max = 10,
    page = 1
  ): Observable<GNewsResponse> {

    const key = `top-${category}-${lang}-${country}-${max}-${page}`;

    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    let params = new HttpParams()
      .set('category', category)
      .set('apikey', this.apiKey)
      .set('lang', lang)
      .set('max', max)
      .set('page', page);

    if (country) {
      params = params.set('country', country);
    }

    const request$ = this.http
      .get<GNewsResponse>(`${this.baseUrl}/top-headlines`, { params })
      .pipe(
        shareReplay(1),
        catchError(err => {
          this.cache.delete(key); // 🔥 não cacheia erro
          return throwError(() => err);
        })
      );

    this.cache.set(key, request$);
    return request$;
  }

  searchNews(
    query: string,
    lang: string,
    max = 10,
    page = 1
  ): Observable<GNewsResponse> {

    const key = `search-${query}-${lang}-${max}-${page}`;

    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    const params = new HttpParams()
      .set('q', query)
      .set('apikey', this.apiKey)
      .set('lang', lang)
      .set('max', max)
      .set('page', page);

    const request$ = this.http
      .get<GNewsResponse>(`${this.baseUrl}/search`, { params })
      .pipe(
        shareReplay(1),
        catchError(err => {
          this.cache.delete(key);
          return throwError(() => err);
        })
      );

    this.cache.set(key, request$);
    return request$;
  }

  clearCache(): void {
    this.cache.clear();
  }
}
