
var ans = Math.floor(Math.random() * 101);
var guesstime=1;
function guess(){
    let inp = parseInt(document.getElementById("input_1").value);
    if(inp>ans)
    {
        alert("太大了，再試一次");
        guesstime++;
    }
    else if(inp<ans)
    {
        alert("太小了，再試一次");
        guesstime++;
    }
    else
    {
        alert("恭喜猜對，共猜了"+guesstime+"次");
        guesstime=1;
        ans = Math.floor(Math.random() * 101);
    }
}