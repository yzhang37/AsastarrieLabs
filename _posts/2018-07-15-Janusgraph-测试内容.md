---
layout: post
author: X230大青椒
categories:
- 编程
- 知识图谱
- JanusGraph
lid: zh-CN
ea: True
---

# 在 JanusGraph 建立索引提高访问性能

图索引是对整个图的全局索引结构, 它允许对点或边的属性进行有效的检索。例如, 考虑以下查询

```Groovy
g.V().has('name', 'hercules')
g.E().has('reason', textContains('loves'))
```

第一个查询在所有顶点中搜索“hercules“。第二个查询在所有的边中搜索包含“loves“的关系。如果没有建立图索引，则需要对图中的所有顶点或边进行全面扫描。这样非常低消，而且针对点数量很大的图不可行。在建立索引后，就可以快速访问所有的字段。

JanusGraph的索引有两种，一种是*综合索引*，由JanuGraph自己提供，只能进行全字匹配（即只能进行 = 运算符，不能用大于小于，也不能用 textContains 等模糊匹配），但速度较快。还有一种是*混合索引*，需要使用额外的索引引擎（如elasticsearch等）。

接下来介绍构建综合索引和混合索引。

## 1. 构建综合索引

综合索引支持 Unique key的构建。
### 1.1. 创建索引

**命令**
```Groovy
//连接服务器，带有 session
:remote connect tinkerpop.server conf/remote.yaml session
//切换为服务器模式
:remote console
//打开 JanusGraph 管理单元
mgmt = graph.openManagement()
// 创建 qiniu_id 的 unique key
qid_key = mgmt.makePropertyKey('qid').dataType(Integer.class).make()
// 构建 index
mgmt.buildIndex('byQidUnique', Vertex.class).addKey(qid_key).unique().buildCompositeIndex()
// 提交本次任务
mgmt.commit()
```

**结果**
```Groovy
gremlin> :remote connect tinkerpop.server conf/remote.yaml session
==>Configured localhost/127.0.0.1:8182-[6c549ddb-953a-44a0-bdc6-559abd77d674]

gremlin> :remote console
==>All scripts will now be sent to Gremlin Server - [localhost/127.0.0.1:8182]-[6c549ddb-953a-44a0-bdc6-559abd77d674] - type ':remote console' to return to local mode

gremlin> mgmt = graph.openManagement()
==>org.janusgraph.graphdb.database.management.ManagementSystem@6717a5a7

gremlin> qid_key = mgmt.makePropertyKey('qid').dataType(Integer.class).make()
==>qid

gremlin> mgmt.buildIndex('byQidUnique', Vertex.class).addKey(qid_key).unique().buildCompositeIndex()
==>byQidUnique

gremlin> mgmt.commit()
==>null
```

