---
title: 抖音星图 sign 加密参数
date: 2025-12-20 15:10:03
categories: ['Reverse']
years: ["2025"]
---

前段时间做星图爬虫的时候，一些请求遇到了 `sign` 参数加密，由于好久没有写 Blog 了，于是写个 Blog 记录一下。好了，现在直接进入正题。

### 一、思路

首先是对星图的对应请求进行抓包，抓包得到下面的这个接口。

<img src="https://drive.404fix.cn/i/y7mnrlIHEG.png" width="500" alt="星图"/>

这个接口是一个任务导出接口，可以看到有一个 `sign` 参数：`2fe1ed100fee78edd2277c8a26ae0778`。密钥一看就像是 MD5 加密，可以打 XHR 断点，然后根据调用栈，去 js 里面找 MD5相关调用场景。

<img src="https://drive.404fix.cn/i/xVndAnaiYu.png" width="500" alt="CleanShot 2026-01-27 at 19.24.03@2x.png" />

很容易就能定位到这个 `sign` 加密的位置，就看到这个 `sign` 的赋值位置是在这个 `sign$1` 的方法里面，只要拆解还原一下这个方法就可以。

首先在调试面板里能看到，函数会先提取请求里的关键参数：`page`、`limit`、`start_time`、`end_time`、`payment_type`、`operate_type`、`service_name`、`service_method`、`sign_strict`。

然后做了三步关键处理：
- 从 `d` 中取出关键的参数对照表
- 把这些参数排序后按 `key+value` 规则拼接成字符串，还会额外加一个固定密钥串 `e9fefef711becf4c3d7bfef829578b0c`；
- 对拼接后的字符串做`md5`哈希处理，最终生成 `sign` 参数。

<img src="https://drive.404fix.cn/i/eFKlJhJR8F.png" width="500" alt="CleanShot 2026-01-27 at 19.24.59@2x.png" />
方法还原起来也是比较容易的，只要注意拼接时的顺序就行，我们直接在本地还原一下，然后按照已有的请求参数进行一次重试。

本地把加密方法用 python 还原之后再跑一遍，得到加密后的参数 `2fe1ed100fee78edd2277c8a26ae0778` 。拿去和原来的请求对比发现完全一致，重放请求也请求正常，证明我们的 `sign` 逻辑是正确。

<img src="https://drive.404fix.cn/i/WtHTwgQP7e.png" width="300" alt="CleanShot 2026-01-27 at 19.48.31@2x.png" />

这是一个简单的 MD5 加密，只要知道它的加密参数的生成逻辑就行，没有什么难度，记录一下。

### 二、实现

附代码：
```python
import hashlib

page = '1'
limit = '10'
start_time = '2025-10-27 00:00:00'
end_time = '2026-01-27 23:59:59'
payment_type = '10'
operate_type = '0'
service_name = 'orders.AdStarOrdersService'
service_method = 'DemanderGetTradeRecord'
sign_strict = '1'

payload = {
    "download": True,
    "page": 1,
    "limit": 10,
    "start_time": '2025-10-27 00:00:00',
    "end_time": '2026-01-27 23:59:59',
    "payment_type": 10,
    "operate_type": 0,
    "service_name": 'orders.AdStarOrdersService',
    "service_method": 'DemanderGetTradeRecord',
    "sign_strict": 1,
}

def sign(params: dict) -> str:
    keys = list(params.keys())
    secret = "e9fefef711becf4c3d7bfef829578b0c"
    parts = []
    for k in sorted(keys):
        v = params.get(k)

        if v is None:
            parts.append("")
        else:
            if isinstance(v, (str, int, float)) and not isinstance(v, bool):
                parts.append(f"{k}{v}")
            else:
                parts.append(f"{k}{k}")

    return hashlib.md5(("".join(parts) + secret).encode("utf-8")).hexdigest()

print(sign(payload))
```
