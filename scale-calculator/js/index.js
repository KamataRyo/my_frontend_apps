$(function() {
  var Edition, Metrics, editionAfter, editionBefore, metricsInput, scaleBefore, tryCalc, unit_info, validate, var_dump;
  metricsInput = '';
  editionBefore = '';
  scaleBefore = 0;
  editionAfter = '';
  unit_info = {
    'μm': {
      magnifier: 0.000001,
      exportable: false
    },
    'mm': {
      magnifier: 0.001,
      exportable: true
    },
    'cm': {
      magnifier: 0.01,
      exportable: true
    },
    'dm': {
      magnifier: 0.1,
      exportable: false
    },
    'm': {
      magnifier: 1,
      exportable: true
    },
    'dam': {
      magnifier: 10,
      exportable: false
    },
    'hm': {
      magnifier: 100,
      exportable: false
    },
    'km': {
      magnifier: 1000,
      exportable: true
    }
  };
  Metrics = (function() {
    var RE_METRICS, RE_UNIT, RE_VALUE;

    RE_METRICS = /^[-\+]?[\d,]+(\.\d+)?[a-z]+$/i;

    RE_VALUE = /^[-\+]?[\d,]+(\.\d+)?/;

    RE_UNIT = /[a-z]+$/i;

    function Metrics(value) {
      var _string;
      _string = value.replace(/\s+/g, '');
      this.isParsable = RE_METRICS.test(_string);
      this.value = 1;
      this.unit = '';
      this.magnifier = 1;
      if (this.isParsable) {
        this.value = parseFloat(RE_VALUE.exec(_string));
        if (RE_UNIT.test(_string)) {
          this.unit = RE_UNIT.exec(_string);
        } else {
          this.unit = '';
        }
        this.magnifier = unit_info[this.unit] != null ? unit_info[this.unit].magnifier : 1;
      }
      this.absValue = this.value * this.magnifier;
    }

    Metrics.prototype.stringfy = function(opts) {
      var unit, value;
      if (opts == null) {
        opts = new Object();
      }
      value = opts['value'] != null ? opts['value'] : this.value;
      unit = opts['unit'] != null ? opts['unit'] : this.unit;
      return value + unit;
    };

    Metrics.prototype.regenerate = function(opts) {
      if (opts == null) {
        opts = new Object();
      }
      return new Metrics(this.stringfy(opts));
    };

    Metrics.prototype.optimize = function() {
      var min_x, minifier, optimum_unit, props, unit, unit_info_ex, x;
      unit_info_ex = new Object();
      minifier = function(x) {
        return x + 100 / x;
      };
      min_x = minifier(this.absValue);
      optimum_unit = this.unit;
      for (unit in unit_info) {
        props = unit_info[unit];
        if (props.exportable) {
          x = this.absValue / props.magnifier;
          unit_info_ex[unit] = x;
          if (minifier(x < min_x)) {
            min_x = minifier(x);
            optimum_unit = unit;
          }
        }
      }
      return new Metrics((this.absValue / unit_info[optimum_unit].magnifier).toString() + optimum_unit);
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
      if (opt == null) {
        opt = 'L';
      }
      this.long_width = widths[this.column] / Math.pow(2, this.size / 2);
      this.short_width = widths[this.column] / Math.pow(2, (this.size + 1) / 2);
      switch (opt.toUpperCase()) {
        case 'SHORT':
        case 'SHORTER':
        case 'S':
          return this.short_width;
        case 'LONG':
        case 'LONGER':
        case 'L':
          return this.long_width;
      }
    };

    return Edition;

  })();
  var_dump = function(obj) {
    var key, result, value;
    result = '<table>';
    for (key in obj) {
      value = obj[key];
      if (typeof value !== 'function') {
        result += "<tr><th>" + key + "</th><td>" + value + "</td></tr>";
      }
    }
    result += '</table>';
    return result;
  };
  validate = {
    'metrics-input': function() {
      var $elem;
      $elem = $('input[name=metrics-input]');
      metricsInput = new Metrics($elem.val());
      $elem.data('validated', metricsInput.isParsable);
      $('#parsed-metrics-input').children().remove();
      return $('#parsed-metrics-input').append($(var_dump(metricsInput)));
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
        value: metricsInput.value * scaleBefore
      });
      m1 = m1.optimize();
      $('input[name=metrics-before-output]').val(m1.stringfy());
    } else {
      $('input[name=metrics-before-output]').val('');
    }
    if (c1 && c2 && c3 && c4) {
      m2 = metricsInput.regenerate({
        value: metricsInput.value * scaleAfter
      });
      m2 = m2.optimize();
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
