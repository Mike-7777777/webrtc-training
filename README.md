# What did i do

``` bash
# 1. 初始化 package.json
npm init -y
# 2. 获取所需包
npm i express ejs socket.io
# 3. 让用户拥有独立的id进入频道
npm i uuid 
# 4. 修改后自动刷新应用
npm i --save-dev nodemon
# 5. 修改 package.json中的Scrpts
"devStart": "nodemon server.js"
# 6. 创建server.js文件

# 7. 运行服务器
npm run devStart
# 8.编辑server.js文件
# 9. 编写views/room.ejs的代码
# 10. 编写public/scripts的代码
# 11 使用PEERjs 为每个用户提供一个id
peerjs --port 3001
cd git/webrtc-training
# end 运行
npm run devStart
peerjs --port 3001
peerjs 
```

chrome 只接受ssl https://github.com/ant-media/Ant-Media-Server/issues/1200

需要在secure content下才能运行navigator.mediaDevices，否则就会undefined

https://webrtc.github.io/samples/

https://webrtc.org/getting-started/overview?hl=en

IMPORTANT NOTES:
 - Congratulations! 
 - certificate and chain
   /etc/letsencrypt/live/rtc.hk1.jabni.top/fullchain.pem
 - key file
   /etc/letsencrypt/live/rtc.hk1.jabni.top/privkey.pem

```php
server {
       listen       80; 
       server_name  rtc.hk1.jabni.top;
       return      301 https://$host$request_uri;
   }
```

https://github.com/coturn/coturn

https://github.com/webrtc/apprtc

https://michaelyou.github.io/2018/08/01/%E7%9C%9F%E5%AE%9E%E4%B8%96%E7%95%8C%E4%B8%AD%E7%9A%84WebRTC/
