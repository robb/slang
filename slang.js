(function() {
  var ceil, floor;

  ceil = Math.ceil, floor = Math.floor;

  window.Slang = (function() {

    Slang.defaultSettings = {
      tilesPerRow: 20
    };

    function Slang(targetSelector, settings) {
      var k, v, _base, _ref, _ref2;
      this.targetSelector = targetSelector;
      this.settings = settings != null ? settings : Slang.defaultSettings;
      this._canvas = document.createElement('canvas');
      this._context = this._canvas.getContext('2d');
      _ref = Slang.defaultSettings;
      for (k in _ref) {
        v = _ref[k];
        if ((_ref2 = (_base = this.settings)[k]) == null) _base[k] = v;
      }
    }

    Slang.prototype.process = function(imageData, callback) {
      var image;
      var _this = this;
      image = new Image;
      image.onerror = function(error) {
        return typeof callback === "function" ? callback(error) : void 0;
      };
      image.onload = function() {
        var bottom, bottomAverage, bottomLeft, bottomLeftDifferece, bottomRight, bottomRightDifferece, center, falling, left, leftAverage, resized, right, rightAverage, scaleFactor, scaleHeight, scaleWidth, style, tileSize, top, topAverage, topLeft, topLeftDifference, topRight, topRightDifference, x, xScale, y, yScale, _ref, _ref2;
        try {
          _this._canvas.width = image.width;
          _this._canvas.height = image.height;
          _this._context = _this._canvas.getContext('2d');
          scaleFactor = ~~(image.width / _this.settings.tilesPerRow) / 10;
          while (!(scaleFactor > 0.5)) {
            scaleFactor *= 2;
          }
          scaleWidth = ~~((image.width / scaleFactor) / _this.settings.tilesPerRow) * _this.settings.tilesPerRow;
          scaleHeight = ~~((image.height / scaleFactor) / _this.settings.tilesPerRow) * _this.settings.tilesPerRow;
          tileSize = scaleWidth / _this.settings.tilesPerRow;
          resized = _this._resize(image, scaleWidth, scaleHeight);
          for (x = 0, _ref = resized.width; 0 <= _ref ? x <= _ref : x >= _ref; x += tileSize) {
            for (y = 0, _ref2 = resized.height; 0 <= _ref2 ? y <= _ref2 : y >= _ref2; y += tileSize) {
              topLeft = {
                x: x,
                y: y
              };
              topRight = {
                x: x + tileSize,
                y: y
              };
              center = {
                x: x + tileSize / 2,
                y: y + tileSize / 2
              };
              bottomRight = {
                x: x + tileSize,
                y: y + tileSize
              };
              bottomLeft = {
                x: x,
                y: y + tileSize
              };
              top = [topLeft, topRight, center];
              right = [topRight, bottomRight, center];
              bottom = [bottomRight, bottomLeft, center];
              left = [bottomLeft, topLeft, center];
              topAverage = _this._average(_this._cutout(resized, top));
              rightAverage = _this._average(_this._cutout(resized, right));
              bottomAverage = _this._average(_this._cutout(resized, bottom));
              leftAverage = _this._average(_this._cutout(resized, left));
              topLeftDifference = _this._difference(topAverage, leftAverage);
              topRightDifference = _this._difference(topAverage, rightAverage);
              bottomLeftDifferece = _this._difference(bottomAverage, leftAverage);
              bottomRightDifferece = _this._difference(bottomAverage, rightAverage);
              falling = topLeftDifference < topRightDifference && topLeftDifference < bottomLeftDifferece && topLeftDifference < bottomRightDifferece || bottomRightDifferece < topLeftDifference && bottomRightDifferece < topRightDifference && bottomRightDifferece < bottomLeftDifferece;
              xScale = _this._canvas.width / scaleWidth;
              yScale = _this._canvas.height / scaleHeight;
              _this._context.beginPath();
              _this._context.moveTo(~~(topLeft.x * xScale), ~~(topLeft.y * yScale));
              _this._context.lineTo(~~(topRight.x * xScale), ~~(topRight.y * yScale));
              _this._context.lineTo(~~(bottomRight.x * xScale), ~~(bottomRight.y * yScale));
              _this._context.lineTo(~~(bottomLeft.x * xScale), ~~(bottomLeft.y * yScale));
              _this._context.closePath();
              if (!falling) {
                style = "rgba(" + leftAverage.r + ", " + leftAverage.g + ", " + leftAverage.b + ", 1)";
              } else {
                style = "rgba(" + rightAverage.r + ", " + rightAverage.g + ", " + rightAverage.b + ", 1)";
              }
              _this._context.fillStyle = style;
              _this._context.fill();
              _this._context.beginPath();
              _this._context.moveTo(~~(topLeft.x * xScale), ~~(topLeft.y * yScale));
              _this._context.lineTo(~~(topRight.x * xScale), ~~(topRight.y * yScale));
              if (!falling) {
                _this._context.lineTo(~~(bottomRight.x * xScale), ~~(bottomRight.y * yScale));
              } else {
                _this._context.lineTo(~~(bottomLeft.x * xScale), ~~(bottomLeft.y * yScale));
              }
              _this._context.closePath();
              if (falling) {
                style = "rgba(" + leftAverage.r + ", " + leftAverage.g + ", " + leftAverage.b + ", 1)";
              } else {
                style = "rgba(" + rightAverage.r + ", " + rightAverage.g + ", " + rightAverage.b + ", 1)";
              }
              _this._context.fillStyle = style;
              _this._context.strokeStyle = style;
              _this._context.fill();
            }
          }
          return typeof callback === "function" ? callback(null, _this._canvas.toDataURL()) : void 0;
        } catch (error) {
          return typeof callback === "function" ? callback(error) : void 0;
        }
      };
      return image.src = imageData;
    };

    Slang.prototype._difference = function(colorA, colorB) {
      return (Math.abs(colorA.r - colorB.r)) / 3 + (Math.abs(colorA.g - colorB.g)) / 3 + (Math.abs(colorA.b - colorB.b)) / 3;
    };

    Slang.prototype._resize = function(source, width, height) {
      var canvas, context;
      canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      context = canvas.getContext('2d');
      context.drawImage(source, 0, 0, source.width, source.height, 0, 0, canvas.width, canvas.height);
      return canvas;
    };

    Slang.prototype._cutout = function(source, path) {
      var canvas, context, x, y, _i, _len, _ref, _ref2;
      canvas = document.createElement('canvas');
      canvas.width = source.width;
      canvas.height = source.height;
      context = canvas.getContext('2d');
      context.beginPath();
      context.moveTo(path[0].x, path[0].y);
      _ref = path.slice(1, (path.length - 1) + 1 || 9e9);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        _ref2 = _ref[_i], x = _ref2.x, y = _ref2.y;
        context.lineTo(x, y);
      }
      context.closePath();
      context.fill();
      context.globalCompositeOperation = 'source-in';
      context.drawImage(source, 0, 0, source.width, source.height, 0, 0, canvas.width, canvas.height);
      return canvas;
    };

    Slang.prototype._average = function(source) {
      var B, G, R, a, b, context, g, imageData, pixels, pos, r, _ref;
      context = source.getContext('2d');
      imageData = context.getImageData(0, 0, source.width, source.height);
      R = G = B = pixels = 1;
      for (pos = 0, _ref = imageData.data.length; pos < _ref; pos += 4) {
        r = imageData.data[pos];
        g = imageData.data[pos + 1];
        b = imageData.data[pos + 2];
        a = imageData.data[pos + 3];
        if (a !== 0xFF) continue;
        R += r / 0xFF;
        G += g / 0xFF;
        B += b / 0xFF;
        pixels++;
      }
      R = ~~((R / pixels) * 0xFF);
      G = ~~((G / pixels) * 0xFF);
      B = ~~((B / pixels) * 0xFF);
      return {
        r: R,
        g: G,
        b: B
      };
    };

    return Slang;

  })();

}).call(this);
