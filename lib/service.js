/**
 * DO NOT IMPORT NODE JS MODULES HERE!
 * for example:
 * fs, got, ....
 * 
 * get Nodejs modules from `getStaticProps` callback
 * @2021/03/20
 * 
 * add css file download
 * @2021/03/28
 */

import cheerio from 'cheerio'
import { fetchAPI, WP_URL } from './api'


const NODE_MODULES = {
  fs : null,
  got: null,
}

/**
 * init node js modules from `getStaticProps` function in each template
 * @param {function} fs fs module
 * @param {function} got got module
 */
export const initNodeModules = (fs, got) => {
  NODE_MODULES.fs = fs
  NODE_MODULES.got= got
}

/**
 * get post content including: date, slug, uri, title
 * 
 * @param {string} id post id
 */
export async function getPostBy(id) {
  const data = await fetchAPI(`
    query PostQuery {
      post (id: "${id}", idType: DATABASE_ID) {
        date
        slug
        uri
        title
      }
    }
  `)
  return data.post
}

/**
 * get posts params: id, blog
 */
export async function getPostParams() {
  const data = await fetchAPI(`
    query postsQuery {
      posts {
        nodes {
          postId
          slug
          title
          uri
        }
      }
    }
  `)
  const posts = data.posts.nodes
  return posts.map(p => (
    { params: {id: `${p.postId}`} } // returned path
  ))
}

export const checkIDValidity = (id, paths) => {
  let result = false
  paths.forEach(p => {
    if(id == p.params.id) result = true
  })
  return result
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
    }
  `)
  return data?.settings
}

export async function getPostContentBy(id) {
  return await getPageContentBy(`archives/${id}`)
}

export async function getHomeContent() {
  return await getPageContentBy('')
}

export async function getPageContentBy(slug) {
  const got = NODE_MODULES.got

  const safeUrl = (WP_URL.slice(-1) == '/') ? WP_URL.slice(0, -1) : WP_URL
  const response = await got(`${safeUrl}/${slug}`)
  const $ = cheerio.load(response.body)

  const neveStyleObj = $('head style#neve-style-inline-css')
  const neveStyleCss = neveStyleObj.html()

  // download specific style for each template
  const layouts = [''] // for now just save one layout style
  const layoutFolder = '/wp-css/bb-plugin'
  const styleLinks = $('head link[rel=stylesheet]')
  styleLinks.each(function(i, link){
    let id = $(link).attr('id')
    if(!id.includes('fl-builder-layout')) return

    let url = $(link).attr('href')
    layouts[0] = url // prepare to download
  })
  await downloadCSSBy(layouts[0], layoutFolder) // download ...
  const cssFileName = layouts[0].split('/').pop()
  const cssLocalPath = `${layoutFolder}/${cssFileName}`
  layouts[0] = cssLocalPath // return page local path


  const iconMap = {icon32 : null, icon192: null, iconApple: null}
  const iconLinkObjs = $('head link[rel=icon]')
  iconLinkObjs.each(function(i, link){
    let sizes = $(link).attr('sizes')
    if(sizes.includes('32')) iconMap.icon32 = $(link).attr('href')
    if(sizes.includes('192')) iconMap.icon192=$(link).attr('href')
  })
  const iconLinkApple = $('head link[rel=apple-touch-icon]')
  iconMap.iconApple = iconLinkApple.attr('href')
  // absoluteIcontoLocal(iconMap)

  const neveHeaderObj = $('header')
  absoluteURLtoLocal($, neveHeaderObj) // replace all the menu link
  const neveHeaderHTML = neveHeaderObj.html()

  const neveMainObj = $('main')
  absoluteURLtoLocal($, neveMainObj) // replace all the post link
  absoluteImgtoLocal($, neveMainObj) // download images and rewrite absolute paths
  const neveMainHTML = neveMainObj.html()

  const neveFooterObj = $('footer')
  const neveFooterHTML = neveFooterObj.html()

  return {
    icon32 : iconMap.icon32,
    icon192 : iconMap.icon192,
    iconApple : iconMap.iconApple,
    inlineStyle : neveStyleCss,
    layoutCSS : layouts[0],
    header : neveHeaderHTML,
    main: neveMainHTML,
    footer: neveFooterHTML,
  }
}

const absoluteIcontoLocal = icons => {
  if(icons.icon32){
    console.log('>>> download icon32:')
    downloadImgBy(icons.icon32, '/icons')
    let fileName = icons.icon32.split('/').pop()
    icons.icon32 = `/icons/${fileName}`
  }
  if(icons.icon192){
    console.log('>>> download icon192:')
    downloadImgBy(icons.icon192, '/icons')
    let fileName = icons.icon192.split('/').pop()
    icons.icon192 = `/icons/${fileName}`
  }
  if(icons.iconApple){
    console.log('>>> download iconApple:')
    downloadImgBy(icons.iconApple, '/icons')
    let fileName = icons.iconApple.split('/').pop()
    icons.iconApple = `/icons/${fileName}`
  }
}

// style background-image, img ...
const absoluteImgtoLocal = ($, obj) => {
  // 1. process cover image
  const wp_block_cover = $(obj).find('.wp-block-cover')
  wp_block_cover.each(function(i, div){
    let style = $(div).attr("style")
    if(!style.includes('background-image')) return

    let fields = style.split(';')
    fields.forEach((attr, i) => {
      if(!attr.includes('background-image')) return

      let url = attr.substring(21, attr.length-1)
      let imageFile = url.split('/').pop()
      fields[i] = `background-image:url(/neve/img/${imageFile})` // create relative path
      downloadImgBy(url, '/neve/img') // download image
    })
    $(div).attr('style', fields.join(';')) // modify style value
  })
  // 2. process imgs
  $(obj).find('img').each(function(i, img){
    let url = $(img).attr('src')
    let imageFile = url.split('/').pop()
    downloadImgBy(url, '/neve/img') // download image
    $(img).attr('src', `/neve/img/${imageFile}`)
  })
}

const absoluteURLtoLocal = ($, obj) => {
  $(obj).find('a').each(function(i, link){
    let href = $(link).attr("href")
    if(href.includes(WP_URL)){
      let relativePath = href.substr(WP_URL.length)
      $(link).attr('href', `/${relativePath}`)
    }
  })
}

/**
 * download images by url to one folder which under public folder
 * @param {string} url image file url
 * @param {string} folder folder under public like: /icons
 */
const downloadImgBy = (url, folder = '') => {
  if(!url) return

  const fs = NODE_MODULES.fs
  const got= NODE_MODULES.got

  let iconFile = url.split('/').pop()
  let fileType = iconFile.split('.').pop()
  let isValid = ['jpg', 'png', 'jpeg'].includes(fileType)
  if(!isValid) return
  
  console.log('>>> dnld img: ' + url)
  let writeFile = fs.createWriteStream(`./public${folder}/${iconFile}`)
  let stream = got.stream(url)
  stream.pipe(writeFile)
}

const downloadCSSBy = async (url, folder = '') => {
  if(!url) return

  const fs  = NODE_MODULES.fs
  const got = NODE_MODULES.got
  // also could be imported here!
  const stream = require('stream');
  const util = require('util');
  const { promisify } = require('util');
  const pipeline = promisify(stream.pipeline)
  
  const cssFile = url.split('/').pop()
  const cssNoParam = cssFile.split('?')[0]
  const stylePath = `./public${folder}/${cssNoParam}`
  const exists = fs.existsSync(stylePath)
  if(exists) return // downloaded already
  // console.log('>>> downloading css: '+url)
  
  await pipeline(
		got.stream(url), fs.createWriteStream(stylePath)
	);
}
