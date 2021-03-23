/**
 * Home page
 * 
 * @2021/03/18
 */
import Head from 'next/head'
import {
  initNodeModules, getGeneralSettings, getHomeContent, 
} from '@lib/service'
import WPPage from '@components/wp-page'

export default function IndexPage({
  title, description, inlineStyle,
  icon32, icon192, iconApple,
  header, main, footer, 
}) {
  return (
    <WPPage 
      title={title}
      subtile={description}
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

export async function getStaticProps() {
  const fs = require('fs');
  const got = require('got');
  initNodeModules(fs, got) // cache node js modules

  const {
    title, description,
  } = await getGeneralSettings()
  const {
    inlineStyle, header, main, footer,
    icon32, icon192, iconApple,
  } = await getHomeContent()

  return {
    props: {
      title, description,
      icon32, icon192, iconApple,
      inlineStyle,
      header, main, footer,
    }
  }
}