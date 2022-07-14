"use strict";




function resizeCanvasToDisplaySize(canvas) {
    // 브라우저가 캔버스를 표시하고 있는 크기를 CSS 픽셀 단위로 얻어옵니다.
    const displayWidth  = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
   
    // 캔버스와 크기가 다른지 확인합니다.
    const needResize = canvas.width  !== displayWidth ||
                       canvas.height !== displayHeight;
   
    if (needResize) {
      // 캔버스를 동일한 크기가 되도록 합니다.
      canvas.width  = displayWidth;
      canvas.height = displayHeight;
    }
   
    return needResize;
  }


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


function setGeometry(gl)
{
  gl.bufferData
  (
    gl.ARRAY_BUFFER,
    new Float32Array(
      [
        0, -100,
        150, 125,
        -175, 100
      ]
    ),
    gl.STATIC_DRAW
  );
}



// main() ---------------------------------------------------------------------------

function main(){
    var canvas = document.getElementById("c");
    var gl = canvas.getContext("webgl");
    console.log(gl);
    if (!gl) {
      return;
    }

   
    // Get the strings for our GLSL shaders
    var vertexShaderSource = document.querySelector("#vertex-shader-2d").text;
    var fragmentShaderSource = document.querySelector("#fragment-shader-2d").text;

    // create GLSL shaders, upload the GLSL source, compile the shaders
    var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    // Link the two shaders into a program
    var program = createProgram(gl, vertexShader, fragmentShader);

    // look up where the vertex data needs to go.
    var positionAttributeLocation = gl.getAttribLocation(program, "a_position");


    var matrixLocation = gl.getUniformLocation(program, "u_matrix");

  

    // Create a buffer and put three 2d clip space points in it
    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    setGeometry(gl); // 삼각형 그리기

    var translation = [200, 150];
    var angleInRadians = 0;
    var scale = [1, 1];
    
    drawScene();


    function drawScene()
    {
      resizeCanvasToDisplaySize(gl.canvas);

      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      gl.clearColor(0.0,0.0,0.0,0.0);
      gl.clear(gl.COLOR_BUFFER_BIT);
  
      gl.useProgram(program);

        // Turn on the attribute
      gl.enableVertexAttribArray(positionAttributeLocation);

      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

      // positionBuffer(ARRAY_BUFFER)의 데이터를 꺼내오는 방법을 속성에 지시
      var size = 2; // 반복마다 2개의 컴포넌트 a_position = {x: 0, y: 0, z: 0, w: 0}와 같이 생각할 수 있습니다. 위에서 size = 2로 설정했는데요. 속성의 기본값은 0, 0, 0, 1이기 때문에 이 속성은 버퍼에서 처음 2개의 값(x/y)을 가져옵니다. z와 w는 기본값으로 각각 0과 1이 될 겁니다.
      var type = gl.FLOAT; // 데이터는 부동소수점
      var normalize = false; // 데이터 정규화 안함
      var stride = 0; // 0 = 다음위치를 가져오기 위해 반복마다 size * size(type)만큼 앞으로 이동
      var offset = 0; // 버퍼의 처음부터 시작

      gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

        // Compute the matrix
      var matrix = m3.projection(gl.canvas.clientWidth, gl.canvas.clientHeight);
      matrix = m3.translate(matrix, translation[0], translation[1]);
      matrix = m3.rotate(matrix, angleInRadians);
      matrix = m3.scale(matrix, scale[0], scale[1]);

      // Set the matrix.
      gl.uniformMatrix3fv(matrixLocation, false, matrix);

      var primitiveType = gl.TRIANGLES;
      var offset = 0;
      var count = 3;
      gl.drawArrays(primitiveType, offset, count);
      
    }

}


main();


