# VOD 视频网站系统架构设计

## 一、整体架构分层

```
┌─────────────────────────────────────────────────────────────┐
│ 1. 客户端层    Web / Mobile / TV / Cast · QoS+业务双通道埋点 │
└─────────────────────────────────────────────────────────────┘
                            │ (下行 API / 上行埋点)
┌─────────────────────────────────────────────────────────────┐
│ 2. 边缘层      视频 CDN · Image CDN · Edge · Origin Shield   │
│              媒体流量 ↔ CDN; API/License ↔ 旁路 → Gateway    │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│ 3. 接入层      Gateway / BFF / WAF / Auth / 限流 / 风控 /    │
│              埋点网关 (QoS+业务双流)                          │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│ 4. 业务层      核心: 用户 / 媒资 / Play Auth ★ / License ★ /│
│                     搜索 / 推荐编排                           │
│              变现: ADS / Manifest 服务 ★ / 计费+Webhook /    │
│                    营销 / 评论 / CMS                          │
│              参与: 历史 / 收藏 / 通知 / 家长 / 地域 / A/B    │
└─────────────────────────────────────────────────────────────┘
                            │                ↘ (调用)
┌─────────────────────────────────────────────────────────────┐
│ 5. AI 智能层   CV / Taxonomy / Embedding / 模型服务 /        │
│              内容审核 / 反盗版 (音视频指纹+DMCA)              │
│              ← CV 读对象存储反向依赖                          │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│ 6. 媒体处理层  Upload → Probe → ┌── 视频转码 ──┐ → Package  │
│                                  ├── 音频处理 ──┤ → DRM      │
│                                  └── 字幕生成 ──┘ → QC      │
│                                                      → Publish│
│              共享: Image Pipeline · Storyboard · Watermark   │
│                    JIT Packager · Origin Cluster · Workflow  │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│ 7. 数据 & 基础设施                                            │
│   存储:   对象存储 · 冷存储 · MySQL · Redis · ES · Kafka · Milvus│
│   处理:   Doris/CH · Flink · Spark+Hudi · Feature Store ·    │
│           CDN 日志分析 · OTel/Jaeger · Prom/ELK              │
│   横切:   KMS★ · Vault · Nacos · Istio · Argo CD ·          │
│           任务队列 · 多 Region                                 │
└─────────────────────────────────────────────────────────────┘
```

★ = 跨层关键运行时服务

---

## 二、关键子系统

### 1. 媒体管线 fan-out / fan-in

**主流水线：**
```
Upload
  ↓
Probe / 审核 (任务分发)
  ↓ (fan-out)
  ├──→ 视频转码 (H.264 / H.265 / AV1, per-title, ABR)
  ├──→ 音频处理 (AAC / EAC3 / Atmos, 多音轨, R128 响度)
  └──→ 字幕生成 (ASR / NMT / WebVTT / TTML)
  ↓ (fan-in)
Package · CMAF (HLS + DASH 共享 fMP4)
  ↓
DRM 加密 · CENC (从 KMS 取 key, 3 套 license)
  ↓
QC · VMAF + Storyboard + 封面
  ↓
Publish · 写 Origin + CDN 预热 + 事件→Kafka
```

**辅助服务：**
- Image Pipeline · 海报多比例 · Image CDN
- Storyboard / Trick Play
- Forensic Watermark · A/B 变体
- JIT Packager · 长尾内容动态打包
- Origin Cluster · nginx-vod / MediaPackage（**我方部署**，区别于 CDN 端的 Origin Shield）
- Workflow Orchestrator · Temporal / Argo · GPU/CPU/Spot

### 2. 业务层运行时关键服务

#### Play Auth ★
- 客户端 → Play Auth → 校验登录/订阅/地域/并发 → 签发：
  1. Manifest URL（指向 Manifest 服务）
  2. **DRM proxy token**（JWT，短期，绑 user/device/asset）
- 返回客户端后，客户端凭 proxy token 去请求 License Server

#### License Server ★
- 接受客户端 EME license request
- 校验 proxy token → 从 **KMS** 取 content key → 签发 DRM-specific license
- 三套并行：Widevine / FairPlay / PlayReady（同一 content key，不同 license 容器）
- 支持 **persistent license**（离线下载）+ **撤销机制**

#### Manifest 服务 ★（原 SSAI 升级）
做三件事：
1. **SSAI 拼接**：从 ADS 取 VAST → 拼主片+广告分片（CMAF 对齐）
2. **设备/订阅个性化**：
   - 订阅等级 → 4K/1080p/720p 码率上限
   - 设备能力 → codec 选择（H.264 / H.265 / AV1）
   - 用户偏好 → 默认字幕语言、默认音轨
   - HDCP 级别 → 决定下发哪一档分辨率
3. **PAL** （Programmatic Access Library）防广告作弊

#### KMS ★（在 Infra 层，横切）
- **统一密钥库**：内容 key 一份生成，多方读取
- **写方**：Packager（媒体管线 DRM 加密节点）
- **读方**：License Server（业务层运行时）
- Key rotation · HSM 后端可选

### 3. 客户端 SDK 双通道

| 通道 | 内容 | 路径 | 目标 |
|------|------|------|------|
| **QoS** | 首帧 / 卡顿 / 错误码 / CDN 节点 | Client → 埋点网关 → Kafka → Flink | 实时 CDN 调度反馈 |
| **业务** | 点击 / 播放 / 完播 / 收藏 | Client → 埋点网关 → Kafka → 数仓 | 推荐特征 · BI 报表 |

