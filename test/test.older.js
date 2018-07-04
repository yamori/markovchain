/* eslint global-require: 0, no-unused-expressions: 0 */
'use strict';

var MarkovChain = require('../lib/index.js').MarkovChain
    , chai = require('chai')

var expect = chai.expect
    , testMarkov;

describe('MarkovChain', function() {

  beforeEach(function() {
    testMarkov = new MarkovChain()
  })

  afterEach(function() {
    testMarkov = null;
  })

  describe('use', function() {
    it('should accept an array for use and return array', function(done) {
      testMarkov.use(['a', 'b'])
      expect(testMarkov.files).to.be.an('array')
      expect(testMarkov.files).to.have.members(['a', 'b'])
      expect(testMarkov.files).to.not.include('c')
      done()
    })
    it('should accept a string for use and return array', function(done) {
      testMarkov.use('a')
      expect(testMarkov.files).to.be.an('array')
      expect(testMarkov.files).to.include('a')
      expect(testMarkov.files).to.not.include('b')
      done()
    })
    it('should throw an error for non-array/non-string', function(done) {
      expect(function() { testMarkov.use({ 'a': 'b' }) }).to.throw(Error)
      done()
    })
  })

  describe('readFile', function() {
    it('return the contents of file a.txt', function(done) {
      testMarkov.use(['./test/fixtures/a.txt']).start('this').end(5)
      testMarkov.readFile(testMarkov.files[0])(function(err, resp) {
        expect(err).to.not.exist
        expect(resp).to.be.a('string')
        expect(resp).to.equal('this is file: a\nthis is not file: b\n')
        done()
      })
    })
  })

  describe('process', function() {
    it('should process files into token bank', function(done) {
      testMarkov.use(['./test/fixtures/a.txt']).start('not').end(5).process(function(err, resp) {
        expect(err).to.not.exist
        expect(testMarkov.countTotal('this')).to.equal(2)
        expect(testMarkov.countTotal('is')).to.equal(2)
        expect(testMarkov.countTotal('file:')).to.equal(2)
        expect(testMarkov.countTotal('not')).to.equal(1)
        expect(resp.substring(0, 4)).to.equal('not ')
        done()
      })
    })
  })

  describe('start', function() {
    it('should set the start property with value "spot"', function(done) {
      testMarkov.start('spot')
      expect(testMarkov.startFn()).to.equal('spot')
      done()
    })
    it('should set the start property with a function "onlyIfWordHasLetterI"', function(done) {
      var onlyIfWordHasLetterI = function(wordList) {
        var words = Object.keys(wordList);
        var tmpList = words.filter(function(word) { return word.indexOf('i') > -1 })

        return tmpList[~~(Math.random() * tmpList.length)]
      }

      testMarkov.use(['./test/fixtures/a.txt']).start(onlyIfWordHasLetterI).end(5).process(function(err, sent) {
        expect(err).to.not.exist
        expect(sent.split(' ')[0]).to.include('i')
        expect(testMarkov.wordBank).to.eql({
          'this': {
            'is': 2
          },
          'is': {
            'file:': 1,
            'not': 1
          },
          'file:': {
            'a': 1,
            'b': 1
          },
          'not': {
            'file:': 1
          }
        })
        done()

      })

    })
  })

  describe('end', function() {
    it('should set the end property with value "tops"', function(done) {
      testMarkov.sentence = 'this sentence ends with tops'
      testMarkov.end('tops')
      expect(testMarkov.endFn()).to.equal(true)
      testMarkov.end('nottops')
      expect(testMarkov.endFn()).to.equal(false)
      done()
    })
    it('should set the end property with value "5"', function(done) {
      testMarkov.end(5)
      testMarkov.sentence = 'this is a test of a test'
      expect(testMarkov.endFn()).to.equal(true)
      testMarkov.sentence = 'this is a test of'
      expect(testMarkov.endFn()).to.equal(false)
      testMarkov.sentence = 'this is a'
      expect(testMarkov.endFn()).to.equal(false)
      done()
    })
    it('should set the end property with a function', function(done) {
      testMarkov.end(function() { return this.sentence.split(' ').length > 3 || this.sentence.split(' ').slice(-1)[0] === 'test' }.bind(testMarkov))
      testMarkov.sentence = 'test'
      expect(testMarkov.endFn()).to.equal(true)
      testMarkov.sentence = 'this is a test of a test'
      expect(testMarkov.endFn()).to.equal(true)
      testMarkov.sentence = 'this is a test of'
      expect(testMarkov.endFn()).to.equal(true)
      testMarkov.sentence = 'this is a test of the tester'
      expect(testMarkov.endFn()).to.equal(true)
      testMarkov.sentence = 'this is a'
      expect(testMarkov.endFn()).to.equal(false)
      done()
    })
  })

  describe('VERSION', function() {
    it('should have the same version as in package.json', function(done) {
      expect(require('../package').version).to.equal(testMarkov.VERSION)
      done()
    })
  })
})
