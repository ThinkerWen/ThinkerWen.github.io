---
title: 小红书蒲公英 x-s, x-t 加密
date: 2026-04-17 16:03:10
categories: ['Reverse']
years: ["2026"]
---

最近做的项目和小红书的蒲公英投放平台有关，在请求接口的时候遇到了 `x-s` 和 `x-t` 的加密，总体解决难度不大，记录一下，最后附代码。

### 一、思路

先对要抓的接口进行抓包分析，可以看到有 4 个看起来比较关键的参数` x-b3-traceid`、`x-s`、`x-t`、`x-s-common`。我们重放请求找出关键的加密参数，发现 `x-b3-traceid` 和 `x-s-common` 对请求是否成功影响不大，只有 `x-s` 和 `x-t` 是关键参数，且要同时出现才能成功。

<img src="https://drive.404fix.cn/i/bVkXJyKsMj.png" width="500" alt="Snipaste_2026-04-17_22-02-51.png" />

然后我们直接打开控制台，去搜 `x-t`，找对应的加密 JS 代码。这个加密代码也是比较好找到的，很容易定位到 `x-t` 的生成方法。现在直接在关键位置打上断点，可以看到这个 `x-t` 的生成方法。给它在外部入参和内部方法上都打上断点。

<img src="https://drive.404fix.cn/i/mBVgFMA4zT.png" width="300" alt="Snipaste_2026-04-17_22-16-31.png" />

很直观地可以看到，`x-t` 就是当前的时间戳了，那么关键点也就是在 `x-s` 上面。可以看到这个 `x-s` 的生成主要依赖两个关键方法：
1. 内部匿名 `function` 
2. `R` 方法

只要还原这两个方法的具体逻辑就可以。先看外层的 `R` 方法。`R` 方法主要依赖 4 个关键参数：`f`、`p`、`u`、`c`，依次看这几个参数是什么：
1. `f` 就是 `x-t`，也就是时间戳
2. `p` 在浏览器环境下是固定的 `test`
3. `u` 可以通过打断点看到，其实就是当前请求的 url-path
4. `c` 是 stringify 后的请求 post-data，在 get 请求中它为空字符串

最后将这几个参数拼接成字符串就好了。

<img src="https://drive.404fix.cn/i/RUOiZDnSus.png" width="500" alt="Snipaste_2026-04-17_22-23-35.png" />

然后我们再看内部匿名 `function` 的入参，也就是 `R` 方法的返回值了，断点一进去就可以看出来，它是一个 MD5 字符串我们拿刚才的几个参数去验证一下。刚才的几个参数拼完之后是这样的：`1776436465654test/api/solar/user/info`

<img src="https://drive.404fix.cn/i/x7UqMxiiDZ.png" width="500" alt="Snipaste_2026-04-17_22-29-38.png" />
<img src="https://drive.404fix.cn/i/CWm1jVPxdj.png" width="500" alt="Snipaste_2026-04-17_22-40-10.png" />

显而易见的，我们 `R` 方法是还原成功了现在开始看匿名 `function` 方法。其实也能通过特征看出来，这个匿名 `function` 方法是一个自定义码表的 Base64。我们直接手动还原一下，到控制台跑一下刚才的加密。
<img src="https://drive.404fix.cn/i/2L6Gn0ED8N.png" width="500" alt="Snipaste_2026-04-17_22-44-07.png" />

还原后的 JS：

```javascript
(function () {
    const table = "A4NjFqYu5wPHsO0XTdDgMa2r1ZQocVte9UJBvk6/7=yRnhISGKblCWi+LpfE8xzm3";

    function customBase64(input) {
        const bytes = new TextEncoder().encode(input);
        let output = "";
        let i = 0;

        while (i < bytes.length) {
            const t = bytes[i++];
            const n = bytes[i++];
            const r = bytes[i++];

            const i1 = t >> 2;
            const i2 = ((t & 3) << 4) | (n >> 4);
            const i3 = ((n & 15) << 2) | (r >> 6);
            const i4 = r & 63;

            if (isNaN(n)) {
                output += table[i1] + table[i2] + table[64] + table[64];
            } else if (isNaN(r)) {
                output += table[i1] + table[i2] + table[i3] + table[64];
            } else {
                output += table[i1] + table[i2] + table[i3] + table[i4];
            }
        }

        console.log(output);
    }

    customBase64("d38a9ee4247c093d7515a516098fa4d2");
})();
```

<img src="https://drive.404fix.cn/i/hs4Oxk2nxh.png" width="500" alt="Snipaste_2026-04-17_22-46-38.png" />
<img src="https://drive.404fix.cn/i/chZN2pENGS.png" width="500" alt="Snipaste_2026-04-17_22-47-54.png" />

去原请求验证一下，可以看到是完全匹配的，`x-s` 和 `x-t`都还原成功了。

### 二、实现

因为我习惯用 python 所以还原成 python 代码：

```python
import time
import hashlib

table = "A4NjFqYu5wPHsO0XTdDgMa2r1ZQocVte9UJBvk6/7=yRnhISGKblCWi+LpfE8xzm3"

def custom_base64(input_str: str) -> str:
    data = input_str.encode("utf-8")
    output = ""
    i = 0

    while i < len(data):
        t = data[i]
        i += 1

        n = data[i] if i < len(data) else None
        i += 1

        r = data[i] if i < len(data) else None
        i += 1

        i1 = t >> 2
        i2 = ((t & 3) << 4) | ((n >> 4) if n is not None else 0)

        if n is None:
            i3 = 64
            i4 = 64
        elif r is None:
            i3 = (n & 15) << 2
            i4 = 64
        else:
            i3 = ((n & 15) << 2) | (r >> 6)
            i4 = r & 63

        output += table[i1] + table[i2] + table[i3] + table[i4]

    return output

def sign(url):
    x_t = int(time.time() *1000)
    payload = f"{x_t}test{url}"
    cipher = hashlib.md5(payload.encode("utf-8")).hexdigest()
    x_s = custom_base64(cipher)
    return x_t, x_s

print(sign("/api/pgy/kol/data/data_summary?userId=692c426a000000000300c4f0&business=0"))
```