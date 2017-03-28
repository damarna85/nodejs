import highland from 'highland'
import defaults from 'lodash.defaults'
import difference from 'lodash.difference'
import csv from 'csv-parser'
import npmlog from 'npmlog'

import CONSTANTS from '../constants'

/* eslint class-methods-use-this:["error", {"exceptMethods":["_processData"]}]*/
export default class AbstractParser {
  constructor ({ logger, csvConfig = {} }, moduleName) {
    this.moduleName = moduleName

    this.csvConfig = defaults(csvConfig, {
      batchSize: CONSTANTS.standardOption.batchSize,
      delimiter: CONSTANTS.standardOption.delimiter,
      strictMode: CONSTANTS.standardOption.strictMode,
    })

    this.logger = logger || {
      error: npmlog.error.bind(this, ''),
      warn: npmlog.warn.bind(this, ''),
      info: npmlog.info.bind(this, ''),
      verbose: npmlog.verbose.bind(this, ''),
    }
  }

  _streamInput (input) {
    let rowIndex = 1

    return highland(input)
      .through(csv({
        separator: this.csvConfig.delimiter,
        strict: this.csvConfig.strictMode,
      }))
      .batch(this.csvConfig.batchSize)
      .stopOnError(error => this.logger.error(error))
      .doto((data) => {
        this.logger.verbose(`Parsed row-${rowIndex}: ${JSON.stringify(data)}`)
        rowIndex += 1
      })
      .flatMap(highland)
      .flatMap(data => highland(this._processData(data)))
      .doto(data => this.logger.verbose(
        `Converted row-${rowIndex}: ${JSON.stringify(data)}`))
  }

  _getMissingHeaders (data) {
    const headerDiff = difference(
      CONSTANTS.requiredHeaders[this.moduleName],
      Object.keys(data))

    return headerDiff
  }

  _processData () {
    throw new Error('Method AbstractParser._processData has to be overridden!')
  }
}
