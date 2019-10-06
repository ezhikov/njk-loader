const nunjucks = require("nunjucks");
const path = require("path");
const fs = require("fs");

function loader(content, map, meta) {
  const context = this;
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
  const env = new nunjucks.Environment(new MyLoader());
  const template = new nunjucks.Template(content, env, this.resourcePath);
  return template.render();
}

module.exports = loader;
