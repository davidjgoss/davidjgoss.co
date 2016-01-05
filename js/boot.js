(function() {
    function loadJS(src) {
        var script = document.createElement("script");
        script.async = true;
        script.src = src;
        document.body.appendChild(script);
    }
    if (document.querySelector("code[class^='language-']")) {
        loadJS("/js/prism.js");
    }
    if (document.querySelector("blockquote.twitter-tweet")) {
        loadJS("//platform.twitter.com/widgets.js");
    }
}());