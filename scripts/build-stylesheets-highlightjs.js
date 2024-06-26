'use strict';
/*
 * Quick and dirty script to build javascript stylesheets from highlight.js css
 */
import path from 'node:path';
import fs from 'node:fs';

import css from 'css';
import camel from 'to-camel-case';

const autogenMessage =
  '//\n// This file has been auto-generated by the `npm run build-styles-hljs` task\n//\n\n';

fs.readdir(path.resolve('node_modules/highlight.js/styles'), (err, files) => {
  if (err) {
    throw err;
  }

  files = files.filter(f => !f.endsWith('.min.js') && !f.endsWith('.min.css'));

  files.forEach((file) => {
    if (file.includes('.css')) {
      createJavascriptStyleSheet(file);
    }
  });
  const onlyCSSFiles = files.filter(file => file.includes('.css'));
  const availableStyleNames = onlyCSSFiles.map((file) =>
    file.split('.css')[0] === 'default'
      ? 'default-style'
      : file.split('.css')[0],
  );
  const styles = availableStyleNames.map((name) => `\n* ${camel(name)}`);
  const defaultExports = availableStyleNames.map(
    (name) => `export { default as ${camel(name)} } from './${name}.js';\n`,
  );
  const styleMD = `## Available \`stylesheet\` props ${styles.join('')}`;
  fs.writeFile(path.resolve('AVAILABLE_STYLES_HLJS.MD'), styleMD, (err) => {
    if (err) {
      throw err;
    }
  });
  fs.writeFile(
    path.resolve('src/styles/hljs/index.js'),
    defaultExports.join(''),
    (err) => {
      if (err) {
        throw err;
      }
    },
  );

  const demoStylesArray = `${autogenMessage}export default [${availableStyleNames
    .sort()
    .map((style) => `\n  '${style}'`)}\n];`;
  fs.writeFile(path.resolve('demo/styles/hljs.js'), demoStylesArray, (err) => {
    if (err) {
      throw err;
    }
  });
});

function createJavascriptStyleSheet(file) {
  const ignoreStyleWithThis = '.hljs a';
  const fileWithoutCSS =
    file.split('.css')[0] === 'default'
      ? 'default-style'
      : file.split('.css')[0];
  fs.readFile(
    path.resolve(`node_modules/highlight.js/styles/${file}`),
    'utf-8',
    (err, data) => {
      if (err) {
        throw err;
      }
      const javacriptStylesheet = css
        .parse(data)
        .stylesheet.rules.reduce((sheet, rule) => {
          if (rule.type === 'rule') {
            const style = rule.selectors.reduce((selectors, selector) => {
              if (!selector.includes(ignoreStyleWithThis)) {
                const selectorObject = rule.declarations.reduce(
                  (declarations, declaration) => {
                    if (
                      declaration.type === 'declaration' &&
                      declaration.property
                    ) {
                      declarations[camel(declaration.property)] =
                        declaration.value;
                    }
                    return declarations;
                  },
                  {},
                );
                selectors[selector.substring(1)] = selectorObject;
              }
              return selectors;
            }, {});
            sheet = Object.keys(style).reduce((stylesheet, selector) => {
              if (stylesheet[selector]) {
                stylesheet[selector] = Object.assign(
                  {},
                  stylesheet[selector],
                  style[selector],
                );
              } else {
                stylesheet[selector] = style[selector];
              }
              return stylesheet;
            }, sheet);
          }
          return sheet;
        }, {});
      fs.writeFile(
        path.resolve(`src/styles/hljs/${fileWithoutCSS}.js`),
        `export default ${JSON.stringify(javacriptStylesheet, null, 4)}`,
        (err) => {
          if (err) {
            throw err;
          }
        },
      );
    },
  );
}
