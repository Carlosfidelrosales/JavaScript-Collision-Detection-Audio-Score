const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const collisionCanvas = document.getElementById("collisionCanvas");
const collisionCtx = collisionCanvas.getContext("2d");
collisionCanvas.width = window.innerWidth;
collisionCanvas.height = window.innerHeight;

const bg = document.getElementById('bg');
const asset1 = document.getElementById('asset1');
const asset2 = document.getElementById('asset2');
const asset3 = document.getElementById('asset3');
const asset4 = document.getElementById('asset4');
const asset5 = document.getElementById('asset5');


let score = 0;
let gameOver = false;
ctx.font = "50px Impact";

let timeToNextDragons = 0;
let dragonsInterval = 600;
let lastTime = 0;

let parallaxSpeed = 5;
let x = 0, x2 = 1000;


const reach = document.getElementById('reach')
reach.value = parallaxSpeed;
const display_speed = document.getElementById('speedParallax')
display_speed.innerHTML = parallaxSpeed;
reach.addEventListener('change', function(e) {
    parallaxSpeed = e.target.value;
    display_speed.innerHTML = e.target.value;
})


let dragons = [];
class Dragons {
    constructor(){
        this.spriteWidth = 293;
        this.spriteHeight = 155;
        this.sizeModifier = Math.random() * 0.6 + 0.4;
        this.width = this.spriteWidth * this.sizeModifier;
        this.height = this.spriteHeight * this.sizeModifier;
        this.x = canvas.width;
        this.y = Math.random() * (canvas.height - this.height);
        this.directionX = Math.random();
        this.directionY = Math.random() * 5 - 2.5;
        this.markedForDeletion = false;
        this.image = new Image();
        this.image.src = "images/enemy.png";
        this.frame = 0;
        this.maxFrame = 4;
        this.timeSinceFlap = 0;
        this.sound = new Audio();
        this.sound.src = "mario.mp3";
        this.flapInterval = Math.random() * 50 + 50;
        this.randomColors = [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)];
        this.color = "rgb(" + this.randomColors[0] + "," + this.randomColors[1] + "," + this.randomColors[2] + ")";
        this.speed = parallaxSpeed;
    } 

    update(deltatime){
        this.speed = parallaxSpeed * this.speedModel;
        if (this.y < 0 || this.y > canvas.height - this.height){
           this.directionY = this.directionY * -1;
        }
        this.x -= (this.directionX * parallaxSpeed);
        this.y += this.directionY;
        if (this.x < 0 - this.width) this.markedForDeletion = true;
        this.timeSinceFlap += deltatime;
        if (this.timeSinceFlap > this.flapInterval){
            if (this.frame > this.maxFrame) this.frame = 0;
            else this.frame++;
            this.timeSinceFlap = 0;
        }
        if (this.x < 0 - this.width) gameOver = true, this.sound.play();
    }
    
    draw(){
        collisionCtx.fillStyle = this.color;
        collisionCtx.fillRect(this.x, this.y, this.width, this.height);
        ctx.drawImage(this.image, this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
    }
}
let explosions = [];
class Explosion {
    constructor(x, y, size){
        this.image = new Image();
        this.image.src = "images/smokeExplosion.png";
        this.spriteWidth = 200;
        this.spriteHeight = 179;
        this.size = size;
        this.x = x;
        this.y = y;
        this.frame= 0;
        this.sound = new Audio();
        this.sound.src = "cannon_fire.ogg";
        this.timeSinceLastFrame = 0;
        this.frameInterval = 100;
        this.markedForDeletion = false;
    }
    update(deltatime){
        if (this.frame === 0) this.sound.play();
        this.timeSinceLastFrame += deltatime;
        if (this.timeSinceLastFrame > this.frameInterval){
            this.frame++;
            this.timeSinceLastFrame = 0;
            if (this.frame > 5) this.markedForDeletion = true;
        }
    }
    draw(){
        ctx.drawImage(this.image, this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y - this.size/4, this.size, this.size);
    }
}

class Background {
    constructor(image, speedModel, y_pos, parallaxHeight)
    {
       this.x = 0;
       this.y = y_pos;
       this.width = 1300;
       this.height = parallaxHeight;
       this.x2 = this.width;
       this.image = image;
       this.speedModel = speedModel;
       this.speed = parallaxSpeed * this.speedModel;
   }

   update() {
        this.speed = parallaxSpeed * this.speedModel;
        if (this.x <= -this.width) {
            this.x = this.width + this.x2 - this.speed;
        }

        if (this.x2 <= -this.width) {
            this.x2 = this.width + this.x - this.speed;
        }

        this.x = Math.floor(this.x - this.speed);
        this.x2 = Math.floor(this.x2 - this.speed);
    }

    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        ctx.drawImage(this.image, this.x2, this.y, this.width, this.height);
    }

    
    }
function drawScore(){
    ctx.fillStyle = "blue";
    ctx.fillText("Score: " + score, 50, 75);
    ctx.fillStyle = "white";
    ctx.fillText("Score: " + score, 55, 80);
}
function drawGameOver(){
    ctx.textAlign = "center";
    ctx.font = "150px Impact";
    ctx.fillStyle = "white";
    ctx.fillText("GAME OVER", canvas.width/2, canvas.height/2);
    ctx.fillStyle = "red";
    ctx.fillText("GAME OVER", canvas.width/2 + 4, canvas.height/2 + 4);
    
}

window.addEventListener("click", function(e){
    const detectPixelColor = collisionCtx.getImageData(e.x, e.y, 1, 1);
    console.log(detectPixelColor);
    const pc = detectPixelColor.data;
    dragons.forEach(object => {
        if (object.randomColors[0] === pc[0] && object.randomColors[1] === pc[1] && object.randomColors[2] === pc[2]){
            object.markedForDeletion = true;
            score++;
            explosions.push(new Explosion(object.x, object.y, object.width));
            console.log(explosions);
        }
    });
});

const bg_background = new Background(bg, 0, 0, 503);
const asset1_background = new Background(asset1, 0.2, 0, 503);
const asset2_background = new Background(asset2, 0.4, 0, 744);
const asset3_background = new Background(asset3, 0.8, 0, 650);
const asset4_background = new Background(asset4, 1, 0, 281);
const asset5_background = new Background(asset5, 2.5, 400, 318);


const parallaxObjects = [bg_background,asset1_background, asset2_background, asset3_background, asset4_background, asset5_background];

function animate(timestamp){
    ctx.clearRect(0,0, canvas.width, canvas.height);
    collisionCtx.clearRect(0, 0, canvas.width, canvas.height);
    parallaxObjects.forEach(object => {
        object.update();
        object.draw();
    });
    let deltatime = timestamp - lastTime;
    lastTime = timestamp;
    timeToNextDragons += deltatime;
    if (timeToNextDragons > dragonsInterval){
        dragons.push(new Dragons());
        timeToNextDragons = 0;
        dragons.sort(function(a,b){
            return a.width - b.width;
        })
    };
    drawScore();
    [...dragons, ...explosions].forEach(object => object.update(deltatime));
    [...dragons, ...explosions].forEach(object => object.draw());
    dragons = dragons.filter(object => !object.markedForDeletion);
    explosions = explosions.filter(object => !object.markedForDeletion);
    if (!gameOver) requestAnimationFrame(animate);
    else drawGameOver();
}

animate(0);