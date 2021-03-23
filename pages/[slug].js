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
} from '@lib/service'
import WPPage from '@components/wp-page'


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
    <WPPage 
      title={slug}
      subtile={title}
      inlineStyle={inlineStyle}
      icon32={icon32}
      icon192={icon192}
      iconApple={iconApple}
      header={header}
      main={main}
      footer={footer}
    />
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