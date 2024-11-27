---
title: Android crackme_0x08
date: 2023-07-27 15:14:04
tags: ['CrackMe', '逆向']
categories: ['CrackMe', '逆向']
years: ["2023"]
---

## 描述

The crackme from hell! A secret string is hidden somewhere in this app. Find a way to extract it.

### 目标

找到密码

### APK下载

[https://yhxx.lanzoub.com/iVOZH0n1ra1i](https://yhxx.lanzoub.com/iVOZH0n1ra1i)

## 题解

首先打开APP看一下，可以看到是需要输入注册码来进行注册，但是检测到了root，需要先过root检测。

<img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_26_qESMPz.png" width="200" alt="CrackMe" />

在GitHub上有个脚本可以过很多root检测[https://github.com/AshenOneYe/FridaAntiRootDetection](https://github.com/AshenOneYe/FridaAntiRootDetection)，用这个脚本就可以过这个APP的root检测，不过还是看看具体代码中怎么过吧。
Jadx-GUI打开找到root检测的位置，发现用到了3个函数，当3个函数都返回true时就可以正常使用APP。

<img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_26_uyFeGw.png" width="500" alt="CrackMe" />

点进去发现3个函数都在一个类中，只要将3个函数都改为永远返回true就行，可以直接修改smali或者hook，hook方便一些。

<img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_26_RbWsDv.png" width="500" alt="CrackMe" />

写好hook的代码，使用frida重启注入`frida -U --no-pause -f owasp.mstg.uncrackable3 -l crack.js`
```JavaScript
function passRoot() {
    Java.perform(function() {
        let RootDetection = Java.use("sg.vantagepoint.util.RootDetection");
        RootDetection["checkRoot1"].implementation = function () {
            console.log(`RootDetection.checkRoot1 is called`);
            return false;
        };
        RootDetection["checkRoot2"].implementation = function () {
            console.log(`RootDetection.checkRoot2 is called`);
            return false;
        };
        RootDetection["checkRoot3"].implementation = function () {
            console.log(`RootDetection.checkRoot3 is called`);
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

<img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_26_nZQKlx.png" width="200" alt="CrackMe" />

再找到验证密码的地方，看到是在`verify()`方法中，将用户输入的文本传入`this.check.check_code()`方法中进行检查。

<img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_26_AZRoWt.png" width="500" alt="CrackMe" />

进入`this.check.check_code()`方法，发现用到的关键方法`bar()`是一个返回值为bool的native方法。在`MainActivity`中看到在`verifyLibs()`中加载了`libfoo.so`，于是去`libfoo.so`中找`bar()`方法。

<img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_26_PBEzHH.png" width="500" alt="CrackMe" />

用ida打开`libfoo.so`，通过字符串很容易找到静态注册的`bar()`方法，可以看到验证方法主要用到了`v8`,`v9`两个参数，且在②中做了一些简单的对比，当字节长度为24且内容都相等的时候则会在③return true验证成功。
可以看到`v9`在`sub_10E0`中做了处理，`v8`作为循环的index在`qword_15038`数组上遍历，那么现在的任务就是找到`v9`和`qword_15038`的内容，然后还原对比算法。

<img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_26_HJ8pTe.png" width="500" alt="CrackMe" />

```JavaScript
function passRoot() {
    Java.perform(function() {
        let RootDetection = Java.use("sg.vantagepoint.util.RootDetection");
        RootDetection["checkRoot1"].implementation = function () {
            console.log(`RootDetection.checkRoot1 is called`);
            return false;
        };
        RootDetection["checkRoot2"].implementation = function () {
            console.log(`RootDetection.checkRoot2 is called`);
            return false;
        };
        RootDetection["checkRoot3"].implementation = function () {
            console.log(`RootDetection.checkRoot3 is called`);
            return false;
        };
    })
}

// hook sub_10E0 函数，入参就是v9的地址，找到地址就可以监控地址上值的变化
function hookSub10E0() {
    let module_obj = null;
    let modules = Process.enumerateModules();
    for (let i=0; i<modules.length; i++) {
        if (modules[i].name == "libfoo.so") {
            module_obj = modules[i];
        }
    }
    let sub_10E0_addr = module_obj.base.add(0x10E0);

    Interceptor.attach(sub_10E0_addr, {
        onEnter: function (args) {
            this.argPtr = args[0];
        },
        onLeave: function (retval) {
            console.log('v9:\n');
            console.log(hexdump(this.argPtr, {
                offset: 0,
                length: 24,
                header: true,
                ansi: true
            }));
        }
    });
}

// 在 qword_15038 的地址上拿24为就是数组内容
function getV8() {
    let module_obj = null;
    let modules = Process.enumerateModules();
    for (let i=0; i<modules.length; i++) {
        if (modules[i].name == "libfoo.so") {
            module_obj = modules[i];
        }
    }

    let qword_15038_addr = module_obj.base.add(0x15038);
    console.log(`v8: ${Memory.readUtf8String(qword_15038_addr,24)}`);
}

function main() {
    passRoot();
    hookSub10E0();
    getV8();
}

setImmediate(main);
```
找到了`v8`的内容：`pizzapizzapizzapizzapizz`和`qword_15038`的内容：`1d0811130f1749150d0003195a1d1315080e5a0017081314`

<img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_26_Msv0Yq.png" width="500" alt="CrackMe" />

还原算法：
```Python
import binascii

xorkey = "pizzapizzapizzapizzapizz"
secret_key = binascii.unhexlify("1d0811130f1749150d0003195a1d1315080e5a0017081314".encode('utf-8')).decode("utf-8")

password = str()
for i in range(24):
    password += chr((ord(xorkey[i]) ^ ord(secret_key[i])))

print(password)

# output: making owasp great again
```

将密码输入APP，密码正确，密码为`making owasp great again`

<img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_26_RywvLN.png" width="200" alt="CrackMe" />