import Document, { Html, Head, Main, NextScript } from 'next/document'

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx)
    return { ...initialProps }
  }

  render() {
    
    const bodyClasses = ` page page-template-default wp-custom-logo nv-sidebar-full-width nv-without-title menu_sidebar_slide_left `

    return (
      <Html lang="en" >
        <Head/>
        <body 
          className={bodyClasses}
          style={{height: '100vh'}}>
          <Main/>
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument