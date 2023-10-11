import React from "react"
import { Helmet } from "react-helmet"

const SEO = ({ title, description, pathname, children }) => {

  const seo = {
    title: title ,
    description: description ,
    // image: `${siteUrl}${image}`,
    // url: `${siteUrl}${pathname || ``}`,
    // twitterUsername,
  }

  return (
    <Helmet >
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      {/* <meta name="image" content={seo.image} /> */}
      {children}
    </Helmet>
  )
}

export default SEO