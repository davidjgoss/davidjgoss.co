const {DateTime} = require("luxon");

module.exports = eleventyConfig => {
    eleventyConfig.addFilter("humanDate", dateObj => {
        return DateTime.fromJSDate(dateObj, {zone: "utc"}).toLocaleString(DateTime.DATE_FULL);
    });
    eleventyConfig.addFilter("machineDate", dateObj => {
        return DateTime.fromJSDate(dateObj, {zone: "utc"}).toFormat("yyyy-LL-dd");
    });
    eleventyConfig.addPassthroughCopy("css");
    eleventyConfig.addPassthroughCopy("fonts");
    eleventyConfig.addPassthroughCopy("js");
    eleventyConfig.addCollection("posts", collectionApi => {
        return collectionApi.getFilteredByGlob("blog/*.md").reverse();
    });
};
