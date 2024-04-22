"use strict";
(self["webpackChunkreact_syntax_highlighter"] = self["webpackChunkreact_syntax_highlighter"] || []).push([["react-syntax-highlighter_languages_highlight_inform7"],{

/***/ "./node_modules/highlight.js/es/languages/inform7.js":
/*!***********************************************************!*\
  !*** ./node_modules/highlight.js/es/languages/inform7.js ***!
  \***********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ inform7)
/* harmony export */ });
/*
Language: Inform 7
Author: Bruno Dias <bruno.r.dias@gmail.com>
Description: Language definition for Inform 7, a DSL for writing parser interactive fiction.
Website: http://inform7.com
*/

function inform7(hljs) {
  const START_BRACKET = '\\[';
  const END_BRACKET = '\\]';
  return {
    name: 'Inform 7',
    aliases: [ 'i7' ],
    case_insensitive: true,
    keywords: {
      // Some keywords more or less unique to I7, for relevance.
      keyword:
        // kind:
        'thing room person man woman animal container '
        + 'supporter backdrop door '
        // characteristic:
        + 'scenery open closed locked inside gender '
        // verb:
        + 'is are say understand '
        // misc keyword:
        + 'kind of rule' },
    contains: [
      {
        className: 'string',
        begin: '"',
        end: '"',
        relevance: 0,
        contains: [
          {
            className: 'subst',
            begin: START_BRACKET,
            end: END_BRACKET
          }
        ]
      },
      {
        className: 'section',
        begin: /^(Volume|Book|Part|Chapter|Section|Table)\b/,
        end: '$'
      },
      {
        // Rule definition
        // This is here for relevance.
        begin: /^(Check|Carry out|Report|Instead of|To|Rule|When|Before|After)\b/,
        end: ':',
        contains: [
          {
            // Rule name
            begin: '\\(This',
            end: '\\)'
          }
        ]
      },
      {
        className: 'comment',
        begin: START_BRACKET,
        end: END_BRACKET,
        contains: [ 'self' ]
      }
    ]
  };
}




/***/ })

}]);
//# sourceMappingURL=react-syntax-highlighter_languages_highlight_inform7.js.map