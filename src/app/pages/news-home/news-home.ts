import { Component, OnInit, OnDestroy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription, finalize } from 'rxjs';

import { GnewsService } from '../../service/gnews.service';
import { Article } from '../../models/article.model';

@Component({
  selector: 'app-news-home',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './news-home.html',
  styleUrls: ['./news-home.css']
})
export class NewsHomeComponent implements OnInit, OnDestroy {

  articles: Article[] = [];

  loading = false;
  error = false;

  category = 'general';
  lang = 'pt';
  searchTerm = '';

  max = 10;
  page = 1;
  totalPages = 1;

  isSearchMode = false;

  skeletons = Array.from({ length: 6 });

  private sub?: Subscription;

  constructor(private gnews: GnewsService) {}

  ngOnInit(): void {
    this.loadNews();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  // 🔄 CARREGAMENTO CENTRAL
  loadNews(): void {
    if (this.loading) return;

    this.loading = true;
    this.error = false;
    this.sub?.unsubscribe();

    const request$ = this.isSearchMode && this.searchTerm.trim()
      ? this.gnews.searchNews(this.searchTerm.trim(), this.lang, this.max, 1)
      : this.gnews.getTopHeadlines(this.category, this.lang, this.max, 1);

    this.sub = request$
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: res => {
          this.totalPages = Math.max(1, Math.ceil(res.totalArticles / this.max));
          this.articles = res.articles;
        },
        error: err => {
          console.error('Erro GNews:', err);
          this.error = true;
        }
      });
  }

  // 🔍 BUSCA
  search(): void {
    if (!this.searchTerm.trim()) return;

    this.isSearchMode = true;
    this.gnews.clearCache();
    this.loadNews();
  }

  // 🧹 LIMPAR BUSCA
  clearSearch(): void {
    this.searchTerm = '';
    this.isSearchMode = false;
    this.gnews.clearCache();
    this.loadNews();
  }

  // 🔁 ATUALIZAR
  refresh(): void {
    this.gnews.clearCache();
    this.loadNews();
  }
}
