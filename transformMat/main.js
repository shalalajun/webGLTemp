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


  
/**
 * main함수
 * 
 */

function main()
{
    var canvas = document.querySelector("#c");
    var gl = canvas.getContext("webgl");
    if (!gl) {
      return;
    }
    // 쉐이더 소스를 불러옴 뒤에 텍스트를 붙이네?.... 중요

    var vertexShaderSource = document.querySelector("#vertex-shader-2d").text;
    var fragmentShaderSource = document.querySelector("#fragment-shader-2d").text;

    // 쉐이더를 만듬
    var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);


    // 쉐이더를 만든 후 프로그램을 만들고 링크하기
    var program = createProgram(gl, vertexShader, fragmentShader);

    
    // 어트리뷰트, 유니폼 데이터 설정
    var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    //gl.bindAttribLocation(program, 0, "a_position"); -> 필요없을까?
    var u_location = gl.getUniformLocation(program, "u_location");
    var u_transLocation = gl.getUniformLocation(program, "u_transLocation");


    // 어트리뷰트등 속성을 넣기 위한 버퍼를 생성, 버퍼셋업
    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer); 
    gl.clearColor(1.0,1.0,0.0,1.0);
    
    setGeometry(gl);

    var translation = [240,500]; // 위치변환하는 곳
    
    drawScene();

// -----------------------------------------------------------------------------------------------여기까지가 실제 메인


    // Turn on the attribute 어트리뷰트 활성화
    function drawScene()
    {
      resizeCanvasToDisplaySize(gl.canvas);
     
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height); // 뷰포트 사이즈 정하기
     
      gl.clear(gl.COLOR_BUFFER_BIT);
    
      gl.useProgram(program);
    
      gl.enableVertexAttribArray(positionAttributeLocation);
      
      //위치 버퍼 할당?
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    
      // positionBuffer(ARRAY_BUFFER)의 데이터를 꺼내오는 방법을 속성에 지시
      var size = 2; // 반복마다 2개의 컴포넌트 a_position = {x: 0, y: 0, z: 0, w: 0}와 같이 생각할 수 있습니다. 위에서 size = 2로 설정했는데요. 속성의 기본값은 0, 0, 0, 1이기 때문에 이 속성은 버퍼에서 처음 2개의 값(x/y)을 가져옵니다. z와 w는 기본값으로 각각 0과 1이 될 겁니다.
      var type = gl.FLOAT; // 데이터는 부동소수점
      var normalize = false; // 데이터 정규화 안함
      var stride = 0; // 0 = 다음위치를 가져오기 위해 반복마다 size * size(type)만큼 앞으로 이동
      var offset = 0; // 버퍼의 처음부터 시작
      gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);
      //------


      gl.uniform2f(u_location, gl.canvas.width, gl.canvas.height); // set the resolution
      gl.uniform2fv(u_transLocation, translation); // Set the translation.
    
      // 그리는 부분
      var primitiveType = gl.TRIANGLES;
      var offset = 0;
      var count = 18;
      gl.drawArrays(primitiveType, offset, count);
    
    
    }
    
    
    function setGeometry(gl) {
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([
          // 왼쪽 열
          0, 0,
          30, 0,
          0, 150,
          0, 150,
          30, 0,
          30, 150,
     
          // 상단 가로 획
          30, 0,
          100, 0,
          30, 30,
          30, 30,
          100, 0,
          100, 30,
     
          // 중간 가로 획
          30, 60,
          67, 60,
          30, 90,
          30, 90,
          67, 60,
          67, 90,
        ]),
        gl.STATIC_DRAW
      );
    }
}

main();



