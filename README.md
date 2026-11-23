# newsletter-scraper

A web scraper that extracts curated content from programming/coding newsletters, making it a great tool to search for new libraries, articles and tools.

[Website](https://carlosqsilva.github.io/newsletter-scraper/)

- [x] [JavaScript Weekly](https://javascriptweekly.com)
- [x] [Node Weekly](https://nodeweekly.com)
- [x] [React Status](https://react.statuscode.com)
- [x] [Frontend Focus](https://frontendfoc.us)
- [x] [Golang Weekly](https://golangweekly.com)
- [x] [Ruby Weekly](https://rubyweekly.com)
- [x] [Postgres Weekly](https://postgresweekly.com)
- [x] [This Week in React](https://thisweekinreact.com)
- [x] [PyCoder's Weekly](https://pycoders.com/)

Want to suggest a new newsletter? [Suggest Newsletter](https://github.com/carlosqsilva/newsletter-scraper/issues/new/choose)

## Why?

Many newsletters don't allow/offer a way to search through their content

## How it works?

[This GitHub Action](https://github.com/carlosqsilva/newsletter-scraper/blob/main/.github/workflows/deploy.yml) runs every 2 days to scrape the newsletters and build the website with fresh data.

## Built with

- Node.js
- SQLite
- Astro
- SolidJS
- Tailwind CSS
