# Static Wordpress Neve theme

@2021/03/18

The fastest way to export your wordpress site as a static site

## Demo

- [next site](#)
- [wp site](#)

## How to use

- create a wordpress site
- install WPGraphql plugin
- clone this repo and install dependecies
- create .env.local by copy .env.local.example
- replace WORDPRESS_URL value with your own wordpress url
- run `yarn dev` to start buiding you static wordpress site
- visit `http://localhost:3000`

## Deploy your own

- push your local project to github
- create a [vercel](https://vercel.com/) account
- connect this repo from github to vercel
- it will auto deploy

## Dependencies

- wordpress
- neve
- wpgraphql
- got
- cheerio