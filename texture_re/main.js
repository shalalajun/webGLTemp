"use strict";
/** @type {WebGLRenderingContext} */

function createShader(gl,type,source)
{
    var shader = gl.createShader();
    gl.shaderSource(shader,source);
    gl.compileShader(shader);
    var success = gl.getShaderParameter(shader,gl.COMPILE_STATUS);
    if(success){
        return shader
    }else{
        alert("쉐이더에 문제가 있습니다.");
    }
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader)
{
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    var success = gl.getProgramParameter(program, gl.LINK_STATUS);

    if(success){
        return program;
    }

    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}

function main()
{
    var canvas = document.getElementById("c");
    var gl = canvas.getContext("webgl");

    if(!gl){
        alert("웹지엘이 아니므이다.");
        return;
    }

    var vertexShaderSource = document.getElementById("vertexShader").text;
    var fragmentShaderSource = document.getElementById("fragmentShader").text;

    var vertexShader = createShader(gl,gl.VERTEX_SHADER,vertexShaderSource);
    var fragmentShader = createShader(gl,gl.FRAGMENT_SHADER,fragmentShaderSource);

    
}

main();