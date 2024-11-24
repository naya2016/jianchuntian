function search() {
	window.open(
		document.getElementById("search_form").getAttribute("action_e") +
			" " +
			document.getElementById("search_value").value
	);
	return false;
}

let display = false;
function displayAll() {
	let elements = document.querySelectorAll(".catalogue .hidden");
	if (!display) {
		for (let elem of elements) {
			elem.style.display = "block";
			display = true;
		}
	} else {
		for (let elem of elements) {
			elem.style.display = "none";
			display = false;
		}
	}
}

document.onkeydown = function(e) {
    if(e.keyCode == 123) {
        alert("F12审查元素已被禁用！");
        return false;
    }
    if(e.ctrlKey && e.shiftKey && e.keyCode == 'I'.charCodeAt(0)) {
        alert("F12审查元素已被禁用！");
        return false;
    }
    if(e.ctrlKey && e.shiftKey && e.keyCode == 'C'.charCodeAt(0)) {
        alert("F12审查元素已被禁用！");
        return false;
    }
    if(e.ctrlKey && e.shiftKey && e.keyCode == 'J'.charCodeAt(0)) {
        alert("F12审查元素已被禁用！");
        return false;
    }
    if(e.ctrlKey && e.keyCode == 'U'.charCodeAt(0)) {
        alert("查看源代码已被禁用！");
        return false;
    }
}

// 检测用户是否打开了开发者工具
function checkDevTools() {
	if (window.outerWidth - window.innerWidth > 160 || window.outerHeight - window.innerHeight > 160) {
	  alert('请不要打开开发者工具！');
	}
  }
  
  // 每隔一段时间检测一次
  setInterval(checkDevTools, 1000);

// 定义全局变量用于控制相关功能
window.noPrint = true; // 禁止打印
window.noCopy = true;  // 禁止复制/粘贴
window.noScreenshot = true; // 禁止截图
window.autoBlur = true; // 自动模糊

// 引入外部的js文件（这里的引入路径需根据实际情况保证可正确访问到该文件）
const script = document.createElement('script');
script.src = 'https://pdfanticopy.com/noprint.js';
document.head.appendChild(script);
