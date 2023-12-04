var vertexShaderText = `
attribute vec2 a_position;
 
uniform vec2 u_resolution;
 
  void main() {
    // преобразуем положение в пикселях к диапазону от 0.0 до 1.0
    vec2 zeroToOne = a_position / u_resolution;
 
    // преобразуем из 0->1 в 0->2
    vec2 zeroToTwo = zeroToOne * 2.0;
 
    // преобразуем из 0->2 в -1->+1 (пространство отсечения)
    vec2 clipSpace = zeroToTwo - 1.0;
 
    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
  }
`;

var fragmentShaderText = `
 
// фрагментные шейдеры не имеют точности по умолчанию, поэтому нам необходимо её
// указать. mediump подойдёт для большинства случаев. Он означает "средняя точность"
precision mediump float;
uniform vec4 u_color;

void main() {
  // gl_FragColor - специальная переменная фрагментного шейдера.
  // Она отвечает за установку цвета.
  gl_FragColor = u_color; // вернёт красновато-фиолетовый
}
`;


function createShader(gl, type, source) {
   var shader = gl.createShader(type);   // создание шейдера
   gl.shaderSource(shader, source);      // устанавливаем шейдеру его программный код
   gl.compileShader(shader);             // компилируем шейдер
   var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
   if (success) {                        // если компиляция прошла успешно - возвращаем шейдер
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

// Fill the buffer with the values that define a rectangle.
function setSquare(gl, x, y, width, height) {
   var x1 = x;
   var x2 = x + width;
   var y1 = y;
   var y2 = y + height;
   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      x1, y1,
      x2, y1,
      x1, y2,
      x1, y2,
      x2, y1,
      x2, y2,
   ]), gl.STATIC_DRAW);
}

// Returns a random integer from 0 to range - 1.
function randomInt(range) {
   return Math.floor(Math.random() * range);
}

function draw(gl) {
   var primitiveType = gl.TRIANGLES;
   offset = 0
   var count = 6;

   gl.drawArrays(primitiveType, offset, count);
}

function drawScene(gl) {
   gl.clear(gl.COLOR_BUFFER_BIT);
   gl.useProgram(program);
}

function main() {
   var canvas = document.getElementById("game-surface");
   var gl = canvas.getContext("webgl");
   if (!gl) {
      alert("ERRRRRROOOOORRRRR");
   }
   gl.clearColor(0, 0, 0, 1.0);
   gl.clear(gl.COLOR_BUFFER_BIT);


   var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderText);
   var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderText);
   var program = createProgram(gl, vertexShader, fragmentShader);

   // говорим использовать нашу программу (пару шейдеров)
   gl.useProgram(program);

   var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
   var resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
   var colorUniformLocation = gl.getUniformLocation(program, "u_color");
   
   var positionBuffer = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
   gl.enableVertexAttribArray(positionAttributeLocation);

   gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);
   gl.uniform4f(colorUniformLocation, Math.random(), Math.random(), Math.random(), 1);

   // Указываем атрибуту, как получать данные от positionBuffer (ARRAY_BUFFER)
   var size = 2;          // 2 компоненты на итерацию
   var type = gl.FLOAT;   // наши данные - 32-битные числа с плавающей точкой
   var normalize = false; // не нормализовать данные
   var stride = 0;        // 0 = перемещаться на size * sizeof(type) каждую итерацию для получения следующего положения
   var offset = 0;        // начинать с начала буфера
   gl.vertexAttribPointer(
      positionAttributeLocation, size, type, normalize, stride, offset)

   count = 100
   size_square = canvas.width / 10
   for (i = 0; i < count; i++) {
      setSquare(gl, randomInt(canvas.width), randomInt(canvas.width), size_square, size_square)
      draw(gl)
   }
}

main()