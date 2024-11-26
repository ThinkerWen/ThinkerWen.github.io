---
title: 大麦网回流票监控
date: 2024-06-27 16:10:37
tags: ['逆向']
categories: ["逆向"]
years: ["2024"]
---

最近演唱会增多，总是抢不到票，所以想从回流票入手，做一个某麦网的演唱会回流票的监控。

最简单的方向就是从网页端入手。

<img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_26_88DSq2.png" width="200" alt="大麦" />

在这个演唱会页面看到**网页端不支持购买**，不慌，咱只是看看有没有票不购买，直接抓包随便一个音乐节的票量接口。

经过抓包得到以下两个链接，分别是

场次接口：

```HTTP
https://mtop.damai.cn/h5/mtop.alibaba.damai.detail.getdetail/1.2/?jsv=2.7.2&appKey=12574478&t=1696836862157&sign=8f6f6d430ae53782832c28c208c9c246&api=mtop.alibaba.damai.detail.getdetail&v=1.2&H5Request=true&type=originaljson&timeout=10000&dataType=json&valueType=original&forceAntiCreep=true&AntiCreep=true&useH5=true&data=%7B%22itemId%22%3A739853478245%2C%22platform%22%3A%228%22%2C%22comboChannel%22%3A%222%22%2C%22dmChannel%22%3A%22damai%40damaih5_h5%22%7D
```

座次接口：

```HTTP
https://mtop.damai.cn/h5/mtop.alibaba.detail.subpage.getdetail/2.0/?jsv=2.7.2&appKey=12574478&t=1696837077937&sign=2000a8d025a2b8ff407be20a671b5e48&api=mtop.alibaba.detail.subpage.getdetail&v=2.0&H5Request=true&type=originaljson&timeout=10000&dataType=json&valueType=original&forceAntiCreep=true&AntiCreep=true&useH5=true&data=%7B%22itemId%22%3A%22739853478245%22%2C%22bizCode%22%3A%22ali.china.damai%22%2C%22scenario%22%3A%22itemsku%22%2C%22exParams%22%3A%22%7B%5C%22dataType%5C%22%3A2%2C%5C%22dataId%5C%22%3A%5C%22211839138%5C%22%2C%5C%22privilegeActId%5C%22%3A%5C%22%5C%22%7D%22%2C%22platform%22%3A%228%22%2C%22comboChannel%22%3A%222%22%2C%22dmChannel%22%3A%22damai%40damaih5_h5%22%7D
```

经过验证headers是统一的不会变也没有加密参数，cookie也是一致的但有未知参数`_m_h5_tk`和`_m_h5_tk_enc`
<img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_26_VGAgxj.png" width="500" alt="大麦" />
而这两个接口里的参数大同小异，分别如下

场次接口：

<img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_26_zIjBAS.png" width="500" alt="大麦" />

座次接口：

<img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_26_NL4mDY.png" width="500" alt="大麦" />

可以看到其中关键参数就是`t`、`sign`、`data`，其他参数都是固定的。

其中data显而易见，场次接口的`itemId`就是这个演出的id，其他参数固定；座次接口的`itemId`是演出id，`dataId`就是当前场次的id（例如10.21场），其他参数固定。  
接着我们可以打断点看一下这个t和sign是如何生成的。F12调出控制台，下一个xhr断点，可以直接打到`sign`上，也可以打到对应链接上。

<img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_26_JDuCbE.png" width="200" alt="大麦" />

刷新一下页面触发断点，找到对应的请求发起js文件。

<img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_26_ZgU6Vp.png" width="500" alt="大麦" />

在这个文件里简单调试下很容易就能找到加密函数

<img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_26_ptv6qb.png" width="500" alt="大麦" />

可以看到这个函数就是将`token`、`c`、`s`、`data`，以&进行分隔拼接，然后再进行加密得到sign。

其中`token`暂时未知，`c`就是url参数中的t时间戳，`s`就是url参数中的`appKey`固定值，`data`就是url参数中的`data`的json字符串，简单拼接就行。

所以现在就剩token未知，在函数上打个断点看看：  
<img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_26_dOTo6b.png" width="500" alt="大麦" />

发现这个`token`很眼熟，回头看看我们请求所需的cookie，这个`token`就是cookie中`_m_h5_tk`的前半部分，直接拿过来用就可以。

我们拿相同的参数去网上的在线md5加密一下，发现加密结果一致，即这个加密函数就是简单的md5加密。

现在所需要知道的就是`_m_h5_tk`是如何产生的，直接回到首页，删除cookie缓存重新抓包，找到set-cookie的那一条请求就行。

<img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_26_7CMqEz.png" width="500" alt="大麦" />

可以发现只要在token失效之后，随便发起一条请求携带过期的sign，就会返回新的`_m_h5_tk`，这下大功告成了。

最后再加上VX推送提示，或者其他通知app接口，就完成了回流监控。

<img src="https://cloud.hive-net.cn/gallery-api/fs/show-gallery/2024_09_26_ygrH9y.jpg" width="200" alt="微信推送" />