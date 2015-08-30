# 浮動小数点型に切り替わるケースがあかん
$ () ->
	metricsInput = ''
	editionBefore = ''
	scaleBefore = 0
	editionAfter = ''

	unit_info =
		'μm':
			magnifier: 0.000001
			exportable: false
		'mm':
			magnifier: 0.001
			exportable: true
		'cm':
			magnifier: 0.01
			exportable: true
		'dm':
			magnifier: 0.1
			exportable: false
		'm' :
			magnifier: 1
			exportable: true
		'dam' :
			magnifier: 10
			exportable: false
		'hm' :
			magnifier: 100
			exportable: false
		'km':
			magnifier: 1000
			exportable: true


	class Metrics
		RE_METRICS   = /^[-\+]?[\d,]+(\.\d+)?[a-z]+$/i
		RE_VALUE     = /^[-\+]?[\d,]+(\.\d+)?/
		RE_UNIT      = /[a-z]+$/i
		constructor: (value) ->
			_string = value.replace /\s+/g, ''
			@isParsable = RE_METRICS.test _string

			@value = 1
			@unit = ''
			@magnifier = 1

			if @isParsable
				@value = parseFloat(RE_VALUE.exec _string)
				if RE_UNIT.test _string
					@unit   = RE_UNIT.exec _string
				else
					@unit = ''
				@magnifier = if unit_info[@unit]? then unit_info[@unit].magnifier else 1
			@absValue = @value * @magnifier
		stringfy: (opts) ->
			unless opts? then opts = new Object()
			value = if opts['value']? then opts['value'] else @value
			unit  = if opts['unit']?  then opts['unit']  else @unit
			return value + unit
		regenerate: (opts) ->
			unless opts? then opts = new Object()
			return new Metrics @.stringfy(opts)
		optimize: () ->
			unit_info_ex = new Object()
			minifier = (x) -> return x + 100 / x

			min_x = minifier @absValue
			optimum_unit = @unit
			for unit, props of unit_info
				if props.exportable
					x = @absValue / props.magnifier
					unit_info_ex[unit] = x
					if minifier x < min_x
						min_x = minifier x
						optimum_unit = unit
			return new Metrics (@absValue / unit_info[optimum_unit].magnifier).toString() + optimum_unit




	class Edition
		RE_EDITION = /^[aAbBcC]([0-9]|10)$/
		RE_COLUMN = /^[aAbBcC]/
		RE_SIZE = /([0-9]|10)$/
		widths =
			A:1189
			B:1414
			C:1297
		constructor: (value) ->
			_string = value.replace /\s+/g, ''
			@isParsable = RE_EDITION.test _string
			if @isParsable
				@column = String(RE_COLUMN.exec _string).toUpperCase()
				@size = parseInt(RE_SIZE.exec _string)
			# else raise err
		getWidth: (opt) ->
			unless opt? then opt = 'L'
			@long_width = widths[@column] / Math.pow(2, (@size / 2))
			@short_width = widths[@column] / Math.pow(2, ((@size + 1) / 2))
			switch opt.toUpperCase()
				when 'SHORT','SHORTER','S' then return @short_width
				when 'LONG','LONGER','L' then return @long_width

	# オブジェクトの、関数以外のパブリックメンバをダンプする
	var_dump = (obj) ->
		result = '<table>'
		for key, value of obj
			if typeof value isnt 'function'
				result += "<tr><th>#{key}</th><td>#{value}</td></tr>"
		result += '</table>'
		return result


	# inputフォーム個別の,入力値のvalidation関数の定義
	# name属性がキー
	validate =
		'metrics-input': () ->
			$elem = $('input[name=metrics-input]')
			metricsInput = new Metrics $elem.val()
			$elem.data 'validated', metricsInput.isParsable
			$('#parsed-metrics-input').children().remove()
			$('#parsed-metrics-input').append $(var_dump(metricsInput))


		'edition-before' : () ->
			$elem = $('input[name=edition-before]')
			editionBefore = new Edition $elem.val()
			$elem.data 'validated', editionBefore.isParsable

		'scale-before' : () ->
			scaleBefore = $('input[name=scale-before]').val()
			$('input[name=scale-before]').data 'validated', true

		'edition-after' : () ->
			$elem = $('input[name=edition-after]')
			editionAfter = new Edition $elem.val()
			$elem.data 'validated', editionAfter.isParsable


	# 計算してみる
	tryCalc = () ->
		c1 = $('input[name=metrics-input]').data 'validated'
		c2 = $('input[name=scale-before]').data 'validated'
		c3 = $('input[name=edition-before]').data 'validated'
		c4 = $('input[name=edition-after]').data 'validated'

		# scaleAfter
		if c2 and c3 and c4
			scaleAfter = scaleBefore * (editionAfter.getWidth() / editionBefore.getWidth())
			$('input[name=scale-after]').val Math.round(scaleAfter)
		else
			$('input[name=scale-after]').val ''

		# 測定値換算（before）
		if c1 and c2
			m1 = metricsInput.regenerate value: metricsInput.value * scaleBefore
			m1 = m1.optimize()
			$('input[name=metrics-before-output]').val m1.stringfy()
		else
			$('input[name=metrics-before-output]').val ''

		# 測定値換算（after）
		if c1 and c2 and c3 and c4
			m2 = metricsInput.regenerate value: metricsInput.value * scaleAfter
			m2 = m2.optimize()
			$('input[name=metrics-after-output]').val m2.stringfy()
		else
			$('input[name=metrics-after-output]').val ''



	# inputフォームの入力値validationアイコンを生成、設置
	# labelを持つforで、data-validated属性を持ち、かつ、example,outputクラスを持たないものにのみ有効化される
	$('input').each (i, elem) ->
		if $(elem).attr("name")? and $(elem).attr("data-validated")? and not $(elem).hasClass('example') and not $(elem).hasClass('output')
			name = $(elem).attr("name")
			if $("label[for=#{name}]")?
				$("label[for=#{name}]").append $("<i id='notation-#{name}' class='fa'></i>")
				$("#notation-#{name}")
					.css 'opacity', '0.4'
					.css 'margin-left', '5px'
				#keyupの動作（validateの実行と、validationアイコンの更新）をイテレーションで定義
				$(elem).keyup () ->
					if validate[name]? then validate[name]()# validationは個別に実装,name属性がキー
					if $(this).data("validated")
						$("#notation-#{name}")
							.removeClass 'fa-exclamation-triangle'
							.addClass 'fa-check-circle'
							.css 'color', 'green'
					else
						$("#notation-#{name}")
							.removeClass 'fa-check-circle'
							.addClass 'fa-exclamation-triangle'
							.css 'color', 'red'
					tryCalc()
				# 最初に実行しておく
				$(elem).keyup()


	# toggle機能の定義
	##toggleアイコンをprepend
	##初期状態でtoggleにするにはstyle=display:none
	$('.toggle-next').each (i, elem) ->
		$(elem).prepend '<i class="fa"></i>'
		$i = $(elem).children 'i'
		display = $(elem).next().css 'display'
		if display is 'none'
			$i.addClass 'fa-angle-double-right'
		else
			$i.addClass 'fa-angle-double-down'


	## clickableなスタイル定義
	$('.toggle-next').hover () ->
		$(this).css 'cursor', 'pointer'


	## toggleの動作の定義
	$('.toggle-next').click () ->
		display = $(this).next().css 'display'
		if display is 'none'
			$(this).children('i')
				.removeClass 'fa-angle-double-right'
				.addClass 'fa-angle-double-down'
			$(this).next().show 'fast'
		else
			$(this).children('i')
				.removeClass 'fa-angle-double-down'
				.addClass 'fa-angle-double-right'
			$(this).next().hide 'fast'
