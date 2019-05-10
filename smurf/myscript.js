
// char_context image data 
var walk_rate = 1000/35;
var frame_num = 0;

var position_x=250;
var position_y=200;
var ground_level = 200;
var counter=0;

// background_img image data 
var background_rate = 1000/120;
var img_max_w = 1600;
var img_max_h = 711;
var back_x=1500;
var back_y=0;

// obstacles img data 
var obstacle_rate = 1000/150;
var obst_w = 82;
var obst_h = 60;
var obj_index = 8;
var obst_posi_x = 0;
var obst_posi_y = 0;

var canvas_1 = document.getElementById('canvas_1');
var canvas_2 = document.getElementById('canvas_2');
var canvas_3 = document.getElementById('canvas_3');
var canvas_w = canvas_1.width;
var canvas_h = canvas_1.height;

var char_context = canvas_1.getContext("2d");
var backg_context = canvas_2.getContext("2d");
var object_context = canvas_3.getContext("2d");

var smurf_img = new Image();
var background_img = new Image();
var object_img = new Image();

var background_music = new Audio("sound/background.ogg");
var jump_sound = new Audio("sound/jump.ogg");
var dead_sound = new Audio("sound/dead.ogg");

background_music.loop="true";
background_music.preload="auto";
background_music.autoplay="true";
//======== loop audio ============
/*
background_music.addEventListener('ended', function() {
    this.currentTime = 0;
    this.play();
}, false);
background_music.play();
*/
//________ loop audio _____________

var walk_interval;
var background_interval;
var object_interval;

window.onload = function(){

    var character_url="character.json";
    var object_img="object.json";
    var background_url="background.json";
    
    ajax(background_url,_background,"");
    ajax(character_url,_character,"");
    ajax(object_img,_obstacle,"");

    setTimeout(function (){console.log(background_music.duration)},2000);

    obst_posi_x = canvas_w;
    obst_posi_y = 275;    
}

function ajax(url,callback,type)
{   
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET",url,true);
    if(type) xmlhttp.responseType = type;   
    xmlhttp.onreadystatechange=function()
    {
        if (xmlhttp.readyState==4 && xmlhttp.status==200)
        {
            var response = JSON.parse(xmlhttp.responseText);
            callback(response);
        }
    }
    xmlhttp.send();
}

var character;
function _character(msg){
    character = msg;
    smurf_img.src = character.smurf.url;
    walk_interval=setInterval('draw_character(frame_num++,position_x,position_y)',walk_rate);
    console.log(character.smurf.url);
}

var object;
function _obstacle(msg){
    object = msg;
    object_img.src = object.url
    object_interval = setInterval("shift(object_img,object.img[obj_index].sx, object.img[obj_index].sy)",background_rate);
    console.log(object.url);
}

var background;
function _background(msg){
    background = msg;
    background_img.src = background.img[0].url;
    background_interval=setInterval("move_background()",background_rate);
    console.log(background.img[0].url);
}

function sound(){
    var id=document.getElementById("sound");
    if(id.value == 1){
        id.value = 0;
        id.innerHTML = "No Music";
        background_music.pause();
    }
    else if(id.value == 0){
        id.value = 1;
        id.innerHTML = "Music";
        background_music.play();
    }

}

function pause(){
    var id=document.getElementById("pause");
    if(id.value == 1){
        id.value = 0;
        id.innerHTML = "Resume";
        background_music.pause();
        
        clearInterval(background_interval);
        clearInterval(walk_interval);
        clearInterval(object_interval);
        document.getElementById("jump_button").disabled = true;
        document.getElementById("sound").disabled= true;

    }
    else if(id.value == 0){
        id.value = 1;
        id.innerHTML = "Pause";
        var music_playing=document.getElementById("sound").value;
        console.log(music_playing);
        if(music_playing==1){
            background_music.play();
        }

        walk_interval=setInterval('draw_character(frame_num++,position_x,position_y)',walk_rate);
        background_interval=setInterval("move_background()",background_rate);
        object_interval = setInterval("shift(object_img,object.img[obj_index].sx, object.img[obj_index].sy)",background_rate);
        document.getElementById("jump_button").disabled = false;
        document.getElementById("sound").disabled= false;
    }
}

