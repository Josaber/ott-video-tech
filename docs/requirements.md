# OTT Video Tech Demo 需求规格说明

本文整理 `ott-video-tech-demo` 的产品、技术和交付需求。目标是把项目从一个偏模拟的 OTT/VOD demo，推进成一个可以本地运行、上传视频、真实处理媒体、插入广告、生成 HLS 播放地址，并体现 SSAI/DRM/播放器行为的端到端演示系统。

## 目标

- 提供一个可运行的 OTT/VOD 发布流程 demo，覆盖 metadata、raw upload、transcode、package、SSAI、DRM、publish 和 playback。
- 后端需要真实调用 FFmpeg 处理媒体，而不是只记录模拟状态。
- 前端需要作为操作型 workflow console，支持创建资产、上传视频、触发处理、查看状态和播放生成的 m3u8。
- 生成的输出需要可以在本地浏览器中播放和验证。
- 代码需要可测试、可构建、可提交，并推送到 GitHub Enterprise 远端。

## 技术栈

### 后端

- Java 25。
- Spring Boot 4.1.0。
- Spring Web 提供 REST API。
- Spring Validation 处理请求校验。
- Spring Actuator 提供健康检查和运行信息。
- Spring Data JPA + Hibernate 管理持久化访问。
- Flyway 11.16.0 管理 PostgreSQL schema migration。
- Maven 负责依赖管理、测试和构建。

### 工作流与状态管理

- Temporal SDK 1.31.0 负责编排 VOD 发布流程。
- 本地 demo 默认使用 embedded Temporal runtime。
- 处理状态和 job timeline 保存在 PostgreSQL。
- 每个处理阶段通过独立 worker 实现，便于展示媒体发布流水线。

### 数据库与本地基础设施

- PostgreSQL 16 Alpine 作为本地数据库。
- Docker Compose 管理数据库容器。
- PostgreSQL 容器名为 `ott-video-tech-demo-postgres`。
- 本地数据库端口映射为 `55432:5432`。
- 数据库名、用户名和密码分别为 `ott_video_demo`、`ott_demo`、`ott_demo`。

### 媒体处理与播放格式

- FFmpeg 负责 raw video 转码、HLS packaging、本地广告素材生成和 AES-128 HLS 加密。
- 转码目标为 H.264/AAC MP4。
- 播放输出使用 HLS，包括 `master.m3u8` 和 `.ts` segment。
- DRM demo 使用 HLS AES-128 key file 机制。
- SSAI demo 使用 HLS manifest stitching、`#EXT-X-DATERANGE` 和 `#EXT-X-DISCONTINUITY` 表达广告插入。

### 前端

- React + Vite 构建操作型 workflow console。
- `hls.js` 加载和播放后端生成的 m3u8。
- `lucide-react` 提供界面图标。
- Vite dev server 固定运行在 `http://127.0.0.1:5173`。
- 前端通过 `/api` proxy 调用 `http://127.0.0.1:8080` 后端 API。

### 运行与交付工具

- 顶层 `Makefile` 提供安装、启动数据库、启动后端、启动前端、测试和构建入口。
- Git 管理代码版本。
- GitHub Enterprise 作为远端仓库。
- 后端验证命令为 `mvn -f backend/pom.xml test`。
- 前端验证命令为 `cd frontend && npm run build`。

## 功能需求

### 1. 元数据与上传

- 用户可以在前端创建视频元数据。
- 后端将元数据保存到 PostgreSQL，并把 asset 初始状态置为 `UNPUBLISHED`。
- 用户可以上传 raw video 文件。
- 后端保存原始文件，并记录 `UPLOAD` processing job。
- 支持较大的视频文件上传，本地 demo multipart 上限为 512MB。

### 2. 处理工作流

- 用户可以触发视频处理和发布。
- 后端通过 Temporal workflow 编排处理步骤。
- 每个处理步骤由独立 worker 执行：
  - `TRANSCODE`
  - `PACKAGE`
  - `SSAI`
  - `DRM`
  - `PUBLISH`
- 前端需要展示各步骤进度和 job message。
- 本地开发默认使用 embedded Temporal，不要求用户额外启动 Temporal 服务。

### 3. FFmpeg 转码与 HLS 打包

- 后端必须使用 FFmpeg 真实处理上传视频。
- 转码输出为浏览器友好的 H.264/AAC MP4。
- HLS packaging 输出 `master.m3u8` 和 `.ts` segment。
- 生成文件默认落在 `backend/data/processed/<assetId>/` 下。
- FFmpeg 路径通过 `app.media.ffmpeg-path` 配置，默认使用 PATH 上的 `ffmpeg`。

### 4. SSAI 广告插入

- SSAI 不能只写 marker，需要真正插入广告媒体。
- demo 应生成一段本地 pre-roll 广告视频。
- 广告视频生成后需要被打包成 HLS。
- 最终播放 manifest 中，广告 segment 必须出现在节目 segment 前面。
- manifest 需要包含 SSAI 相关 metadata，例如 `#EXT-X-DATERANGE`、广告时长和广告 asset id。
- 插入广告时需要使用 `#EXT-X-DISCONTINUITY` 分隔广告和节目内容。

