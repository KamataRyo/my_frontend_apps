$(function() {
  var calcRatio, edition_in, edition_out, getWidth, scale_in;
  edition_in = '';
  scale_in = 0;
  edition_out = '';
  $('#paperwrapper').hide();
  getWidth = function(ab, num) {
    if (ab.toUpperCase() === 'A') {
      return Math.round(1189 / Math.pow(2, num / 2));
    }
    if (ab.toUpperCase() === 'B') {
      return Math.round(1456 / Math.pow(2, num / 2));
    }
  };
  calcRatio = function() {
    var r_in, r_out, scale_out;
    r_in = getWidth(edition_in[0], edition_in.slice(1));
    r_out = getWidth(edition_out[0], edition_out.slice(1));
    scale_out = Math.round((r_in / r_out) * scale_in);
    $('#result').text(scale_out);
    if (scale_out !== 'NaN') {
      $('#paper-in').css('width', (r_in / 5) + 'px').css('height', ((r_in / 5) * 1.41) + 'px');
      $('#paper-out').css('width', (r_out / 5) + 'px').css('height', ((r_out / 5) * 1.41) + 'px');
      return $('#paperwrapper').show();
    } else {
      return $('#ppaperwrapper').hide();
    }
  };
  $('#edition_in').keyup(function() {
    edition_in = $(this).val();
    return calcRatio();
  });
  $('#scale_in').keyup(function() {
    scale_in = $(this).val();
    return calcRatio();
  });
  return $('#edition_out').keyup(function() {
    edition_out = $(this).val();
    return calcRatio();
  });
});
