(function() {
    function loadJS(src) {
        var script = document.createElement("script");
        script.async = true;
        script.src = src;
        document.body.appendChild(script);
    }
    if (document.querySelector("blockquote.twitter-tweet")) {
        loadJS("//platform.twitter.com/widgets.js");
    }
}());
