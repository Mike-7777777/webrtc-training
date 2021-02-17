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

// 获取用户名
getUserName().then((text) => {
  myName = text;
  addNameText(myLi, myName);
  // 监听connection事件
  myPeer.on("connection", (dataConnection) => {
    dataConnection.send(myNmae);
    const li = document.createElement("li");
    addNameText(li, dataConnection.metadata);
  });
});
// 获取本地媒体流
navigator.mediaDevices
  .getUserMedia({
    // constraints
    video: false,
    audio: true,
  })
  .then((stream) => {
    // 手动添加自己的视频块
    myStream = stream;
    addVideoStream(myVideo, myStream);
    // 监听call命令，收到后进行answer, 在本地新建一个video标签来展示这个peer的stream
    myPeer.on("call", (mediaConnection) => {
      mediaConnection.answer(stream);
      const video = document.createElement("video");
      video.autoplay;
      video.playsinline;
      mediaConnection.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });
    // 监听user-connected事件, 传入userId，可传出用户??已连接
    socket.on("user-connected", (userId, name) => {
      connectToNewUser(userId, stream, name);
    });
  });

// open事件,与服务器建立连接时触发.
myPeer.on("open", (id) => {
  // 使用join-room函数，传入ROOM_ID和id参数，分别为房间号和用户号
  socket.emit("join-room", ROOM_ID, id, user_name);
});

socket.on("user-disconnected", (userId, name) => {
  // 如果peers内有用户id，则令相关id关闭链接
  if (peers[userId]) {
    peers[userId].close();
    names[name].close();
  }
});
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

function connectToNewUser(userId, stream, name) {
  // stream
  const mediaConnection = myPeer.call(userId, stream);
  const video = document.createElement("video");
  video.autoplay;
  video.playsinline;
  mediaConnection.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
  mediaConnection.on("close", () => {
    video.remove();
  });
  peers[userId] = mediaConnection;
  // name
  const dataConnection = myPeer.connect(userId, { metadata: name });
  const li = document.createElement("li");
  addNameText(li, dataConnection.metadata)
  dataConnection.on("close", () => {
    li.remove();
  });
  names[dataConnection.metadata] = dataConnection;
}

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
