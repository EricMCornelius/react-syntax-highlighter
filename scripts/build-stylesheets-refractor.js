'use strict';

import path from 'node:path';
import fs from 'node:fs';
import css from 'css';
import camel from 'to-camel-case';

const autogenMessage =
  '//\n// This file has been auto-generated by the `npm run build-styles-prism` task\n//\n\n';

let directories = [
  'node_modules/prismjs/themes',
  'node_modules/prism-themes/themes',
];

directories.map((directory) => {
  fs.readdir(path.resolve(directory), (err, files) => {
    files.forEach((file) => {
      if (file.endsWith('.ts')) return;

      if (file.includes('.css') && !file.includes('.min')) {
        createJavascriptStyleSheet(file, directory);
      }
    });
    updateDocs(files);
  });
});

function getSimpleFilename(filename) {
  let nameWithoutExtension = filename.split('.css')[0].split('prism-')[1];
  if (filename === 'prism.css') nameWithoutExtension = 'prism';
  if (filename === 'prism.min.css') nameWithoutExtension = 'prism.min';
  return nameWithoutExtension;
}

let allFiles = [];
let callCount = 0;
function updateDocs(files) {
  allFiles = allFiles.concat(files);
  callCount += 1;

  if (callCount != directories.length) {
    return;
  }
  const onlyCSSFiles = allFiles.filter((file) => file.includes('.css'));
  const onlyNonMinifiedCSS = onlyCSSFiles.filter(
    (file) => !file.includes('.min'),
  );
  const availableStyleNames = onlyNonMinifiedCSS.map((file) =>
    getSimpleFilename(file),
  );
  const styles = availableStyleNames.map((name) => `\n* ${camel(name)}`);
  const defaultExports = availableStyleNames.map(
    (name) => `export { default as ${camel(name)} } from './${name}.js';\n`,
  );
  const styleMD = `## Available \`stylesheet\` props ${styles.join('')}`;
  fs.writeFile(path.resolve('AVAILABLE_STYLES_PRISM.MD'), styleMD, () => {});
  fs.writeFile(
    path.resolve('src/styles/prism/index.js'),
    defaultExports.join(''),
    () => {},
  );

  const demoStylesArray = `${autogenMessage}export default [${availableStyleNames
    .sort()
    .map((style) => `\n  '${style}'`)}\n];`;
  fs.writeFile(path.resolve('demo/styles/prism.js'), demoStylesArray, (err) => {
    if (err) {
      throw err;
    }
  });
}

function createJavascriptStyleSheet(file, directory) {
  let fileWithoutCSS = getSimpleFilename(file);
  console.log(fileWithoutCSS);

  fs.readFile(path.resolve(`${directory}/${file}`), 'utf-8', (err, data) => {
    const javacriptStylesheet = css
      .parse(data)
      .stylesheet.rules.reduce((sheet, rule) => {
        if (rule.type === 'rule') {
          const style = rule.selectors.reduce((selectors, selector) => {
            const selectorObject = rule.declarations.reduce(
              (declarations, declaration) => {
                if (
                  declaration.type === 'declaration' &&
                  declaration.property
                ) {
                  const camelCaseDeclarationProp = camel(declaration.property);
                  const key =
                    camelCaseDeclarationProp.includes('moz') ||
                    camelCaseDeclarationProp.includes('webkit') ||
                    (camelCaseDeclarationProp[0] === 'o' &&
                      !camelCaseDeclarationProp.includes('overflow'))
                      ? `${camelCaseDeclarationProp
                          .substring(0, 1)
                          .toUpperCase()}${camelCaseDeclarationProp.substring(
                          1,
                        )}`
                      : camelCaseDeclarationProp;
                  declarations[key] = declaration.value;
                }
                return declarations;
              },
              {},
            );

            if (selector.substring(0, 6) === '.token') {
              selector = selector.substring(7);

              // Regex to fix Prism theme selectors
              // - Remove further `.token` classes
              // - Remove the space (descendant combinator)
              //   to allow for styling multiple classes
              //   Ref: https://github.com/react-syntax-highlighter/react-syntax-highlighter/pull/305
              selector = selector.replace(/(?<=\w) (\.token)?(?=\.)/g, '');
            }
            selectors[selector] = selectorObject;
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
      path.resolve(`src/styles/prism/${fileWithoutCSS}.js`),
      `export default ${JSON.stringify(javacriptStylesheet, null, 4)}`,
      () => {},
    );
  });
}
