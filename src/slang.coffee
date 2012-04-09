class window.Slang
  constructor: (selector) ->
    @_canvas  = document.querySelector selector
    @_context = @_canvas.getContext '2d'

  process: (imageData) ->
    image        = new Image
    image.onload = =>
      @_canvas.width  = image.width
      @_canvas.height = image.height
      @_context = @_canvas.getContext '2d'

      resized = @_resize image, 140, 84

      for x in [0..resized.width] by 7
        for y in [0..resized.height] by 7
          # Points
          topLeft     = x: x,       y: y
          topRight    = x: x + 7,   y: y
          center      = x: x + 3.5, y: y + 3.5
          bottomRight = x: x + 7,   y: y + 7
          bottomLeft  = x: x,       y: y + 7

          # Triangles
          top    = [topLeft, topRight, center]
          right  = [topRight, bottomRight, center]
          bottom = [bottomRight, bottomLeft, center]
          left   = [bottomLeft, topLeft, center]

          # Averages
          topAverage    = @_average @_cutout resized, top
          rightAverage  = @_average @_cutout resized, right
          bottomAverage = @_average @_cutout resized, bottom
          leftAverage   = @_average @_cutout resized, left

          # Draw

          xScale = image.width  / 140
          yScale = image.height / 84

          # first
          @_context.beginPath()
          @_context.moveTo (x    ) * xScale, (    y) * yScale
          @_context.lineTo (x + 7) * xScale, (    y) * yScale
          @_context.lineTo (x + 7) * xScale, (y + 7) * yScale
          @_context.lineTo (x    ) * xScale, (y + 7) * yScale
          @_context.closePath()

          style = "rgba(#{leftAverage.r}, #{leftAverage.g}, #{leftAverage.b}, 1)"

          @_context.fillStyle   = style
          @_context.strokeStyle = style
          @_context.fill()
          @_context.stroke()

          # second
          @_context.beginPath()
          @_context.moveTo (x    ) * xScale, (    y) * yScale
          @_context.lineTo (x + 7) * xScale, (    y) * yScale
          @_context.lineTo (x + 7) * xScale, (y + 7) * yScale
          @_context.closePath()

          style = "rgba(#{rightAverage.r}, #{rightAverage.g}, #{rightAverage.b}, 1)"

          @_context.fillStyle   = style
          @_context.strokeStyle = style
          @_context.fill()
          @_context.stroke()

    image.src = imageData

  _resize: (source, width, height) ->
    canvas = document.createElement 'canvas'
    canvas.width  = width
    canvas.height = height
    context = canvas.getContext '2d'

    context.drawImage source,
                      0, 0, source.width, source.height,
                      0, 0, canvas.width, canvas.height

    canvas

  _cutout: (source, path) ->
    canvas = document.createElement 'canvas'
    canvas.width  = source.width
    canvas.height = source.height
    context = canvas.getContext '2d'

    context.beginPath()
    context.moveTo path[0].x, path[0].y

    context.lineTo x, y for {x, y} in path[1..path.length - 1]

    context.closePath()
    context.fill()

    context.globalCompositeOperation = 'source-in'

    context.drawImage source,
                      0, 0, source.width, source.height,
                      0, 0, canvas.width, canvas.height

    canvas

  # Internal: Calculates RGB values of all pixels in a given canvas whose
  #           alpha value is not zero.
  #
  # TODO: Investigate if HSV yields a more accurate result.
  #
  # Returns an color containing the RGB averages.
  _average: (source) ->
    context   = source.getContext '2d'
    imageData = context.getImageData 0, 0, source.width, source.height

    R = G = B = pixels = 1
    for pos in [0...imageData.data.length] by 4
      r = imageData.data[pos]
      g = imageData.data[pos+1]
      b = imageData.data[pos+2]
      a = imageData.data[pos+3]

      continue if a isnt 0xFF

      R += r / 0xFF
      G += g / 0xFF
      B += b / 0xFF

      pixels++

    R = ~~((R / pixels) * 0xFF)
    G = ~~((G / pixels) * 0xFF)
    B = ~~((B / pixels) * 0xFF)

    {r: R, g: G, b: B}
