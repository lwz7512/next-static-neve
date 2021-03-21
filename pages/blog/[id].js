/**
 * General template for pages other than index
 */
import ErrorPage from 'next/error'
import { getMenuPaths, } from '../../lib/service'  // async functions

import { checkSlugValidity } from '../../lib/utils' // normal functions



export default function GeneralPage ({id}) {
  if (!id) {
    return <ErrorPage statusCode={404} />
  }


  return <p>Page: {slug}</p>
}

export async function getStaticProps(context) {
  const { id } = context.params
  // console.log('>>> requesting page: '+slug)
  
  const paths = await getMenuPaths()
  const exist = checkSlugValidity(id, paths)

  return {
    props: {
      id : exist ? id : null
    }, 
  }
}

/**
 * get all the first level page paths for build phase use
 */
export  function getStaticPaths() {
  // const paths = await getMenuPaths()
  // console.log('>>> building paths:')
  // console.log(paths)
  return {
    paths: [
      { params: { id: '1' } },
      { params: { id: '2' } }
    ],
    fallback: true,
  }

}