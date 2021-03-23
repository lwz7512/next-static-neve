/**
 * extracted from each page as a common component
 * 
 * @2021/03/23
 */
import Head from 'next/head'

export default function WPPage({
  title, subtile,
  icon32, icon192, iconApple,inlineStyle,
  header, main, footer
}) {
  return (
    <div className="wrapper">
      <Head>
        <title>{title} – {subtile}</title>
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