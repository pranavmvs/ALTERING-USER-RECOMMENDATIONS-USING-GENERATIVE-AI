// const extensions = 'https://developer.chrome.com/docs/extensions'
// const webstore = 'https://developer.chrome.com/docs/webstore'

// chrome.runtime.onInstalled.addListener(() => {
//   chrome.action.setBadgeText({
//     text: "OFF",
//   });
// });

// chrome.action.onClicked.addListener(async (tab) => {
//   if (tab.url.startsWith(extensions) || tab.url.startsWith(webstore)) {
//     // Retrieve the action badge to check if the extension is 'ON' or 'OFF'
//     const prevState = await chrome.action.getBadgeText({ tabId: tab.id });
//     // Next state will always be the opposite
//     const nextState = prevState === 'ON' ? 'OFF' : 'ON'
    
//     if (nextState === "ON") {
//       // Insert the CSS file when the user turns the extension on
//       await chrome.scripting.insertCSS({
//         files: ["focus-mode.css"],
//         target: { tabId: tab.id },
//       });
//     } else if (nextState === "OFF") {
//       // Remove the CSS file when the user turns the extension off
//       await chrome.scripting.removeCSS({
//         files: ["focus-mode.css"],
//         target: { tabId: tab.id },
//       });
//     }

//     // Set the action badge to the next state
//     await chrome.action.setBadgeText({
//       tabId: tab.id,
//       text: nextState,
//     });
//   }
  
// });

//Message receiving function
function gotMessage (message, sender, sendResponse) {
  console.log(message)
  if(message.mode=="duration"){
    console.log('video duration is: '+message.text)
    processTimeDuration(message.text)
  }
  
}
chrome.runtime.onMessage.addListener(gotMessage)

//Message Sending function
function sendData(mode,text){
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if(!tabs[0].url.includes('https://www.youtube.com')) {
      alert('please go to https://www.youtube.com')
      return
    }
    
    // const payload = {
    //   "mode": mode,
    //   "text": text
    // }
    let payload={"mode":mode}
    if(mode=="results"){
      payload["vidNum"]=text
    }
    else if(mode=="input"){
      payload["text"]=text
    }

    console.log(payload)
    chrome.tabs.sendMessage(tabs[0].id, payload);
  });
}
let queryIndex=-1
let queries=[]
let loader=document.querySelector('.loading-icon')
let but=document.querySelector('#sendquer')

//Make a query bold to track progress
function highlight(index){
  let items=document.querySelectorAll('.squery')
  for(let i=0;i<items.length;i++){
    console.log(i,index,i==index)
    if(i==index){
      console.log('making '+index+' bold..')
      items[index].classList.add('active')
    }
    else{
      items[index].classList.remove('active')
    }
  }
}

//Start processing here
but.addEventListener('click',async function(){
  currVideoCount=0
  let inp=document.querySelector('#quer')
  // queries=[inp.value,inp.value+' video',inp.value+' videos']
  loader.classList.add('active')
  queries=await getSearchQueries(inp.value)
  console.log(queries)
  loader.classList.remove('active')
  let querycontainer=document.querySelector('#querylist')
  querycontainer.innerHTML=''
  queries.forEach(i=>{
    let temp=document.createElement('p')
    temp.classList.add('squery')
    temp.textContent=i
    querycontainer.appendChild(temp)
  })
  queryIndex=0
  document.querySelectorAll('.squery')[queryIndex].classList.add('active')
  sendData('input',queries[queryIndex])
})


//Call when one query finishes processing
function startNextQuery(){
  console.log("starting Next Query....")
  queryIndex++;
  document.querySelectorAll('.squery').forEach(i=>{
    i.classList.remove('active')
  })
  document.querySelectorAll('.squery')[queryIndex].classList.add('active')
  if(queryIndex>=queries.length)
    return
  sendData('input',queries[queryIndex])
}

