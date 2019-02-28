console.log('connect.js loaded')

cnct=function(){
    // ini
    console.log('ini at '+Date())
    let div = document.body.querySelector('#connectDiv')
    if(div){cnct.UI(div)}
}

cnct.UI=function(div){
    let h = '<h3>API status</h3>'
    h += '<input size=50> <button>Send</button>'
    h += '<textarea stylw="width:500px"></textarea>'
    
    div.innerHTML=h
}

window.onload=cnct