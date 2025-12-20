import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { GnewsService } from '../../service/gnews.service';
import { Article } from '../../models/article.model';

@Component({
  selector: 'app-news-home',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './news-home.html',
  styleUrls: ['./news-home.css']
})
export class NewsHomeComponent
  implements OnInit, AfterViewInit, OnDestroy {

  articles: Article[] = [];

  loading = false;        // 🔥 CORREÇÃO CRÍTICA
  loadingMore = false;
  error = false;

  category = 'general';
  lang = 'pt';            // 🔥 melhor retorno
  searchTerm = '';

  max = 10;
  page = 1;
  totalPages = 1;

  isSearchMode = false;
  useInfinite = true;

  skeletons = Array.from({ length: 6 });

  sub?: Subscription;

  @ViewChild('anchor') anchor?: ElementRef;
  observer?: IntersectionObserver;

  constructor(private gnews: GnewsService) {}

  ngOnInit(): void {
    this.loadNews(true);
  }

  ngAfterViewInit(): void {
    this.setupObserver();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.observer?.disconnect();
  }

  loadNews(reset: boolean): void {

    if (this.loadingMore) return;

    if (reset) {
      this.page = 1;
      this.articles = [];
      this.loading = true;
      this.error = false;
    } else {
      if (this.page >= this.totalPages) return;
      this.loadingMore = true;
    }

    this.sub?.unsubscribe();

    const request$ =
      this.isSearchMode && this.searchTerm.trim()
        ? this.gnews.searchNews(this.searchTerm.trim(), this.lang, this.max, this.page)
        : this.gnews.getTopHeadlines(this.category, this.lang, undefined, this.max, this.page);

    this.sub = request$.subscribe({
      next: res => {
        this.totalPages = Math.max(1, Math.ceil(res.totalArticles / this.max));

        this.articles = reset
          ? res.articles
          : [...this.articles, ...res.articles];

        this.loading = false;
        this.loadingMore = false;
      },
      error: err => {
        console.error('Erro GNews:', err);
        this.loading = false;
        this.loadingMore = false;
        this.error = true;
      }
    });
  }

  search(): void {
    if (!this.searchTerm.trim()) return;
    this.isSearchMode = true;
    this.gnews.clearCache();
    this.loadNews(true);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.isSearchMode = false;
    this.gnews.clearCache();
    this.loadNews(true);
  }

  setupObserver(): void {
    if (!this.anchor) return;

    this.observer = new IntersectionObserver(entries => {
      if (
        entries[0].isIntersecting &&
        this.useInfinite &&
        !this.loading &&
        !this.loadingMore &&
        this.page < this.totalPages
      ) {
        this.page++;
        this.loadNews(false);
      }
    }, { rootMargin: '600px' });

    this.observer.observe(this.anchor.nativeElement);
  }
}
