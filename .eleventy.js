const {DateTime} = require("luxon");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");

module.exports = eleventyConfig => {
    eleventyConfig.addFilter("humanDate", dateObj => {
        return DateTime.fromJSDate(dateObj, {zone: "utc"}).toLocaleString(DateTime.DATE_FULL);
    });
    eleventyConfig.addFilter("machineDate", dateObj => {
        return DateTime.fromJSDate(dateObj, {zone: "utc"}).toFormat("yyyy-LL-dd");
    });
    eleventyConfig.addPlugin(syntaxHighlight);
    eleventyConfig.addPassthroughCopy("css");
    eleventyConfig.addPassthroughCopy("fonts");
    eleventyConfig.addPassthroughCopy("js");
    eleventyConfig.addCollection("posts", collectionApi => {
        return collectionApi.getFilteredByGlob("blog/*.md").reverse();
    });
};
