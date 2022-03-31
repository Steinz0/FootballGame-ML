import * as settings from './settings.js'
import  {Player, Ball} from './classes.js'

let ball
let allPlayers = []
let blueTeam = []
let redTeam = []
let score = [0,0]
let play = false
let filename = 'file_data'

const Application = PIXI.Application;

const stadium = new Application({
	width: 1200,
	height: 700,
	backgroundColor: 0xAAFFAA
})

const graphics = new PIXI.Graphics();
graphics.lineStyle(15, 0xffd900, 1);
graphics.moveTo(0, 0);
graphics.lineTo(0, settings.FIELDHEIGTH);
graphics.lineTo(settings.FIELDWIDTH, settings.FIELDHEIGTH);
graphics.lineTo(settings.FIELDWIDTH, 0);
graphics.lineTo(0, 0);

// Center line
graphics.lineStyle(8, 0xffd900, 1);
graphics.moveTo(settings.FIELDWIDTH / 2, 0)
graphics.lineTo(settings.FIELDWIDTH / 2, settings.FIELDHEIGTH)

// Center circle
graphics.lineStyle(8, 0xffd900, 1);
graphics.drawCircle(settings.FIELDWIDTH / 2, settings.FIELDHEIGTH / 2, 100)

// Goal posts
graphics.lineStyle(20, 0x808080, 1);
graphics.moveTo(0, settings.FIELDHEIGTH / 2 - settings.GOALHEIGTH / 2)
graphics.lineTo(0, settings.FIELDHEIGTH / 2 + settings.GOALHEIGTH / 2)
graphics.moveTo(settings.FIELDWIDTH, settings.FIELDHEIGTH / 2 - settings.GOALHEIGTH / 2)
graphics.lineTo(settings.FIELDWIDTH, settings.FIELDHEIGTH / 2 + settings.GOALHEIGTH / 2)

stadium.stage.addChild(graphics);

// Adding to the window 
document.body.appendChild(stadium.view)

stadium.loader.baseUrl = '/public/img'
stadium.loader
	.add('blue', 'blueSquare.png')
	.add('red', 'redSquare.png')
	.add('ball', 'football.png')

stadium.loader.onProgress.add(show);
stadium.loader.onComplete.add(doneLoading);
stadium.loader.load();

const btn = document.getElementsByClassName("breplay")[0]; 
btn.addEventListener("click", onOffPlay);


const submit = document.getElementsByClassName("submit-button")[0]; 
submit.addEventListener("click", insertData);

const testB = document.getElementsByClassName("test")[0]; 
testB.addEventListener("click", getDataMatches);

const fileB = document.getElementsByClassName("file-button")[0]; 
fileB.addEventListener("click", setFilename);

function show(e) {
	console.log(e.progress)
}

function doneLoading() {
	createPlayer()
	ball = new Ball(settings.FIELDWIDTH / 2, settings.FIELDHEIGTH / 2, stadium.loader.resources['ball'].texture, 'ball')
	stadium.stage.addChild(ball)

	stadium.ticker.add(gameLoop)
	getDataMatches()
}

function createPlayer() {

	// Blue team creation
	for (let i=0; i<settings.NUMBEROFPLAYERSBYTEAM; i++){
		// Player creation
		let player = new Player('Blue', '1', 100 , 100 + (i*10), 'none', 'blue', stadium.loader.resources['blue'].texture)

		allPlayers.push(player)
		blueTeam.push(player)
		// Adding the player to the stage
		stadium.stage.addChild(player)
		stadium.stage.addChild(player.directLine)
	}

	// Red team creation
	for (let i=0; i<settings.NUMBEROFPLAYERSBYTEAM; i++){
		// Player creation
		let player = new Player('Red', '1', 200 , 200 + (i*10), 'none', 'red', stadium.loader.resources['red'].texture)

		allPlayers.push(player)
		redTeam.push(player)

		// Adding the player to the stage
		stadium.stage.addChild(player)
		stadium.stage.addChild(player.directLine)
	}
}

function gameLoop(delta) {
	if (play){
		playGameFile()
	}else{
		setSituation()
	}
	allPlayers.forEach(function (e, i) {
		drawLine(e.directLine, e.x, e.y, e.speed.x, e.speed.y)
	})
	drawLine(ball.directLine, ball.x, ball.y, ball.speed.x, ball.speed.y)
}

