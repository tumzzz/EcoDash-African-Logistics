let canvas = document.querySelector("#gameCanvas");

let context = canvas.getContext("2d");


canvas.width = innerWidth;

canvas.height = innerHeight;


class Train {

    constructor(x, y) {

        this.x = x;
        this.y = y;

        this.width = 100;
        this.height = 45;

        this.vx = 0;
        this.vy = 0;

        this.acceleration = 0.12;
        this.drag = 0.95;
        this.maxSpeed = 4;

        this.battery = 100;

        this.cargo = 0;

        this.angle = 0;
    }


    update(keys) {

        if (this.battery <= 0) {

            this.vx = 0;
            this.vy = 0;

            return;
        }


        if (keys["ArrowRight"] || keys["d"] || keys["D"]) {
            this.vx += this.acceleration;

        }


        if (keys["ArrowLeft"] || keys["a"] || keys["A"]) {
            this.vx -= this.acceleration;

        }


        if (this.vx > this.maxSpeed) {
            this.vx = this.maxSpeed;

        }


        if (this.vx < -this.maxSpeed) {
            this.vx = -this.maxSpeed;

        }


        this.vx *= this.drag;


        let slope = Math.cos(this.x * 0.01) * 0.35;




        this.vy = Math.sin(this.angle) * Math.abs(this.vx);


        this.x += Math.cos(this.angle) * this.vx;


        this.y = getTrackY(this.x) - this.height;


        if (this.x < 0) {
            this.x = 0;
            this.vx = 0;

        }


        if (this.x + this.width > canvas.width) {
            this.x = canvas.width - this.width;
            this.vx = 0;

        }


        this.battery -= Math.abs(this.vx) * 0.02;


        if (this.battery < 0) {
            this.battery = 0;

        }

    }


    draw(context) {

        context.save();


        context.translate(
            this.x + this.width / 2,

            this.y + this.height / 2

        );


        context.rotate(this.angle);

        context.fillStyle = "light brown";
        context.fillRect(-50,-22, 100, 45);


        context.fillStyle = "brown";
        context.fillRect(30,-12,20,34);


        context.fillStyle = "white";
        context.fillRect(-40,-14,20,15);

        context.fillRect(-10,-14,20,15);

        context.fillRect(20,-14,15,15);


        context.fillStyle = "black";

        context.beginPath();

        context.arc(-30,23,10,0,Math.PI * 2);

        context.arc(30,23,10,0,Math.PI * 2);

        context.fill();


        context.fillStyle = "black";

        context.fillRect(-30,-30, 60, 8);


        context.restore();

    }

}



class Obstacle {

    constructor(x,y,width,height,type) {
        this.x = x;
        this.y = y;

        this.width = width;
        this.height = height;

        this.type = type;

        this.hit = false;

    }


    draw(context) {

        if (this.type === "tree") {
            context.fillStyle = "brown";
            context.fillRect(

                this.x,
                this.y + 20,
                this.width,
                15

            );

        }


        if (this.type === "flood") {

            context.fillStyle ="#3b82a0";

            context.fillRect(

                this.x + 85,
                this.y, 
                this.width,
                this.height

            );

            context.fillStyle ="white";
            context.font ="14px Arial";

            context.fillText("FLOOD", this.x + 100, this.y + 25);

        }


        if (this.type === "wildlife") {

            context.fillStyle = "#8b6f47";

            context.fillRect(this.x + 10, this.y + 20, 55, 25);


            context.beginPath();

            context.arc(this.x + 70, this.y + 20, 15, 0, Math.PI * 2);

            context.fill();


            context.fillRect(this.x + 20, this.y + 40, 7, 20);

            context.fillRect( this.x + 50, this.y + 40, 7, 20);
 
            

        }

    }

}


class Warehouse {

    constructor(x, y,name,cargo) {
        this.x = x;
        this.y = y;

        this.width = 100;
        this.height = 80;

        this.name = name;

        this.foodCargo = cargo;

        this.visited = false;

    }


