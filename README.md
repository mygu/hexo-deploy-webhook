# What's this（这是啥？）

> 我在`LeanCloud`云引擎上使用`Node.js`开发的一个`Webhook`，可以实现自动部署和定时部署。

------

# How to work （咋个弄？）

> 相信大家应该都用过`Hexo`去搭建一个自己的`Markdown`博客系统，每次在电脑上写完博客后，需要运行`hexo g -d`去部署到代码仓库（例如：`github`、`bitbucket`、`coding`等）。

> 那么问题来了！

> 1.我每次写完博客除了要将博客源码`push`到仓库以外，还要运行命令才能发布更新博客。

> 2.如果我不是通过电脑，例如通过手机直接在代码仓库修改源码写的博客，我如何更新？最常见的情况就是，我发布博客后，发现写错了一个字，我直接在仓库就更改了，但是却没有环境去执行命令更新。

> Ok,针对以上情况，我们希望的是专注于写博客，其他事不要管。当我每次写完博客以后，我只需要`push`代码到仓库，就可以自动完成发布和部署工作。

> 相信说了这么多，聪明的已经想到了搭建一台`VPS`服务器来完成这些工作，当然如果你有`VPS`的话。好吧，我承认我是个穷人！我使用的是`leancloud`的云引擎来完成这些工作，你只需要去注册一个账号，就可以拥有一台“0.5 CPU / 256 
MB”规格的云服务器。接下来你要把代码部署上去，然后配置一些环境变量，最后在你的代码仓库上新建一个`Webhook`指向`leancloud`的主机域名，剩下的一切交给机器吧。

> Have fun!

------

## leancloud主机环境变量配置

### GIT_CLONE_USER_NAME 

> git配置用户名

### GIT_CLONE_USER_EMAIL 

> git配置邮箱

### GIT_CLONE_REPOSITORY_HOST 

> git克隆仓库的域名

### GIT_CLONE_REPOSITORY_USERNAME 

> git克隆仓库的用户名

### GIT_CLONE_REPOSITORY_PASSWORD 

> git克隆仓库的密码

### GIT_CLONE_REPOSITORY_PROJECT 

> git克隆仓库的项目名

### GIT_CLONE_REPOSITORY_BRANCH 

> git克隆仓库的分支

### GIT_DEPLOY_USER_NAME 

> git配置部提交户名

### GIT_DEPLOY_USER_EMAIL 

> git配置提交邮箱

### GIT_DEPLOY_REPOSITORY_HOST 

> git提交仓库的域名

### GIT_DEPLOY_REPOSITORY_USERNAME 

> git提交仓库的用户名

### GIT_DEPLOY_REPOSITORY_PASSWORD 

> git提交仓库的密码

### GIT_DEPLOY_REPOSITORY_PROJECT 

> git提交仓库的项目名

### GIT_DEPLOY_REPOSITORY_BRANCH 

> git提交仓库的分支

### PROCESS_DIR 

> 工作目录

### NPM_REPOSITORY 

> npm仓库镜像，不配置的话默认是'https:>registry.npm.taobao.org'

------

# 备注

> 说一下我的博客架构，首先我使用的`Hexo`搭建的博客（如果你不是也没有关系，这个代码仍然适用），然后我的博客源码存储在`bitbucket`上，博客编译后存储在`coding`（不要问我为什么，因为快啊）上，启用`pages`服务发布。所以当我提交代码到`bitbucket`上的时候，`bitbucket`就会触发我设置的`Webhook`，然后调用`leancloud`主机上的程序完成自动发布部署。

------

# 相关文档

* [Hexo博客搭建](https://hexo.io/docs/)
* [网站托管开发指南](https://leancloud.cn/docs/leanengine_webhosting_guide-node.html)
