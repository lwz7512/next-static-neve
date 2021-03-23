/**
 * General template for pages other than index(homepage)
 * @2012/03/20
 */
import ErrorPage from 'next/error'
import Head from 'next/head'

import {
  initNodeModules,
  getMenuPaths, checkSlugValidity, 
  getGeneralSettings, getPageContentBy,
} from '../lib/service'



export default function GeneralPage ({
  slug, 
  title, 
  icon32, icon192, iconApple, 
  inlineStyle,
  header, main, footer,
}) {

  if (!slug) { // not found
    return <ErrorPage statusCode={404} />
  }

  return (
    <div className="wrapper">
      <Head>
        <title>{title} - {slug}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1"/>
        <link rel="stylesheet" href="/neve/block-library/style.css"/>
        <link rel="stylesheet" href="/neve/style.css"/>
        <link rel="icon" type="image/png" href={icon32} sizes="32x32"/>
        <link rel="icon" type="image/png" href={icon192} sizes="192x192"/>
        <link rel="apple-touch-icon" href={iconApple} />
        <style id="neve-style-inline-css" type="text/css">{inlineStyle}</style>
      </Head>
      <header 
        className="header" role="header" 
        dangerouslySetInnerHTML={{__html: header}}
        />
      <main 
        id="content" 
        className="neve-main" role="main"
        dangerouslySetInnerHTML={{__html: main}}
        />
      <footer 
        id="site-footer" 
        className="site-footer"
        dangerouslySetInnerHTML={{__html: footer}}
        />
    </div>
  )
}

export async function getStaticProps(context) {
  const fs = require('fs');
  const got = require('got');
  initNodeModules(fs, got) // cache node js modules

  const { slug } = context.params
  const paths = await getMenuPaths()
  const exist = checkSlugValidity(slug, paths)
  if(!exist) return {props: {slug : null}}  // 404

  const {title, } = await getGeneralSettings()
  const { 
    inlineStyle, header, main, footer,
    icon32, icon192, iconApple,
  } = await getPageContentBy(slug)

  return {
    props: {
      slug, title, inlineStyle, 
      icon32, icon192, iconApple,
      header, main, footer, 
    }, 
  }
}

/**
 * get all the first level page paths for build phase use
 */
export async function getStaticPaths() {
  const paths = await getMenuPaths()
  return {
    paths,
    fallback: true,
  }

}