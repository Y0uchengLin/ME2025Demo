document.write('<input type="text" id="screen" readonly><br>');
for (let i = 0; i <= 9; i++) {
  document.write('<button onclick="press(' + i + ')">' + i + '</button>');
  if (i === 4 || i === 9) document.write("<br>");
}
let ops = ["+", "-", "*", "/","(",")"];
for (let op of ops) {
  document.write('<button onclick="press(\'' + op + '\')">' + op + '</button>');
}
document.write("<br>");
document.write('<button onclick="calculate()">=</button>');
document.write('<button onclick="clearScreen()">clear</button>');
function press(val) {
  document.getElementById("screen").value += val;
}

function calculate() {
  let exp = document.getElementById("screen").value;
  let ans = eval(exp);
  alert(exp + " = " + ans);
  document.getElementById("screen").value = ans;
}

function clearScreen() {
  document.getElementById("screen").value = "";
}
