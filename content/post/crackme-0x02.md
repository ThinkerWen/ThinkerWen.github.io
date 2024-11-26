---
title: Android crackme_0x02
date: 2023-06-19 19:47:20
tags: ['CrackMe', '逆向']
categories: ['CrackMe', '逆向']
years: ["2023"]
---

## 描述

What if JD-GUI doesn’t show you the password?

### 目标

找到Flag

### APK下载

[https://yhxx.lanzoub.com/ikyBX0mj4kab](https://yhxx.lanzoub.com/ikyBX0mj4kab)

## 题解

首先打开APP看一下，可以看到是输入密码点击SUBMIT来获取Flag
<img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_25_p6FPzk.jpg" width="200" alt="CrackMe" />

用Jadx-GUI打开APK看一下源码，在`MainActivity`中找到了`SUBMIT`按钮绑定的`onClick`函数。
在①中通过`FlagGuard().getFlag()`函数来根据获取文本框中输入的`password`和`ApplicationContext`得到`flag`。
②中`Flag`不为空则展示`Congratulations!`和`Flag`。
<img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_25_NxCeGq.png" width="500" alt="CrackMe" />

进入`FlagGuard().getFlag()`，发现只要传入的`str`(即输入的`password`)与`Data().getData(context)`相等就会返回②所计算出的flag，现在只需要看`Data().getData()`就可以拿到密码。
<img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_25_RdI1TZ.png" width="500" alt="CrackMe" />

进入`Data().getData()`，发现函数需要获取到`ApplicationContext`中的字符串来当做`password`。
<img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_25_Vl7Dh2.png" width="500" alt="CrackMe" />

追踪进去后我们发现R.string.secret的值是一个地址，这显然不是明文密码，那么我该何看到密码呢？
<img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_25_ZWwZ6G.png" width="500" alt="CrackMe" />

Android的字符串资源都存储在`/res/values/strings.xml`中
可以使用apktool工具解压apk文件查看：
```bash
apktool d base.apk
cd base
cat res/values/strings.xml
```
或者直接在Jadx-GUI的路径`/资源文件/resources.arsc/res/values/strings.xml`中查看。
打开xml文件后可以看到名为secret的字符串值：`s0m3_0th3r_s3cr3t_passw0rd`即为密码。
<img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_25_njHdXe.png" width="500" alt="CrackMe" />

在文本框输入`s0m3_0th3r_s3cr3t_passw0rd`即可拿到`flag`。
<img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_25_TTVqqg.jpg" width="200" alt="CrackMe" />