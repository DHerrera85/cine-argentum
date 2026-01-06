module.exports = {
  layout: "article.njk",
  eleventyComputed: {
    permalink: data => `articulos/${data.slug}/index.html`
  }
};
