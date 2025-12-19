import {
  Component,
  OnInit,
  ViewChild,
  ElementRef
} from '@angular/core';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GnewsService } from '../../service/gnews.service';
import { Article } from '../../models/article.model';

@Component({
  selector: 'app-news-home',
  standalone: true,
  imports: [NgIf, NgFor, FormsModule, DatePipe],
  templateUrl: './news-home.html',
  styleUrls: ['./news-home.css']
})
export class NewsHomeComponent implements OnInit {

  articles: Article[] = [];
  loading = true;
  loadingMore = false;

  category = 'general';
  lang = 'en';
  max = 10;
  page = 1;
  totalPages = 1;
  useInfinite = false;

  @ViewChild('anchor') anchor!: ElementRef;
  observer?: IntersectionObserver;

  constructor(private gnews: GnewsService) {}

  ngOnInit(): void {
    this.loadNews(true);
  }

  loadNews(reset: boolean) {
    if (reset) {
      this.page = 1;
      this.articles = [];
      this.loading = true;
    } else {
      this.loadingMore = true;
    }

    this.gnews.getTopHeadlines(this.category, this.lang, undefined, this.max, this.page)
      .subscribe(res => {
        this.totalPages = Math.ceil(res.totalArticles / this.max);
        this.articles = [...this.articles, ...res.articles];
        this.loading = false;
        this.loadingMore = false;
        this.setupObserver();
      });
  }

  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
      this.loadNews(true);
    }
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.loadNews(true);
    }
  }

  toggleInfinite() {
    this.useInfinite = !this.useInfinite;
    this.loadNews(true);
  }

  setupObserver() {
    if (!this.useInfinite || !this.anchor) return;

    this.observer?.disconnect();

    this.observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && this.page < this.totalPages) {
        this.page++;
        this.loadNews(false);
      }
    }, { rootMargin: '300px' });

    this.observer.observe(this.anchor.nativeElement);
  }
}
