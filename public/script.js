const socket = io("/");
const videoGrid = document.getElementById("video-grid");
const nameGrid = document.getElementById("name-grid");
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
let user_name = null;
const peers = {};
const names = {};

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
    const li = document.createElement("li");
    // send
    dataConnection.send(myName);
  });
  dataConnection.on("open", () => {
    // receive
    dataConnection.on("data", (data) => {
      addNameText(li, data);
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
    addVideoStream(myVideo, myStream);
    // 这个on.call的作用是接收其他端的call, 如果没有的话这个页面就只会有自己的视频.
    // 监听call命令，收到后进行answer, 在本地新建一个video标签来展示这个peer的stream
    myPeer.on("call", (mediaConnection) => {
      // 前序页面获得后续页面视频
      // 这个mediaConnection本身就具有caller的stream数据,此处receiver使用answer返回流给caller
      mediaConnection.answer(stream);
      // 后续页面获得前序页面视频
      const video = document.createElement("video");
      video.autoplay;
      video.playsinline;
      // 感觉其实不需要使用stream,因为
      mediaConnection.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });
    // 监听user-connected事件(新用户进入房间).
    // 为了让本地的流发送给新接入的用户.
    socket.on("user-connected", (userId) => {
      // 输送给这个userId的对方,我们的stream
      connectToNewUser(userId, stream);
    });
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
    names[userId].close();
  }
});

// 该方法用于与新用户交换视频流.
// 此处的id是对方的id,本地的流.
function connectToNewUser(userId, stream) {
  // stream media connection
  // 本地发送stream到对端, 此处是caller
  const mediaConnection = myPeer.call(userId, stream);

  const video = document.createElement("video");
  video.autoplay;
  video.playsinline;
  // 监听stream事件,即另一端(新用户)发送stream过来
  mediaConnection.on("stream", (userVideoStream) => {
    // 将收到的新stream放进本地浏览器客户端
    addVideoStream(video, userVideoStream);
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
    addNameText(li, data);
    names[data] = dataConnection;
  });
  dataConnection.on("close", () => {
    li.remove();
  });
}
// 获取用户名
function getUserName() {
  user_name = prompt("plz write u name");
  if (user_name != null) {
    alert("welcome! ur name is: " + user_name);
    return Promise.resolve(user_name);
  } else {
    alert("Invalid username");
    return Promise.reject(e);
  }
}
// 将一个stream加载到传入的video标签中播放, 并将该标签加入网页中的videoGrid中.
function addVideoStream(video, stream) {
  video.srcObject = stream;
  // loadedmetadata is a event of media
  // https://developer.mozilla.org/zh-CN/docs/Web/Events
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
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
  var tracks = myStream.getTracks(); //stream为MediaStream
  tracks.forEach((item) => {
    if (item.kind === "audio" && item.enabled === true) {
      item.enabled = false;
    } else if (item.kind === "audio" && item.enabled === false) {
      item.enabled = true;
    }
  });
};
// mute function ---------------------------------------------------------------------
