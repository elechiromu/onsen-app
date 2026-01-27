
// Vercel Serverless Function
// OpenStreetMap Nominatim APIを呼び出してCORS問題を回避

export default async function handler(req, res) {
  // CORSヘッダーを設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONSリクエスト（プリフライト）への対応
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // GETメソッドのみ許可
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { address } = req.query;

  if (!address) {
    return res.status(400).json({ error: 'Address parameter is required' });
  }

  try {
    console.log('住所から座標を取得中:', address);

    // OpenStreetMap Nominatim API を呼び出し
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address + ', Japan')}&limit=1&addressdetails=1`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'OnsenApp/1.0 (onsen-app.vercel.app)', // 必須
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('API error:', response.status);
      return res.status(response.status).json({ 
        error: 'Failed to fetch coordinates',
        status: response.status 
      });
    }

    const data = await response.json();
    console.log('取得データ:', data);

    if (data && data.length > 0) {
      const coords = {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
        display_name: data[0].display_name
      };
      console.log('座標取得成功:', coords);
      return res.status(200).json(coords);
    }

    console.warn('座標が見つかりませんでした');
    return res.status(404).json({ error: 'No coordinates found' });

  } catch (error) {
    console.error('座標取得エラー:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
