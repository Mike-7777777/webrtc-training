const { Console } = require("console");
const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
// 方法uuidV4 - 获取一个独一无二的房间id - 使用uuid模块
const { v4: uuidV4 } = require("uuid");
// 使用ejs引擎渲染
app.set("view engine", "ejs");
// 所有js存储在pulic目录下
app.use(express.static("public"));

// 如果进入主页(例如https://localhost/)
// 使用 uuid库 自动创建一个拥有独立房间号的房间 并跳转到该房间
// app.get("/", (req, res) => {
//   res.redirect(`/${uuidV4()}`);
// });
// 计划:将此处render到index.ejs,也就是一个可以输入房间号和用户名的地方.
app.get("/", (req, res) => {
  res.render("intro");
});
app.get("/go", (req, res) => {
  res.render("room", { roomId: req.query.room,  userName: req.query.name});
});
// 如果进入特定房间 则跳转到该房间
// 此处的/:room 是一个变量
// app.get("/:room", (req, res) => {
  // render() 用于将呈现给用户的html传送给客户端
  // 此处'room'的意义是指定绘制的是room.ejs页面
  // res.render("room", { roomId: req.params.room });
  // roomId是一个新的room.ejs的局部变量,赋值为传入的房间号req.params.room
// });

// socket服务端内置事件connection - 任何时候只要有用户连接到服务器,就触发该事件.
io.on("connection", (socket) => {
  // 定义了一个监听事件, 当客户端调用时,运行join-room内的所有内容
  socket.on("join-room", (roomId, userId) => {
    // socket.io自带的join方法, 将客户端添加到指定房间内
    socket.join(roomId);
    // 向除了自己的(房间内)所有人广播'用户已连接'
    socket.to(roomId).broadcast.emit("user-connected", userId);
    // 监听disconnect事件
    socket.on("disconnect", () => {
      // 向(房间内)所有人广播'用户已断开连接'
      socket.to(roomId).broadcast.emit("user-disconnected", userId);
    });
    // 监听全体(房间)消息
    socket.on("roommsgc2s", (obj) => {
      io.in(roomId).emit("roommsgs2c", obj);
    })
  });
});

// 实现用户名自定义+用户名显示的构思:
//      首先, 页面最初需要一个弹窗让用户自定义用户名(一个在客户端js中保存的用户名).
//      其次, 将这个用户名通过join-room事件传递给服务器, 并向所有人(无需包括自己)广播.

// 该服务部署在3000端口
server.listen(3000);
