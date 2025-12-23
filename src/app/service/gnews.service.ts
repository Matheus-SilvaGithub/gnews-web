import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, shareReplay, catchError, throwError } from 'rxjs';
import { GNewsResponse } from '../models/article.model';

@Injectable({
  providedIn: 'root'
})
export class GnewsService {

  private readonly apiKey = '3b8c8fc973fa2acaedbec56b1c88c343';
  private readonly baseUrl = '/gnews';

  private cache = new Map<string, Observable<GNewsResponse>>();

  constructor(private http: HttpClient) {}

  // 🔹 TOP HEADLINES
  getTopHeadlines(
    category: string,
    lang: string,
    max = 10,
    page = 1
  ): Observable<GNewsResponse> {

    const cacheKey = `top-${category}-${lang}-${max}-${page}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const params = new HttpParams()
      .set('category', category)
      .set('lang', lang)
      .set('max', max)
      .set('page', page)
      .set('apikey', this.apiKey);

    const request$ = this.http
      .get<GNewsResponse>(`${this.baseUrl}/top-headlines`, { params })
      .pipe(
        shareReplay(1),
        catchError(err => {
          this.cache.delete(cacheKey);
          return throwError(() => err);
        })
      );

    this.cache.set(cacheKey, request$);
    return request$;
  }

  // 🔍 SEARCH
  searchNews(
    query: string,
    lang: string,
    max = 10,
    page = 1
  ): Observable<GNewsResponse> {

    const cacheKey = `search-${query}-${lang}-${max}-${page}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const params = new HttpParams()
      .set('q', query)
      .set('lang', lang)
      .set('max', max)
      .set('page', page)
      .set('apikey', this.apiKey);

    const request$ = this.http
      .get<GNewsResponse>(`${this.baseUrl}/search`, { params })
      .pipe(
        shareReplay(1),
        catchError(err => {
          this.cache.delete(cacheKey);
          return throwError(() => err);
        })
      );

    this.cache.set(cacheKey, request$);
    return request$;
  }

  // 🧹 LIMPAR CACHE (ESSENCIAL)
  clearCache(): void {
    this.cache.clear();
  }
}
