var ans = Math.floor(Math.random() * 101);
var guesstime = 1;
var startTime = null;
var timer = null;
var seconds = 0;

function startTimer() {
    if (timer) return;
    timer = setInterval(function() {
        seconds++;
        document.getElementById("timer").textContent = "計時：" + seconds + " 秒";
    }, 1000);
}

function stopTimer() {
    clearInterval(timer);
    timer = null;
}

function guess() {
    let inp = parseInt(document.getElementById("input_1").value);

    if (guesstime === 1 && !timer) {
        startTime = new Date();
        startTimer();
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
        stopTimer();
        let totalTime = seconds;
        alert("恭喜猜對，共猜了 " + guesstime + " 次，耗時 " + totalTime + " 秒");

        let record = document.createElement("div");
        record.textContent = "次數：" + guesstime +
                             "，耗時：" + totalTime + " 秒" +
                             "，完成時間：" + new Date().toLocaleTimeString();
        document.getElementById("records").appendChild(record);

        guesstime = 1;
        ans = Math.floor(Math.random() * 101);
        seconds = 0;
        document.getElementById("timer").textContent = "計時：0 秒";
        document.getElementById("message").textContent = "新遊戲開始！";
    }
}
