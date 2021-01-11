const { Console } = require('console')
const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
// 方法uuidV4 - 获取一个独一无二的房间id - 使用uuid模块
const { v4: uuidV4 } = require('uuid')

app.set('view engine', 'ejs')
app.use(express.static('public'))

// 如果进入主页 自动创建一个拥有独立房间号的房间 并跳转到该房间
app.get('/', (req, res) => {
    res.redirect(`/${uuidV4()}`)
})

// 如果进入特定房间 则跳转到该房间
app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room})
})

// 接到了一个socket链接并且传入的是room id和user id时，就运行join-room内的所有内容
io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId)
        // 向除了自己的所有人广播
        socket.to(roomId).broadcast.emit('user-connected', userId)
        // 向所有人广播断开连接
        socket.on('disconnect', () => {
            socket.to(roomId).broadcast.emit('user-disconnected', userId)
        })
    })
})
// 该服务部署在3000端口
server.listen(3000)