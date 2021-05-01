/*globals window, document, setInterval, event, localStorage */

let hitCount = 0;

function saveScore(score){
    'use strict';

    let nowDate = new Date();
    let year = nowDate.getFullYear();
    let month = ('00' + (nowDate.getMonth()+1)).slice(-2);
    let day = ('00' + nowDate.getDate()).slice(-2);
    let hour = ('00' + nowDate.getHours()).slice(-2);
    let minute = ('00' + nowDate.getMinutes()).slice(-2);
    let second = ('00' + nowDate.getSeconds()).slice(-2);

    localStorage.setItem('FALL-BALLS' + ',' + year + month + day + hour + minute + second, score);
}

window.onload = function () {
    'use strict';
    title();
}

function drawScoreCanvas(){
    'use strict';
    let ctx = canvas.getContext('2d'); 

    ctx.fillStyle = '#000';

    let fontsize = 40;
    ctx.font = "normal " + fontsize + "px Arial, meiryo, sans-serif" ;
    ctx.fillText('SCORE:' + hitCount, 500, 1300) ;
}

function drawHiScoreCanvas(){
    'use strict';
    let ctx = canvas.getContext('2d'); 

    ctx.fillStyle = '#000';

    let hiScore = -1;
    for(let key in localStorage) {
	let appName = key.split(',')[0];
	if(appName === 'FALL-BALLS') {
	    let score = localStorage.getItem(key);
	    if(hiScore < score){
		hiScore = score;
	    }
	}
    }
    if(hiScore === -1){hiScore = '-';}
    
    let fontsize = 80;
    ctx.font = "normal " + fontsize + "px Arial, meiryo, sans-serif" ;
    let text = 'BEST SCORE:' + hiScore;
    let textWidth = ctx.measureText(text).width;
    ctx.fillText(text, (canvas.width - textWidth) / 2, fontsize + 500) ;

}

function drawPlayCanvas(){
    'use strict';
    let ctx = canvas.getContext('2d'); 

    const RECT_POS_Y = 1000;
    const RECT_WIDTH = 500;
    const RECT_HEIGHT = 200;
    const RECT_POS_X = (canvas.width - RECT_WIDTH) / 2;

    ctx.fillStyle = '#777';
    ctx.fillRect(RECT_POS_X,RECT_POS_Y,RECT_WIDTH,RECT_HEIGHT); 

    let fontsize = 100;
    ctx.font = "bold " + fontsize + "px Arial, meiryo, sans-serif" ;
    let text = 'PLAY';
    let textWidth = ctx.measureText(text).width;
    let textHeight = ctx.measureText(text).actualBoundingBoxAscent + ctx.measureText(text).actualBoundingBoxDescent;
    ctx.fillStyle = '#FFF';
    ctx.fillText(text, (canvas.width - textWidth) / 2, RECT_POS_Y + RECT_HEIGHT - textHeight);
    
    
    canvas.addEventListener('touchstart', touchStart);

    function touchStart(e){
 	let touchX = e.changedTouches[0].clientX - canvas.getBoundingClientRect().left;
	let touchY = e.changedTouches[0].clientY - canvas.getBoundingClientRect().top;

	if(RECT_POS_X <= touchX && touchX <= RECT_POS_X + RECT_WIDTH){
	    if(RECT_POS_Y <= touchY && touchY <= RECT_POS_Y + RECT_HEIGHT){
		canvas.removeEventListener('touchstart', touchStart);
		main();
	    }
	}
   }  
}

function gameover(){
    'use strict';
    let ctx = canvas.getContext('2d'); 

    ctx.clearRect(0, 0,canvas.width, canvas.height);

    ctx.fillStyle = '#000';

    let fontsize = 100;
    ctx.font = "bold " + fontsize + "px Arial, meiryo, sans-serif" ;
    let text = 'GAME OVER';
    let textWidth = ctx.measureText(text).width ;
    ctx.fillText(text, (canvas.width - textWidth) / 2, fontsize + 100) ;

    drawHiScoreCanvas();
    drawPlayCanvas();
    drawScoreCanvas();

    ctx.font = "normal 40px Arial, meiryo, sans-serif" ;
    ctx.fillText(fps + ' FPS', 500, 1350);
}

function title(){
    'use strict';
    let ctx = canvas.getContext('2d'); 

    ctx.fillStyle = '#000';
    
    let fontsize = 140;
    ctx.font = "bold " + fontsize + "px Arial, meiryo, sans-serif" ;
    let text = 'Fall Balls';
    let textWidth = ctx.measureText(text).width ;
    ctx.fillText(text, (canvas.width - textWidth) / 2, fontsize) ;
    
    drawHiScoreCanvas();
    drawPlayCanvas();
}
let fps;

