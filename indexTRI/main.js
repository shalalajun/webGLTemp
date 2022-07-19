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

  function createVbo(gl,data){
    var vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    return vbo;
  }

  function setAttribute(gl, vbo, attLocation, attSize){
    for(var i in vbo)
    {
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo[i]);
      gl.enableVertexAttribArray(attLocation[i]);
      gl.vertexAttribPointer(attLocation[i], attSize[i], gl.FLOAT, false, 0, 0);

      //  //위치 버퍼 할당? -> 여러개의 버퍼를 사용할때는 바인트 버퍼를 사용해야 한다.
      //  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      //  // positionBuffer(ARRAY_BUFFER)의 데이터를 꺼내오는 방법을 속성에 지시
      //  var size = 3; // 반복마다 2개의 컴포넌트 a_position = {x: 0, y: 0, z: 0, w: 0}와 같이 생각할 수 있습니다. 위에서 size = 2로 설정했는데요. 속성의 기본값은 0, 0, 0, 1이기 때문에 이 속성은 버퍼에서 처음 2개의 값(x/y)을 가져옵니다. z와 w는 기본값으로 각각 0과 1이 될 겁니다.
      //  var type = gl.FLOAT; // 데이터는 부동소수점
      //  var normalize = false; // 데이터 정규화 안함
      //  var stride = 0; // 0 = 다음위치를 가져오기 위해 반복마다 size * size(type)만큼 앞으로 이동
      //  var offset = 0; // 버퍼의 처음부터 시작
      //  gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);
    }
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
    gl.useProgram(program);
    

    var attLocation = new Array(2);
    attLocation[0] = gl.getAttribLocation(program, 'a_position');
    attLocation[1] = gl.getAttribLocation(program, 'color');
    
    var attSize = new Array(2);
    attSize[0] = 3;
    attSize[1] = 4;
   
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
    
  
    var positionBuffer = createVbo(gl,vertex_position);
    var colorBuffer = createVbo(gl,vertex_color);

    setAttribute(gl,[positionBuffer, colorBuffer], attLocation, attSize);

    // 인덱스버퍼를 만드는곳 엘리먼트 어레이 버퍼를 사용한다.
    var ibo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(index), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    //------------------------------------------

    var uniLocation = gl.getUniformLocation(program, "mvpMatrix");

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



