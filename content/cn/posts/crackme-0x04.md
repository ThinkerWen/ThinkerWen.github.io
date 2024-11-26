---
title: Android crackme_0x04
date: 2023-06-20 16:51:29
tags: ['CrackMe', '逆向']
categories: ['CrackMe', '逆向']
years: ["2023"]
---

## 描述

使用用户名和注册码来成功注册软件。

### 目标

成功注册软件

### APK下载

[https://yhxx.lanzoub.com/i3Acs0mqhnji](https://yhxx.lanzoub.com/i3Acs0mqhnji)

## 题解

首先打开APP看一下，可以看到是需要输入用户名和注册码来通过注册。
<img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_25_REl7Wz.jpg" width="200" alt="CrackMe" />

用Jadx-GUI打开APK看一下源码，通过`onClick()`绑定的函数发现注册按钮是通过调用`checkSN()`函数来判断是否成功注册的，传入参数为用户名和注册码。
<img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_25_Foj31S.png" width="500" alt="CrackMe" />

在`checkSN()`中将`username`进行md5加密，然后经过简单的字符串拼接计算出注册码`sn`，由于并不困难，所以只需本地实现一下计算过程就行。
<img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_25_LL1HKk.png" width="500" alt="CrackMe" />

```Python
import hashlib

def md5_hash(input_string):
    md5 = hashlib.md5()
    md5.update(input_string.encode('utf-8'))
    bytes_hash = md5.digest()
    hexstr = ''.join(f'{b:02x}' for b in bytes_hash)
    return hexstr

result = str()
user_name = "cracker"
hexstr = md5_hash(user_name)
for i in range(0, len(hexstr), 2):
    result += hexstr[i]
print(f"The {user_name}'s password is: {result}")

# Output:
# The cracker's password is: 26b525207d9b7886
```

将得到的用户名和注册码填入APP即可注册成功
<img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_25_aXmJrb.png" width="200" alt="CrackMe" />