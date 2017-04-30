/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.PointerLockControls = function ( camera ) {

	var scope = this;

	camera.rotation.set( 0, 0, 0 );

	var pitchObject = new THREE.Object3D();
	pitchObject.add( camera );

	var yawObject = new THREE.Object3D();
	yawObject.add( pitchObject );

	var PI_2 = Math.PI / 2;

	//begin*******************************************************
	//兼容移动端与pc端
	var onMouseMove = function ( event ) {
		if ( scope.enabled === false ) return;
		
		var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
		rotation(movementX,movementY);
	},
		//开始触摸屏幕的事件对象,用于获得开始触摸时的点
		startTouche = null,
		onToucheStart = function(event){
			event.preventDefault(event);
			var touche = event.touches[0];
			if(touche) startTouche = touche;
		},
		onTouchMove = function(event){
			event.preventDefault(event);

			var touche = event.touches[0];
			rotation(touche.pageX - startTouche.pageX,touche.pageY - startTouche.pageY);
			startTouche = touche;
		},
		onToucheEnd = function(event){
			event.preventDefault(event);
		};
	//改变视角x y
	function rotation(movementX,movementY){
		yawObject.rotation.y -= movementX * 0.003;
		pitchObject.rotation.x -= movementY * 0.003;

		pitchObject.rotation.x = Math.max( - PI_2, Math.min( PI_2, pitchObject.rotation.x ) );
	}

	this.dispose = function() {
		document.removeEventListener('touchmove',onTouchMove,false);
		document.removeEventListener('touchstart',onToucheStart,false);
		document.removeEventListener( 'mousemove', onMouseMove, false );
		document.removeEventListener('touchend',onToucheEnd,false);
	};

	document.addEventListener( 'mousemove', onMouseMove, false );
	document.addEventListener('touchstart',onToucheStart,false);
	document.addEventListener('touchmove',onTouchMove,false);
	document.addEventListener('touchend',onToucheEnd,false);
	
	//end*******************************************************
	this.enabled = false;

	this.getObject = function () {

		return yawObject;

	};

	this.getDirection = function() {

		// assumes the camera itself is not rotated

		var direction = new THREE.Vector3( 0, 0, - 1 );
		var rotation = new THREE.Euler( 0, 0, 0, "YXZ" );

		return function( v ) {

			rotation.set( pitchObject.rotation.x, yawObject.rotation.y, 0 );

			v.copy( direction ).applyEuler( rotation );

			return v;

		};

	}();

};