    draw(context) {

        if (this.visited) {
            context.fillStyle ="grey";
        } else {
            context.fillStyle ="silver";
        }


        context.fillRect(this.x,this.y,this.width,this.height);


        context.fillStyle ="brown";

        context.fillRect(this.x - 10, this.y - 15, this.width + 20, 15);


        context.fillStyle = "brown";

        context.fillRect( this.x + 40, this.y + 40, 20, 40);


        context.fillStyle ="black";

        context.fillRect(this.x + 10, this.y + 10, 80, 20);

        context.fillStyle ="white";

        context.font = "12px Arial";

        context.fillText(this.name, this.x + 15, this.y + 24);


        context.fillStyle ="black";

        context.fillText("Food: " + this.foodCargo, this.x + 10, this.y + 65);

    }

}



let startScreen = document.querySelector("#startScreen");

let gameScreen = document.querySelector("#gameScreen");

let pauseScreen = document.querySelector("#pauseScreen");

let gameOverScreen = document.querySelector("#gameOverScreen");


let startButton = document.querySelector("#startButton");

let pauseButton = document.querySelector("#pauseButton");

let resumeButton = document.querySelector("#resumeButton");

let restartButton = document.querySelector("#restartButton");

let pauseRestartButton = document.querySelector("#pauseRestartButton");

let gameOverRestartButton = document.querySelector("#gameOverRestartButton");


let gameState = "start";

let score = 0;

let distance = 0;

let warehouse = 0;

let efficiency = 0;

let startingBattery = 100;


let highScore =Number(localStorage.getItem("railHighScore")) || 0;

let keys = {};


document.addEventListener("keydown", function(event) {
        keys[event.key] = true;

    }
);


document.addEventListener("keyup",function(event) {
        keys[event.key] = false;

    }
);


function getTrackY(x) {

    return (canvas.height - 120 + Math.sin(x * 0.01) * 35);

}


let train = new Train(100,getTrackY(100) - 45);


let solar = {

    x:
        canvas.width * 0.45,

    y:
        getTrackY(canvas.width * 0.45) - 50, width: 150, height: 100

};


let warehouseList = [

    new Warehouse(canvas.width * 0.30,

        getTrackY(canvas.width * 0.30) - 80,

        "Johannesburg", 50

    ),


    new Warehouse(

        canvas.width * 0.75,

        getTrackY(canvas.width * 0.75) - 80,

        "Pretoria", 40

    )

];


let obstacles = [

    new Obstacle(

        canvas.width * 0.25,

        getTrackY(
            canvas.width * 0.25
        ) - 20, 80, 40, "tree"

    ),


    new Obstacle(

        canvas.width * 0.50,

        getTrackY(
            canvas.width * 0.50
        ) - 25, 120, 50, "flood"

    ),


    new Obstacle(

        canvas.width * 0.70,

        getTrackY(
            canvas.width * 0.70
        ) - 40, 90, 60,
 "wildlife"

    )

];


function updateWorldPositions() {

    solar.x = canvas.width * 0.45;

    solar.y = getTrackY(solar.x) - 50;

    warehouseList[0].x = canvas.width * 0.30;

    warehouseList[0].y =getTrackY(warehouseList[0].x) - 80;

    warehouseList[1].x = canvas.width * 0.75;

    warehouseList[1].y = getTrackY(warehouseList[1].x) - 80;

    obstacles[0].x = canvas.width * 0.25;

    obstacles[0].y = getTrackY(obstacles[0].x) - 20;

    obstacles[1].x = canvas.width * 0.50;

    obstacles[1].y = getTrackY(obstacles[1].x) - 25;

    obstacles[2].x = canvas.width * 0.70;

    obstacles[2].y = getTrackY(obstacles[2].x) - 40;

}


startButton.addEventListener("click",function() {

        gameState = "playing";

        startScreen.classList.add("hidden" );


        gameScreen.classList.remove("hidden");

    }
);


