// blacklist is a function that takes an array of regexes and combines
// them with the default blacklist to return a single regex.
const blacklist = require('metro').createBlacklist()

module.exports = {
  resolver: {
    blacklistRE: blacklist([/#current-cloud-backend\/.*/]),
  },
}
