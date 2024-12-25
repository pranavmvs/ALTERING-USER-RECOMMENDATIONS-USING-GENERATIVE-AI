function gotMessage (message, sender, sendResponse) {
    console.log(message)
    console.log(message.mode=="results")
    mode=message.mode
    if(mode=='input'){
        window.open('https://youtube.com/results?search_query='+message.text,'_self')
    }
    else if(mode=='results'){
        console.log('selecting video...'+message.vidNum)
        selectVideo(message.vidNum)
    }
    else if(mode=='duration'){
        sendVideoDuration()
    }
    else if(mode=='goBack'){
        history.back()
    }
    else if(mode=='homepage'){
        window.open('https://youtube.com/','_self')
    }

    
}

function selectVideo(i){
    console.log('reached video selector...')
    let p = document.querySelectorAll('#dismissible.style-scope.ytd-video-renderer')[i]
    // console.log(p)
    // console.log(p.children[0])
    // console.log(p.children[0].children[0])
    window.open(p.children[0].children[0].href,'_self')

  }

function sendVideoDuration(){
    let dur=document.querySelector('.ytp-time-duration').textContent
    sendData('duration',dur)
}
chrome.runtime.onMessage.addListener(gotMessage)

function sendData(mode,text) {
    chrome.runtime.sendMessage(message={"mode": mode,"text": text})
}