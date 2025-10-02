# Architecture Overview

本專案採用了類似 Model-View-Controller (MVC) 的設計模式，透過關注點分離 (Separation of Concerns) 的原則，將程式碼劃分為三個主要部分：模型 (Model)、視圖 (View) 和控制器 (Controller)。這種架構使得程式碼更容易理解、維護和擴展。

在 React 和 Hooks 的生態系中，我們透過自定義 Hooks 和 Context API 來實現這種模式。

## 分層設計：遊戲引擎與實現 (Layered Design: Engine vs. Implementation)

### 遊戲引擎 (Engine)

`engine/game_engine.ts` 的職責是提供通用的、與具體遊戲內容無關的核心邏輯。它包含了處理遊戲狀態變化的所有核心演算法。這個引擎的設計是純粹的，意味著它的所有函式都只依賴於傳入的參數來計算結果，不依賴任何外部狀態或全域變數。這種設計使得邏輯本身變得高度可測試、可重用且易於理解。

### 遊戲實現 (Implementation)

相對於通用的引擎，遊戲實現層提供了所有具體的遊戲內容。這些內容透過設定檔來定義，使得遊戲的平衡性調整、內容擴充和在地化變得非常方便，而無需修改核心的引擎程式碼。

-   **`settings.json`**: 這個檔案定義了遊戲的所有數值，例如初始資源、遊戲開發的成本與效益、升級項目的效果等。它是遊戲平衡性的主要控制中心。
-   **`constants/locales.ts`**: 這個檔案負責提供所有在地化的文字內容，例如遊戲名稱、描述、UI 上的按鈕文字等。透過這個檔案，可以輕鬆地為遊戲新增多語言支援。

## Model (模型)

模型層負責管理應用程式的資料和業務邏輯。它不關心使用者介面，只專注於處理遊戲狀態的變化和資料的持久化。

-   **核心業務邏輯**:
    -   `utils/game_logic.ts`: 定義了遊戲的核心資料結構 (`SaveProfile`) 和所有操作這些資料的純函式，例如：
        -   `createNewSaveProfile()`: 建立一個新的遊戲存檔。
        -   `updateSaveProfile()`: 計算遊戲經過一段時間後的狀態變化（如資源增長、遊戲開發進度）。
        -   `developGame()`: 處理開發新遊戲的邏輯。

-   **遊戲設定**:
    -   `settings.json`: 包含所有遊戲的靜態設定資料，如初始資源、各種遊戲的成本與收益等。將設定與邏輯分離，方便進行遊戲平衡性調整。
        -   `initial`: 定義新遊戲開始時的初始資源和資產，分為 `resources` 和 `assets`。

-   **資料儲存**:
    -   `hooks/use-game-storage.ts`: 負責遊戲進度的儲存和讀取。它會根據不同平台（Web 使用 `localStorage`，原生平台使用 `AsyncStorage`）進行操作，實現資料持久化。

## View (視圖)

視圖層由一系列的 React 元件組成，負責將遊戲狀態呈現給使用者。它本身不包含業務邏輯，只根據從控制器傳入的資料 (`props` 或 `context`) 來渲染 UI。

-   **畫面 (Screens)**:
    -   `app/*.tsx`: 每個檔案對應一個應用程式的頁面，例如主選單、遊戲主畫面、開發遊戲畫面等。它們從控制器獲取狀態並將其顯示出來。

-   **可重用元件 (Components)**:
    -   `components/**/*.tsx`: 包含如資源條 (`ResourceBar`)、懸浮按鈕 (`Fab`) 等可在多個畫面中重用的 UI 元件。

## Controller (控制器)

控制器是模型和視圖之間的橋樑。它接收使用者的輸入，呼叫模型來更新狀態，然後將更新後的狀態提供給視圖進行渲染。

-   **遊戲引擎核心 Hook**:
    -   `hooks/useGameEngine.ts`: 這是主要的控制器，扮演著整合**遊戲引擎**與**遊戲實現**的關鍵角色。它負責從 `settings.json` 讀取遊戲設定，並將這些設定注入到 `engine/game_engine.ts` 的純函式中。同時，它管理著遊戲的即時狀態 (`profile`)，並透過 `useEffect` 來處理遊戲時間的推進 (Game Tick)，最後向 View 層提供一組操作遊戲的 API（如 `createNewGame`, `loadGame`, `developNewGame` 等）。

-   **狀態提供者 (Context Provider)**:
    -   `contexts/GameEngineContext.tsx`: 使用 React Context 將 `useGameEngine` 提供的狀態和方法注入到元件樹中，讓任何需要存取遊戲狀態的 View 元件都能輕易地獲取。

---
