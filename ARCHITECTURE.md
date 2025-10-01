# Architecture Overview

本專案採用了類似 Model-View-Controller (MVC) 的設計模式，透過關注點分離 (Separation of Concerns) 的原則，將程式碼劃分為三個主要部分：模型 (Model)、視圖 (View) 和控制器 (Controller)。這種架構使得程式碼更容易理解、維護和擴展。

在 React 和 Hooks 的生態系中，我們透過自定義 Hooks 和 Context API 來實現這種模式。

## Model (模型)

模型層負責管理應用程式的資料和業務邏輯。它不關心使用者介面，只專注於處理遊戲狀態的變化和資料的持久化。

-   **核心業務邏輯**:
    -   `utils/game_logic.ts`: 定義了遊戲的核心資料結構 (`SaveProfile`) 和所有操作這些資料的純函式，例如：
        -   `createNewSaveProfile()`: 建立一個新的遊戲存檔。
        -   `updateSaveProfile()`: 計算遊戲經過一段時間後的狀態變化（如資源增長、遊戲開發進度）。
        -   `developGame()`: 處理開發新遊戲的邏輯。

-   **遊戲設定**:
    -   `settings.json`: 包含所有遊戲的靜態設定資料，如初始資源、各種遊戲的成本與收益等。將設定與邏輯分離，方便進行遊戲平衡性調整。

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
    -   `hooks/useGameEngine.ts`: 這是主要的控制器。它透過 `useState` 管理當前的遊戲狀態 (`profile`)，並使用 `useEffect` 來處理遊戲時間的推進 (Game Tick)。它封裝了對 Model 層函式的呼叫，並向 View 層提供一組簡單的 API 來操作遊戲，例如 `createNewGame`, `loadGame`, `saveGame` 等。

-   **狀態提供者 (Context Provider)**:
    -   `contexts/GameEngineContext.tsx`: 使用 React Context 將 `useGameEngine` 提供的狀態和方法注入到元件樹中，讓任何需要存取遊戲狀態的 View 元件都能輕易地獲取。

---
