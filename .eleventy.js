module.exports = function(eleventyConfig) {
  // Passthrough assets
  eleventyConfig.addPassthroughCopy({ "images": "images" });
  eleventyConfig.addPassthroughCopy({ "css": "css" });
  eleventyConfig.addPassthroughCopy({ "js": "js" });
  eleventyConfig.addPassthroughCopy({ "admin": "admin" });
  eleventyConfig.addPassthroughCopy({ "data.json": "data.json" });
  eleventyConfig.addPassthroughCopy("*.html");

  // Date filter
  eleventyConfig.addFilter("date", function(date, format) {
    const d = new Date(date);
    if (format === "yyyy-MM-dd") {
      return d.toISOString().split('T')[0];
    } else if (format === "dd/MM/yyyy") {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    }
    return date;
  });

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
    templateFormats: ["njk", "md"],
    pathPrefix: "/"
  };
};
