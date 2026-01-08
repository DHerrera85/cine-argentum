module.exports = function(eleventyConfig) {
  // Ignore root HTML files from template processing (they're copied as passthrough)
  eleventyConfig.ignores.add("index.html");
  eleventyConfig.ignores.add("streaming.html");
  eleventyConfig.ignores.add("tiras_2000.html");
  eleventyConfig.ignores.add("tiras_2010.html");
  eleventyConfig.ignores.add("juveniles.html");
  eleventyConfig.ignores.add("unitarios.html");
  eleventyConfig.ignores.add("show.html");
  eleventyConfig.ignores.add("search.html");

  // Passthrough assets
  eleventyConfig.addPassthroughCopy({ "images": "images" });
  eleventyConfig.addPassthroughCopy({ "css": "css" });
  eleventyConfig.addPassthroughCopy({ "js": "js" });
  eleventyConfig.addPassthroughCopy({ "admin": "admin" });
  eleventyConfig.addPassthroughCopy({ "data.json": "data.json" });
  
  // Passthrough static HTML pages (root only, not src/)
  eleventyConfig.addPassthroughCopy("index.html");
  eleventyConfig.addPassthroughCopy("streaming.html");
  eleventyConfig.addPassthroughCopy("tiras_2000.html");
  eleventyConfig.addPassthroughCopy("tiras_2010.html");
  eleventyConfig.addPassthroughCopy("juveniles.html");
  eleventyConfig.addPassthroughCopy("unitarios.html");
  eleventyConfig.addPassthroughCopy("show.html");
  eleventyConfig.addPassthroughCopy("search.html");

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
    templateFormats: ["njk", "md", "html"],
    pathPrefix: process.env.ENVIRONMENT === "production" ? "/cine-argentum/" : "/"
  };
};
