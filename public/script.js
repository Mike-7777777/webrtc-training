const socket = io("/");
const videoGrid = document.getElementById("video-grid");
// local test
// const myPeer = new Peer(undefined, {
//     host: '/',
//     port: '3001',
// })
const myPeer = new Peer({
  config: {
    iceServers: [
      {
        url: "turn:stun.wblare.com:3478",
        credential: "mike7777777",
        username: "mike",
      },
    ],
  },
  host: "/",
  port: "",
});
let myStream = null

// 我的视频块 默认不收听自己的声音
const myVideo = document.createElement("video");
myVideo.muted = true;
const peers = {};
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    // 手动添加自己的视频块
    myStream = stream
    addVideoStream(myVideo, myStream);
    // 监听call命令，收到后
    myPeer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });
    // user-connected函数，传入userId，可传出用户??已连接
    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
    });
  });

// open函数，传入用户id
myPeer.on("open", (id) => {
  // 使用join-room函数，传入ROOM_ID和10参数，分别为房间号和用户号
  socket.emit("join-room", ROOM_ID, id);
});

socket.on("user-disconnected", (userId) => {
  // 如果peers内有用户id，则令相关id关闭链接
  if (peers[userId]) {
    peers[userId].close();
  }
});

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
}

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
  call.on("close", () => {
    video.remove();
  });
  peers[userId] = call;
}

// new code
// mute remote sound
const soundbtn = document.getElementById("soundbtn")
soundbtn.onclick = function () {
  const video = document.getElementsByTagName("video")
  // loop from i=1, cuz the first one is local stream, which is always false.
  for (let i = 1; i < video.length; i++) {
    if (video[i].muted === true) {
      video[i].muted = false
    } else {
      video[i].muted = true
    }
  }
}
// mute local mic
const micbtn = document.getElementById("micbtn")
// https://www.jianshu.com/p/b1a6a2c77f1f
micbtn.onclick = function() {
  var tracks = myStream.getTracks(); //stream为MediaStream
  tracks.forEach((item) => {
    if (item.kind === "audio" && item.enabled === true) {
      item.enabled = false;
    }else if(item.kind === "audio" && item.enabled === false){
      item.enabled = true;
    }
  });
}
