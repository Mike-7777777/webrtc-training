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

# end 运行
npm run devStart
peerjs --port 3001
```
