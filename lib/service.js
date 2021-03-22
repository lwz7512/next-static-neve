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
      neve: wp4SpeedNeve {
        logoID
        logoURL
        siteIconUrl
      }
    }
  `)
  // process favicon file
  const siteIconUrl = data?.neve.siteIconUrl
  downloadImgBy(siteIconUrl)
  
  return {
    ...data?.settings,
    ...data?.neve,
    siteIconUrl : siteIconUrl.split('/').pop()
  }
}

export async function getPostContentBy(id) {
  return await getPageContentBy(`archives/${id}`)
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
  absoluteURLtoLocal($, neveHeaderObj) // replace all the menu link
  const neveHeaderHTML = neveHeaderObj.html()

  const neveMainObj = $('main')
  absoluteURLtoLocal($, neveMainObj) // replace all the post link
  absoluteImgtoLocal($, neveMainObj) // download images and rewrite absolute paths
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
      $(link).attr('href', relativePath)
    }
  })
}

const downloadImgBy = (url, folder = '') => {
  if(!url) return
  if(USE_ABS_PATH == 'false') return // no downloads in production mode

  const fs = NODE_MODULES.fs
  const got= NODE_MODULES.got

  let iconFile = url.split('/').pop()
  let writeFile = fs.createWriteStream(`public${folder}/${iconFile}`)
  let stream = got.stream(url)
  stream.pipe(writeFile)
}
