$(function() {
  var Edition, Metrics, editionAfter, editionBefore, metricsInput, scaleBefore, tryCalc, unit_info, validate;
  metricsInput = '';
  editionBefore = '';
  scaleBefore = 0;
  editionAfter = '';
  unit_info = {
    'μm': {
      dimension: 1,
      magnifier: 0.000001,
      "export": false
    },
    'mm': {
      dimension: 1,
      magnifier: 0.001,
      "export": true
    },
    'cm': {
      dimension: 1,
      magnifier: 0.01,
      "export": true
    },
    'm': {
      dimension: 1,
      magnifier: 1,
      "export": true
    },
    'km': {
      dimension: 1,
      magnifier: 1000,
      "export": true
    },
    'a': {
      dimension: 2,
      magnifier: 10,
      "export": true
    },
    'ha': {
      dimension: 2,
      magnifier: 100,
      "export": true
    }
  };
  Metrics = (function() {
    var RE_DIMENSION, RE_METRICS, RE_UNIT, RE_VALUE;

    RE_METRICS = /^-?[0-9]+(.[0-9]+)?([A-Z,a-z]+)?(-?[0-9]+(.[0-9]+)?)?$/;

    RE_VALUE = /^-?[0-9]+(.[0-9]+)?/;

    RE_UNIT = /[A-Z,a-z]+/;

    RE_DIMENSION = /-?[0-9]+(.[0-9]+)?$/;

    function Metrics(value) {
      var _string;
      _string = value.replace(/\s+/g, '');
      this.isParsable = RE_METRICS.test(_string);
      this.value = 1;
      this.unit = '';
      this.unit_magnifier = 1;
      this.input_dimension = 1;
      this.unit_dimension = 1;
      if (this.isParsable) {
        this.value = parseFloat(RE_VALUE.exec(_string));
        if (RE_UNIT.test(_string)) {
          this.unit = RE_UNIT.exec(_string);
          this.input_dimension = RE_DIMENSION.test(_string) ? parseFloat(RE_DIMENSION.exec(_string)) : 1;
        } else {
          this.unit = '';
          this.input_dimension = 1;
        }
        this.uit_dimension = unit_info[this.unit] != null ? unit_info[this.unit].dimension : 1;
        this.unit_magnifier = unit_info[this.unit] != null ? unit_info[this.unit].magnifier : 1;
      }
      this.absValue = Math.abs(this.value);
      this.sign = this.absValue / this.value;
      this.baseAbsValue = Math.pow(this.absValue * this.unit_magnifier, 1 / (this.unit_dimension * this.input_dimension));
    }

    Metrics.prototype.stringfy = function(opts) {
      var dimension, unit, value;
      if (opts == null) {
        opts = new Object();
      }
      value = opts['value'] != null ? opts['value'] : this.value;
      value = Math.round(value);
      unit = opts['unit'] != null ? opts['unit'] : this.unit;
      dimension = opts['dimension'] != null ? opts['dimension'] : this.input_dimension;
      dimension = dimension === 1 ? '' : dimension;
      return value + unit + dimension;
    };

    Metrics.prototype.regenerate = function(opts) {
      if (opts == null) {
        opts = new Object();
      }
      return new Metrics(this.stringfy(opts));
    };

    return Metrics;

  })();
  Edition = (function() {
    var RE_COLUMN, RE_EDITION, RE_SIZE, widths;

    RE_EDITION = /^[aAbBcC]([0-9]|10)$/;

    RE_COLUMN = /^[aAbBcC]/;

    RE_SIZE = /([0-9]|10)$/;

    widths = {
      A: 1189,
      B: 1414,
      C: 1297
    };

    function Edition(value) {
      var _string;
      _string = value.replace(/\s+/g, '');
      this.isParsable = RE_EDITION.test(_string);
      if (this.isParsable) {
        this.column = String(RE_COLUMN.exec(_string)).toUpperCase();
        this.size = parseInt(RE_SIZE.exec(_string));
      }
    }

    Edition.prototype.getWidth = function(opt) {
      var long_width, short_width;
      if (opt == null) {
        opt = 'L';
      }
      long_width = widths[this.column] / Math.pow(2, this.size / 2);
      short_width = widths[this.column] / Math.pow(2, (this.size + 1) / 2);
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
  validate = {
    'metrics-input': function() {
      var $elem;
      $elem = $('input[name=metrics-input]');
      metricsInput = new Metrics($elem.val());
      $elem.data('validated', metricsInput.isParsable);
      $('#metrics-input-parsed-value').text(metricsInput.value);
      $('#metrics-input-parsed-unit').text(metricsInput.unit);
      $('#metrics-input-parsed-unit-magnifier').text(metricsInput.unit_magnifier);
      $('#metrics-input-parsed-unit-dimension').text(metricsInput.unit_dimension);
      $('#metrics-input-parsed-input-dimension').text(metricsInput.input_dimension);
      return $('#metrics-input-parsed-baseAbsValue').text(metricsInput.baseAbsValue);
    },
    'edition-before': function() {
      var $elem;
      $elem = $('input[name=edition-before]');
      editionBefore = new Edition($elem.val());
      return $elem.data('validated', editionBefore.isParsable);
    },
    'scale-before': function() {
      scaleBefore = $('input[name=scale-before]').val();
      return $('input[name=scale-before]').data('validated', true);
    },
    'edition-after': function() {
      var $elem;
      $elem = $('input[name=edition-after]');
      editionAfter = new Edition($elem.val());
      return $elem.data('validated', editionAfter.isParsable);
    }
  };
  tryCalc = function() {
    var c1, c2, c3, c4, m1, m2, scaleAfter;
    c1 = $('input[name=metrics-input]').data('validated');
    c2 = $('input[name=scale-before]').data('validated');
    c3 = $('input[name=edition-before]').data('validated');
    c4 = $('input[name=edition-after]').data('validated');
    if (c2 && c3 && c4) {
      scaleAfter = scaleBefore * (editionAfter.getWidth() / editionBefore.getWidth());
      $('input[name=scale-after]').val(Math.round(scaleAfter));
    } else {
      $('input[name=scale-after]').val('');
    }
    if (c1 && c2) {
      m1 = metricsInput.regenerate({
        value: metricsInput.sign * Math.pow(metricsInput.absValue * scaleBefore, metricsInput.dimension)
      });
      $('input[name=metrics-before-output]').val(m1.stringfy());
    } else {
      $('input[name=metrics-before-output]').val('');
    }
    if (c1 && c2 && c3 && c4) {
      m2 = metricsInput.regenerate({
        value: metricsInput.sign * Math.pow(metricsInput.absValue * scaleAfter, metricsInput.dimension)
      });
      return $('input[name=metrics-after-output]').val(m2.stringfy());
    } else {
      return $('input[name=metrics-after-output]').val('');
    }
  };
  $('input').each(function(i, elem) {
    var name;
    if (($(elem).attr("name") != null) && ($(elem).attr("data-validated") != null) && !$(elem).hasClass('example') && !$(elem).hasClass('output')) {
      name = $(elem).attr("name");
      if ($("label[for=" + name + "]") != null) {
        $("label[for=" + name + "]").append($("<i id='notation-" + name + "' class='fa'></i>"));
        $("#notation-" + name).css('opacity', '0.4').css('margin-left', '5px');
        $(elem).keyup(function() {
          if (validate[name] != null) {
            validate[name]();
          }
          if ($(this).data("validated")) {
            $("#notation-" + name).removeClass('fa-exclamation-triangle').addClass('fa-check-circle').css('color', 'green');
          } else {
            $("#notation-" + name).removeClass('fa-check-circle').addClass('fa-exclamation-triangle').css('color', 'red');
          }
          return tryCalc();
        });
        return $(elem).keyup();
      }
    }
  });
  $('.toggle-next').each(function(i, elem) {
    var $i, display;
    $(elem).prepend('<i class="fa"></i>');
    $i = $(elem).children('i');
    display = $(elem).next().css('display');
    if (display === 'none') {
      return $i.addClass('fa-angle-double-right');
    } else {
      return $i.addClass('fa-angle-double-down');
    }
  });
  $('.toggle-next').hover(function() {
    return $(this).css('cursor', 'pointer');
  });
  return $('.toggle-next').click(function() {
    var display;
    display = $(this).next().css('display');
    if (display === 'none') {
      $(this).children('i').removeClass('fa-angle-double-right').addClass('fa-angle-double-down');
      return $(this).next().show('fast');
    } else {
      $(this).children('i').removeClass('fa-angle-double-down').addClass('fa-angle-double-right');
      return $(this).next().hide('fast');
    }
  });
});
