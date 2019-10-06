const nunjucks = require("nunjucks");
const path = require("path");
const fs = require("fs");
const utils = require("loader-utils");
const validateOptions = require("schema-utils");

const schema = require("./options-schema.json");

function loader(content, map, meta) {
  const context = this;

  const options = utils.getOptions(context);
  validateOptions(schema, options, {
    name: "nunjucks-loader",
    baseDataPath: "options"
  });

  const callback = this.async();
  const MyLoader = nunjucks.Loader.extend({
    async: false,
    resolve(from, to) {
      const file = path.resolve(path.dirname(from), to);
      context.addDependency(file);
      return file;
    },
    getSource(name) {
      return {
        src: fs.readFileSync(name, { encoding: "utf-8" }).toString(),
        path: name
      };
    }
  });
  const env = new nunjucks.Environment(new MyLoader(), options.config);
  if (options.filters) {
    delete require.cache[require.resolve(options.filters)];
    this.addDependency(options.filters);
    const filters = require(options.filters);

    for (const name in filters) {
      env.addFilter(name, filters[name]);
    }
  }
  if (options.extensions) {
    delete require.cache[require.resolve(options.extensions)];
    this.addDependency(options.extensions);
    const extensions = require(options.extensions);

    for (const name in extensions) {
      const ext =
        typeof extensions[name] === "function"
          ? new extensions[name]()
          : extensions[name];
      env.addExtension(name, ext);
    }
  }
  if (options.globals) {
    delete require.cache[require.resolve(options.globals)];
    this.addDependency(options.globals);
    const globals = require(options.globals);
    for (const name in globals) {
      env.addGlobal(name, globals[name]);
    }
  }
  const template = new nunjucks.Template(content, env, this.resourcePath);
  template.render({}, function(error, result) {
    callback(error || null, result, map, meta);
  });
}

module.exports = loader;