function updateDistance() {

    let movement = Math.abs(train.vx );
    distance += movement * 0.01;

}


function updateEfficiency() {

    let energyUsed = startingBattery - train.battery;


    if (energyUsed > 0) {
        efficiency = distance / energyUsed;
    } else {
        efficiency = 0;
    }

}

function updateHighScore() {

    if ( score > highScore) {
        highScore = score;


        localStorage.setItem( "ecoRailHighScore", highScore);

    }

}



function drawBackground() {

    context.fillStyle ="#87CEEB";

    context.fillRect(0,0,canvas.width,canvas.height * 0.5);


    context.fillStyle ="#c9b36a";

    context.fillRect( 0, canvas.height * 0.5, canvas.width, canvas.height * 0.5 );


    context.fillStyle ="#f5c542";

    context.beginPath();

    context.arc( canvas.width - 120,90,45,0,Math.PI * 2);

    context.fill();

    drawTrees();

}


function drawTrees() {

    let treePositions = [

        canvas.width * 0.10,

        canvas.width * 0.20,

        canvas.width * 0.60,

        canvas.width * 0.90

    ];


    for (let x of treePositions) {

        context.fillStyle ="brown";

        context.fillRect(x,canvas.height * 0.55,15,100);

        context.fillStyle ="green";

        context.beginPath();

        context.arc( x + 7,canvas.height * 0.54,40,0,Math.PI * 2);

        context.fill();

    }

}


function drawRailway() {

    context.strokeStyle ="black";

    context.lineWidth = 4;

    context.beginPath();


    for ( let x = 0; x <= canvas.width; x += 5) {
        let y = getTrackY(x) - 30;
 
        if ( x === 0) {
            context.moveTo( x,y);
        } else {
            context.lineTo( x, y);

        }

    }


    context.stroke();

    context.beginPath();


    for (let x = 0;x <= canvas.width; x += 5) {

        let y = getTrackY(x) + 30;


        if ( x === 0) {
            context.moveTo(x,y);
        } else {
            context.lineTo(x,y);

        }

    }


    context.stroke();


    context.strokeStyle ="#6b4f32";

    context.lineWidth = 4;


    for (let x = 0; x <= canvas.width;  x += 35) {

        let y = getTrackY(x);


        context.beginPath();

        context.moveTo(x, y - 40);

        context.lineTo(x,y + 40);

        context.stroke();

    }

}


function drawSolar() {

    context.fillStyle ="rgba(255, 215, 0, 0.25)";

    context.fillRect(

        solar.x,
        solar.y,
        solar.width,
        solar.height

    );


    context.fillStyle ="yellow";

    context.font ="16px Arial";

    context.fillText(
        "SOLAR",
        solar.x + 45,
        solar.y + 25

    );

}


function checkSolarCharging() {

    let touchingSolar =

        train.x <
            solar.x +
            solar.width &&

        train.x +
            train.width >
            solar.x &&

        train.y <
            solar.y +
            solar.height &&

        train.y +
            train.height >
            solar.y;


    if ( touchingSolar ) {
        train.battery += 0.15;


        if (train.battery > 100 ) {

            train.battery = 100;

        }

    }

}


function checkWarehouse() {

    for (let warehouse of warehouseList) {

        let touchingWarehouse =

            train.x <
                warehouse.x +
                warehouse.width &&

            train.x +
                train.width >
                warehouse.x &&

            train.y <
                warehouse.y +
                warehouse.height &&

            train.y +
                train.height >
                warehouse.y;


        if ( touchingWarehouse) {

if ( warehouse.foodCargo > 0 && train.cargo === 0) {

    train.cargo = warehouse.foodCargo;

    warehouse.foodCargo = 0;

    score += 500;

    lastWarehouse = warehouse.name;

    warehouse.visited = true;

}


else if (train.cargo > 0 && warehouse.name !== lastWarehouse) {
    score += train.cargo * 100;

    train.cargo = 0;

    warehouse++;

    warehouse.visited = true;

    lastWarehouse = warehouse.name;

}

}

    }

}


