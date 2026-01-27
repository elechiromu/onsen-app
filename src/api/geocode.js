// 住所から緯度経度を取得（サーバーレス関数経由）
  const getCoordinates = async (address) => {
    try {
      console.log('🔍 住所から座標を取得中:', address);
      
      // 自分のサーバーレス関数を呼び出す（CORS問題を回避）
      const url = `/api/geocode?address=${encodeURIComponent(address)}`;
      console.log('📡 APIリクエスト:', url);
      
      const response = await fetch(url);
      console.log('📥 APIレスポンス status:', response.status);
      
      if (!response.ok) {
        console.error('❌ API error:', response.status);
        return null;
      }
      
      const data = await response.json();
      console.log('📦 取得データ:', data);
      
      if (data && data.lat && data.lon) {
        const coords = {
          lat: data.lat,
          lon: data.lon
        };
        console.log('✅ 座標取得成功:', coords);
        return coords;
      }
      
      console.warn('⚠️ 座標が見つかりませんでした');
      return null;
    } catch (error) {
      console.error('❌ 座標取得エラー:', error);
      return null;
    }
  };
```

5. **「Commit changes」** をクリック

---

## テスト手順

1. **2〜3分待つ**（Vercelがデプロイ完了するまで）
2. アプリをリロード（**Ctrl+Shift+R**で強制リロード）
3. **F12キーでConsoleを開く**
4. 設定で自宅住所を確認
5. 新しい温泉を登録：
   - 温泉名：「テスト温泉」
   - 住所：「神奈川県足柄下郡箱根町湯本」
6. 「記録する」をクリック
7. **Consoleを確認**

---

## 期待される結果

Consoleに以下のように表示されれば成功：
```
🔍 住所から座標を取得中: 千葉県松戸市...
📡 APIリクエスト: /api/geocode?address=...
📥 APIレスポンス status: 200
📦 取得データ: {lat: ..., lon: ..., display_name: ...}
✅ 座標取得成功: {lat: ..., lon: ...}
