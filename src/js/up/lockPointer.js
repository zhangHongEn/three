a﻿function DRenderer(){
	this.canvas = document.createElement('canvas');
	this.ctx = this.canvas.getContext('2d');
	
	this.canvas.style="position:absolute; top:0px; left:0px;";
	this.canvas.width = window.innerWidth;
	this.canvas.height = window.innerHeight;
	this.canvas.style.width = this.canvas.width + 'px';
	this.canvas.style.height = this.canvas.height + 'px';
}
DRenderer.prototype = {
	constructor : DRenderer,
	oldStart : {x:0,y:0,r:50},
	oldMove : {x:0,y:0,r:30},
	newStart : {x:0,y:0,r:50},
	newMove : {x:0,y:0,r:30},
	empty : false,
	setNewMoveX : function(x){
		this.newMove.x = x;
	},
	setNewMoveY : function(y){
		this.newMove.y = y;
	},
	clearOldStart : function(){
		this.ctx.clearRect(this.oldStart.x - this.oldStart.r -5 , this.oldStart.y - this.oldStart.r - 5 , this.oldStart.r*2 +10 , this.oldStart.r*2 + 10 );
	},
	clearOldMove : function(){
		this.ctx.clearRect(this.oldMove.x - this.oldMove.r -5  , this.oldMove.y - this.oldMove.r -5 , this.oldMove.r*2 +10 , this.oldStart.r*2 + 10);
	},
	drawStart : function(){
		if(this.empty) return;
		var gradient = this.ctx.createRadialGradient(this.newStart.x,this.newStart.y,this.newStart.r/2,this.newStart.x,this.newStart.y,this.newStart.r);
		gradient.addColorStop(0,'rgba(0,0,0,0.7)');
		gradient.addColorStop(1,'rgba(0,0,0,0.1)');
		this.drawArc(this.newStart.x,this.newStart.y,this.newStart.r,gradient);
		this.oldStart.x = this.newStart.x;
		this.oldStart.y = this.newStart.y;
	},
	drawMove : function(){
		if(this.empty) return;
		var gradient = this.ctx.createRadialGradient(this.newMove.x,this.newMove.y,this.newMove.r/2,this.newMove.x,this.newMove.y,this.newMove.r);
		gradient.addColorStop(0,'rgba(100,200,200,0.7)');
		gradient.addColorStop(1,'rgba(100,200,200,0.1)');
		this.drawArc(this.newMove.x,this.newMove.y,this.newMove.r,gradient);
		this.oldMove.x = this.newMove.x;
		this.oldMove.y = this.newMove.y;
		this.oldMove.z = this.newMove.z;
	},
	drawArc : function(x,y,r,gradient){
		this.ctx.beginPath();
		this.ctx.fillStyle = gradient;
		this.ctx.arc(x,y,r,0,Math.PI*2,false);
		this.ctx.closePath();
		this.ctx.fill();
	},
	clearAll : function(){
		DRenderer.ctx.clearRect(0,0,DRenderer.canvas.width,DRenderer.canvas.height);
		this.empty = true;
	},
	renderer : function(){
		this.clearOldStart();
		this.clearOldMove();
		this.drawStart();
		this.drawMove();
	}
};

function THREEPointerLockControls(camera){
	THREE.DeviceOrientationControls.call( this , camera );
	this.moves = new Moves(15,15,this.getObject());
	
	if(String(document.ontouchstart) === 'undefined'){
		//pc
		this.pointLock();
		this.moves.pc();
	}else{
		//移动
		this.enabled = true;
		this.moves.mobilePhone();
	}
	
	scene.add( this.getObject() );
}

