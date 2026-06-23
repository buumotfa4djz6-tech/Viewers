# PACS Client Context

## 项目概述

基于 OHIF Viewer 构建完整的 PACS 客户端软件。OHIF 已经提供了影像查看、认证、工作列表、DICOM SR 报告等基础功能，需要在此基础上扩展角色权限、多租户、报告工作流、统计分析等功能。

## 核心概念

### 用户角色
- **管理员** — 管理用户、配置系统、查看统计
- **医生** — 创建报告、审核报告、查看影像
- **技师** — 提交检查、查看影像、创建初步报告
- **审核医生** — 审核和签发报告

### 多租户
通过 OHIF 租户标识实现数据隔离，每个租户有独立的数据空间。

### 报告工作流
利用 WorkflowStepsService 实现标准流程：技师提交 → 医生创建报告 → 审核医生审核 → 签发归档

### 报告模板
固定模板，存储在配置文件中，每个检查类型一个固定模板，支持简单文本和结构化字段混合。

### 工作状态
四个状态：待处理、进行中、已完成、已取消

## 已有功能（无需重新实现）

- **用户认证** — UserAuthenticationService + OpenIdConnectRoutes + Keycloak 集成
- **工作列表** — WorkList 组件 + useStudyListQuery + CustomizationService 扩展点
- **DICOM SR 报告** — cornerstone-dicom-sr 扩展 + createReportAsync
- **测量追踪** — measurement-tracking 扩展 + SR 水合
- **工作流框架** — WorkflowStepsService
- **定制化系统** — CustomizationService（全局/模式/默认三级）

## 需要新增的功能

- **角色权限 (RBAC)** — 基于 Keycloak 角色的功能级别权限控制
- **多租户支持** — OHIF 租户标识 + 数据过滤
- **报告模板系统** — 配置文件中的固定模板
- **报告工作流** — 基于 WorkflowStepsService 的状态管理
- **工作状态追踪** — 待处理、进行中、已完成、已取消
- **工作分配** — 将检查分配给特定医生
- **统计分析** — 前端简单指标 + 后端复杂指标

## 技术栈

- **前端框架** — React 18 + TypeScript
- **状态管理** — Zustand
- **认证系统** — Keycloak (OIDC)
- **PACS 后端** — DCM4CHEE
- **部署方式** — Docker 容器化部署
- **运行环境** — Linux 服务器

## 实现方式

扩展现有服务，只创建真正需要的新扩展：
- extension-rbac — 角色权限控制
- extension-multitenant — 多租户支持
- extension-report-workflow — 报告模板和工作流
- extension-analytics — 统计分析

## 开发计划

按依赖顺序迭代开发：
1. 第一阶段 — 角色权限（其他功能都依赖于此）
2. 第二阶段 — 多租户支持
3. 第三阶段 — 报告模板和工作流
4. 第四阶段 — 工作状态追踪和分配
5. 第五阶段 — 统计分析
