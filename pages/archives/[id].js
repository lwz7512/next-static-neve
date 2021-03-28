/**
 * Post template by id
 * @2021/03/21
 */
import ErrorPage from 'next/error'
import Head from 'next/head'

import {
  initNodeModules, getPostParams, checkIDValidity,
  getGeneralSettings, getPostBy, getPostContentBy,
} from '@lib/service'
import WPPage from '@components/wp-page'


export default function GeneralPost ({
  id,
  blog,
  title,
  inlineStyle, layoutCSS,
  icon32, icon192, iconApple,
  header, main, footer,
}) {
  if (!id) {
    return <ErrorPage statusCode={404} />
  }

  return (
    <WPPage 
      title={blog}
      subtile={title}
      inlineStyle={inlineStyle}
      layoutCSS={layoutCSS}
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

  const { id } = context.params
  const paths = await getPostParams()
  const exist = checkIDValidity(id, paths)
  if(!exist) return {props: {id : 0}}  // 404

  const { title: blog } = await getPostBy(id)
  const {title, } = await getGeneralSettings()
  const {
    inlineStyle, header, main, footer,
    icon32, icon192, iconApple, layoutCSS,
  } = await getPostContentBy(id)

  return {
    props: {
      id,
      blog, // blog title
      title,// site title
      icon32, icon192, iconApple,
      inlineStyle, layoutCSS,
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