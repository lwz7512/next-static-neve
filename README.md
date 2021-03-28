# Static Wordpress Neve theme

@2021/03/18

The fastest way to export your Wordpress(v5.7& Neve theme v2.10.2) site as a static site

## Demo

- [next site](https://next-static-neve.vercel.app/)
- [wp site](https://www.wp4speed.com)

## Features

- Pages and Posts staticalization
- Images and Styles Grabing to local project
- Configurable Wordpress site URL

## Limitations

- few javascripts included currently

## TODOs

- add more js
- more test
- ...

## How to use

- Create a WordPress(v5.7+) site
- Install Neve theme(v2.10.2+)
- Setting Wordpress `Permalink Settings` with `Numeric` format !!
- Install WPGraphql plugin
- Clone this repo and install dependecies
- Create .env.local by copy .env.local.example
- Replace WORDPRESS_URL value with your own wordpress url
- Run `yarn dev` to start buiding you static wordpress site
- Visit `http://localhost:3000`

```
% cd ~/web/next-projects
% git clone https://github.com/lwz7512/next-static-neve.git my-static-wpsite
% cd my-static-wpsite
% yarn
% cp .env.local.example .env.local
% yarn dev
```

## Deploy your own

- push your local project to github
- create a [vercel](https://vercel.com/) account
- connect this repo from github to your vercel project
- add environment varialble WORDPRESS_URL in your vercel project
- start deploy

## Dependencies

- wordpress
- neve
- wpgraphql
- got
- cheerio