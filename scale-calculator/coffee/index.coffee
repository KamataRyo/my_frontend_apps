$ () ->
	edition_in = ''
	scale_in = 0
	edition_out = ''
	$('#paperwrapper').hide()

	getWidth = (ab, num) ->
		if ab.toUpperCase() is 'A'
			return Math.round(1189 / Math.pow(2, (num / 2)))
		if ab.toUpperCase() is 'B'
			return Math.round(1456 / Math.pow(2, (num / 2)))


	calcRatio = () ->
		r_in = getWidth(edition_in[0], edition_in[1..])
		r_out =  getWidth(edition_out[0], edition_out[1..])
		scale_out = Math.round((r_out / r_in) * scale_in)
		$('#result').text scale_out
		if scale_out isnt 'NaN'
			$('#paper-in')
				.css 'width', (r_in / 5) + 'px'
				.css 'height',((r_in / 5) * 1.41) + 'px'
			$('#paper-out')
				.css 'width', (r_out / 5) + 'px'
				.css 'height',((r_out / 5) * 1.41) + 'px'
			$('#paperwrapper').show()
		else
			$('#ppaperwrapper').hide()


	$('#edition_in').keyup () ->
		edition_in = $(this).val()
		calcRatio()

	$('#scale_in').keyup () ->
		scale_in = $(this).val()
		calcRatio()

	$('#edition_out').keyup () ->
		edition_out = $(this).val()
		calcRatio()
