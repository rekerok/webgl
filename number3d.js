var vertexShaderText = `
attribute vec4 a_position;
uniform mat4 u_matrix;

void main() {
  // Умножаем координату на матрицу
  gl_Position = u_matrix * a_position;
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

var m4 = {

  projection: function (width, height, depth) {
    // Note: This matrix flips the Y axis so 0 is at the top.
    return [
      2 / width, 0, 0, 0,
      0, -2 / height, 0, 0,
      0, 0, 2 / depth, 0,
      -1, 1, 0, 1,
    ];
  },

  multiply: function (a, b) {
    var a00 = a[0 * 4 + 0];
    var a01 = a[0 * 4 + 1];
    var a02 = a[0 * 4 + 2];
    var a03 = a[0 * 4 + 3];
    var a10 = a[1 * 4 + 0];
    var a11 = a[1 * 4 + 1];
    var a12 = a[1 * 4 + 2];
    var a13 = a[1 * 4 + 3];
    var a20 = a[2 * 4 + 0];
    var a21 = a[2 * 4 + 1];
    var a22 = a[2 * 4 + 2];
    var a23 = a[2 * 4 + 3];
    var a30 = a[3 * 4 + 0];
    var a31 = a[3 * 4 + 1];
    var a32 = a[3 * 4 + 2];
    var a33 = a[3 * 4 + 3];
    var b00 = b[0 * 4 + 0];
    var b01 = b[0 * 4 + 1];
    var b02 = b[0 * 4 + 2];
    var b03 = b[0 * 4 + 3];
    var b10 = b[1 * 4 + 0];
    var b11 = b[1 * 4 + 1];
    var b12 = b[1 * 4 + 2];
    var b13 = b[1 * 4 + 3];
    var b20 = b[2 * 4 + 0];
    var b21 = b[2 * 4 + 1];
    var b22 = b[2 * 4 + 2];
    var b23 = b[2 * 4 + 3];
    var b30 = b[3 * 4 + 0];
    var b31 = b[3 * 4 + 1];
    var b32 = b[3 * 4 + 2];
    var b33 = b[3 * 4 + 3];
    return [
      b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
      b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
      b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
      b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
      b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
      b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
      b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
      b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
      b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
      b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
      b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
      b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
      b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
      b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
      b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
      b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33,
    ];
  },

  translation: function (tx, ty, tz) {
    return [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      tx, ty, tz, 1,
    ];
  },

  xRotation: function (angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);

    return [
      1, 0, 0, 0,
      0, c, s, 0,
      0, -s, c, 0,
      0, 0, 0, 1,
    ];
  },

  yRotation: function (angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);

    return [
      c, 0, -s, 0,
      0, 1, 0, 0,
      s, 0, c, 0,
      0, 0, 0, 1,
    ];
  },

  zRotation: function (angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);

    return [
      c, s, 0, 0,
      -s, c, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ];
  },

  scaling: function (sx, sy, sz) {
    return [
      sx, 0, 0, 0,
      0, sy, 0, 0,
      0, 0, sz, 0,
      0, 0, 0, 1,
    ];
  },

  translate: function (m, tx, ty, tz) {
    return m4.multiply(m, m4.translation(tx, ty, tz));
  },

  xRotate: function (m, angleInRadians) {
    return m4.multiply(m, m4.xRotation(angleInRadians));
  },

  yRotate: function (m, angleInRadians) {
    return m4.multiply(m, m4.yRotation(angleInRadians));
  },

  zRotate: function (m, angleInRadians) {
    return m4.multiply(m, m4.zRotation(angleInRadians));
  },

  scale: function (m, sx, sy, sz) {
    return m4.multiply(m, m4.scaling(sx, sy, sz));
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


// Returns a random integer from 0 to range - 1.
function randomInt(range) {
  return Math.floor(Math.random() * range);
}

function tmp(gl, positionLocation) {
  var size = 3;
  var type = gl.FLOAT;
  var normalize = false;
  var stride = 0;
  var offset = 0;
  gl.vertexAttribPointer(positionLocation, size, type, normalize, stride, offset);
}

function drawScene(gl, program, positionBuffer, positionAttributeLocation, colorUniformLocation, matrixLocation, size_canvas, position, color_number, size_letter, rotation, scale, coordinates) {
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(program);
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  tmp(gl, positionAttributeLocation)

  // set the color
  gl.uniform3fv(colorUniformLocation, [randomInt(255), randomInt(255), randomInt(255)]);

  // Compute the matrices
  var matrix = m4.projection(size_canvas, size_canvas, 400);
  matrix = m4.translate(matrix, position[0], position[1], position[2])
  matrix = m4.translate(matrix, -size_letter[0] / 2, -size_letter[1] / 2, 0)
  matrix = m4.xRotate(matrix, rotation[0]);
  matrix = m4.yRotate(matrix, rotation[1]);
  matrix = m4.zRotate(matrix, rotation[2]);
  matrix = m4.scale(matrix, scale[0], scale[1], scale[2]);

  // Set the matrix.
  gl.uniformMatrix4fv(matrixLocation, false, matrix);
  var primitiveType = gl.TRIANGLES;
  var offset = 0;
  var count = coordinates.length / 3;
  gl.drawArrays(primitiveType, offset, count);
}

function setGeometry(gl, coordinates) {
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(coordinates),
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

function radToDeg(r) {
  return r * 180 / Math.PI;
}

function degToRad(d) {
  return d * Math.PI / 180;
}


function getArrayCoorinates(width, height, thickness) {
  // return [

  //   // верхняя перекладина
  //   0, 0, 0,
  //   width, 0, 0,
  //   width, thickness, 0,
  //   width, thickness, 0,
  //   0, thickness, 0,
  //   0, 0, 0,

  //   // верхняя маленькая палка
  //   thickness, 0, 0,
  //   thickness, height / 3.5, 0,
  //   0, height / 3.5, 0,
  //   0, height / 3.5, 0,
  //   0, 0, 0,
  //   thickness, 0, 0,

  //   // вертикальный столб
  //   width, 0, 0,
  //   width, height, 0,
  //   width - thickness, height, 0,
  //   width - thickness, height, 0,
  //   width - thickness, 0, 0,
  //   width, 0, 0,
  // ]
  return [
    // перед верхней перекладины
    0, 0, 0,
    width, 0, 0,
    width, thickness, 0,
    width, thickness, 0,
    0, thickness, 0,
    0, 0, 0,

    // верх верхней перекладины
    0, 0, 0,
    0, 0, thickness,
    width, 0, thickness,
    width, 0, thickness,
    width, 0, 0,
    0, 0, 0,

    // обратная часть верхней перекладины
    0, 0, thickness,
    width, 0, thickness,
    width, thickness, thickness,
    width, thickness, thickness,
    0, thickness, thickness,
    0, 0, thickness,

    // низ передней перекладины 
    0, thickness, 0,
    0, thickness, thickness,
    width, thickness, thickness,
    width, thickness, thickness,
    width, thickness, 0,
    0, thickness, 0,

    // левая часть верхней перекладины
    0, 0, 0,
    0, thickness, 0,
    0, thickness, thickness,
    0, thickness, thickness,
    0, 0, thickness,
    0, 0, 0,

    // правая часть верхней перекладины
    width, 0, 0,
    width, thickness, 0,
    width, thickness, thickness,
    width, thickness, thickness,
    0, 0, thickness,
    0, 0, 0,

  ]
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
  var thickness = height / 7;
  var coordinates = getArrayCoorinates(width, height, thickness)
  var color_number = [128.0, 0.0, 0.0]
  var color_background = [230.0, 230.0, 230.0]
  var position = [size_canvas / 2, size_canvas / 2, 0];
  var rotation = [degToRad(0), degToRad(0), degToRad(0)]
  var scale = [1, 1, 1];

  gl.clearColor(...to_rgb(color_background), 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderText);
  var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderText);
  var program = createProgram(gl, vertexShader, fragmentShader);


  gl.useProgram(program);

  var positionAttributeLocation = gl.getAttribLocation(program, "a_position");

  var colorUniformLocation = gl.getUniformLocation(program, "u_color");
  var matrixLocation = gl.getUniformLocation(program, "u_matrix");

  var positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  args = [gl, program, positionBuffer, positionAttributeLocation, colorUniformLocation, matrixLocation, size_canvas, position, color_number, [width, height], rotation, scale, coordinates]
  setGeometry(gl, coordinates);
  drawScene(...args);

  // Setup a ui.
  webglLessonsUI.setupSlider("#x", { value: position[0], slide: updatePosition(0), max: gl.canvas.width });
  webglLessonsUI.setupSlider("#y", { value: position[1], slide: updatePosition(1), max: gl.canvas.height });
  webglLessonsUI.setupSlider("#z", { value: position[2], slide: updatePosition(2), max: gl.canvas.height });
  webglLessonsUI.setupSlider("#angleX", { value: radToDeg(rotation[0]), slide: updateRotation(0), max: 360 });
  webglLessonsUI.setupSlider("#angleY", { value: radToDeg(rotation[1]), slide: updateRotation(1), max: 360 });
  webglLessonsUI.setupSlider("#angleZ", { value: radToDeg(rotation[2]), slide: updateRotation(2), max: 360 });
  webglLessonsUI.setupSlider("#scaleX", { value: scale[0], slide: updateScale(0), min: -5, max: 5, step: 0.01, precision: 2 });
  webglLessonsUI.setupSlider("#scaleY", { value: scale[1], slide: updateScale(1), min: -5, max: 5, step: 0.01, precision: 2 });
  webglLessonsUI.setupSlider("#scaleZ", { value: scale[2], slide: updateScale(2), min: -5, max: 5, step: 0.01, precision: 2 });

  function updatePosition(index) {
    return function (event, ui) {
      position[index] = ui.value;
      drawScene(...args);
    };
  }

  function updateRotation(index) {
    return function (event, ui) {
      var angleInDegrees = ui.value;
      var angleInRadians = angleInDegrees * Math.PI / 180;
      rotation[index] = angleInRadians;
      drawScene(...args);
    };
  }

  function updateScale(index) {
    return function (event, ui) {
      scale[index] = ui.value;
      drawScene(...args);
    };
  }
};


main();
