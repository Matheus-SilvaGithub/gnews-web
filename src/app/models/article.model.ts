export interface Article {
  id: string;
  title: string;
  description?: string;
  content?: string;
  url: string;
  image?: string;
  publishedAt: string;
  lang: string;
  source: {
    name: string;
    url: string;
    country: string;
  };
}

export interface GNewsResponse {
  totalArticles: number;
  articles: Article[];
}
