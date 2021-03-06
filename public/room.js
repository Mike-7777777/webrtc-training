const socket = io("/");
const videoGrid = document.getElementById("video-grid");
const nameGrid = document.getElementById("name-grid");
const screenGrid = document.getElementById("screen-grid");
const screenbtn = document.getElementById("screenbtn");
const sendbtn = document.getElementById("sendbtn");
const chati = document.getElementById("chat-in");
const chato = document.getElementById("chat-out");
const clearbtn = document.getElementById("clearbtn");

// ==========================================================
// local test
// const myPeer = new Peer(undefined, {
//     host: '/',
//     port: '3001',
// })
// server test
const myPeer = new Peer(undefined, {
  config: {
    iceServers: [
      {
        url: "turn:stun.wblare.com:3478",
        username: "mike",
        credential: "mike7777777",
      },
    ],
  },
  host: "/",
  port: "",
  secure: true,
});
// ==========================================================
let myStream = null;
let myName = null;
const peers = {};
const names = {};
const datas = {};
const screenShare = {};

// 创建我的视频video标签块 & 我的名字
const myVideo = document.createElement("video");
const myLi = document.createElement("li");
// 默认不收听自己的声音 & 给名字赋值
myVideo.muted = true;
// === ios 所需属性
myVideo.autoplay;
myVideo.playsinline;
// ===

//
// 问题: 后续页面打开后,无法获得前序页面的用户名.
// 但是这个逻辑是和视频类似的,但是没有相似的问题.
//

// 新收获: 其实并不需要dataConnection,
// 只需要现在的情况下把服务器端的name变量用好就可以了.

// 新收获: 使用dataConnection的话需要解决后续页面不显示前序视频的问题.
// 这个问题应该与视频的on call方法内没有写 call.on

// 获取用户名
getUserName().then((text) => {
  myName = text;
  addNameText(myLi, myName);
  // 监听connection事件
  myPeer.on("connection", (dataConnection) => {
    dataConnection.on("open", () => {
      const li = document.createElement("li");
      // send
      const obj = {
        type: "name",
        sender: myName,
        content: myName,
      };
      dataConnection.send(obj);
      // receive
      dataConnection.on("data", (obj) => {
        if (obj.type === "name") {
          addNameText(li, obj.content);
          names[dataConnection.peer] = obj.content;
        } else if (obj.type === "chat") {
          getRoomChat(obj);
        } else if (obj.type === "file") {
          // getFile(obj);
        }
      });
      dataConnection.on("close", () => {
        li.remove();
      });
      if (datas[dataConnection.peer]) {
        //
      } else {
        datas[dataConnection.peer] = dataConnection;
      }
    });
  });
});
// 获取本地媒体流
navigator.mediaDevices
  .getUserMedia({
    // constraints
    video: true,
    audio: true,
  })
  .then((stream) => {
    // 手动添加自己的视频块
    myStream = stream;
    addVideoStream(myVideo, myStream, "audio");
    // 这个on.call的作用是接收其他端的call, 如果没有的话这个页面就只会有自己的视频.
    // 监听call命令，收到后进行answer, 在本地新建一个video标签来展示这个peer的stream
    myPeer.on("call", (mediaConnection) => {
      if (mediaConnection.metadata === "audio") {
        // 前序页面获得后续页面视频
        // 这个mediaConnection本身就具有caller的stream数据,此处receiver使用answer返回流给caller
        mediaConnection.answer(stream);
        // 后续页面获得前序页面视频
        const video = document.createElement("video");
        video.autoplay;
        video.playsinline;
        // 感觉其实不需要使用stream,因为
        mediaConnection.on("stream", (userVideoStream) => {
          addVideoStream(video, userVideoStream, "audio");
        });
        mediaConnection.on("close", () => {
          video.remove();
        });
        if (peers[mediaConnection.peer]) {
          //
        } else {
          peers[mediaConnection.peer] = mediaConnection;
        }
      }
    });
    // 监听user-connected事件(新用户进入房间).
    // 为了让本地的流发送给新接入的用户.
    socket.on("user-connected", (userId) => {
      // 输送给这个userId的对方,我们的stream
      connectToNewUser(userId, stream);
    });
  });

// 推出/获取本地屏幕捕捉流
screenbtn.onclick = function () {
  navigator.mediaDevices.getDisplayMedia({ video: true }).then((screen) => {
    screenShareId = Peer.id;
    const myScreen = document.createElement("video");
    addVideoStream(myScreen, screen, "screen");
    Object.keys(peers).forEach((key) => {
      const screenConn = myPeer.call(peers[key].peer, screen, {
        metadata: "screen",
      });
    });
    socket.on("user-connected", (userId) => {
      const screenConn = myPeer.call(userId, screen, {
        metadata: "screen",
      });
    });
  });
};
myPeer.on("call", (screenCall) => {
  if (screenCall.metadata === "screen") {
    screenCall.answer();
    screenShareId = screenCall.peer;
    const screenVideo = document.createElement("video");
    screenVideo.autoplay;
    screenVideo.playsinline;
    screenCall.on("stream", (screenStream) => {
      addVideoStream(screenVideo, screenStream, "screen");
    });
    screenCall.on("close", () => {
      screenVideo.remove();
    });
  }
});

