---
title: Android crackme_0x07
date: 2023-07-25 16:25:21
tags: ['CrackMe', '逆向']
categories: ['CrackMe', '逆向']
years: ["2023"]
---

## 描述

This app holds a secret inside. May include traces of native code.

### 目标

找到密码

### APK下载

[https://yhxx.lanzoub.com/iMZpZ0mx336d](https://yhxx.lanzoub.com/iMZpZ0mx336d)

## 题解

首先打开APP看一下，可以看到是需要输入注册码来进行注册，但是检测到了root，需要先过root检测。

<img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_26_CBtlsI.jpg" width="200" alt="CrackMe" />


在GitHub上有个脚本可以过很多root检测[https://github.com/AshenOneYe/FridaAntiRootDetection](https://github.com/AshenOneYe/FridaAntiRootDetection)，用这个脚本就可以过这个APP的root检测，不过还是看看具体代码中怎么过吧。
Jadx-GUI打开找到root检测的位置，发现用到了3个函数，当3个函数都返回true时就可以正常使用APP。

<img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_26_ayVJTW.png" width="500" alt="CrackMe" />

点进去发现3个函数都在一个类中，只要将3个函数都改为永远返回true就行，可以直接修改smali或者hook，hook方便一些。

<img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_26_9eH6qL.png" width="500" alt="CrackMe" />

写好hook的代码，使用frida重启注入`frida -U --no-pause -f owasp.mstg.uncrackable2 -l crack.js`
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

打开后APP就可以正常使用，不会提示root了。

<img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_26_VyBx3W.png" width="200" alt="CrackMe" />

再找到验证密码的地方，看到是在`verify()`方法中，将用户输入的文本传入`this.m.a()`方法中进行检查。

<img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_26_DqaZ5p.png" width="500" alt="CrackMe" />

进入`this.m.a()`方法，发现用到的关键方法`bar()`是一个返回值为bool的native方法。在`MainActivity`中看到有`System.loadLibrary("foo")`，于是去`libfoo.so`中找`bar()`方法。

<img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_26_Y8updd.png" width="500" alt="CrackMe" />

用ida打开`libfoo.so`，通过字符串很容易找到静态注册的`bar()`方法，可以看到其中用到了`strncmp()`来做字符串对比，所以只需要hook`strncmp()`即可。同时可以看到字符串长度为23位，这也缩小了hook范围，更加方便。

<img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_26_IpR2e4.png" width="500" alt="CrackMe" />

写出hook脚本，重启注入APP`frida -U --no-pause -f owasp.mstg.uncrackable2 -l crack.js`，输入`01234567890123456789012`来查看返回值，可以看到输出为`Thanks for all the fish`
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

<img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_26_XJFkT6.png" width="500" alt="CrackMe" />

将密码输入APP，密码正确，密码为`Thanks for all the fish`

<img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_26_jeL0KC.png" width="200" alt="CrackMe" />