// Util functions
// Drawing a line using a PIXI.Graphics component, a position (x, y) and a direction (vectx, vecty)
function drawLine(obj, x, y, vectx, vecty) {
	obj.clear()
	obj.lineStyle(2, 0x000000);
    obj.moveTo(x,y);
    obj.lineTo(x + (vectx * 10), y + (vecty * 10));
}


function setFilename(file) {
	filename = document.querySelector('#file').value
}
function setSituation() {
	let x = document.getElementsByClassName("slider").myRange.value
	document.getElementsByClassName("slider").myRange.disabled = false
	document.getElementsByClassName("breplay")[0].disabled = false
	let rawFile = new XMLHttpRequest()
    rawFile.open("GET", `logsGames/${filename}.txt`, false)
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                let allText = rawFile.responseText.split("\n")			
				// let checker = allText[0].split("\r")[0]
				let coords = allText.slice(1, allText.length)
				setValues(coords[x])
            }
        }
    }
    rawFile.send(null);
}

function onOffPlay() {

	const breplay = document.getElementById("breplay");

	if (play){
		play = false;
		breplay.innerText = "PLAY";
		console.log('play')
	}else{
		play = true;
		breplay.innerText = "PAUSE";
		console.log('pause')
	}
}
function playGameFile() {
	document.getElementsByClassName("slider").myRange.value = parseInt(document.getElementsByClassName("slider").myRange.value) + 1
	setSituation()
}

function setValues(coords) {
	if (coords != undefined){
		let c = coords.split(" ")
		
		score = c
		document.getElementById("blueTeamScore").innerHTML = c[1]
		document.getElementById("redTeamScore").innerHTML = c[0]

		let ball_c = c.slice(2, 6)
		let reds_c = c.slice(6, 6 + redTeam.length*4)
		let blues_c = c.slice(6 + redTeam.length*4, 6 + redTeam.length*4 + blueTeam.length*4)

		ball.position.x = ball_c[0]
		ball.position.y = ball_c[1]
		ball.speed.x = ball_c[2]
		ball.speed.y = ball_c[3]
		for (let i=0; i<redTeam.length; i++) {
			redTeam[i].position.x = reds_c[i*4]
			redTeam[i].position.y = reds_c[i*4+1]
			redTeam[i].speed.x = reds_c[i*4+2]
			redTeam[i].speed.y = reds_c[i*4+3]
		}
		for (let i=0; i<blueTeam.length; i++) {
			blueTeam[i].position.x = blues_c[i*4]
			blueTeam[i].position.y = blues_c[i*4+1]
			blueTeam[i].speed.x = blues_c[i*4+2]
			blueTeam[i].speed.y = blues_c[i*4+3]
		}
	}
}

function arrayToOption(arr, selectId) {
	(e1 => (
		(e1 = document.querySelector('#' + selectId)),
		(e1.innerHTML = '')
		(e1.innerHTML += arr.map(item => `<option> ${item} </option>`).join(''))
	))();
}
async function getDataMatches(){
    await axios.get('http://localhost:3000/db')
    .then((data) => {
		arrayToOption(data.data.msg, 'file')
    })
    .catch((err) => {
      	console.log(err)
    })


}

async function insertData(userId){
	const ballCoord = [ball.position.x, ball.position.y]
	const redCoords = []
	const blueCoords = []
	for (let i=0; i<redTeam.length; i++) {
		redCoords.push([redTeam[i].position.x, redTeam[i].position.y])
		blueCoords.push([blueTeam[i].position.x, blueTeam[i].position.y])
	}
	const actualPlayer = [document.querySelector('#x').innerHTML, document.querySelector('#y').innerHTML]
	const order = document.querySelector('#choose').value;

	const data = {
		userId: userId,
        ballCoord: ballCoord,
        redCoords: redCoords,
        blueCoords: redCoords,
        score: score,
        actualPlayer: actualPlayer,
        order: order
    }
	console.log(data)
	await axios.post('http://localhost:3000/db', data)
    .then((data) => {
      console.log(data)
    })
    .catch((err) => {
      console.log(err)
    })
}