# rn-inc-game

這是一個使用 Expo 和 React Native 建立的放置型遊戲專案。

## 開發指令

1.  安裝專案依賴

    ```bash
    npm install
    ```

2.  啟動應用程式

    ```bash
    npx expo start
    ```

## 遊戲簡介

這款遊戲模擬了經營一間遊戲開發工作室的過程。玩家將扮演工作室的管理者，透過招聘工程師來自動產生「創意值」（Creativity）和「生產力」（Productivity）這兩種資源。利用這些資源，玩家可以開發不同的遊戲，並從中獲得「金錢」（Money）收入。遊戲的核心循環是：**生產資源 -\> 開發遊戲 -\> 獲得收入 -\> 再投資擴張**。

## 遊戲運作設計

遊戲的核心邏輯圍繞在幾個關鍵的數據結構和處理流程上：

### 1\. 遊戲狀態 (`SaveProfile`)

所有遊戲進度都儲存在一個 `SaveProfile` 物件中，包含以下主要部分：

  * **`resources`**: 玩家當前擁有的資源。
      * `creativity`: 創意值，用於開發遊戲。
      * `productivity`: 生產力，用於開發遊戲。
      * `money`: 金錢，用於支付開發成本。
      * `creativity_max`, `productivity_max`: 創意值和生產力的最大儲存量。
      * `creativity_per_tick`, `productivity_per_tick`, `money_per_tick`: 每一個遊戲刻（tick）自動產生的資源量。
  * **`employees`**: 玩家擁有的員工，目前只有 `engineer_level_1` 一種。
  * **`games`**: 玩家已開發或正在開發的遊戲列表。
      * 每個遊戲物件都包含 `name`, `status` (`developing` 或 `completed`) 和 `development_progress_ticks`。
  * **`createdAt`**: 遊戲創建時間，用於計算離線期間的進度。

### 2\. 遊戲進度更新 (`updateSaveProfile`)

遊戲的核心更新機制是 `updateSaveProfile` 函數。這個函數會在以下兩種情況下被呼叫：

  * 遊戲載入時，根據上次儲存時間和當前時間的差值來計算離線收益。
  * 遊戲運行時，每隔一段固定的時間（`gameTickInterval`）會被呼叫，以更新遊戲狀態。

`updateSaveProfile` 函數的運作流程如下：

1.  **資源產生**：根據 `employees` 陣列中的員工數量和他們的產能，計算每個資源（創意值、生產力）在經過的遊戲刻（ticks）中應增加的總量。
2.  **上限限制**：新增加的資源量會受到 `creativity_max` 和 `productivity_max` 的限制，確保資源不會無限制地累積。
3.  **遊戲收益與維護**：遍歷 `games` 陣列，針對每款遊戲執行以下操作：
      * 如果遊戲狀態為 `developing`，則增加其 `development_progress_ticks`。
      * 如果遊戲的開發進度達到 `development_time_ticks`，則將其狀態變更為 `completed`。
      * 如果遊戲狀態為 `completed`，則根據遊戲設定增加 `money` 收入並扣除 `productivity` 維護成本。

### 3\. 遊戲開發流程 (`developGame`)

玩家可以透過 `developGame` 函數來啟動新遊戲的開發。

1.  **資源檢查**：檢查玩家當前的資源（金錢、創意值、生產力）是否足以支付該遊戲的 `development_cost`。
2.  **重複性檢查**：確保玩家沒有重複開發已經擁有或正在開發的遊戲。
3.  **扣除成本**：如果所有檢查都通過，則從玩家的資源中扣除相應的成本。
4.  **新增遊戲**：在 `SaveProfile` 的 `games` 陣列中新增一個遊戲物件，其狀態被設定為 `developing`，開發進度 `development_progress_ticks` 為 0。

### 4\. 遊戲儲存機制 (`useGameStorage`)

`useGameStorage` Hook 負責處理遊戲資料的儲存與讀取，確保遊戲進度可以被保留。

  * 它支援**最多 5 個**遊戲存檔。
  * 在 Web 平台，使用 `localStorage` 進行儲存；在原生平台，則使用 `AsyncStorage`。
  * 當玩家嘗試創建新遊戲但已達到存檔上限時，會顯示提示訊息。

## 遊戲設定

遊戲的所有數值設定都集中在 `settings.json` 文件中，方便調整和平衡遊戲內容，無需修改程式碼。

  * **`initial`**: 定義新遊戲開始時的初始資源和資產。
      * `resources`: 包含遊戲的核心資源，如 `money`, `creativity`, `productivity`。
      * `assets`: 包含遊戲開始時擁有的資產，如 `engineer_level_1` 的數量。
  * **`engineer_level_1`**: 定義基礎工程師的產能。
      * `creativity_per_tick`: 10
      * `productivity_per_tick`: 20
  * **`gameTickInterval`**: 定義遊戲邏輯更新的頻率，單位為毫秒。
  * **`developable_games`**: 包含所有可開發遊戲的詳細資訊，例如成本、開發時間、收入和維護成本等。

## 待辦事項

  * [ ] 實作 `Fab.tsx` 中的「招募員工」功能。
  * [x] 擴充 `develop-game.tsx`，使其在點擊「開發」按鈕時實際呼叫 `developGame` 函數。
  * [ ] 實作 `developGame` 頁面中的開發進度顯示。
  * [ ] 新增更多種類的員工和可開發的遊戲，豐富遊戲內容。
  * [ ] 優化手機橫向模式下的 UI 顯示。

## 專案結構

此專案採用 Expo Router 檔案系統路由。

```
.
├── app
│   ├── (drawer)
│   │   ├── (tabs)
│   │   │   ├── settings.tsx
│   │   │   └── _layout.tsx
│   │   └── _layout.tsx
│   ├── _layout.tsx
│   ├── develop-game.tsx
│   ├── game.tsx
│   ├── index.tsx
│   ├── menu.tsx
│   └── saved-games.tsx
├── assets
│   └── ...
├── components
│   ├── ui
│   │   ├── IconSymbol.ios.tsx
│   │   └── IconSymbol.tsx
│   ├── Fab.tsx
│   ├── LoginButton.tsx
│   ├── ResourceBar.tsx
│   ├── ThemedText.tsx
│   └── ThemedView.tsx
├── constants
│   ├── Colors.ts
│   └── locales.ts
├── hooks
│   ├── use-game-storage.ts
│   ├── use-game-storage.test.ts
│   ├── use-language.tsx
│   ├── useColorScheme.ts
│   ├── useColorScheme.web.ts
│   └── useTheme.tsx
├── utils
│   ├── game_logic.ts
│   └── game_logic.test.ts
├── settings.json
├── jest.config.js
├── package.json
├── package-lock.json
└── tsconfig.json
```
