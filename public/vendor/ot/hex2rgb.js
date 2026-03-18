const defaultColor = { red: 0, green: 0, blue: 0 }

function hex2rgb (hex) {
  if (!hex || typeof hex !== 'string') return defaultColor
  if (hex[0] == '#') hex = hex.substr(1)
  if (hex.length == 3) {
    var temp = hex
    hex = ''
    var match = /^([a-f0-9])([a-f0-9])([a-f0-9])$/i.exec(temp)
    if (!match) return defaultColor
    temp = match.slice(1)
    for (var i = 0; i < 3; i++) hex += temp[i] + temp[i]
  }
  var result = /^([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})$/i.exec(hex)
  if (!result) return defaultColor
  var triplets = result.slice(1)
  return {
    red: parseInt(triplets[0], 16),
    green: parseInt(triplets[1], 16),
    blue: parseInt(triplets[2], 16)
  }
}

module.exports = hex2rgb