### 4. 跨层依赖关系（图中以虚线表示）

| 起点 | 终点 | 关系 |
|------|------|------|
| AI 内容理解 (CV) | 数据·对象存储 | 读取转码后视频做帧分析 |
| AI Embedding | 数据·Milvus | 写入向量 |
| 业务·推荐编排 | AI·模型服务 (Triton) | 在线推理调用 |
| 业务·License Server | Infra·KMS | 读取 content key |
| 媒体·DRM 加密 | Infra·KMS | 写入 / 读取 content key |
| 客户端·埋点 SDK | 数据·Kafka | 反向上行流量 |
| CDN · access log | 数据·CDN 日志分析 | 异步导入分析 |
| 业务·计费 | 外部 · 支付平台 | Webhook 回调 |

---

## 三、关键运行时流程

### 摄入 (Ingest, 离线，fan-out)
```
Upload → Probe → ┌── 视频转码 ──┐
                  ├── 音频处理 ──┤  并行
                  └── 字幕生成 ──┘
              → Package (CMAF)
              → DRM 加密 (KMS write)
              → QC (VMAF + Storyboard)
              → Publish → Origin → CDN 预热 → 事件→Kafka
```

### 播放 (Playback, 运行时)
```
Client (1) → Gateway → Play Auth (校验, 签 token)
                         ↓ token + manifest URL
Client (2) → Manifest 服务 (SSAI + 个性化) → CDN → 分片
Client (3) → License Server (凭 token, KMS read) → license
                         ↓
                     EME 解密 → 渲染
Client (4) → 埋点网关 → Kafka (QoS) → Flink → CDN 调度反馈
```

### 推荐
```
埋点 → 网关 → Kafka → Flink 实时特征 → Feature Store
                                            ↓
推荐编排 ── 召回 (Milvus + CF + 热门)
       ├── 粗排 (DSSM, Triton)
       ├── 精排 (DIN/SIM, Triton)
       └── 重排 (多目标 / 多样性 / 探索)
```

### 广告
```
Manifest 请求 → Manifest 服务 → ADS 决策 → VAST 响应
                                 ↓
                           主片 + 广告 CMAF 拼接
                                 ↓
                              CDN 分发
                                 ↓
                         客户端 beacon (PAL)
                                 ↓
                              归因 / 对账
```

---

## 四、非功能性设计

| 维度 | 设计要点 |
|------|---------|
| 可用性 | **多 Region Active-Active**、多 AZ、CDN 多供应商、Manifest 兜底 |
| 一致性 | 媒资强一致；推荐/搜索最终一致；License token 短期 |
| 成本 | per-title、CMAF 共享、JIT 长尾、Spot 转码、智能 CDN 调度、**冷存储分层**、**CDN 日志驱动选型** |
| 安全 | CENC + 多 DRM + HDCP + Token + 防盗链 + Watermark + 风控 + **PAL 防广告作弊** + **License 撤销** |
| 合规 | 内容审核、版权窗口、地域限制、家长/分级、GDPR、数据本地化 |
| 国际化 | 多语言 metadata、多字幕、多音轨、多 DRM、**多 Region 部署** |
| 可观测 | Prometheus（指标）+ ELK（日志）+ **OTel/Jaeger（链路）** 三栈 |
| 部署 | **GitOps (Argo CD)** + **Service Mesh (Istio)** + 灰度/蓝绿 |

---

## 五、关键设计陷阱

1. **媒体管线不是串行**：视频/音频/字幕必须并行；串行会让短片处理时间变成三者之和。
2. **License Server 不属离线管线**：它是运行时高 QPS 服务，必须与 Play Auth 同区，毫秒级响应。
3. **KMS 是横切**：Packager 写、License Server 读，不能让 KMS 嵌在媒体管线内部。
4. **Manifest 服务做的事远不止 SSAI**：码率上限、字幕默认、HDCP、PAL 都在这里收口。
5. **Play Auth 和 License Server 是两次调用**：很多设计漏了 proxy token 这一中间步骤，导致 license 鉴权失控。
6. **CDN 旁路 API**：视频流量走 CDN；API/License 走 Gateway（即便共享 CDN 域名也是 dynamic passthrough）。
7. **客户端埋点是上行流量**：架构图常误画为单向下行；实际是双向。
8. **CV/内容理解读对象存储**：是 AI 层"反向"读取媒体管线产物，跨多层依赖，不能忽略。
9. **Origin Shield (CDN 端) ≠ Origin Cluster (我方)**：前者是 CDN 厂商提供的回源收敛，后者是我方部署的回源出口；二者协作。
10. **离线 DRM 必须支持撤销**：persistent license + 撤销列表，否则一旦泄露无法回收。

---

## 六、上线分阶段

1. **MVP**：单 DRM、HLS、人工字幕、热门推荐、无广告、单 Region
2. **V1**：多 DRM + KMS、Manifest 服务 (SSAI+个性化)、ASR 字幕、协同过滤、Image CDN、历史/收藏
3. **V2**：4K/AV1、多 CDN 智能调度、精排模型、Forensic Watermark、家长控制、OTel 全栈、Service Mesh
4. **V3**：离线下载、实时推荐、Edge 个性化 manifest、**多 Region Active-Active**、AI 内容理解全面接入、音视频指纹反盗版