function main(){
    'use strict';

    //canvas
    let ctx = canvas.getContext('2d'); 
    ctx.fillStyle = '#000';
    
    //ball(function use)
    let barWidth = 100;
    let barPosX = 50;
    let changeValue = 0;
    let touchStartX = null;

    //ball
    let ballSize = 20;
    let xPow = 0;
    let posX = 100;
    let posY = 100;
    let isFaster = true;
    let isReflection = false;
    let falling = false;
   
    let v0 = 0;
    let a = 1;

    //bar(flg)
    let moving = false;
    let dragging = false;
   
    //bar 
    let barPosY = 1000;
    let barHeight = 10;

    hitCount = 0;
    
    let beforeTime;
    let frameCount = 0;
    fps = 0;

    (function update(){
        let requestId = window.requestAnimationFrame(update);

	ctx.clearRect(0, 0,canvas.width, canvas.height);

	//---------
	//FPS RATE
	//---------
	let now = new Date()
	ctx.font = "normal 40px Arial, meiryo, sans-serif" ;
	if(frameCount % 50 === 10){
	    fps = 1 / ((now.getTime() - beforeTime)/1000);
	    fps = Math.round(fps * 10) / 10;
	}
	if(fps === 0){
	    ctx.fillText('... FPS', 500, 1350);
	}else{
	    ctx.fillText(fps + ' FPS', 500, 1350);
	}
	frameCount += 1;
	beforeTime = now.getTime();
	
	//------
	//SCORE
	//------
	drawScoreCanvas();

	//-----
	//BAR
	//-----
	if(dragging){
	    if(!moving){setChangeValue(null)};
	    barPosX = barPosX + changeValue;
	}
	
	moving = false;
	ctx.fillRect(barPosX,barPosY,barWidth,barHeight);

	//------
	//BALL
	//------
	posX = posX + xPow;

	//posY 
	if(isReflection){
	    posY = barPosY - (posY + v0 - barPosY);
	    isFaster = false;
	    isReflection = false;
	
	}else{
	    if(isFaster){
		posY = posY + v0;
	    }else{
		posY = posY - v0;
	    }
	}

	if(posY >= canvas.height){
	    console.log('ball out frame!!!');

	    // Save Score
	    (function (){
		'use strict';

		let nowDate = new Date();
		let year = nowDate.getFullYear();
		let month = ('00' + (nowDate.getMonth()+1)).slice(-2);
		let day = ('00' + nowDate.getDate()).slice(-2);
		let hour = ('00' + nowDate.getHours()).slice(-2);
		let minute = ('00' + nowDate.getMinutes()).slice(-2);
		let second = ('00' + nowDate.getSeconds()).slice(-2);

		localStorage.setItem('FALL-BALLS' + ',' + year + month + day + hour + minute + second, hitCount);
	    
	    })();
	    
	    canvas.removeEventListener('touchstart', touchStart);
	    canvas.removeEventListener('touchEnd', touchEnd);
	    canvas.removeEventListener('touchMove', touchMove);
	    gameover();
	    window.cancelAnimationFrame(requestId);
	}

	ctx.beginPath();
	ctx.arc(posX, posY, ballSize, 0, Math.PI * 2, true); 
	ctx.fill();

	if(isFaster){
	    v0 = v0 + a;
	}else{
	    v0 = v0 - a;
	}

	if(v0 <= 0){isFaster = true;}

	//wall reflection
	if(canvas.width < posX + ballSize){xPow = -xPow}
	if(posX < 0){xPow = -xPow}

	if(falling){
	    
	}else{

	    if(isFaster && posY + v0 >= barPosY){

		let ballCenter = posX;
			
		if(barPosX <=  ballCenter && ballCenter <= barPosX + barWidth){
		    isReflection = true;
		    hitCount += 1;
		 
		    let barCenter = barPosX + (barWidth / 2);
	            let newXPow = (ballCenter - barCenter) / 2;
		    xPow = xPow + newXPow;
		    if(xPow === 0){xPow = 0.5;}

		}else{
		    falling = true;
		}
	    }

	}
    })();

    canvas.addEventListener('touchstart',touchStart);
    function touchStart(e){
 	dragging = true;
	moving = false;

	touchStartX = e.changedTouches[0].clientX - canvas.getBoundingClientRect().left;
	setChangeValue(e);
    }
 
    canvas.addEventListener('touchend', touchEnd);
    function touchEnd(e){
	dragging = false;
	moving = false;
    }

    canvas.addEventListener('touchmove', touchMove);
    function touchMove(e){
	moving = true;

	touchStartX = e.changedTouches[0].clientX - canvas.getBoundingClientRect().left;
	setChangeValue(e);
        
        e.preventDefault();
    }
   
    function setChangeValue(e){
	'use strict';
	let touchX  
	
	if(e === null){
	    touchX = touchStartX;
	}else{
	    touchX = e.changedTouches[0].clientX - canvas.getBoundingClientRect().left;
	}

	if(touchX < barPosX + (barWidth / 2)){
	    changeValue = -20;
	}
	if(barPosX + (barWidth / 2) < touchX){
	    changeValue = 20;
	}
    }
}


