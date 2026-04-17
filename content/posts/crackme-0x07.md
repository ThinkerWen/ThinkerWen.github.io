---
title: Android crackme_0x07
date: 2024-06-24 16:25:21
categories: ['CrackMe']
years: ["2024"]
---

## 描述

This app holds a secret inside. May include traces of native code.

### 目标

找到密码

### APK 下载

[点击下载](http://drive.404fix.cn/f/nznLrjsJja)

## 题解

首先打开 APP 看一下，可以看到是需要输入注册码来进行注册，但是检测到了 root，需要先过 root 检测。

<img src="https://drive.404fix.cn/i/ATh7pgcq.png" width="200" alt="CrackMe" />

在 GitHub 上有个脚本可以过很多 root 检测 [https://github.com/AshenOneYe/FridaAntiRootDetection](https://github.com/AshenOneYe/FridaAntiRootDetection)，用这个脚本就可以过这个 APP 的 root 检测，不过还是看看具体代码中怎么过吧。
Jadx-GUI 打开找到 root 检测的位置，发现用到了 3 个函数，当 3 个函数都返回 true 时就可以正常使用 APP。

<img src="https://drive.404fix.cn/i/hSXmPBnX.png" width="500" alt="CrackMe" />

点进去发现 3 个函数都在一个类中，只要将 3 个函数都改为永远返回 true 就行，可以直接修改 smali 或者 hook，hook 方便一些。

<img src="https://drive.404fix.cn/i/RqFGEIix.png" width="500" alt="CrackMe" />

写好 hook 的代码，使用 frida 重启注入 `frida -U --no-pause -f owasp.mstg.uncrackable2 -l crack.js`

```JavaScript
function passRoot() {
    Java.perform(function() {
        let b = Java.use("sg.vantagepoint.a.b");
        b["a"].implementation = function () {
            console.log(`b.a is called`);
            return false;
        };
        b["b"].implementation = function () {
            console.log(`b.b is called`);
            return false;
        };
        b["c"].implementation = function () {
            console.log(`b.c is called`);
            return false;
        };
    })
}

function main() {
    passRoot();
}

setImmediate(main);
```

打开后 APP 就可以正常使用，不会提示 root 了。

<img src="https://drive.404fix.cn/i/O9CksqJe.png" width="200" alt="CrackMe" />

再找到验证密码的地方，看到是在 `verify()` 方法中，将用户输入的文本传入 `this.m.a()` 方法中进行检查。

<img src="https://drive.404fix.cn/i/dLtbW5lM.png" width="500" alt="CrackMe" />

进入 `this.m.a()` 方法，发现用到的关键方法 `bar()` 是一个返回值为 bool 的 native 方法。在 `MainActivity` 中看到有 `System.loadLibrary("foo")`，于是去 `libfoo.so` 中找 `bar()` 方法。

<img src="https://drive.404fix.cn/i/l7tB878F.png" width="500" alt="CrackMe" />

用 ida 打开 `libfoo.so`，通过字符串很容易找到静态注册的 `bar()` 方法，可以看到其中用到了 `strncmp()` 来做字符串对比，所以只需要 hook `strncmp()` 即可。同时可以看到字符串长度为 23 位，这也缩小了 hook 范围，更加方便。

<img src="https://drive.404fix.cn/i/BF1GY1Lt.png" width="500" alt="CrackMe" />

写出 hook 脚本，重启注入 APP `frida -U --no-pause -f owasp.mstg.uncrackable2 -l crack.js`，输入 `01234567890123456789012` 来查看返回值，可以看到输出为 `Thanks for all the fish`

```JavaScript
function passRoot() {
    Java.perform(function() {
        let b = Java.use("sg.vantagepoint.a.b");
        b["a"].implementation = function () {
            console.log(`b.a is called`);
            return false;
        };
        b["b"].implementation = function () {
            console.log(`b.b is called`);
            return false;
        };
        b["c"].implementation = function () {
            console.log(`b.c is called`);
            return false;
        };
    })
}

function getSecret() {
    let libfoo_ptr = null;
    let modules = Process.enumerateModules();
    for (let i=0; i<modules.length; i++) {
        if (modules[i].name == "libfoo.so") libfoo_ptr = modules[i].base;
    }
    Interceptor.attach(Module.findExportByName(libfoo_ptr, "strncmp"), {
        onEnter: function (args) {
           if(args[2].toInt32() == 23 && Memory.readUtf8String(args[0],23) == "01234567890123456789012") {
                console.log("[*] Secret string at " + args[1] + ": " + Memory.readUtf8String(args[1],23));
            }
         },
        onLeave: function(retval) {
        }
    })
}

function main() {
    passRoot();
    getSecret();
}

setImmediate(main);
```

<img src="https://drive.404fix.cn/i/O2VBNLGo.png" width="500" alt="CrackMe" />

将密码输入 APP，密码正确，密码为 `Thanks for all the fish`

<img src="https://drive.404fix.cn/i/CU7GYVWD.png" width="200" alt="CrackMe" />