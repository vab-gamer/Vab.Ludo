class VabLudo {

constructor(){

this.canvas = document.getElementById("board");
this.ctx = this.canvas.getContext("2d");

this.tile = 600/15;
this.currentPlayer = 0;
this.diceValue = 0;
this.gameMode = "human";
this.history = [];

this.safePositions = [0,8,13,21,26,34,39,47];

this.path = this.generatePath();

this.initTokens();
this.initEvents();
this.updateUI();
this.gameLoop();
}

/* ---------------- TOKEN SETUP ---------------- */

initTokens(){
this.tokens=[];
for(let p=0;p<4;p++){
let arr=[];
for(let t=0;t<4;t++){
arr.push({
pos:-1,
eligible:false,
negativeCharges:2
});
}
this.tokens.push(arr);
}
}

/* ---------------- EVENTS ---------------- */

initEvents(){

document.getElementById("rollBtn").onclick=()=>this.rollDice();
document.getElementById("negativeBtn").onclick=()=>this.rollDice(true);
document.getElementById("resetBtn").onclick=()=>this.reset();
document.getElementById("undoBtn").onclick=()=>this.undo();
document.getElementById("newGameBtn").onclick=()=>this.reset();

document.querySelectorAll(".mode-btn").forEach(btn=>{
btn.onclick=(e)=>{
document.querySelectorAll(".mode-btn").forEach(b=>b.classList.remove("active"));
e.target.classList.add("active");
this.gameMode=e.target.dataset.mode;
this.reset();
};
});

this.canvas.onclick=()=>this.autoMove();
}

/* ---------------- DICE ---------------- */

rollDice(forceNegative=false){

if(this.diceValue!==0) return;

let currentTokens=this.tokens[this.currentPlayer];

if(forceNegative){
this.diceValue=-(Math.floor(Math.random()*3)+1);
}
else{
let negAvailable=currentTokens.some(t=>t.pos>0 && t.eligible && t.negativeCharges>0);

if(negAvailable && Math.random()<0.2){
this.diceValue=-(Math.floor(Math.random()*3)+1);
}
else{
this.diceValue=Math.floor(Math.random()*6)+1;
}
}

document.getElementById("dice").textContent=
this.diceValue>0?this.diceValue:`-${Math.abs(this.diceValue)}`;

this.updateUI();
}

/* ---------------- MOVE ---------------- */

autoMove(){

if(this.diceValue===0) return;

let tokens=this.tokens[this.currentPlayer];

for(let token of tokens){

if(this.canMove(token)){
this.saveState();
this.moveToken(token);
this.afterMove();
return;
}
}

this.diceValue=0;
this.nextTurn();
}

canMove(token){

if(token.pos===-1 && this.diceValue===6) return true;

if(token.pos>=0){
let newPos=token.pos+this.diceValue;
if(newPos<0) return false;
return true;
}

return false;
}

moveToken(token){

if(token.pos===-1 && this.diceValue===6){
token.pos=this.currentPlayer*13;
}
else{
token.pos+=this.diceValue;
if(token.pos<0) token.pos=0;
if(token.pos>=this.path.length) token.pos=this.path.length;
}

if(token.pos>0) token.eligible=true;

this.handleCapture(token);
}

/* ---------------- CAPTURE ---------------- */

handleCapture(movedToken){

if(this.safePositions.includes(movedToken.pos)) return;

for(let p=0;p<4;p++){

if(p===this.currentPlayer) continue;

for(let token of this.tokens[p]){

if(token.pos===movedToken.pos){
token.pos=-1;
token.eligible=false;
token.negativeCharges=2;
}
}
}
}

/* ---------------- TURN ---------------- */

afterMove(){

if(this.checkWin()) return;

if(this.diceValue!==6){
this.nextTurn();
}

this.diceValue=0;
this.updateUI();

if(this.gameMode==="bot" && this.currentPlayer!==0){
setTimeout(()=>this.botMove(),700);
}
}

botMove(){
this.rollDice();
setTimeout(()=>this.autoMove(),500);
}

nextTurn(){
this.currentPlayer=(this.currentPlayer+1)%4;
}

/* ---------------- WIN ---------------- */

checkWin(){

let win=this.tokens[this.currentPlayer]
.every(t=>t.pos>=this.path.length);

if(win){
document.getElementById("winText").textContent=
`Player ${this.currentPlayer+1} Wins! 🎉`;
document.getElementById("winModal").style.display="flex";
return true;
}
return false;
}

/* ---------------- UNDO ---------------- */

saveState(){
this.history.push(JSON.stringify(this.tokens));
}

undo(){
if(this.history.length>0){
this.tokens=JSON.parse(this.history.pop());
this.updateUI();
}
}

/* ---------------- RESET ---------------- */

reset(){
this.initTokens();
this.currentPlayer=0;
this.diceValue=0;
this.history=[];
document.getElementById("winModal").style.display="none";
this.updateUI();
}

/* ---------------- UI ---------------- */

updateUI(){
document.getElementById("turn").textContent=
`Player ${this.currentPlayer+1}'s Turn`;

let info="";
this.tokens[this.currentPlayer].forEach((t,i)=>{
info+=`Token ${i+1}: ${t.pos}<br>`;
});
document.getElementById("tokens-status").innerHTML=info;
}

/* ---------------- BOARD DRAWING ---------------- */

generatePath(){

let path=[];

// top
for(let i=1;i<14;i++) path.push([i,6]);

// right
for(let i=6;i<14;i++) path.push([8,i]);

// bottom
for(let i=13;i>0;i--) path.push([i,8]);

// left
for(let i=8;i>0;i--) path.push([6,i]);

return path;
}

drawYard(startX,startY,color){

this.ctx.fillStyle=color;
this.ctx.fillRect(startX,startY,6*this.tile,6*this.tile);

this.ctx.fillStyle="#ffffff";
this.ctx.fillRect(startX+this.tile,startY+this.tile,4*this.tile,4*this.tile);

const circlePos=[
[2,2],[4,2],[2,4],[4,4]
];

circlePos.forEach(pos=>{
this.ctx.beginPath();
this.ctx.arc(
(startX/this.tile+pos[0])*this.tile,
(startY/this.tile+pos[1])*this.tile,
this.tile/3,0,Math.PI*2
);
this.ctx.fillStyle=color;
this.ctx.fill();
this.ctx.stroke();
});
}

drawBoard(){

this.ctx.clearRect(0,0,600,600);

// background
this.ctx.fillStyle="#ffffff";
this.ctx.fillRect(0,0,600,600);

// yards
this.drawYard(0,0,"#FF4444");
this.drawYard(9*this.tile,0,"#4169E1");
this.drawYard(9*this.tile,9*this.tile,"#32CD32");
this.drawYard(0,9*this.tile,"#FFD700");

// grid
this.ctx.strokeStyle="#000";
for(let i=0;i<15;i++){
for(let j=0;j<15;j++){
this.ctx.strokeRect(i*this.tile,j*this.tile,this.tile,this.tile);
}
}

// center
this.ctx.beginPath();
this.ctx.moveTo(7.5*this.tile,7.5*this.tile);
this.ctx.lineTo(7.5*this.tile,6*this.tile);
this.ctx.lineTo(6*this.tile,7.5*this.tile);
this.ctx.fillStyle="#FF4444";
this.ctx.fill();

this.ctx.beginPath();
this.ctx.moveTo(7.5*this.tile,7.5*this.tile);
this.ctx.lineTo(9*this.tile,7.5*this.tile);
this.ctx.lineTo(7.5*this.tile,6*this.tile);
this.ctx.fillStyle="#4169E1";
this.ctx.fill();

this.ctx.beginPath();
this.ctx.moveTo(7.5*this.tile,7.5*this.tile);
this.ctx.lineTo(7.5*this.tile,9*this.tile);
this.ctx.lineTo(9*this.tile,7.5*this.tile);
this.ctx.fillStyle="#32CD32";
this.ctx.fill();

this.ctx.beginPath();
this.ctx.moveTo(7.5*this.tile,7.5*this.tile);
this.ctx.lineTo(6*this.tile,7.5*this.tile);
this.ctx.lineTo(7.5*this.tile,9*this.tile);
this.ctx.fillStyle="#FFD700";
this.ctx.fill();

this.drawTokens();
}

drawTokens(){

const colors=["#FF4444","#4169E1","#32CD32","#FFD700"];

this.tokens.forEach((playerTokens,p)=>{

playerTokens.forEach((token,index)=>{

let x,y;

if(token.pos===-1){

const yardMap=[[2,2],[4,2],[2,4],[4,4]];

let baseX=(p===1||p===2)?9:0;
let baseY=(p===2||p===3)?9:0;

x=(baseX+yardMap[index][0])*this.tile;
y=(baseY+yardMap[index][1])*this.tile;
}
else{
let pos=this.path[token.pos%this.path.length];
x=pos[0]*this.tile+this.tile/2;
y=pos[1]*this.tile+this.tile/2;
}

this.ctx.beginPath();
this.ctx.arc(x,y,this.tile/3,0,Math.PI*2);
this.ctx.fillStyle=colors[p];
this.ctx.fill();
this.ctx.stroke();
});
});
}

/* ---------------- LOOP ---------------- */

gameLoop(){
this.drawBoard();
requestAnimationFrame(()=>this.gameLoop());
}

}

new VabLudo();