1. 第一步**链接服务器：**Gremlin Console 在默认情况下，对于发送给远程 (`:remote`) 的命令，每次执行命令都使用一次单独的会话(session)，执行完以后立即清除该会话。本例中需要使用变量（`mgmt`），如果没有持久的会话，每步命令执行完后变量就会被清除。在 `:remote` 命令最后增加`session`后就可以保持持久的会话。
2. 第二步**切换远程模式：**默认Gremlin Console所有的命令都是本地处理的，发给服务器命令之前要增加 `:>`。如果所有的命令都发往服务器，每条命令都要增加`:>`比较繁琐。使用 `:remote console`可以切换**本地**/**远程**模式，使所有的命令都发往服务器。切换后所有的命令就默认发往服务器，不需要在命令最前面增加`:>`。再次执行`:remote console`又可以回到本地模式。
3. 第三步**打开管理配置单元**。
4. 第四步**创建一个属性值：**本例中 qid 是一个Unique的数字，用于建边时使用。在数据类型中指定为 Integer。
5. 第五步**构建一个唯一索引**：`mgmt.buildIndex(独立名称, 类型)`。构建索引的时候需要有一个唯一名称，接下来对索引执行的任何操作都需要这个唯一名称。 类型可选值为 `Vertex.class`、 `Edge.class`，分别表示点和边。增加了 unique() 后表示这是一个唯一索引。值得注意的是，只有综合索引才可以创建unique key，混合索引则不能这么做。
6. 第六步**提交所有操作**：提交之前创建的索引。

### 1.2. 索引重建

首先要等待服务器完成索引的部署，状态字从 `INSTALLED` 到`REGISTERED`，然后重建索引。

> 接下来的命令在 pods 上运行会超时报错，mac 上没有任何问题。不过后来发现由于在创建 index 的时候 Janusgraph 是空的，因此不执行也无所谓，不会影响后续建图。

```Groovy
// 过几分钟后再执行（等待 INDEX 从 INSTALLED 状态变为 REGISTERED）
mgmt.awaitGraphIndexStatus(graph, 'byQidUnique').call()
// 重新打开 JanusGraph 管理单元
mgmt = graph.openManagement()
// 重建索引
mgmt.updateIndex(mgmt.getGraphIndex("byQidUnique"), SchemaAction.REINDEX).get()
// 提交本次任务
mgmt.commit()
```

**结果**

```Groovy
gremlin> mgmt.awaitGraphIndexStatus(graph, 'byQidUnique').call()
==>GraphIndexStatusReport[success=true, indexName='byQidUnique', targetStatus=[REGISTERED], notConverged={}, converged={qid=REGISTERED}, elapsed=PT0.011S]
gremlin> mgmt = graph.openManagement()
==>org.janusgraph.graphdb.database.management.ManagementSystem@28b824a9
gremlin> mgmt.updateIndex(mgmt.getGraphIndex("byQidUnique"), SchemaAction.REINDEX).get()
==>org.janusgraph.diskstorage.keycolumnvalue.scan.StandardScanMetrics@1cd6dbe
```

## 2. 使用混合索引（基于 Elasticsearch） 

不同词条的内容很长，如果使用综合索引，则在索引的过程中只能匹配整个词条才能查询。例如，`1·17巴基斯坦列车炸弹爆炸事件`，整个词条要完全匹配才能进行搜索，这样的索引是不实用的。本文希望给出几个关键字就可以匹配到这些实体，例如给出“事件“就可以查找到这个实体，这样就需要用到混合索引。

混合索引的详细内容请查阅：http://docs.janusgraph.org/latest/index-backends.html

### 2.1. 建立 Full-Text 搜索(基于 String的)

**代码**

```Groovy
mgmt = graph.openManagement()
name_key = mgmt.makePropertyKey('name').dataType(String.class).make()
mgmt.buildIndex('byEntityName', Vertex.class).addKey(name_key, Mapping.STRING.asParameter()).buildMixedIndex("search")
mgmt.commit()
mgmt.awaitGraphIndexStatus(graph, 'byEntityName').call()
mgmt = graph.openManagement()
mgmt.updateIndex(mgmt.getGraphIndex("byEntityName"), SchemaAction.REINDEX).get()
```

第三行创建了一个名为“byEntityName”的索引。这个名字是索引的唯一标识符，以后对索引进行重建、删除等都需要用到这个名字。在 addKey 的时候，函数指定索引方式为 Mapping.STRING。最后指定构建混合索引，使用search引擎。

其中，`Mapping.STRING` 表示对字符串构建字符级别的索引（类似于N-char）。也可以使用`Mapping.TEXT`，这样就会在文本中按照空格分割，给每个单词构建N-gram词袋索引（Bag of words）。由于中文单词之间没有空格，因此在这里使用`Mapping.TEXT`不合适的，本文使用`Mapping.STRING`。

一个 JanusGraph 可以配置多个索引引擎，默认配置的是名为`search`的引擎，其实质是 Elasticsearch。这些配置都在 JanusGraph 的配置文件中，可以进行修改。

**结果**

```Groovy
gremlin> mgmt = graph.openManagement()
==>org.janusgraph.graphdb.database.management.ManagementSystem@5c7a4ce6
gremlin> name_key = mgmt.getPropertyKey('name')
==>name
gremlin> mgmt.buildIndex('byEntityName', Vertex.class).addKey(name_key, Mapping.STRING.asParameter()).buildMixedIndex("search")
==>byEntityName
gremlin> mgmt.commit()
==>null
gremlin> mgmt.awaitGraphIndexStatus(graph, 'byEntityName').call()
==>GraphIndexStatusReport[success=true, indexName='byEntityName', targetStatus=[REGISTERED], notConverged={}, converged={name=REGISTERED}, elapsed=PT0.009S]
gremlin> mgmt = graph.openManagement()
==>org.janusgraph.graphdb.database.management.ManagementSystem@b4edcf6
gremlin> mgmt.updateIndex(mgmt.getGraphIndex("byEntityName"), SchemaAction.REINDEX).get()
==>org.janusgraph.diskstorage.keycolumnvalue.scan.StandardScanMetrics@1e062d77

```

在 Mac 上的速度：每秒钟250条（比没有 index 的慢了一倍）