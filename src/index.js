/* eslint global-require: 0 */
//'use strict';

const pickOneByWeight = require('pick-one-by-weight')

const isType = (t) => Object.prototype.toString.call(t).slice(8, -1).toLowerCase()

class MarkovChain {
  constructor(contents, normFn = (word) => word.replace(/\.$/ig, '')) {
    this.wordBank = Object.create(null);
    this.sentence = ''
    this._normalizeFn = normFn
    this.parseBy = /(?:\.|\?|\n)/ig
    this.kOrder = 5;
    this.parse(contents);
  }
  startFn(wordList) {
    const k = Object.keys(wordList)
    const l = k.length

    return k[~~(Math.random() * l)]
  }
  endFn() {
    return this.sentence.split(' ').length > 7
  }
  process() {
    let curToken = this.startFn(this.wordBank)

    this.sentence = curToken
    while (this.wordBank[curToken] && !this.endFn()) {
      var nextChar = pickOneByWeight(this.wordBank[curToken]);
      this.sentence += nextChar;
      curToken = this.sentence.substring(this.sentence.length - this.kOrder, this.sentence.length);
    }
    return this.sentence
  }
  parse(text = '', parseBy = this.parseBy) {

    var kOrder = this.kOrder;
    for (let i = 0; i < (text.length - 2 - kOrder); i++) {
      let curToken =    text.substring(i, i + kOrder);
      let nextPhrase =   text.substring(i + 1, i + kOrder + 1);
      let nextChar =   text.substring(i + kOrder, i + kOrder + 1);

      if (!this.wordBank[curToken]) {
        this.wordBank[curToken] = Object.create(null);
      }
      if (!this.wordBank[curToken][nextChar]) {
        this.wordBank[curToken][nextChar] = 1;
      } else {
        this.wordBank[curToken][nextChar] += 1;
      }
    }

    return this
  }
  start(fnStr) {
    const startType = isType(fnStr)

    if (startType === 'string') {
      this.startFn = () => fnStr
    }
    else if (startType === 'function') {
      this.startFn = (wordList) => fnStr(wordList)
    }
    else {
      throw new Error('Must pass a function, or string into start()')
    }
    return this
  }
  end(fnStrOrNum) {
    const endType = isType(fnStrOrNum)

    if (endType === 'function') {
      this.endFn = () => fnStrOrNum(this.sentence)
    }
    else if (endType === 'string') {
      this.endFn = () => this.sentence.split(' ').slice(-1)[0] === fnStrOrNum
    }
    else if (endType === 'number' || fnStrOrNum === undefined) {
      fnStrOrNum = fnStrOrNum || Infinity
      this.endFn = () => this.sentence.length > fnStrOrNum;
    }
    else {
      throw new Error('Must pass a function, string or number into end()')
    }
    return this
  }

  _normalize(word) {
    return this._normalizeFn(word)
  }

  normalize(fn) {
    this._normalizeFn = fn
    return this
  }

  static get VERSION() {
    return require('../package').version
  }
  static get MarkovChain() {
    // load older MarkovChain
    return require('../older/index.js').MarkovChain
  }
}

module.exports = MarkovChain
