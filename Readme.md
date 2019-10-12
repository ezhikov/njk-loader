Webpack loader for nunjucks templates

# shiny-nunjucks-loader

Configurable loader for bundling nunjucks templates with webpack.

## Advantages

- Fully configurable
- Relative paths to views (see Relative paths section)
- Recompiles on partials and macros changes

## Quick Start

This loader returns raw HTML. In most cases you would pair it with [html-loader](https://github.com/webpack-contrib/html-loader) so your images and other assets will be processed by webpack.

Install nunjucks and loader with your favourite package manager:

```shell
# yarn
yarn add --dev nunjucks shiny-nunjucks-loader html-loader

# npm
npm install --save-dev nunjucks shiny-nunjucks-loader html-loader
```

Then add it to your webpack config.

```js
{
  module: {
    rules: [
      { test: /\.(njk|html)$/, use: ["html-loader", "shiny-nunjucks-loader"] }
    ];
  }
}
```

## Configuration

It was a bit deceptive to tell that loader is fully configurable. You can configure almost every aspect of nunjucks, but you can't create new Environment since loader creates one inside.

### Filters, Globals, Extensions

You define filters, globals and extensions in separate JavaScript files. Be careful: these files should be able to run in the environment same with your webpack. Then specify paths to this files in options. Let's say, that you created all three and put them to `njk-helpers` folder. Then your config would look like that:

```js

{
  module: {
    rules: [
      { test: /\.(njk|html)$/, use: ["html-loader", {loader: "shiny-nunjucks-loader", options: {
          filters: path.resolve(__dirname, 'njk-helpers/filters.js'),
          globals: path.resolve(__dirname, 'njk-helpers/globals.js'),
          extensions: path.resolve(__dirname, 'njk-helpers/extensions.js)
      }}] }
    ];
  }
}
```

These files will be watched by webpack, so whenever any of them changes your templates will be recompiled.

### Configuration options

As was said earlier, you can't specify your own environment, but you can pass some options to one created inside loader.

Available options are (cited from nunjucks docs):

- `autoescape` (default: `true`) controls if output with dangerous characters are escaped automatically. See [Autoescaping](https://mozilla.github.io/nunjucks/api.html#autoescaping)
- `throwOnUndefined` (default: `false`) throw errors when outputting a `null`/`undefined` value
  `trimBlocks` (default: false) automatically remove trailing newlines from a block/tag
- `lstripBlocks` (default: false) automatically remove leading whitespace from a block/tag
- `tags`: (default: see nunjucks syntax) defines the syntax for nunjucks tags. See [Customizing Syntax](https://mozilla.github.io/nunjucks/api.html#customizing-syntax).

These options should be passed to `config` option like this:

```js
{
  module: {
    rules: [
      {
        test: /\.(njk|html)$/,
        use: [
          "html-loader",
          {
            loader: "shiny-nunjucks-loader",
            options: {
              config: {
                autoescape: false,
                tags: {
                  blockStart: "<%",
                  blockEnd: "%>",
                  variableStart: "<$",
                  variableEnd: "$>",
                  commentStart: "<#",
                  commentEnd: "#>"
                }
              }
            }
          }
        ]
      }
    ];
  }
}
```

### Full configuration example

```js
{
  module: {
    rules: [
      {
        test: /\.(njk|html)$/,
        use: [
          "html-loader",
          {
            loader: "shiny-nunjucks-loader",
            options: {
                filters: path.resolve(__dirname, 'njk-helpers/filters.js'),
                globals: path.resolve(__dirname, 'njk-helpers/globals.js'),
                extensions: path.resolve(__dirname, 'njk-helpers/extensions.js),
                config: {
                    autoescape: false,
                    tags: {
                        blockStart: "<%",
                        blockEnd: "%>",
                        variableStart: "<$",
                        variableEnd: "$>",
                        commentStart: "<#",
                        commentEnd: "#>"
                    }
                }
              }
            }
          }
        ]
      }
    ];
  }
}
```

## Relative paths

While all your template files are able to locate themselves relatively to each other, all other assets, like images is not handled by nunjucks itself. This means that when code passed to html-loader, it will attempt to find files located _relative_ to page, and not relative to any partial or macros file.

This can be worked around in various ways. You can maintain such flat file structure when path to assets from any template part will end up with right path, like so:

```
src
├── assets
│   └── sky.jpg
├── js
│   └── main.js
├── macros
│   └── checkbox.njk
├── pages
│   └── index.njk
├── partials
│   ├── about-assets.njk
│   ├── about-macros.njk
│   ├── about-pages.njk
│   ├── about-partials.njk
│   ├── about-styles.njk
│   └── about-templates.njk
├── styles
│   └── main.scss
└── templates
  └── base.njk
```

This way, when you reference image this way: `<img src="../assets/sky.jpg"/>` in partial (include) or macros, it will allways be found.
