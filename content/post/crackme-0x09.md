---
title: Android crackme_0x09
date: 2023-08-10 16:00:52
tags: ['CrackMe', '逆向']
categories: ['CrackMe', '逆向']
years: ["2023"]
---

## 描述

package: com.tlamb96.spetsnazmessenger

### 目标

找到Flag

### APK下载

[https://yhxx.lanzoue.com/iwnao22p7pda](https://yhxx.lanzoue.com/iwnao22p7pda)

## 题解
首先打开APP看一下，检测到只能运行在俄罗斯版的设备上，需要先过设备检测。

<img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_26_4TKWhe.png" width="200" alt="CrackMe" />

Jadx-GUI打开找到设备检测的位置，发现用`System.getProperty("user.home")`来获取设备类型，同时发现还用到`System.getenv("USER")`增加了用户白名单检测，白名单用户是`R.string.User`。

<img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_26_brNfX1.png" width="500" alt="CrackMe" />

想找用户字符串很简单，Android的字符串资源都存储在`/res/values/strings.xml`中，可以使用apktool工具解压apk文件查看`apktool d base.apk`。或者直接在Jadx-GUI的路径`/资源文件/resources.arsc/res/values/strings.xml`中查看。
打开xml文件后可以看到名为User的字符串值：`RkxBR3s1N0VSTDFOR180UkNIM1J9Cg==`即为白名单用户。

<img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_26_3lZ2zJ.png" width="500" alt="CrackMe" />

hook以上两个函数就可以过检测了
```JavaScript
function passCheck() {
    Java.perform(function () {
        var System = Java.use('java.lang.System');
        System.getProperty.overload('java.lang.String').implementation = function (name) {
            if (name == 'user.home') return 'Russia';
            return this.getProperty(name);
        };
        System.getenv.overload('java.lang.String').implementation = function (name) {
            if (name == 'USER') return 'RkxBR3s1N0VSTDFOR180UkNIM1J9Cg==';
            return this.getProperty(name);
        };
    });
}

function main() {
    passCheck();
}

setImmediate(main);
```

打开APP没有提示了，显示需要输入用户名密码进入APP

<img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_26_H9wnMc.png" width="200" alt="CrackMe" />

用Jadx-GUI继续看APP，找到登陆页，发现用户名依旧是从资源里面取`username`，拿到是`codenameduchess`。密码是在`j()`方法中对比。

<img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_26_lunWnC.png" width="500" alt="CrackMe" />

打开`j()`方法，发现是md5对比，md5字符串是从资源里面取`password`，拿到是`84e343a0486ff05530df6c705c8bb4`。这是一个非标准md5，需要进行补0，直接去百度搜md5原文，或者hook j()方法，搜索得到明文是`guest`。

<img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_26_81ZH6J.png" width="500" alt="CrackMe" />

输入用户名`codenameduchess`和密码`guest`进入APP，显示是个聊天页，需要发送正确消息。

<img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_26_r3iFvu.png" width="200" alt="CrackMe" />

用Jadx-GUI继续看APP，找到发送消息页，发现是在`i()`方法中获得flag，但是`i()`方法需要用到`this.q`和`this.s`。

<img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_26_Qk3Q2X.png" width="500" alt="CrackMe" />

继续看可以找到`this.q`和`this.s`是在`onSendMessage()`方法中生成的，而要生成`this.s`和`this.q`又需要用到`a()`方法和`b()`方法。

<img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_26_lhYq8t.png" width="500" alt="CrackMe" />

`a()`方法比较简单，直接用本地进行还原。
```Python
from z3 import *
from binascii import b2a_hex, a2b_hex
 
def question1():
    char_array = list("V@]EAASB\u0012WZF\u0012e,a$7(&am2(3.\u0003")
    length = len(char_array)
    for i in range(length // 2):
        c = char_array[length - i - 1]
        char_array[length - i - 1] = chr(ord(char_array[i]) ^ ord('2'))
        char_array[i] = chr(ord(c) ^ ord('A'))
    print(''.join(char_array))


def main():
    question1()
 
 
if __name__ == "__main__":
    main()

# output: Boris, give me the password
```

<img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_26_gQC9BQ.png" width="200" alt="CrackMe" />

`b()`方法较`a()`方法难度提升，同时有不可见字符，直接逆向推导函数会有不可见字符，使用[Z3-Solver](https://github.com/Z3Prover/z3)进行推导。

<img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_26_FZFjsr.png" width="500" alt="CrackMe" />

```Python
from z3 import *
from binascii import b2a_hex, a2b_hex
 
def question2():
 
    r = "\u0000dslp}oQ\u0000 dks$|M\u0000h +AYQg\u0000P*!M$gQ\u0000"
    r_result = bytearray(a2b_hex(''.join(f'{ord(c):02x}' for c in r)))
    for i in range(int(len(r_result) / 2)):
        c = r_result[i]
        r_result[i] = r_result[len(r_result) - i - 1]
        r_result[len(r_result) - i - 1] = c
 
    s = Solver()
    x = [BitVec("x%s" % i, 32) for i in range(len(r_result))]
    for i in range(len(r_result)):
        c = r_result[i]
        s.add(((x[i] >> (i % 8)) ^ x[i]) == r_result[i])        #z3
        s.add(x[i] >= 0, x[i] <= 255)
    if (s.check() == sat):
        model = (s.model())
        flag = ""
        for i in range(len(r_result)):
            if (model[x[i]] != None):
                value = model[x[i]].as_long().real
                flag += " " if value == 0 else chr(value)
            else:
                flag += " "
        print('"' + flag + '"')


def main():
    question2()
 
 
if __name__ == "__main__":
    main()

# output: " ay I *P EASE* h ve the  assword "
```

将密码输入APP，密码正确，密码为` ay I *P EASE* h ve the  assword `。(由于加密的字符中有许多ascii为0的字符无法正确推导，所以也可以对output中的空格进行替换，得到：`May I *PLEASE* hive the password?`)

<img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_26_xUCrj8.png" width="200" alt="CrackMe" />