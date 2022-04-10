function hex2rgb (hex) {
  if (hex[0] == '#') hex = hex.substr(1)
  if (hex.length == 3) {
    var temp = hex
    hex = ''
    temp = /^([a-f0-9])([a-f0-9])([a-f0-9])$/i.exec(temp).slice(1)
    for (var i = 0; i < 3; i++) hex += temp[i] + temp[i]
  }
  var triplets = /^([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})$/i.exec(hex).slice(1)
  return {
    red: parseInt(triplets[0], 16),
    green: parseInt(triplets[1], 16),
    blue: parseInt(triplets[2], 16)
  }
}

module.exports = hex2rgb
