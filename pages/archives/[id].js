/**
 * Post template by id
 * @2021/03/21
 */
import ErrorPage from 'next/error'
import Head from 'next/head'

import {
  initNodeModules, getPostParams, checkIDValidity,
  getGeneralSettings, getPostBy, getPostContentBy,
} from '../../lib/service'


export default function GeneralPost ({
  id,
  blog,
  title,
  siteIconUrl,
  inlineStyle,
  header,
  main,
  footer,
}) {
  if (!id) {
    return <ErrorPage statusCode={404} />
  }

  return (
    <div className="wrapper">
      <Head>
        <title>{blog} - {title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1"/>
        <link rel="stylesheet" href="/neve/block-library/style.css"/>
        <link rel="stylesheet" href="/neve/style.css"/>
        <link rel="icon" type="image/png" href={siteIconUrl} sizes="32x32"/>
        <style id="neve-style-inline-css" type="text/css">
          {inlineStyle}
        </style>
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

  const { id } = context.params
  const paths = await getPostParams()
  const exist = checkIDValidity(id, paths)
  if(!exist) return {props: {id : 0}}  // 404

  const { title: blog } = await getPostBy(id)
  const {title, siteIconUrl, } = await getGeneralSettings()
  const { inlineStyle, header, main, footer,} = await getPostContentBy(id)

  return {
    props: {
      id,
      blog, // blog title
      title,// site title
      siteIconUrl, inlineStyle,
      header, main, footer,
    }, 
  }
}

/**
 * get all the first level page paths for build phase use
 */
export async function getStaticPaths() {
  const paths = await getPostParams()
  return {
    paths,
    fallback: true,
  }
}