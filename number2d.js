var vertexShaderText = `
attribute vec2 a_position;
uniform vec2 u_resolution;
uniform vec2 u_translation;
uniform vec2 u_rotation;
uniform vec2 u_scale;
uniform mat3 u_matrix;


void main() {

  // Multiply the position by the matrix.
  vec2 position = (u_matrix * vec3(a_position, 1)).xy;

  // convert the position from pixels to 0.0 to 1.0
  vec2 zeroToOne = position / u_resolution;
  vec2 zeroToTwo = zeroToOne * 2.0;
  vec2 clipSpace = zeroToTwo - 1.0;
  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
}
`;

var fragmentShaderText = `
precision mediump float;
uniform vec3 u_color;

void main() {
  gl_FragColor = vec4(u_color / 255.0, 1.0);;
}
`;


var m3 = {
  translation: function (tx, ty) {
    return [
      1, 0, 0,
      0, 1, 0,
      tx, ty, 1,
    ];
  },

  rotation: function (angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);
    return [
      c, -s, 0,
      s, c, 0,
      0, 0, 1,
    ];
  },

  scaling: function (sx, sy) {
    return [
      sx, 0, 0,
      0, sy, 0,
      0, 0, 1,
    ];
  },

  multiply: function (a, b) {
    var a00 = a[0 * 3 + 0];
    var a01 = a[0 * 3 + 1];
    var a02 = a[0 * 3 + 2];
    var a10 = a[1 * 3 + 0];
    var a11 = a[1 * 3 + 1];
    var a12 = a[1 * 3 + 2];
    var a20 = a[2 * 3 + 0];
    var a21 = a[2 * 3 + 1];
    var a22 = a[2 * 3 + 2];
    var b00 = b[0 * 3 + 0];
    var b01 = b[0 * 3 + 1];
    var b02 = b[0 * 3 + 2];
    var b10 = b[1 * 3 + 0];
    var b11 = b[1 * 3 + 1];
    var b12 = b[1 * 3 + 2];
    var b20 = b[2 * 3 + 0];
    var b21 = b[2 * 3 + 1];
    var b22 = b[2 * 3 + 2];
    return [
      b00 * a00 + b01 * a10 + b02 * a20,
      b00 * a01 + b01 * a11 + b02 * a21,
      b00 * a02 + b01 * a12 + b02 * a22,
      b10 * a00 + b11 * a10 + b12 * a20,
      b10 * a01 + b11 * a11 + b12 * a21,
      b10 * a02 + b11 * a12 + b12 * a22,
      b20 * a00 + b21 * a10 + b22 * a20,
      b20 * a01 + b21 * a11 + b22 * a21,
      b20 * a02 + b21 * a12 + b22 * a22,
    ];
  },
  identity: function () {
    return [
      1, 0, 0,
      0, 1, 0,
      0, 0, 1,
    ];
  },
};

function createShader(gl, type, source) {
  var shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }
  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  var success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }
  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}

function updatePosition(index, translation, drawSceneFunc) {
  return function (event, ui) {
    translation[index] = ui.value;
    drawSceneFunc();
  };
}

// Returns a random integer from 0 to range - 1.
function randomInt(range) {
  return Math.floor(Math.random() * range);
}

function tmp(gl, positionLocation) {
  var size = 2;
  var type = gl.FLOAT;
  var normalize = false;
  var stride = 0;
  var offset = 0;
  gl.vertexAttribPointer(positionLocation, size, type, normalize, stride, offset);
}

function drawScene(gl, program, positionLocation, resolutionLocation, colorLocation, matrixLocation, size_canvas, size_letter, position, color, angleRotation, scale) {
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(program);
  gl.enableVertexAttribArray(positionLocation);
  tmp(gl, positionLocation) // УЗНАТЬ ДЛЯ ЧЕГО vertexAttribPointer


  // set resolution
  gl.uniform2f(resolutionLocation, size_canvas, size_canvas);

  // set color
  gl.uniform3fv(colorLocation, color);

  // Compute the matrices
  var moveOriginMatrix = m3.translation(-size_letter[0] / 2, -size_letter[1] / 2);
  var translationMatrix = m3.translation(position[0], position[1]);
  var rotationMatrix = m3.rotation(angleRotation);
  var scaleMatrix = m3.scaling(scale[0], scale[1]);

  // Multiply the matrices.
  var matrix = m3.identity();
  matrix = m3.multiply(matrix, translationMatrix);
  matrix = m3.multiply(matrix, rotationMatrix);
  matrix = m3.multiply(matrix, scaleMatrix);
  matrix = m3.multiply(matrix, moveOriginMatrix);

  // Set the matrix.
  gl.uniformMatrix3fv(matrixLocation, false, matrix);



  var primitiveType = gl.TRIANGLES;
  var offset = 0;
  var count = 18;
  gl.drawArrays(primitiveType, offset, count);
}

