// sample_095
//
// WebGL에서 VBO를 순차적으로 갱신 파티클

onload = function(){
	var c; // canvas 엘리먼트
	var mouseFlag = false;    // マウス操作のフラグ
	var mousePositionX = 0.0; //마우스 좌표 X (-1.0에서 1.0)
	var mousePositionY = 0.0; //마우스 좌표 Y (-1.0에서 1.0)
	
	// canvas 엘리먼트 취득
	c = document.getElementById('canvas');
	c.width = Math.min(window.innerWidth, window.innerHeight);
	c.height = c.width;
	
	// 이벤트 등록
	c.addEventListener('mousedown', mouseDown, true);
	c.addEventListener('mouseup', mouseUp, true);
	c.addEventListener('mousemove', mouseMove, true);
	
	// webgl 컨텍스트 취득
	var gl = c.getContext('webgl') || c.getContext('experimental-webgl');
	
	// 정점 셰이더와 플래그먼트 셰이더의 생성
	var v_shader = create_shader('vs');
	var f_shader = create_shader('fs');
	
	// 프로그램 객체 생성 및 링크
	var prg = create_program(v_shader, f_shader);
	
	// attribute Location을 배열로 취득
	var attLocation = new Array();
	attLocation[0] = gl.getAttribLocation(prg, 'position');
	
	// VBO 생성
	var position = []; // 정점 좌표
	var vector = [];   // 정점의 진행 방향 벡터
	var resolutionX = 100; // 정점 배치 해상도 X
	var resolutionY = 100; // 정점의 배치 해상도 Y
	var intervalX = 1.0 / resolutionX; // 꼭짓점 사이의 간격 X
	var intervalY = 1.0 / resolutionY; // 꼭짓점 사이의 간격 Y
	var verticesCount = resolutionX * resolutionY; // 꼭짓점 개수
	(function(){
		var i, j, x, y;
		for(i = 0; i < resolutionX; i++){
			for(j = 0; j < resolutionY; j++){
				// 꼭짓점 좌표
				x = i * intervalX * 2.0 - 1.0;
				y = j * intervalY * 2.0 - 1.0;
				position.push(x, y);
				
				// 꼭짓점의 벡터
				vector.push(0.0, 0.0);
			}
		}
	})();
	
	// VBO 생성
	var pointPosition = new Float32Array(position);
	var vbo = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
	gl.enableVertexAttribArray(attLocation[0]);
	gl.vertexAttribPointer(attLocation[0], 2, gl.FLOAT, false, 0, 0);
	gl.bufferData(gl.ARRAY_BUFFER, pointPosition, gl.DYNAMIC_DRAW);
	
	// uniform Location을 배열로 취득
	var uniLocation = new Array();
	uniLocation[0]  = gl.getUniformLocation(prg, 'pointSize');
	uniLocation[1]  = gl.getUniformLocation(prg, 'pointColor');
	
	// 블렌드 팩터
	gl.enable(gl.BLEND);
	gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE, gl.ONE, gl.ONE);
	
	// 카운터
	var count = 0;
	
	// 속도 관련
	var velocity = 0.0;
	var MAX_VELOCITY = 2.0;
	var SPEED = 0.02;
	
	// 루프
	(function render(){
		var i, j, k, l;
		
		// canvas 초기화
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT);
		
		// 카운터에서 색 산출
		count++;
		var pointColor = hsva((count % 720) / 2, 1.0, 1.0, 0.5);
		
		// 마우스 플래그를 보고 속도 수정
		if(mouseFlag){
			velocity = MAX_VELOCITY;
		}else{
			velocity *= 0.95;
		}
		
		// 점을 갱신하다
		for(i = 0; i < resolutionX; i++){
			k = i * resolutionX;
			for(j = 0; j < resolutionY; j++){
				l = (k + j) * 2;
				// 마우스 플래그를 보고 벡터를 갱신하다
				if(mouseFlag){
					var p = vectorUpdate(
						pointPosition[l],
						pointPosition[l + 1],
						mousePositionX,
						mousePositionY,
						vector[l],
						vector[l + 1]
					);
					vector[l]     = p[0];
					vector[l + 1] = p[1];
				}
				pointPosition[l]     += vector[l]     * velocity * SPEED;
				pointPosition[l + 1] += vector[l + 1] * velocity * SPEED;
			}
		}
		gl.bufferSubData(gl.ARRAY_BUFFER, 0, pointPosition);
		
		// 점을 묘화
		gl.uniform1f(uniLocation[0], velocity * 1.25 + 0.25);
		gl.uniform4fv(uniLocation[1], pointColor);
		gl.drawArrays(gl.POINTS, 0, verticesCount);
		
		// 컨텍스트의 재묘화
		gl.flush();
		
		// 루프를 위해 재귀 호출
		requestAnimationFrame(render);
	})();
	
	// 이벤트 처리
	function mouseDown(eve){
		mouseFlag = true;
	}
	function mouseUp(eve){
		mouseFlag = false;
	}
	function mouseMove(eve){
		if(mouseFlag){
			var cw = c.width;
			var ch = c.height;
			mousePositionX = (eve.clientX - c.offsetLeft - cw / 2.0) / cw * 2.0;
			mousePositionY = -(eve.clientY - c.offsetTop - ch / 2.0) / ch * 2.0;
		}
	}
	
	// 벡터 연산
	function vectorUpdate(x, y, tx, ty, vx, vy){
		var px = tx - x;
		var py = ty - y;
		var r = Math.sqrt(px * px + py * py) * 5.0;
		if(r !== 0.0){
			px /= r;
			py /= r;
		}
		px += vx;
		py += vy;
		r = Math.sqrt(px * px + py * py);
		if(r !== 0.0){
			px /= r;
			py /= r;
		}
		return [px, py];
	}
	
	// 셰이더를 생성하는 함수
	function create_shader(id){
		// 셰이더를 저장하는 변수
		var shader;
		
		// HTML에서 script 태그에 대한 참조 가져오기
		var scriptElement = document.getElementById(id);
		
		// script 태그가 존재하지 않으면 빠짐
		if(!scriptElement){return;}
		
		// script 태그의 type 속성 체크
		switch(scriptElement.type){
			
			// 頂点シェーダの場合
			case 'x-shader/x-vertex':
				shader = gl.createShader(gl.VERTEX_SHADER);
				break;
				
			// フラグメントシェーダの場合
			case 'x-shader/x-fragment':
				shader = gl.createShader(gl.FRAGMENT_SHADER);
				break;
			default :
				return;
		}
		
		// 生成されたシェーダにソースを割り当てる
		gl.shaderSource(shader, scriptElement.text);
		
		// シェーダをコンパイルする
		gl.compileShader(shader);
		
		// シェーダが正しくコンパイルされたかチェック
		if(gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
			
			// 成功していたらシェーダを返して終了
			return shader;
		}else{
			
			// 失敗していたらエラーログをアラートする
			alert(gl.getShaderInfoLog(shader));
		}
	}
	
	// プログラムオブジェクトを生成しシェーダをリンクする関数
	function create_program(vs, fs){
		// プログラムオブジェクトの生成
		var program = gl.createProgram();
		
		// プログラムオブジェクトにシェーダを割り当てる
		gl.attachShader(program, vs);
		gl.attachShader(program, fs);
		
		// シェーダをリンク
		gl.linkProgram(program);
		
		// シェーダのリンクが正しく行なわれたかチェック
		if(gl.getProgramParameter(program, gl.LINK_STATUS)){
		
			// 成功していたらプログラムオブジェクトを有効にする
			gl.useProgram(program);
			
			// プログラムオブジェクトを返して終了
			return program;
		}else{
			
			// 실패했다면 에러로그를 경보한다
			alert(gl.getProgramInfoLog(program));
		}
	}
	
	// VBO를 바인드하여 등록하는 함수
	function set_attribute(vbo, attL, attS){
		// 인수로서 받은 배열을 처리하다
		for(var i in vbo){
			// 버퍼를 바인드하다
			gl.bindBuffer(gl.ARRAY_BUFFER, vbo[i]);
			
			// attribute Location을 활성화하다
			gl.enableVertexAttribArray(attL[i]);
			
			// attribute Location을 통지하고 등록하다
			gl.vertexAttribPointer(attL[i], attS[i], gl.FLOAT, false, 0, 0);
		}
	}
};