let shortSkipper=0;
let skippingShort=false
//What to do when a page loads
chrome.webNavigation.onCompleted.addListener(function(details) {
  
  let flag=0
  flag = chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    console.log(tabs[0].url)
    if(tabs[0].url.slice(0,32)=='https://www.youtube.com/results?'){
      console.log('setting flag....')
      onResultPage()
    }
    else if(tabs[0].url.slice(0,30)=='https://www.youtube.com/watch?'){
        console.log('video mode')
        requestVideoDuration()
    }
    else if(tabs[0].url.slice(0,30)=='https://www.youtube.com/shorts'){
        console.log('WARNING: SHORT DETECTED')
        if(skippingShort==true)
          return
        shortSkipper+=1
        skippingShort=true
        sendData('goBack',-1)
        skippingShort=false
    }
    else{
      flag=0
      console.log('flag removed')
    }
  })
  
},);

let loadcount=0


//Function to request video duration
function requestVideoDuration(){
  sendData('duration',-1)
}

let maxVideoCount=2;
let currVideoCount=0;


//Just after a search is made in the search box
function onResultPage() {
  console.log('currently working on query '+(queryIndex+1)+' out of '+queries.length)
  if(/*loadcount>=1 && */currVideoCount<maxVideoCount){
    console.log("SHORT SKIPPER VALUE:  "+shortSkipper)
    console.log('Executing...')
    selectVideo(currVideoCount+shortSkipper)
    loadcount=0 
  }
  
  
}

//Select a video from results based on index
function selectVideo(i){
  sendData('results',i)
}

//Function to convert video duration to seconds
function processTimeDuration(t){
  let tarr=t.split(':')
  console.log(tarr)
  tarr.reverse()
  let timeduration=0
  let sixty=1
  for(let i=0;i<tarr.length;i++){
    timeduration+=parseInt(tarr[i]*sixty)
    sixty*=60
  }
  console.log('total time: '+timeduration)
  watchVideo(timeduration)
}

let watching=false

//Watch video function
function watchVideo(time){
  if(watching==true)
    return
  console.log('watching '+(currVideoCount+1)+' out of '+maxVideoCount)
  watching=true
  currVideoCount+=1
  // setTimeout(goBack,time*1000)
  setTimeout(goBack,15*1000)
}

//What to do when a video has been watched completely
function goBack(){
  watching=false
  console.log('time\'s up!')
  // if(currVideoCount==maxVideoCount){
  //   currVideoCount=0
  //   sendData('homepage',-1)
  //   return
  // }
  
  if(currVideoCount==maxVideoCount && queryIndex<queries.length-1){
    loadcount=0
    currVideoCount=0
    shortSkipper=0
    startNextQuery()
    return
  }
  else if(currVideoCount==maxVideoCount && queryIndex==queries.length-1){
    sendData('homepage',-1)
    return
  }
  sendData('goBack',-1)

}

// function sendData2(){
//   var port = chrome.tabs.connect({name: "tunnel"});
//   port.postMessage({"mode": 'input',"text": 'hello'})

// }


//Function to make requests to AI Model
async function makePostRequest(url, data) {
  try {
    const response = await fetch(url, {
      method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
      });

      if (!response.ok) {
          throw new Error('Network response was not ok ' + response.statusText);
      }

      let responseData = await response.json();
      console.log(responseData)
      let csv=responseData.generated_text.slice(80).split(',')
      console.log(csv)
      if(csv.length==1)
        return responseData.generated_text.slice(80).split('###')
      return csv
  } catch (error) {
      console.error('There has been a problem with your fetch operation:', error);
  }
}


let url = 'https://a6dd-35-223-255-172.ngrok-free.app/generate';

//Function to get search queries
async function getSearchQueries(text){
  const data = {
      query: 'Generate youtube search queries to alter recommendation for the following data: '+text
  };
  let generated_queries = await makePostRequest(url, data);
  return generated_queries

}



















