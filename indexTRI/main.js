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
    var colorLocation = gl.getAttribLocation(program, "color");
    var uniLocation = gl.getUniformLocation(program, "mvpMatrix");

   
    var vertex_position = [
      0.0, 1.0, 0.0,
      1.0, 0.0, 0.0,
     -1.0, 0.0, 0.0,
      0.0,-1.0, 0.0
    ];

    var vertex_color = [
      1.0, 0.0, 0.0, 1.0,
      0.0, 1.0, 0.0, 1.0,
      0.0, 0.0, 1.0, 1.0,
      1.0, 1.0, 1.0, 1.0
    ]; 

    var index = [
      0, 1, 2,
      1, 2, 3
    ];
  
    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertex_position),gl.STATIC_DRAW);
    
    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertex_color),gl.STATIC_DRAW);

    // gl.bindAttribLocation(program, 0, "a_position");
    // gl.bindAttribLocation(program, 1, "color");
  
    gl.useProgram(program);
  
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.enableVertexAttribArray(colorLocation);

    //위치 버퍼 할당? -> 여러개의 버퍼를 사용할때는 바인트 버퍼를 사용해야 한다.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);
    //--------------------------------------
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);//다른 버퍼를 사용하기 때문에 반드시 다시 바인드버퍼를 써주어야 한다.
    gl.vertexAttribPointer(colorLocation, 4, gl.FLOAT, false, 0, 0);

    var ibo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(index), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);

    var m = new matIV();
    //행열 초기화
    var mMatrix = m.identity(m.create());
    var vMatrix = m.identity(m.create());
    var pMatrix = m.identity(m.create());
    var tmpMatrix = m.identity(m.create());
    var mvpMatrix = m.identity(m.create());
  
    m.lookAt([0.0, 0.0, 5.0], [0, 0, 0], [0, 1, 0], vMatrix);
    m.perspective(45, c.width / c.height, 0.1, 100, pMatrix);
    m.multiply(pMatrix, vMatrix, tmpMatrix);



    drawScene();

// ------------------------------------------------------------------------여기까지가 실제 메인
    var count = 0;

    // Turn on the attribute 어트리뷰트 활성화
    function drawScene()
    {
      // resizeCanvasToDisplaySize(gl.canvas);

      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.clearDepth(1.0);
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height); // 뷰포트 사이즈 정하기
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      count ++
     
      var rad = (count % 360) * Math.PI / 180;
      //모델변환 좌표생성
      m.identity(mMatrix);
      m.rotate(mMatrix, rad, [0, 1, 0], mMatrix);
      m.multiply(tmpMatrix, mMatrix, mvpMatrix);
      gl.uniformMatrix4fv(uniLocation, false, mvpMatrix);

      gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0);

      requestAnimationFrame(drawScene);
    
    }
  
}




function setGeometry(gl) {

 

 

 
}

main();