function setGeometry(gl, width, height) {
  var thickness = height / 7;
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([

      // верхняя перекладина
      0, 0,
      width, 0,
      width, thickness,
      width, thickness,
      0, thickness,
      0, 0,

      // вертикальный столб
      width, 0,
      width, height,
      width - thickness, height,
      width - thickness, height,
      width - thickness, 0,
      width, 0,

      // верхняя маленькая палка
      thickness, 0,
      thickness, height / 3.5,
      0, height / 3.5,
      0, height / 3.5,
      0, 0,
      thickness, 0,
    ]),
    gl.STATIC_DRAW);
}

function to_rgb(colors) {
  return colors.map(function (value) {
    return value / 255;
  });
}

function printSineAndCosineForAnAngle(angleInDegrees) {
  var angleInRadians = angleInDegrees * Math.PI / 180;
  var s = Math.sin(angleInRadians);
  var c = Math.cos(angleInRadians);
  console.log("sin = " + s + " cos = " + c);
}

function getRotation(degree) {
  var angleInRadians = degree * Math.PI / 180;
  return [Math.sin(angleInRadians), Math.cos(angleInRadians)]
}

function main() {
  var canvas = document.getElementById("game-surface");
  var gl = canvas.getContext("webgl");
  if (!gl) {
    return;
  }

  size_canvas = 500;
  var height = 300;
  var width = height * 0.55;
  var position = [size_canvas / 2, size_canvas / 2];
  // var position = [0, 0];
  var color_number = [128, 0, 0]
  var color_background = [230, 230, 230]
  var angleInRadians = 0;
  var scale = [1, 1];

  gl.clearColor(...to_rgb(color_background), 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderText);
  var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderText);
  var program = createProgram(gl, vertexShader, fragmentShader);


  gl.useProgram(program);

  var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  var resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
  var colorUniformLocation = gl.getUniformLocation(program, "u_color");
  var matrixLocation = gl.getUniformLocation(program, "u_matrix");


  var positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  args = [gl,
    program,
    positionAttributeLocation,
    resolutionUniformLocation,
    colorUniformLocation,
    matrixLocation,
    size_canvas,
    [width, height],
    position,
    color_number,
    angleInRadians,
    scale]



  setGeometry(gl, width, height);
  drawScene(...args);

  // Setup a ui.
  webglLessonsUI.setupSlider("#x", { slide: updatePositionX(), min: width / 2, max: size_canvas - width / 2, value: position[0] });
  webglLessonsUI.setupSlider("#y", { slide: updatePositionY(), min: height / 2, max: size_canvas - height / 2, value: position[1] });
  webglLessonsUI.setupSlider("#angle", { slide: updateAngle, max: 360 });
  webglLessonsUI.setupSlider("#scaleX", { value: scale[0], slide: updateScale(0), min: -5, max: 5, step: 0.01, precision: 2 });
  webglLessonsUI.setupSlider("#scaleY", { value: scale[1], slide: updateScale(1), min: -5, max: 5, step: 0.01, precision: 2 });

  // function updatePosition(index) {
  //   return function (event, ui) {
  //     // position[index] = ui.value;
  //     position[index] = ui.value
  //     drawScene(...args);
  //     ;
  //   };
  // }

  function updatePositionX() {
    return function (event, ui) {
      position[0] = ui.value
      drawScene(...args);
      ;
    };
  }

  function updatePositionY() {
    return function (event, ui) {
      position[1] = ui.value
      drawScene(...args);
      ;
    };
  }

  function updateAngle(event, ui) {
    var angleInDegrees = 360 - ui.value;
    angleInRadians = angleInDegrees * Math.PI / 180;
    args[10] = angleInRadians
    drawScene(...args);
    ;
  }

  function updateScale(index) {
    return function (event, ui) {
      scale[index] = ui.value;
      drawScene(...args);
    };
  }
};


main();
