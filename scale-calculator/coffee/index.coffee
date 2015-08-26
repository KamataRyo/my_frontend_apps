$ () ->
	edition_in = ''
	scale_in = 0
	distance_in = ''
	edition_out = ''
	units =
		'μm': 0.000001
		'mm': 0.001
		'cm': 0.01
		'm' : 1
		'km': 1000
	


	class Metrics
		RE_METRICS   = /^-?[0-9]+(.[0-9]+)?([A-Z,a-z]+)?(-?[0-9]+(.[0-9]+)?)?$/ # ^/value unit? dimension?/$
		RE_VALUE     = /^-?[0-9]+(.[0-9]+)?/
		RE_UNIT      = /[A-Z,a-z]+/
		RE_DIMENSION = /-?[0-9]+(.[0-9]+)?$/
		constructor: (value) ->
			@stringify = value.replace /\s+/g, ''
			@isParsable = RE_METRICS.test @stringify
			if @isParsable
				@value      = parseFloat(RE_VALUE.exec @stringify)
				if RE_UNIT.test @stringify
					@unit   = RE_UNIT.exec @stringify
					@dimension  = if RE_DIMENSION.test @stringify then parseFloat(RE_DIMENSION.exec @stringify) else 1
				else
					@unit = ''
					@dimension = 1
			# else raise err


	class Edition
		RE_EDITION = /^[aAbBcC]([0-9]|10)$/
		RE_COLUMN = /^[aAbBcC]/
		RE_SIZE = /([0-9]|10)$/
		widths =
			A:1189
			B:1414
			C:1297
		constructor: (value) ->
			@stringify = value.replace /\s+/g, ''
			@isParsable = RE_EDITION.test @stringify
			if @isParsable
				@column = String(RE_COLUMN.exec @stringify).toUpperCase()
				@size = parseInt(RE_SIZE.exec @stringify)
			# else raise err
		getWidth = (opt) ->
			long_width = Math.round(widths[@column] / Math.pow(2, (num / 2)))
			short_width = Math.round(widths[@column] / Math.pow(2, ((num + 1) / 2)))
			switch opt.toUpperCase()
				when 'SHORT','SHORTER','S' then return  short_width
				when 'LONG','LONGER','L' then return long_width



	m = new Metrics '0.101cm'
	console.log m.value + ':' + m.unit + ':' + m.dimension
	e = new Edition 'B11'


	getWidth = (ab, num) ->
		if ab.toUpperCase() is 'A'
			return Math.round(1189 / Math.pow(2, (num / 2)))
		if ab.toUpperCase() is 'B'
			return Math.round(1456 / Math.pow(2, (num / 2)))

	calcValues = () ->
		ab_in = edition_in[0]
		ab_out = edition_out[0]
		num_in = edition_in[1..]
		num_out = edition_out[1..]


		num = distance_in.length
		distance_in_unit = if distance_in[num-1] in [0..9] then distance_in[num-1..num] else distance_in[num-2..num]
		distance_in_num = distance_in[0..(num - distance_in_unit.length - 1)] * units[distance_in_unit]
		$('#distance_in_result').val distance_in_num * scale_in


		r_in = getWidth(ab_in, num_in)
		r_out =  getWidth(ab_out, num_out)
		scale_out = Math.round((r_in / r_out) * scale_in)

		$('#scale_out').val scale_out



	$('#edition_in').keyup () ->
		edition_in = $(this).val()
		calcValues()

	$('#scale_in').keyup () ->
		scale_in = $(this).val()
		calcValues()

	$('#distance_in').keyup () ->
		distance_in = $(this).val()
		calcValues()

	$('#edition_out').keyup () ->
		edition_out = $(this).val()
		calcValues()