### 5. 广告素材生成

- 当前广告素材由 FFmpeg 本地生成，不依赖外部 VAST 或广告服务器。
- 生成方式基于 FFmpeg `lavfi`：
  - 视频使用 `color` 和多层 `drawbox` 生成图形画面。
  - 音频使用 `sine=frequency=880:sample_rate=48000`。
  - 当前默认 pre-roll 时长为 3 秒。
  - 编码为 H.264 `libx264` + AAC。
- 广告文件按 asset 生成并落盘，不是用户每次播放时动态生成。
- 默认路径：
  - `backend/data/processed/<assetId>/ssai/ad/preroll.mp4`
  - `backend/data/processed/<assetId>/ssai/ad/master.m3u8`
  - `backend/data/processed/<assetId>/ssai/ad/segment_000.ts`

### 6. DRM 处理

- DRM 阶段需要生成 AES-128 HLS 加密输出。
- 只加密节目内容，不加密广告内容。
- 最终播放 manifest 中，未加密广告 segment 必须位于 `#EXT-X-KEY` 之前。
- 节目 segment 必须位于 `#EXT-X-KEY` 之后，并受 AES-128 key 保护。
- 生成的 `license.key` 和 `key-info.txt` 保存在 DRM 输出目录。
- asset 上需要记录 DRM key id，并在前端显示部分 key id 以便 demo 观察。

### 7. 播放器与广告不可跳过

- 前端播放器使用生成的后端 m3u8 URL 进行 HLS 播放。
- 不拖动时，播放器必须先播放 pre-roll 广告，再播放节目内容。
- 用户在广告未播放完之前不能通过播放器 controls 跳过广告。
- 播放器需要拦截广告阶段的 seek 行为：
  - 拖动进度条跳过广告时，需要被拉回已观看广告进度。
  - 通过键盘快进广告时，需要阻止该操作。
  - 广告阶段需要强制 `playbackRate = 1`，避免通过倍速绕过。
- 广告播放完成后，节目内容应恢复正常 seek 和播放控制。
- 播放器需要从 m3u8 的 `#EXT-X-DATERANGE` 读取广告时长，兼容不同广告时长。
- 当前不可跳过逻辑属于 player-side enforcement。更强的防绕过能力需要服务端 sessionized manifest 或 segment gating。

## 非功能需求

- 项目需要提供简单的本地启动方式。
- 需要有顶层 `Makefile`，降低启动、测试和构建成本。
- 前端需要有 favicon。
- UI 应保持操作型 workflow console 风格，不做营销 landing page。
- 文档需要说明本地运行、API、demo flow 和关键媒体处理行为。
- 后端 schema 使用 Flyway 管理，Hibernate 只做 schema validate。
- PostgreSQL 使用 Docker Compose，本地端口为 `55432`，避免和本机 `5432` 冲突。

## 验收标准

- `docker compose up -d postgres` 可以启动数据库。
- 后端可以通过 `mvn spring-boot:run` 在 `http://127.0.0.1:8080` 启动。
- 前端可以通过 `npm run dev` 在 `http://127.0.0.1:5173` 启动。
- `GET /actuator/health` 返回 `UP`。
- 用户可以完成 metadata 创建、raw upload、process/publish 和 playback。
- 处理后生成的 playback manifest 可访问，并包含：
  - `#EXT-X-DATERANGE:ID="demo-preroll"`
  - 广告 segment 位于节目 segment 前。
  - 广告 segment 位于 `#EXT-X-KEY` 之前。
  - 节目 segment 位于 `#EXT-X-KEY` 之后。
- 广告和节目 segment 通过 playback API 返回 HTTP 200。
- 广告阶段拖动进度条或键盘快进不能跳过广告。
- 前端 production build 通过。
- 后端测试通过。
- `git diff --check` 无空白问题。

## 已完成交付

- 修复并完善项目，使其可以端到端本地运行。
- 接入 PostgreSQL、Flyway、JPA 和 embedded Temporal。
- 实现 FFmpeg 转码、HLS 打包和 AES-128 HLS 加密。
- 实现本地生成 pre-roll 广告并真实插入 HLS。
- 实现广告不加密、节目加密的最终播放 manifest。
- 实现播放器层广告不可跳过。
- 新增 focused tests 覆盖 manifest 拼接和 FFmpeg 媒体输出。
- 更新 README、favicon 和 Makefile。
- 多次完成 build/test/smoke test 验证。
- 已提交并推送到 `origin/main`。

## 后续可选增强

- 在广告 segment 前显式写入 `#EXT-X-KEY:METHOD=NONE`，让未加密广告状态更明确。
- 增加服务端 sessionized manifest 和 segment gating，防止用户直接请求节目 segment 绕过广告。
- 支持外部广告素材或 VAST response，而不是只使用本地生成 demo 广告。
- 支持多广告位，例如 mid-roll 和 post-roll。
- 增加播放器自动化测试，覆盖广告 seek lock 行为。
