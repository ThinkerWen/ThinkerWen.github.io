---
title: Android crackme_0x01
date: 2023-06-19 16:13:54
tags: ['CrackMe', '逆向']
categories: ['CrackMe', '逆向']
years: ["2023"]
---

## 描述

The very basic crackme challenge. Gives you chance to get familiar with all Android RE tools.

### 目标

找到Flag

### APK下载

[https://yhxx.lanzoub.com/izxhl0mj4k7i](https://yhxx.lanzoub.com/izxhl0mj4k7i)

## 题解

首先打开APP看一下，可以看到是输入密码点击SUBMIT来获取Flag
<img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_20_4YgT7u.jpg" width="200" alt="CrackMe" />
用Jadx-GUI打开APK看一下源码，在`MainActivity`中找到了`SUBMIT`按钮绑定的`onClick`函数。
在①中通过`FlagGuard().getFlag()`函数来根据获取文本框中输入的`password`得到`flag`。
②中`Flag`不为空则展示`Congratulations!`和`Flag`。
<img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_20_jrayxU.png" width="500" alt="CrackMe" />
进入`FlagGuard().getFlag()`，发现只要传入的`str`(即输入的`password`)与`Data().getData()`相等就会返回②所计算出的flag，现在只需要看`Data().getData()`就可以拿到密码。
<img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_20_WkaZbD.png" width="500" alt="CrackMe" />
进入`Data().getData()`，发现函数直接返回了`password`字符串`s3cr37_p4ssw0rd_1337`。
<img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_25_yg83W4.png" width="500" alt="CrackMe" />
在文本框输入`s3cr37_p4ssw0rd_1337`即可拿到`flag`。
<img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_25_lmlltf.jpg" width="200" alt="CrackMe" />