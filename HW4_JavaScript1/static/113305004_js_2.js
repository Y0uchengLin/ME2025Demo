document.write('<input type="text" id="screen" readonly><br>');
for (let i = 0; i <= 9; i++) {
  document.write('<button onclick="press(' + i + ')">' + i + '</button>');
  if (i === 4 || i === 9) document.write("<br>");
}
