module.exports = function(eleventyConfig) {
  // Passthrough assets
  eleventyConfig.addPassthroughCopy({ "images": "images" });
  eleventyConfig.addPassthroughCopy({ "css": "css" });
  eleventyConfig.addPassthroughCopy({ "js": "js" });
  eleventyConfig.addPassthroughCopy({ "admin": "admin" });
  eleventyConfig.addPassthroughCopy({ "data.json": "data.json" });

  // Collections
  eleventyConfig.addCollection("articulos", collection => {
    return collection.getFilteredByGlob("content/articulos/*.md").sort((a, b) => {
      return b.date - a.date; // más reciente primero
    });
  });

  return {
    dir: {
      input: ".",
      includes: "_includes",
      data: "_data",
      output: "_site"
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["njk", "md", "html"]
  };
};
