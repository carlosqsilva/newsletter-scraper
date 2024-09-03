# newsletter-scraper

A web scraper that extract curated content from Programming/Coding newsletter, making it a great tool to search for new libraries, articles and tools.

[Website](https://carlosqsilva.github.io/newsletter-scraper/)

- [x] [JavaScript Weekly](https://javascriptweekly.com)
- [x] [Node Weekly](https://nodeweekly.com)
- [x] [React Status](https://react.statuscode.com)
- [x] [Frontend Focus](https://frontendfoc.us)
- [x] [Golang Weekly](https://golangweekly.com)
- [x] [Ruby Weekly](https://rubyweekly.com)
- [x] [Postgres Weekly](https://postgresweekly.com)
- [x] [This Week in React](https://thisweekinreact.com)

Want to suggest a new newsletter? [Suggest Newsletter](https://github.com/carlosqsilva/newsletter-scraper/issues/new/choose)

## Why?

Many newsletter dont allow/offer a way to search through its content

## How it works?

[This Github Action](https://github.com/carlosqsilva/newsletter-scraper/blob/25dd657af77c6e5482ab05e9d7d859d9523c7611/.github/workflows/deploy.yml) runs every 2 days to scrape the newsletters and build the website with fresh data.

## Built with

- Node.js
- SQLite
- Astro
- SolidJS
- Tailwindcss
