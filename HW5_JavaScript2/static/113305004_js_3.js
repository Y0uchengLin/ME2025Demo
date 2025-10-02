var ans = Math.floor(Math.random() * 101);
var guesstime = 1;
var startTime = null;

function guess() {
    let inp = parseInt(document.getElementById("input_1").value);

    if (guesstime === 1) {
        startTime = new Date();
    }

    if (inp > ans) {
        document.getElementById("message").textContent = "太大了，再試一次";
        guesstime++;
    }
    else if (inp < ans) {
        document.getElementById("message").textContent = "太小了，再試一次";
        guesstime++;
    }
    else {
        let endTime = new Date();
        let diffSec = Math.floor((endTime - startTime) / 1000);
        alert("恭喜猜對，共猜了 " + guesstime + " 次，耗時 " + diffSec + " 秒");

        guesstime = 1;
        ans = Math.floor(Math.random() * 101);
        document.getElementById("message").textContent = "新遊戲開始！請輸入數字";
    }
}