var box = document. getElementsByClassName( 'soundbarbox')[ 0]
var bar = document. getElementsByClassName( 'soundbar')[ 0]
var all = document. getElementsByClassName( 'soundbararea')[ 0]
var p = document. getElementsByClassName( 'soubdbartext')[ 0]
var cha = bar. offsetWidth - box. offsetWidth
box. onmousedown = function ( ev) {
let boxL = box. offsetLeft
let e = ev || window. event //兼容性
let mouseX = e. clientX //鼠标按下的位置
window. onmousemove = function ( ev) {
let e = ev || window. event
let moveL = e. clientX - mouseX //鼠标移动的距离
let newL = boxL + moveL //left值
// 判断最大值和最小值
if ( newL < 0) {
newL = 0
}
if ( newL >= cha) {
newL = cha
}
// 改变left值
box. style. left = newL + 'px'
// 计算比例
let bili = newL / cha * 100
p. innerHTML = '当前位置' + Math. ceil( bili) + '%'
return false //取消默认事件
}
window. onmouseup = function () {
window. onmousemove = false //解绑移动事件
return false
}
return false
};
// 点击音量条
bar. onclick = function ( ev) {
let left = ev. clientX - all. offsetLeft - box. offsetWidth / 2
if ( left < 0) {
left = 0
}
if ( left >= cha) {
left = cha
}
box. style. left = left + 'px'
let bili = left / cha * 100
p. innerHTML = '当前位置' + Math. ceil( bili) + '%'
console. log( left)
return false
}