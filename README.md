## 动态域名解析工具

此工具用于进行动态域名解析（ipv4和ipv6）解析，将当前电脑的ip地址解析到指定的域名上。

目前只支持阿里云

## 运行
```
ddns <配置文件>
```


## 配置文件

配置文件内容参考`res/ddns.conf`，根据需要进行添加或修改即可


## 项目编译

编译前，请确保电脑上安装了nodejs，然后执行如下命令

```
# 安装相关依赖
npm install

# 构建项目
npm run build

# 生成可执行文件
npm run release
```
编译后，会在release目录下生成windows、linux和MacOS下的可执行文件
