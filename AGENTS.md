# Agents.md

## 關於 `Alert.alert` 的使用建議

在開發跨平台應用程式（特別是 Expo 專案）時，請避免直接使用 `react-native` 的 `Alert.alert` 方法。
`Alert.alert` 在 iOS 和 Android 原生環境下運作良好，但已知在網頁（Web）環境中無法正常顯示，這會導致使用者無法收到重要的通知或確認訊息，進而影響應用程式的核心功能。

**請改用以下方法：**
- **自定義視窗或 Dialog 元件：** 為了確保在所有平台上都能有一致且可靠的體驗，建議開發一個可以自訂樣式、標題和內容的視窗（Modal）或 Dialog 元件。
- **使用條件式渲染：** 根據 `Platform.OS` 判斷當前運行環境，並針對不同平台選擇不同的解決方案。例如，在網頁上顯示自定義的 Modal，而在原生應用上則可繼續使用 `Alert.alert` (但不建議這麼做，以保持一致性)。

**範例：**

```typescript
// 不建議的寫法
import { Alert } from 'react-native';

const showConfirmation = () => {
  Alert.alert('確認', '您確定要繼續嗎？', [
    { text: '取消', style: 'cancel' },
    { text: '確定', onPress: () => console.log('已確認') }
  ]);
};

// 建議的寫法：使用自定義 Dialog 元件
import CustomDialog from './CustomDialog'; // 假設您已創建一個 CustomDialog 元件

const showCustomDialog = () => {
  CustomDialog.show({
    title: '確認',
    message: '您確定要繼續嗎？',
    buttons: [
      { text: '取消', onPress: () => console.log('已取消') },
      { text: '確定', onPress: () => console.log('已確認') }
    ]
  });
};
