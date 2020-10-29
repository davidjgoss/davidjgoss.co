const {DateTime} = require("luxon");
const currentYear = new Date().getFullYear().toString();
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const pluginRss = require("@11ty/eleventy-plugin-rss");

module.exports = eleventyConfig => {
    eleventyConfig.addFilter("humanDate", dateObj => {
        return DateTime.fromJSDate(dateObj, {zone: "utc"}).toLocaleString(DateTime.DATE_FULL);
    });
    eleventyConfig.addFilter("machineDate", dateObj => {
        return DateTime.fromJSDate(dateObj, {zone: "utc"}).toFormat("yyyy-LL-dd");
    });
    eleventyConfig.addShortcode("currentYear", () => currentYear);
    eleventyConfig.addPlugin(syntaxHighlight);
    eleventyConfig.addPlugin(pluginRss);
    eleventyConfig.addPassthroughCopy("css");
    eleventyConfig.addCollection("posts", collectionApi => {
        return collectionApi.getFilteredByGlob("blog/*.md").reverse();
    });
};
