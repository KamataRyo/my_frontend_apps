var indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

$(function() {
  var Edition, Metrics, calcValues, distance_in, e, edition_in, edition_out, getWidth, m, scale_in, units;
  edition_in = '';
  scale_in = 0;
  distance_in = '';
  edition_out = '';
  units = {
    'μm': 0.000001,
    'mm': 0.001,
    'cm': 0.01,
    'm': 1,
    'km': 1000
  };
  Metrics = (function() {
    var RE_DIMENSION, RE_METRICS, RE_UNIT, RE_VALUE;

    RE_METRICS = /^-?[0-9]+(.[0-9]+)?([A-Z,a-z]+)?(-?[0-9]+(.[0-9]+)?)?$/;

    RE_VALUE = /^-?[0-9]+(.[0-9]+)?/;

    RE_UNIT = /[A-Z,a-z]+/;

    RE_DIMENSION = /-?[0-9]+(.[0-9]+)?$/;

    function Metrics(value) {
      this.stringify = value.replace(/\s+/g, '');
      this.isParsable = RE_METRICS.test(this.stringify);
      if (this.isParsable) {
        this.value = parseFloat(RE_VALUE.exec(this.stringify));
        if (RE_UNIT.test(this.stringify)) {
          this.unit = RE_UNIT.exec(this.stringify);
          this.dimension = RE_DIMENSION.test(this.stringify) ? parseFloat(RE_DIMENSION.exec(this.stringify)) : 1;
        } else {
          this.unit = '';
          this.dimension = 1;
        }
      }
    }

    return Metrics;

  })();
  Edition = (function() {
    var RE_COLUMN, RE_EDITION, RE_SIZE, getWidth, widths;

    RE_EDITION = /^[aAbBcC]([0-9]|10)$/;

    RE_COLUMN = /^[aAbBcC]/;

    RE_SIZE = /([0-9]|10)$/;

    widths = {
      A: 1189,
      B: 1414,
      C: 1297
    };

    function Edition(value) {
      this.stringify = value.replace(/\s+/g, '');
      this.isParsable = RE_EDITION.test(this.stringify);
      if (this.isParsable) {
        this.column = String(RE_COLUMN.exec(this.stringify)).toUpperCase();
        this.size = parseInt(RE_SIZE.exec(this.stringify));
      }
    }

    getWidth = function(opt) {
      var long_width, short_width;
      long_width = Math.round(widths[this.column] / Math.pow(2, num / 2));
      short_width = Math.round(widths[this.column] / Math.pow(2, (num + 1) / 2));
      switch (opt.toUpperCase()) {
        case 'SHORT':
        case 'SHORTER':
        case 'S':
          return short_width;
        case 'LONG':
        case 'LONGER':
        case 'L':
          return long_width;
      }
    };

    return Edition;

  })();
  m = new Metrics('0.101cm');
  console.log(m.value + ':' + m.unit + ':' + m.dimension);
  e = new Edition('B11');
  getWidth = function(ab, num) {
    if (ab.toUpperCase() === 'A') {
      return Math.round(1189 / Math.pow(2, num / 2));
    }
    if (ab.toUpperCase() === 'B') {
      return Math.round(1456 / Math.pow(2, num / 2));
    }
  };
  calcValues = function() {
    var ab_in, ab_out, distance_in_num, distance_in_unit, num, num_in, num_out, r_in, r_out, ref, scale_out;
    ab_in = edition_in[0];
    ab_out = edition_out[0];
    num_in = edition_in.slice(1);
    num_out = edition_out.slice(1);
    num = distance_in.length;
    distance_in_unit = (ref = distance_in[num - 1], indexOf.call([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], ref) >= 0) ? distance_in.slice(num - 1, +num + 1 || 9e9) : distance_in.slice(num - 2, +num + 1 || 9e9);
    distance_in_num = distance_in.slice(0, +(num - distance_in_unit.length - 1) + 1 || 9e9) * units[distance_in_unit];
    $('#distance_in_result').val(distance_in_num * scale_in);
    r_in = getWidth(ab_in, num_in);
    r_out = getWidth(ab_out, num_out);
    scale_out = Math.round((r_in / r_out) * scale_in);
    return $('#scale_out').val(scale_out);
  };
  $('#edition_in').keyup(function() {
    edition_in = $(this).val();
    return calcValues();
  });
  $('#scale_in').keyup(function() {
    scale_in = $(this).val();
    return calcValues();
  });
  $('#distance_in').keyup(function() {
    distance_in = $(this).val();
    return calcValues();
  });
  return $('#edition_out').keyup(function() {
    edition_out = $(this).val();
    return calcValues();
  });
});
