import fs from 'fs'

import AbstractParser from '../src/parsers/abstract-parser'

const sampleImportFile = 'data/lineitemstate-sample.csv'

describe('AbstractParser', () => {
  it('::constructor should set default settings', () => {
    const parser = new AbstractParser()

    expect(parser.csvConfig).toEqual({
      batchSize: 100,
      delimiter: ',',
      strictMode: true,
    })

    expect(parser.logger).toBeTruthy()
  })

  it('::constructor should accept input options', () => {
    const parser = new AbstractParser({
      csvConfig: {
        delimiter: ';',
      },
    })

    expect(parser.csvConfig).toEqual({
      batchSize: 100,
      delimiter: ';',
      strictMode: true,
    })

    expect(parser.logger).toBeTruthy()
  })

  it('::_getMissingHeaders should return missing headers', () => {
    const parser = new AbstractParser({}, 'lineItemState')
    const headers = parser._getMissingHeaders({
      orderNumber: 123,
      lineItemId: 213,
    })

    expect(headers).toEqual([
      'quantity',
      'fromState',
      'toState',
    ])
  })

  it('::_processData should throw an error when called', () => {
    const parser = new AbstractParser()

    // console.log(parser._processData())
    expect(parser._processData).toThrowError(
      'Method AbstractParser._processData has to be overridden!')
  })

  it('::_streamInput should return a highland stream', () => {
    const parser = new AbstractParser()

    const output = parser._streamInput(fs.createReadStream(sampleImportFile))
    expect(output.source.__HighlandStream__).toBeTruthy()
  })
})