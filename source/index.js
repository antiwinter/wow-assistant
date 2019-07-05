const log = console.log
const async = require('async')

let src = {
  $api: {
    curse: require('./curse'),
    wowinterface: require('./wowinterface'),
    github: require('./github')
  },

  $valid(ad) {
    if (ad.source && !src.$api[ad.source]) {
      log(ad.source, 'is not a valid source, use one of below instead:')
      log(
        _.keys(src.$api)
          .map(x => `  ${x}`)
          .join('\n')
      )
      return false
    }

    return true
  },

  info(ad, done) {
    if (!src.$valid(ad)) return done()

    async.eachOfLimit(
      src.$api,
      1,
      (api, source, cb) => {
        if (ad.source && source !== ad.source) return cb()

        let res = null
        // log('iter', source)
        api.info(ad.key, info => {
          if (info) {
            res = info
            res.source = source
            // log('g info', info)
            done(res)
            cb(false)
          } else cb()
        })
      },
      () => {
        done()
      }
    )
  },

  search(ad, done) {
    if (!src.$valid(ad)) return done()

    async.eachOfLimit(src.$api, 1, (api, source, cb) => {
      if (!api.search) return cb()
      if (ad.source && source !== ad.source) return cb()

      // log('searching', source)
      let res = null
      // log('searching', source)
      api.search(
        ad.key,
        data => {
          if (data && data.length) {
            res = { source, data }
            done(res)
            cb(false)
          }
        },
        () => {
          done()
        }
      )
    })
  }
}

module.exports = src