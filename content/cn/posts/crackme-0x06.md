---
title: Android crackme_0x06
date: 2024-06-24 14:53:53
tags: ['CrackMe', '逆向']
categories: ['CrackMe', '逆向']
years: ["2024"]
---

## 描述

A secret string is hidden somewhere in this app. Find a way to extract it.

### 目标

找到密码

### APK下载

[https://yhxx.lanzoub.com/iGhc20mreula](https://yhxx.lanzoub.com/iGhc20mreula)

## 题解

首先打开APP看一下，可以看到是需要输入注册码来进行注册，但是检测到了root，需要先过root检测。
<img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_26_n6eVfl.jpg" width="200" alt="CrackMe" />

在GitHub上有个脚本可以过很多root检测[https://github.com/AshenOneYe/FridaAntiRootDetection](https://github.com/AshenOneYe/FridaAntiRootDetection)，用这个脚本就可以过这个APP的root检测，不过还是看看具体代码中怎么过吧。
Jadx-GUI打开找到root检测的位置，发现用到了3个函数，当3个函数都返回true时就可以正常使用APP。
<img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_26_ilmmHs.png" width="500" alt="CrackMe" />

点进去发现3个函数都在一个类中，只要将3个函数都改为永远返回true就行，可以直接修改smali或者hook，hook方便一些。
<img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_26_dWVV5d.png" width="500" alt="CrackMe" />

写好hook的代码，使用frida重启注入`frida -U --no-pause -f owasp.mstg.uncrackable1 -l crack.js`
```JavaScript
function passRoot() {
    Java.perform(function() {
        let c = Java.use("sg.vantagepoint.a.c");
        c["a"].implementation = function () {
            console.log(`c.a is called`);
            return false;
        };
        c["b"].implementation = function () {
            console.log(`c.b is called`);
            return false;
        };
        c["c"].implementation = function () {
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
<img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_26_eYkFku.jpg" width="200" alt="CrackMe" />

再找到验证密码的地方，看到是在`verify()`方法中，将用户输入的文本传入`a.a()`方法中进行检查。
<img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_26_7413I6.png" width="500" alt="CrackMe" />

进入`a.a()`方法，可以看到加密的方法还是比较简单的，本地还原一下就行。
<img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_26_rmNKQ7.png" width="500" alt="CrackMe" />

将加密函数进行本地还原，输出结果为`I want to believe`
```Python
from base64 import b64decode
from Crypto.Cipher import AES

def aes_decrypt(key_hex: str, data_base64: str) -> bytes:
    key = bytes.fromhex(key_hex)
    data = b64decode(data_base64)
    cipher = AES.new(key, AES.MODE_ECB)
    decrypted_data = cipher.decrypt(data)
    pad_len = decrypted_data[-1]
    decrypted_data = decrypted_data[:-pad_len]
    return decrypted_data

def get_string() -> str:
    try:
        decrypted_data = aes_decrypt("8d127684cbc37c17616d806cf50473cc", "5UJiFctbmgbDoLXmpL12mkno8HT4Lv8dlat8FxR2GOc=")
    except Exception as e:
        print(f"AES error: {str(e)}")
        decrypted_data = b''
    return decrypted_data.decode()

print(get_string())

# output: I want to believe
```

将密码输入APP，密码正确，密码为`I want to believe`
<img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_26_Waysx6.jpg" width="200" alt="CrackMe" />