// open事件,与服务器建立连接时触发.
myPeer.on("open", (id) => {
  // 向服务器调用join-room函数，传入ROOM_ID和id参数，分别为房间号和用户号
  socket.emit("join-room", ROOM_ID, id);
});

socket.on("user-disconnected", (userId) => {
  // 如果peers内有用户id，则令相关id关闭链接
  if (peers[userId]) {
    peers[userId].close();
    datas[userId].close();
  }
  // 如果断开连接的是直播主,则断开直播连接.
  if (userId === screenShare.peer) {
    screenShare.close();
  }
  chato.value += "  [info]" + ": " + names[userId] + "已断开连接" + "\r\n";
});

// 该方法用于与新用户交换视频流.
// 此处的id是对方的id,本地的流.
function connectToNewUser(userId, stream) {
  // stream media connection
  // 本地发送stream到对端, 此处是caller
  const mediaConnection = myPeer.call(userId, stream, { metadata: "audio" });
  const video = document.createElement("video");
  video.autoplay;
  video.playsinline;
  // 监听stream事件,即另一端(新用户)发送stream过来
  mediaConnection.on("stream", (userVideoStream) => {
    // 将收到的新stream放进本地浏览器客户端
    addVideoStream(video, userVideoStream, "audio");
  });
  mediaConnection.on("close", () => {
    video.remove();
  });
  peers[userId] = mediaConnection;
  // name
  // 发起一个data的call
  const dataConnection = myPeer.connect(userId);
  const li = document.createElement("li");
  // 监听对面发送的信息
  dataConnection.on("data", (data) => {
    if (data.type === "name") {
      const obj = {
        type: "name",
        sender: myName,
        content: myName,
      };
      addNameText(li, data.content);
      names[userId] = data.content;
      datas[userId] = dataConnection;
      dataConnection.send(obj);
      chato.value += "  [info]" + ": " + names[userId] + "已连接" + "\r\n";
    } else if (data.type === "chat") {
      getRoomChat(data);
    } else if (data.type === "file") {
      // getFile(data);
    }
  });
  dataConnection.on("close", () => {
    li.remove();
  });
}
// 获取用户名
function getUserName() {
  myName = USER_NAME;
  if (myName != null) {
    return Promise.resolve(myName);
  } else {
    return Promise.reject(e);
  }
}
// 将一个stream加载到传入的video标签中播放, 并将该标签加入网页中的videoGrid中.
function addVideoStream(video, stream, type) {
  video.srcObject = stream;
  // loadedmetadata is a event of media
  // https://developer.mozilla.org/zh-CN/docs/Web/Events
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  if (type === "audio") {
    videoGrid.append(video);
  } else if (type === "screen") {
    screenGrid.append(video);
  }
}

function addNameText(li, text) {
  li.textContent = text;
  nameGrid.append(li);
}

// function addChatText(li, text) {
//   li.textContent = text;
//   nameGrid.append(li);
// }

// mute function ---------------------------------------------------------------------
// mute all remote sound
const soundbtn = document.getElementById("soundbtn");
soundbtn.onclick = function () {
  const video = document.getElementsByTagName("video");
  // loop from i=1, cuz the first one is local stream, which is always false.
  for (let i = 1; i < video.length; i++) {
    if (video[i].muted === true) {
      video[i].muted = false;
    } else {
      video[i].muted = true;
    }
  }
};
// mute local mic
const micbtn = document.getElementById("micbtn");
// https://www.jianshu.com/p/b1a6a2c77f1f
micbtn.onclick = function () {
  let tracks = myStream.getTracks(); //stream为MediaStream
  tracks.forEach((item) => {
    if (item.kind === "audio" && item.enabled === true) {
      item.enabled = false;
    } else if (item.kind === "audio" && item.enabled === false) {
      item.enabled = true;
    }
  });
};
// mute function ---------------------------------------------------------------------
// chat function
// sendbtn.onclick = function () {
//   let myText = chati.value;
//   pushRoomChatToServer(myText);
//   chati.value = "";
// };
// socket.on("roommsgs2c", (obj) => {
//   getRoomChat(obj);
// });
clearbtn.onclick = function () {
  chato.value = "";
};
// let the msg go to server, and boardcast to everyone.
sendbtn.onclick = function () {
  let myText = chati.value;
  pushRoomChat(myText);
  chati.value = "";
};
// or send it to every dataconnection channel.
function getRoomChat(obj) {
  if (obj.content) {
    chato.value += "  [room]" + obj.sender + ": " + obj.content + "\r\n";
  } else {
    console.log("reveived msg is null");
  }
}
// p2p 失败啦，要想实现的话最方便是服务端维护一个datas列表。
function pushRoomChat(ct) {
  Object.keys(datas).forEach((i) => {
    const obj = {
      type: "chat",
      sender: myName,
      content: ct,
    };
    getRoomChat(obj);
    datas[i].send(obj);
  });
}
// 发给服务端让后群发
// 已废弃
function pushRoomChatToServer(ct) {
  const obj = {
    type: "chat",
    sender: myName,
    content: ct,
  };
  socket.emit("roommsgc2s", obj);
}
// file function -----------------------------------------------------------
filebtn.onclick = function () {};
function getRoomFile(obj) {}
function pushRoomFile(params) {}