function checkObstacles() {

    for (let obstacle of obstacles ) {

        let touchingObstacle =

            train.x <
                obstacle.x +
                obstacle.width &&

            train.x +
                train.width >
                obstacle.x &&

            train.y <
                obstacle.y +
                obstacle.height &&

            train.y +
                train.height >
                obstacle.y;


        if (touchingObstacle && obstacle.hit === false) {
            obstacle.hit = true;

            if ( obstacle.type === "tree") {

                train.vx = 0;

                score -= 100;

            }


            if (obstacle.type === "wildlife" ) {

                train.vx = 0;

                score -= 200;

            }

        }

    }

}

function checkGameOver() {

    if (train.battery <= 0) {

        train.battery = 0;


        updateHighScore();


        gameState = "gameover";


        gameScreen.classList.add( "hidden" );


        gameOverScreen.classList.remove( "hidden");


        document.querySelector("#finalScore").textContent = score;


        document.querySelector("#finalDistance").textContent = distance.toFixed(1) +" km";


        document.querySelector("#finalWarehouse").textContent = warehouse;

        document.querySelector("#finalEfficiency").textContent = efficiency.toFixed(2);


        document.querySelector("#finalHighScore").textContent = highScore;
    

    }

}


function updateHUD() {

    document.querySelector("#score").textContent = score;


      document.querySelector("#highScore").textContent = highScore;

    

    document.querySelector("#battery").textContent =Math.round( train.battery) + "%";


    document.querySelector("#distance").textContent =distance.toFixed(1) +" km";


    document.querySelector("#warehouse").textContent = warehouse;


    document.querySelector("#cargo").textContent = train.cargo;

     document.querySelector("#efficiency").textContent = efficiency.toFixed(2);


}



function drawGame() {

    train.update(keys);


    updateDistance();

    updateEfficiency();

    context.clearRect(0, 0, canvas.width,canvas.height

    );


    drawBackground();

    drawRailway();

    drawSolar();


    for (let warehouse of warehouseList) {

        warehouse.draw(context);

    }


    for ( let obstacle of obstacles) {

        obstacle.draw(context);

    }


    checkSolarCharging();

    checkWarehouse();

    checkObstacles();

    checkGameOver();


    train.draw(context);


    updateHUD();

}


function resetGame() {

    train.x = 100;

    train.y = getTrackY(100) - train.height;

    train.vx = 0;

    train.vy = 0;

    train.battery = 100;

    train.cargo = 0;

    train.angle = 0;


    score = 0;

    distance = 0;

    warehouse = 0;

    efficiency = 0;

    startingBattery = 100;

    lastWarehouse = "";


    for (let obstacle of obstacles) {

        obstacle.hit = false;

    }


    warehouseList[0].foodCargo = 4;

    warehouseList[0].visited = false;


    warehouseList[1].foodCargo = 5;

    warehouseList[1].visited = false;


    updateWorldPositions();

}


function restartGame() {

    resetGame();


    gameState = "playing";


    startScreen.classList.add("hidden");


    pauseScreen.classList.add("hidden");


    gameOverScreen.classList.add("hidden");


    gameScreen.classList.remove("hidden");

}


pauseButton.addEventListener("click",function() {

        if (gameState ==="playing") {
            gameState ="paused";

            gameScreen.classList.add("hidden");


            pauseScreen.classList.remove("hidden");

        }

    }
);


resumeButton.addEventListener("click",function() {

        gameState ="playing";

        pauseScreen.classList.add( "hidden" );

        gameScreen.classList.remove("hidden");

    }
);


restartButton.addEventListener( "click",function() {

        restartGame();

    }
);

pauseRestartButton.addEventListener("click",function() {

        restartGame();

    }
);



gameOverRestartButton.addEventListener("click",function() {

        restartGame();

    }
);


function gameLoop() {

    if (gameState ==="playing") {

        drawGame();

    }


    requestAnimationFrame( gameLoop);

}

gameLoop();