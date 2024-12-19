mix.js("resources/js/app.js", "public/assets")
    .postCss("resources/css/app.css", "public/assets", [
        require("tailwindcss"),
    ]);