---
title: Android crackme_0x03
date: 2023-06-20 14:43:51
categories: ['CrackMe']
years: ["2023"]
---

## 描述

Some hashes, cats and strings generation
### 目标

找到 Flag

### APK 下载

[点击下载](http://drive.404fix.cn/f/RtTYjxvwNi)

---

## 题解

首先打开 APP，可以看到界面为输入密码并点击 SUBMIT 来获取 Flag。

用 Jadx-GUI 打开 APK 查看源码，在 `MainActivity` 中找到了 SUBMIT 按钮绑定的 `onClick` 函数。
在 ① 中通过 `FlagGuard().getFlag()` 函数，根据文本框中输入的 `password` 得到 flag；
在 ② 中若 Flag 不为空，则展示 `Congratulations!` 与 Flag。

进入 `FlagGuard().getFlag()` 方法，发现只要传入的 `str`（即输入的 password）与 `Data().isPasswordOk(context)` 相等，就会返回 ② 计算出的 flag。
因此只需查看 `Data().isPasswordOk()` 即可获取密码。

在 `Data().isPasswordOk()` 中：
① 可看到密码长度为 6；
② 将用户输入的 password 进行 MD5 加密，并与固定 MD5 字符串 `ac43bb53262e4edd82c0e82a93c84755` 对比，相等则返回正确结果。

于是有两种解法：
1. 对 MD5 字符串 `ac43bb53262e4edd82c0e82a93c84755` 进行撞库解密，得到明文即为密码。
2. Hook `isPasswordOk()` 函数使其永远返回 true，任意输入 6 位字符串即可拿到 Flag。

---

### 方法一

前往 MD5 撞库解密网站，输入 `ac43bb53262e4edd82c0e82a93c84755`，得到明文为 `3#8H1J`。

输入密码 `3#8H1J`，即可获取 flag。

---

### 方法二

使用 Frida 对 `isPasswordOk()` 函数进行 Hook，使其永远返回 true。

Hook 代码如下：
```javascript
function main() {
  Java.perform(function(){
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

重启 APP 并注入 JS：
```shell
frida -U --no-pause -f net.persianov.crackme0x03 -l crack.js
```

随意输入字符串即可拿到 flag。