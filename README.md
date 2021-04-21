# What did i do

信令服务器：部署并配置nginx+server.js+peerjs三项服务(需要一个域名, 一个服务器, 服务器nginx环境, 后端NODE环境, peerjs依赖)

coturn服务器：部署并配置coturn服务(需要一个域名, 一个服务器, coturn)





``` bash
npm --registry https://registry.npm.taobao.org install express
git clone https://github.com/Mike-7777777/webrtc-training.git
# 1. 初始化 package.json
npm init -y
# 2. 获取所需包
npm i express ejs socket.io
npm install -g npm@latest
npm i -g peer
npm i -g bufferutil utf-8-validate
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

# nginx 443端口转发
https://www.jianshu.com/p/db91dad5636f


# coturn
vim coturn/etc turnserver.conf

listening-port=3478 #指定侦听端口
external-ip=39.105.185.198 #指定云主机的公网IP地址
user=name:password #访问服务的用户名和密码
realm=stun.xxx.com #域名

listening-port=3478 #指定侦听端口
external-ip=39.105.185.198 #指定云主机的公网IP地址
user=mike:mike7777777 #访问服务的用户名和密码
realm=stun.wblare.com #域名
https://ourcodeworld.com/articles/read/1175/how-to-create-and-configure-your-own-stun-turn-server-with-coturn-in-ubuntu-18-04
# nohup是重定向命令，输出都将附加到当前目录的 nohup.out 文件中； 命令后加 & ,后台执行起来后按 ctr+c,不会停止
sudo nohup turnserver -L 0.0.0.0 -a -u lqf:123456 -v -f -r nort.gov &
sudo nohup turnserver -c turnserver.default.conf -u mike:mike7777777 -v -r wblare.com &
sudo nohup turnserver -c turnserver.conf -u mike:mike7777777 -v -r wblare.com &

#然后查看相应的端口号3478是否存在进程
sudo lsof -i:3000
sudo lsof -i:3478
lsof -i:3000
npm run devStart
peerjs --port 3001
194.156.99.137
fe80::5054:ff:fefc:cbc7

sudo nohup peerjs --port 3001 &
openssl req -x509 -days 1000 -newkey rsa:2048 -keyout ./key.pem -out ./cert.pem -nodes
```

chrome 只接受ssl https://github.com/ant-media/Ant-Media-Server/issues/1200

需要在secure content下才能运行navigator.mediaDevices，否则就会undefined

https://webrtc.github.io/samples/

https://webrtc.org/getting-started/overview?hl=en



![image-20210401224154688](img\image-20210401224154688.png)

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

