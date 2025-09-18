專案代理人指引 (Agent's Guide to the Project)
AI Agent 工作流程 (AI Agent Workflow)

為了讓 AI Agent 能夠順利參與專案開發，請遵循以下步驟作為標準工作流程：
1. 環境建置 (Environment Setup)

    首先，克隆專案儲存庫。

    接著，安裝所有必要的依賴套件。

npm install

2. 執行測試 (Running Tests)

    在進行任何程式碼修改之前，請先執行測試以確保專案的現狀。

    使用以下指令執行測試，並產生涵蓋率報告。

npm test -- --coverage

--coverage 參數將會產生一個 coverage-summary.json 檔案，其中包含了測試涵蓋率的詳細資訊。這個檔案會被用於在 PR 流程中自動產生註解，讓開發團隊可以輕鬆地檢視程式碼變動對測試涵蓋率的影響。

在開發過程中，當您新增或修改功能時，請務必更新或新增對應的測試，以保持高水準的程式碼涵蓋率。
3. 提交變更 (Submitting Changes)

    完成功能開發或錯誤修復後，請確保所有測試都已通過。

    將變更推送到一個新的分支，並建立 Pull Request。

    CI (持續整合) 流程將會自動運行測試，並在 Pull Request 中發布測試涵蓋率報告。

關於 Alert.alert 的使用建議

在開發跨平台應用程式（特別是 Expo 專案）時，請避免直接使用 react-native 的 Alert.alert 方法。Alert.alert 在 iOS 和 Android 原生環境下運作良好，但已知在網頁（Web）環境中無法正常顯示，這會導致使用者無法收到重要的通知或確認訊息，進而影響應用程式的核心功能。

請改用以下方法：

    自定義視窗或 Dialog 元件： 為了確保在所有平台上都能有一致且可靠的體驗，建議開發一個可以自訂樣式、標題和內容的視窗（Modal）或 Dialog 元件。

    使用條件式渲染： 根據 Platform.OS 判斷當前運行環境，並針對不同平台選擇不同的解決方案。例如，在網頁上顯示自定義的 Modal，而在原生應用上則可繼續使用 Alert.alert (但不建議這麼做，以保持一致性)。