function draw_character(_frame_num,dx,dy){
    if(frame_num > 15) frame_num=0;
    
    var sx=character.smurf.frame[frame_num].sx;
    var sy=character.smurf.frame[frame_num].sy;
    var sw=character.smurf.sw;
    var sh=character.smurf.sh;
    var dw=sw;
    var dh=sh;

    //console.log(frame_num,sx,sy);
    char_context.clearRect(0,0,canvas_1.width,canvas_1.height);
    char_context.drawImage(smurf_img, sx,sy,sw,sh,dx,dy,dw,dh);
}

function shift(img_obj,sx,sy){
    var sw = object.sw; 
    var sh = object.sh; 
    var dw=sw;
    var dh=sh;
    // shift img
    if(obst_posi_x >= (-sw)){
        object_context.clearRect(obst_posi_x,obst_posi_y,dw,dh);
        object_context.drawImage(img_obj,sx,sy,sw,sh,obst_posi_x,obst_posi_y,dw,dh);
    }
    else if(obst_posi_x < (-sw)){
        obst_posi_x = canvas_w;
        // clearInterval(object_interval);
    }
    obst_posi_x-=2;
    check_collision();
}

function check_collision(){
    var offset_x=30;
    var offset_y=5;
    var char_sw=character.smurf.sw;
    var char_sh=character.smurf.sh;

    var x1_left = position_x + offset_x;
    var x1_right = position_x + char_sw - offset_x;
    var y1_top = position_y + offset_y;
    var y1_bottom = position_y + char_sh - offset_y;

    var x2_left = obst_posi_x + offset_x;
    var x2_right = obst_posi_x + obst_w - offset_x;
    var y2_top = obst_posi_y + offset_y;
    var y2_bottom = obst_posi_y + obst_h - offset_y;

    if( (x1_left < x2_left && x2_left < x1_right ) || (x1_left < x2_right && x2_right < x1_right) ){
        if((y1_top < y2_top && y2_top < y1_bottom) || (y1_top < y2_bottom && y2_bottom < y1_bottom) ){
        /*    
            clearInterval(object_interval);
            dead_sound.play();
            background_music.pause();
            alert("die");
            location.reload();
        */   

            document.getElementById("collision").style.backgroundColor="red";
        }
    }
    else{
        document.getElementById("collision").style.backgroundColor="blue";   
    }

}

function move_background(){
    backg_context.clearRect(0,0,canvas_w,canvas_h);
    backg_context.drawImage(background_img, back_x, back_y,canvas_w,canvas_h,0,0,canvas_w,canvas_h);

    var difference_x = img_max_w - back_x;
    if(difference_x<canvas_w){
        //console.log("check");
        backg_context.drawImage(background_img, 0, back_y,canvas_w,canvas_h,difference_x,0,canvas_w,canvas_h);
    }
    back_x += 2;
    if(back_x>=img_max_w) back_x=0;
    
}

var jumping_interval;
function jump(){
    jump_sound.play();
    console.log("jump");
    document.getElementById("jump_button").disabled = true;
    frame_num = 0;
    clearInterval(walk_interval);   
    jumpimg();
    jumping_interval = setInterval('jumpimg()',30);
}

function jumpimg(){
    var jump_height=25;
    var jump_offset=0;
    jump_offset =  - (counter * counter) + jump_height*counter;
    position_y = ground_level  - jump_offset;
    draw_character(0,position_x,position_y);
    counter++;
    if(counter > jump_height) {
        // done jumping
        document.getElementById("jump_button").disabled = false;
        counter=0;
        clearInterval(jumping_interval);
        walk_interval = setInterval('draw_character(frame_num++,position_x,position_y)',walk_rate);
    }

}

