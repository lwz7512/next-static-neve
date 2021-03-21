/**
 * DO NOT IMPORT NODE JS MODULES HERE!
 * for example:
 * fs, got, ....
 * 
 * get them from `getStaticProps` callback
 * @2012/03/20
 */

import cheerio from 'cheerio'
import { fetchAPI, WP_URL, USE_ABS_PATH } from './api'


const NODE_MODULES = {
  fs : null,
  got: null,
}

/**
 * init node js modules from `getStaticProps` function
 * @param {function} fs fs module
 * @param {function} got got module
 */
export const initNodeModules = (fs, got) => {
  NODE_MODULES.fs = fs
  NODE_MODULES.got= got
}

export const checkSlugValidity = (slug, paths) => {
  let result = false
  paths.forEach(p => {
    if(p.includes(slug)) result = true
  })
  return result
}

/**
 * menu path to uri
 */
export async function getMenuPaths() {
  const data = await fetchAPI(`
   query mainMenus {
      menuItems {
        nodes {
          label
          order
          path
          url
        }
      }
    }
  `)
  const items = data.menuItems.nodes
  const homePath = items[0].path  // assume this is homepage path !!!
  let pathEqualURI = true
  if(homePath != '/') pathEqualURI = false
  
  const paths = []
  items.forEach(node => {
    // path to uri conversion
    pathEqualURI ? 
      (node.uri = node.path) : 
      (node.uri = node.path.substr(homePath.length-1));
    // get all the menu uri except the homepage,
    // cause the homepage use index.js
    if(node.uri != '/') {
      paths.push(node.uri)
    }
  })
  
  return paths
}

/**
 * query general info of this site, but:
 * do not query email, no permission for graphql query!
 *
 */
export async function getGeneralSettings() {
  const data = await fetchAPI(`
    query headFields {
      settings: generalSettings {
        title
        description
        url
      }
      neve: wp4SpeedNeve {
        logoID
        logoURL
        siteIconUrl
      }
    }
  `)
  // process favicon file
  const siteIconUrl = data?.neve.siteIconUrl
  if(siteIconUrl && USE_ABS_PATH == 'false'){ // production mode
    return {
      ...data?.settings,
      ...data?.neve,
      siteIconUrl : siteIconUrl.split('/').pop()
    }
  }
  
  downloadImgBy(siteIconUrl)

  return {...data?.settings, ...data?.neve}
}


export const downloadImgBy = (url) => {
  if(!url) return

  const fs = NODE_MODULES.fs
  const got= NODE_MODULES.got

  let iconFile = url.split('/').pop()
  let writeFile = fs.createWriteStream(`public/${iconFile}`)
  let stream = got.stream(url)
  stream.pipe(writeFile)
}

const absoluteURLtoLocal = ($, co, selector) => {
  $(co).find(selector).each(function(i, link){
    let href = $(link).attr("href")
    if(href.includes(WP_URL)){
      let relativePath = href.substr(WP_URL.length)
      $(link).attr('href', relativePath)
    }
  })
}

export async function getHomeContent() {
  return await getPageContentBy('')
}

export async function getPageContentBy(slug) {
  const got = NODE_MODULES.got
  const response = await got(`${WP_URL}/${slug}`);
  const $ = cheerio.load(response.body)
  const neveStyleObj = $('style#neve-style-inline-css')
  const neveStyleCss = neveStyleObj.html()

  const neveHeaderObj = $('header')
  absoluteURLtoLocal($, neveHeaderObj, 'li a') // replace all the menu link

  const neveHeaderHTML = neveHeaderObj.html()
  const neveMainObj = $('main')
  const neveMainHTML = neveMainObj.html()
  const neveFooterObj = $('footer')
  const neveFooterHTML = neveFooterObj.html()

  return {
    inlineStyle : neveStyleCss,
    header : neveHeaderHTML,
    main: neveMainHTML,
    footer: neveFooterHTML,
  }
}
