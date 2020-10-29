module.exports = eleventyConfig => {
    eleventyConfig.addPassthroughCopy('css');
    eleventyConfig.addPassthroughCopy('fonts');
    eleventyConfig.addPassthroughCopy('js');
    eleventyConfig.addCollection('posts', collectionApi => {
        return collectionApi.getFilteredByGlob('blog/*.md').reverse();
    });
};