THREEPointerLockControls.prototype = {
	constructor : THREEPointerLockControls,
	pointLock : function(){
		var scope = this;
		//是否支持PointerLock接口
		var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
		//如果支持PointerLock接口
		if ( havePointerLock ) {

			var pointerlockchange = function ( event ) {
				scope.enabled = document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element;
			};
			document.addEventListener( 'pointerlockchange', pointerlockchange, false );
			document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
			document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );
			
			//body
			var element = document.body;

			// Hook pointer lock state change events
			function lockPointer(){

				// Ask the browser to lock the pointer
				//请求浏览器指针锁
				element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;

				//如果是火狐
				if ( /Firefox/i.test( navigator.userAgent ) ) {

					//全屏状态改变事件
					var fullscreenchange = function ( event ) {
						//如果全屏元素是body
						if ( document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element ) {
							
							document.removeEventListener( 'fullscreenchange', fullscreenchange );
							document.removeEventListener( 'mozfullscreenchange', fullscreenchange );
							element.requestPointerLock();
						}

					};

					document.addEventListener( 'fullscreenchange', fullscreenchange, false );
					document.addEventListener( 'mozfullscreenchange', fullscreenchange, false );
					element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;
					element.requestFullscreen();
					

				} else {
					element.requestPointerLock();
				}
			}
			window.addEventListener('click',lockPointer,false);
			
		}
	}
};

function Moves(xspeed , zspeed , object){
	this.xspeed = xspeed || 0;
	this.zspeed = zspeed || 0;
	this.object = object;
	this.yMove = false;
	this.xMove = false;
	this.vector = {x:0,y:0};
}
Moves.prototype = {
	constructor : Moves,
	xmove : function(distance){
		object.translateX(distance);
	},
	zmove : function(distance){
		object.translateZ(distance);
	},
	update : function(dt){
		if(this.yMove){
			this.object.translateZ(dt * this.zspeed * this.vector.y);
		}
		if(this.xMove){
			this.object.translateX(dt * this.xspeed * this.vector.x);
		}
	},
	pc : function(){
		window.addEventListener('keydown',this.onkeydown(),false);
		window.addEventListener('keyup',this.onkeyup(),false);
	},
	mobilePhone : function(){
		//开始触摸屏幕的事件对象,用于获得开始触摸时的点
		var scope = this,
			startTouche = null;
			onToucheStart = function(event){
				event.preventDefault(event);
				var touche = event.touches[1];
				if(touche) {
					startTouche = touche;
					DRenderer.newStart.x = touche.pageX;
					DRenderer.newStart.y = touche.pageY;
					DRenderer.empty = false;
				}
			},
			onTouchMove = function(event){
				event.preventDefault(event);
				var touche = event.touches[1];
				if(!touche) return;
				
				var vector = {
					x : (touche.pageX-startTouche.pageX) / 100,
					y : (touche.pageY-startTouche.pageY) / 100
				};
				scope.vector.x = vector.x;
				scope.vector.y = vector.y;
				scope.xMove = !!vector.x;
				scope.yMove = !!vector.y;
				DRenderer.setNewMoveX(touche.pageX);
				DRenderer.setNewMoveY(touche.pageY);
			},
			onToucheEnd = function(event){
				event.preventDefault(event);
				var stopMove = event.touches.length < 2;
				scope.xMove = scope.yMove = !stopMove;
				if(stopMove){
					scope.vector.x = scope.vector.y = 0;
					DRenderer.clearAll();
					DRenderer.newStart.x = -50;
					DRenderer.newStart.y = -50;
				}
			};
			document.addEventListener('touchstart',onToucheStart,false);
			document.addEventListener('touchmove',onTouchMove,false);
			document.addEventListener('touchend',onToucheEnd,false);
		
		
	},
	onkeydown : function(){
		var scope = this;
		return function(e){
			var code = e.keyCode || e.charCode;
			switch(code){
				//前
				case 38:
				case 87:
					scope.yMove = true;
					scope.vector.y = -1;
				break;
				//后
				case 40:
				case 83:
					scope.yMove = true;
					scope.vector.y = 1;
				break;
				//左
				case 37:
				case 65:
					scope.xMove = true;
					scope.vector.x = -1;
				break;
				//右
				case 39:
				case 68:
					scope.xMove = true;
					scope.vector.x = 1;
				break;
			}
		}
	},
	onkeyup : function(){
		var scope = this;
		return function(e){
			var code = e.keyCode || e.charCode;
			switch(code){
				//前
				case 38:
				case 87:
					if(scope.vector.y != 1)
						scope.yMove = false;
				break;
				//后
				case 40:
				case 83:
					if(scope.vector.y != -1)
					scope.yMove = false;
				break;
				//左
				case 37:
				case 65:
					if(scope.vector.x != 1)
					scope.xMove = false;
				break;
				//右
				case 39:
				case 68:
					if(scope.vector.x != -1)
					scope.xMove = false;
				break;
			}
		}
	}
	
};
