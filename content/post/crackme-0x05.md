---
title: Android crackme_0x05
date: 2023-06-20 20:22:31
tags: ['CrackMe', '逆向']
categories: ['CrackMe', '逆向']
years: ["2023"]
---

## 描述

此为2013年ISCC的一道移动题，相对简单的题，要求是注册为企业版程序。

### 目标

注册为企业版程序

### APK下载

[https://yhxx.lanzoub.com/i5cyV0mrazaf](https://yhxx.lanzoub.com/i5cyV0mrazaf)

## 题解

首先打开APP看一下，可以看到是需要输入注册码来进行注册。
<div style="display: flex; align-items: flex-start; gap: 10px;">  <img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_25_iR3MXN.jpg" width="200" alt="CrackMe" /> <img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_25_D08Sbk.png" width="200" alt="CrackMe" /></div>

用Jadx-GUI打开APK看一下源码，在打开APP后先执行①，通过`MyApp.m`来判断APP的注册状态。
在②中判断注册状态，如果未注册则执行③的`doRegister()`，如果已经注册则执行`MyApp.work()`
<img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_25_jB6Upw.png" width="500" alt="CrackMe" />

先看一下`MyApp.m`参数是怎么来的，发现MyApp.m是静态属性，所在的类加载了名为`hack`的so，并在`onCreate()`中调用了native方法`initSN()`。
且在别处没有找到其他修改`MyApp.m`的地方，那么大概率就在so中进行操作的，并且`MyApp.work()`函数也是native函数。
<img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_25_tRTpDm.png" width="500" alt="CrackMe" />

我们再看输入注册码后的`doRegister()`,他将输入的注册码sn作为参数传入到了`MyApp.saveSN()`中，且`MyApp.saveSN()`也是native函数，所以我们只需要看`hack`的so即可。
<img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_25_km8XwF.png" width="500" alt="CrackMe" />

打开IDA工具找对应的native方法。
找到`work()`方法对应的native方法`n3`后发现想要注册为企业版，则使用到了`n1`方法
<img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_25_XFKD1t.png" width="500" alt="CrackMe" />

我们再去看`n1`，`n1`对应的是`initSN()`方法，它在打开APP时读取`/sdcard/reg.dat`，将其中的内容与4种md5字符串做对比，来设置`MyApp.m`的值。
而我们要注册为企业版，所以需要`MyApp.m`为3，即内容需要和`b2db1185c9e5b88d9b70d7b3278a4947`相等。
<img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_25_rB4WSu.png" width="500" alt="CrackMe" />

再看`saveSN()`对应的`n2`方法，它将输入的字符串做md5加密然后存储到`/sdcard/reg.dat`中，所以结合n2现在有两种解法：
1. 直接将`b2db1185c9e5b88d9b70d7b3278a4947`输入到`/sdcard/reg.dat`中即可
2. 找到`b2db1185c9e5b88d9b70d7b3278a4947`对应的明文即为注册码
<img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_25_ZrsTIV.png" width="500" alt="CrackMe" />

到md5撞库解密的网站输入`b2db1185c9e5b88d9b70d7b3278a4947`，得到明文为`32345678`
<img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_25_p7InGw.png" width="500" alt="CrackMe" />

输入注册码保存成功，再打开APP则已经注册为企业版了
<img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_25_V0qGyT.png" width="200" alt="CrackMe" />