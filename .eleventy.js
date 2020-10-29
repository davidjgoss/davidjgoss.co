const {DateTime} = require("luxon");
const currentYear = new Date().getFullYear().toString();
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const markdownIt = require("markdown-it");
const markdownItFootnote = require("markdown-it-footnote");

module.exports = eleventyConfig => {
    eleventyConfig.addFilter("humanDate", dateObj => {
        return DateTime.fromJSDate(dateObj, {zone: "utc"}).toLocaleString(DateTime.DATE_FULL);
    });
    eleventyConfig.addFilter("machineDate", dateObj => {
        return DateTime.fromJSDate(dateObj, {zone: "utc"}).toFormat("yyyy-LL-dd");
    });
    eleventyConfig.addShortcode("currentYear", () => currentYear);
    eleventyConfig.setLibrary("md", markdownIt({html: true}).use(markdownItFootnote));
    eleventyConfig.addPlugin(syntaxHighlight);
    eleventyConfig.addPlugin(pluginRss);
    eleventyConfig.addPassthroughCopy("static");
    eleventyConfig.addCollection("posts", collectionApi => {
        return collectionApi.getFilteredByGlob("blog/*.md").reverse();
    });
};
