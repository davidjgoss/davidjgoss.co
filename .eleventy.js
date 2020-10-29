module.exports = eleventyConfig => {
    eleventyConfig.addCollection('posts', collectionApi => {
        return collectionApi.getFilteredByGlob('blog/*.md').reverse();
    });
};
