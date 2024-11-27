---
title: Android crackme_0x03
date: 2023-04-21 14:43:51
tags: ['CrackMe', '逆向']
categories: ['CrackMe', '逆向']
years: ["2023"]
---

## 描述

Some hashes, cats and strings generation.

### 目标

找到Flag

### APK下载

[https://yhxx.lanzoub.com/iwKDO0mj4kfg](https://yhxx.lanzoub.com/iwKDO0mj4kfg)

## 题解

首先打开APP看一下，可以看到是输入密码点击SUBMIT来获取Flag

<img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_25_VCHkhq.jpg" width="200" alt="CrackMe" />
用Jadx-GUI打开APK看一下源码，在`MainActivity`中找到了`SUBMIT`按钮绑定的`onClick`函数。
在①中通过`FlagGuard().getFlag()`函数来根据获取文本框中输入的`password`得到`flag`。
②中`Flag`不为空则展示`Congratulations!`和`Flag`。

<img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_25_viT1mg.png" width="500" alt="CrackMe" />

进入`FlagGuard().getFlag()`，发现只要传入的`str`(即输入的`password`)与`Data().isPasswordOk(context)`相等就会返回②所计算出的flag，现在只需要看`Data().isPasswordOk()`就可以拿到密码。

<img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_25_2eh5dC.png" width="500" alt="CrackMe" />

在`Data().isPasswordOk()`可以从①中看到密码长度是6，然后在②中将用户填入的`password`进行md5加密并与现有的md5字符串`ac43bb53262e4edd82c0e82a93c84755`作对比，相等则给出flag。

<img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_25_mziUEq.png" width="500" alt="CrackMe" />

于是现在有两种解法：
1.找出md5字符串`ac43bb53262e4edd82c0e82a93c84755`的明文，即为密码。
2.让`isPasswordOk()`函数永远返回true，随便输入6位字符串即可拿到flag。
### 方法一

到md5撞库解密的网站输入`ac43bb53262e4edd82c0e82a93c84755`，得到明文为`3#8H1J`

<img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_25_Z4sfSu.png" width="500" alt="CrackMe" />
输入密码`3#8H1J`，即可拿到flag。

<img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_25_BziPam.png" width="200" alt="CrackMe" />

### 方法二

使用frida对`isPasswordOk()`函数进行hook，使之永远返回true。
hook代码如下：
```JavaScript
function main() {
  Java.perform( function(){
    let Data = Java.use("net.persianov.crackme0x03.Data");
    Data["isPasswordOk"].implementation = function (str) {
      console.log('isPasswordOk is called' + ', ' + 'str: ' + str);
      let ret = true;
      console.log('isPasswordOk ret value is ' + ret);
      return ret;
    };
  })
}

setImmediate(main);
```

重启app注入js `frida -U --no-pause -f net.persianov.crackme0x03 -l crack.js` 

<img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_25_PEENYe.png" width="500" alt="CrackMe" />
随意输入字符串即可拿到flag。

<img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_25_5BHAEL.jpg" width="200" alt="CrackMe" />