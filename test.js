script.js
/* Digital Clock + To-Do List */

/* Digital Clock + To-Do List with Real-Time Features */

/* Digital Clock + To-Do List + Real-Time Weather */

const timeEl = document.getElementById('time');
const dateEl = document.getElementById('date');
const ampmEl = document.getElementById('ampm');
const greetingEl = document.getElementById('greeting');
const weatherEl = document.getElementById('weather');
const toggleFormatBtn = document.getElementById('toggleFormat');
const toggleSecondsBtn = document.getElementById('toggleSeconds');
const syncNowBtn = document.getElementById('syncNow');

let showSeconds = true;
let use24Hour = true;

// Clock + Greeting
function pad(n){return n<10?'0'+n:n;}
function getGreeting(h){
  if(h<12) return "Good Morning ☀️";
  if(h<17) return "Good Afternoon 🌤️";
  if(h<20) return "Good Evening 🌆";
  return "Good Night 🌙";
}
function updateClock(){
  const now = new Date();
  let h=now.getHours(), m=now.getMinutes(), s=now.getSeconds(), ampm='';
  if(!use24Hour){ampm=h>=12?'PM':'AM';h=h%12||12;ampmEl.textContent=ampm;}
  else ampmEl.textContent='';
  timeEl.textContent = showSeconds?`${pad(h)}:${pad(m)}:${pad(s)}`:`${pad(h)}:${pad(m)}`;
  greetingEl.textContent = getGreeting(now.getHours());
  dateEl.textContent = now.toLocaleDateString(undefined,{weekday:'long',year:'numeric',month:'short',day:'numeric'});
}
setInterval(updateClock,1000); updateClock();
toggleFormatBtn.onclick=()=>{use24Hour=!use24Hour;toggleFormatBtn.textContent=use24Hour?'24-hour':'12-hour';};
toggleSecondsBtn.onclick=()=>{showSeconds=!showSeconds;toggleSecondsBtn.textContent=showSeconds?'Hide seconds':'Show seconds';};
syncNowBtn.onclick=updateClock;

// Weather API
const API_KEY = e4a9a30d8aacfd8e4bd6e170013c6fb4; // 👈 Replace with your OpenWeatherMap API key

async function fetchWeather(lat, lon){
  try{
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`);
    const data = await res.json();
    const temp = Math.round(data.main.temp);
    const cond = data.weather[0].main;
    const city = data.name;
    weatherEl.textContent = `${city}: ${temp}°C • ${cond}`;
  }catch(e){
    weatherEl.textContent = "Unable to fetch weather 🌧️";
  }
}
function getWeather(){
  if(!navigator.geolocation){
    weatherEl.textContent="Location not supported ❌";
    return;
  }
  navigator.geolocation.getCurrentPosition(
    pos=>{
      const {latitude,longitude}=pos.coords;
      fetchWeather(latitude,longitude);
      setInterval(()=>fetchWeather(latitude,longitude),600000); // update every 10min
    },
    ()=>weatherEl.textContent="Location access denied ❌"
  );
}
getWeather();

// --- To-Do List ---
const STORAGE_KEY='todoTasks_v3';
const input=document.getElementById('taskInput');
const addBtn=document.getElementById('addBtn');
const listEl=document.getElementById('taskList');
const clearAllBtn=document.getElementById('clearAll');
const clearCompletedBtn=document.getElementById('clearCompleted');
const remaining=document.getElementById('remaining');
const lastSaved=document.getElementById('lastSaved');
let tasks=[];

function loadTasks(){try{tasks=JSON.parse(localStorage.getItem(STORAGE_KEY))||[];}catch{tasks=[];}}
function saveTasks(){localStorage.setItem(STORAGE_KEY,JSON.stringify(tasks));lastSaved.textContent="Saved "+new Date().toLocaleTimeString();}
function render(){
  listEl.innerHTML='';
  if(tasks.length===0){
    listEl.innerHTML='<div style="color:#94a3b8;padding:18px;text-align:center">No tasks yet — add one above.</div>';
  } else {
    tasks.forEach(t=>{
      const div=document.createElement('div');
      div.className='task'+(t.completed?' done':'');
      const text=document.createElement('div'); text.className='text'; text.textContent=t.text;
      const actions=document.createElement('div');
      const done=document.createElement('button'); done.className='icon-btn'; done.textContent='✓'; done.onclick=()=>toggleComplete(t.id);
      const del=document.createElement('button'); del.className='icon-btn'; del.textContent='🗑'; del.onclick=()=>deleteTask(t.id);
      actions.append(done,del);
      div.append(text,actions);
      listEl.appendChild(div);
    });
  }
  remaining.textContent=tasks.filter(t=>!t.completed).length;
}
function addTask(txt){const text=txt.trim();if(!text)return;tasks.unshift({id:'t'+Date.now(),text,completed:false});saveTasks();render();input.value='';}
function toggleComplete(id){const t=tasks.find(x=>x.id===id);if(t)t.completed=!t.completed;saveTasks();render();}
function deleteTask(id){tasks=tasks.filter(t=>t.id!==id);saveTasks();render();}
clearAllBtn.onclick=()=>{if(confirm('Delete all tasks?')){tasks=[];saveTasks();render();}};
clearCompletedBtn.onclick=()=>{tasks=tasks.filter(t=>!t.completed);saveTasks();render();};
addBtn.onclick=()=>addTask(input.value);
input.onkeydown=e=>{if(e.key==='Enter')addTask(input.value);};
loadTasks();render();
