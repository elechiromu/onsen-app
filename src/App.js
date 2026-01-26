import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  updateDoc,
  query,
  orderBy 
} from 'firebase/firestore';
import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './App.css';

function App() {
  const [onsens, setOnsens] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [editingOnsen, setEditingOnsen] = useState(null);
  
  // フォームの状態
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    visitDate: format(new Date(), 'yyyy-MM-dd'),
    springQualities: [],
    sourceTemp: '',
    ph: '',
    facilities: {
      openAirBath: false,
      sauna: false,
      restRoom: false,
      restaurant: false,
      parking: false
    },
    ratings: {
      waterQuality: 3,
      cleanliness: 3,
      access: 3
    },
    price: '',
    hours: '',
    crowdedness: '普通',
    amenities: '',
    notes: '',
    photoUrls: ['']
  });

  const springQualityOptions = [
    '単純泉',
    '塩化物泉',
    '硫酸塩泉',
    '炭酸水素塩泉',
    '硫黄泉',
    '酸性泉',
    '鉄泉',
    '放射能泉'
  ];

  const crowdednessOptions = ['空いている', '普通', 'やや混雑', '混雑'];

  useEffect(() => {
    loadOnsens();
  }, []);

  const loadOnsens = async () => {
    try {
      const q = query(collection(db, 'onsens'), orderBy('visitDate', 'desc'));
      const querySnapshot = await getDocs(q);
      const onsenList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOnsens(onsenList);
    } catch (error) {
      console.error('温泉データの読み込みエラー:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSpringQualityToggle = (quality) => {
    setFormData(prev => ({
      ...prev,
      springQualities: prev.springQualities.includes(quality)
        ? prev.springQualities.filter(q => q !== quality)
        : [...prev.springQualities, quality]
    }));
  };

  const handleFacilityToggle = (facility) => {
    setFormData(prev => ({
      ...prev,
      facilities: {
        ...prev.facilities,
        [facility]: !prev.facilities[facility]
      }
    }));
  };

  const handleRatingChange = (category, value) => {
    setFormData(prev => ({
      ...prev,
      ratings: {
        ...prev.ratings,
        [category]: parseInt(value)
      }
    }));
  };

  const handlePhotoUrlChange = (index, value) => {
    const newPhotoUrls = [...formData.photoUrls];
    newPhotoUrls[index] = value;
    setFormData(prev => ({ ...prev, photoUrls: newPhotoUrls }));
  };

  const addPhotoUrlField = () => {
    setFormData(prev => ({
      ...prev,
      photoUrls: [...prev.photoUrls, '']
    }));
  };

  const removePhotoUrlField = (index) => {
    setFormData(prev => ({
      ...prev,
      photoUrls: prev.photoUrls.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const onsenData = {
        ...formData,
        photoUrls: formData.photoUrls.filter(url => url.trim() !== ''),
        createdAt: new Date().toISOString()
      };

      if (editingOnsen) {
        await updateDoc(doc(db, 'onsens', editingOnsen.id), onsenData);
      } else {
        await addDoc(collection(db, 'onsens'), onsenData);
      }

      resetForm();
      loadOnsens();
      setShowAddForm(false);
    } catch (error) {
      console.error('温泉の保存エラー:', error);
      alert('保存に失敗しました。もう一度お試しください。');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      visitDate: format(new Date(), 'yyyy-MM-dd'),
      springQualities: [],
      sourceTemp: '',
      ph: '',
      facilities: {
        openAirBath: false,
        sauna: false,
        restRoom: false,
        restaurant: false,
        parking: false
      },
      ratings: {
        waterQuality: 3,
        cleanliness: 3,
        access: 3
      },
      price: '',
      hours: '',
      crowdedness: '普通',
      amenities: '',
      notes: '',
      photoUrls: ['']
    });
    setEditingOnsen(null);
  };

  const handleEdit = (onsen) => {
    setFormData({
      ...onsen,
      photoUrls: onsen.photoUrls && onsen.photoUrls.length > 0 ? onsen.photoUrls : ['']
    });
    setEditingOnsen(onsen);
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('この温泉記録を削除してもよろしいですか?')) {
      try {
        await deleteDoc(doc(db, 'onsens', id));
        loadOnsens();
      } catch (error) {
        console.error('削除エラー:', error);
        alert('削除に失敗しました。');
      }
    }
  };

  const getMonthlyStats = () => {
    const monthlyData = {};
    onsens.forEach(onsen => {
      const month = format(parseISO(onsen.visitDate), 'yyyy-MM');
      monthlyData[month] = (monthlyData[month] || 0) + 1;
    });

    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({
        month: format(parseISO(month + '-01'), 'yyyy年M月', { locale: ja }),
        訪問回数: count
      }));
  };

  const getSpringQualityStats = () => {
    const qualityData = {};
    onsens.forEach(onsen => {
      onsen.springQualities?.forEach(quality => {
        qualityData[quality] = (qualityData[quality] || 0) + 1;
      });
    });

    return Object.entries(qualityData)
      .map(([quality, count]) => ({
        name: quality,
        訪問回数: count
      }))
      .sort((a, b) => b.訪問回数 - a.訪問回数);
  };

  const getFavoriteOnsens = () => {
    const onsenCounts = {};
    onsens.forEach(onsen => {
      onsenCounts[onsen.name] = (onsenCounts[onsen.name] || 0) + 1;
    });

    return Object.entries(onsenCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const getAverageRatings = () => {
    if (onsens.length === 0) return null;

    const totals = onsens.reduce((acc, onsen) => ({
      waterQuality: acc.waterQuality + (onsen.ratings?.waterQuality || 0),
      cleanliness: acc.cleanliness + (onsen.ratings?.cleanliness || 0),
      access: acc.access + (onsen.ratings?.access || 0)
    }), { waterQuality: 0, cleanliness: 0, access: 0 });

    return {
      waterQuality: (totals.waterQuality / onsens.length).toFixed(1),
      cleanliness: (totals.cleanliness / onsens.length).toFixed(1),
      access: (totals.access / onsens.length).toFixed(1)
    };
  };

  const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1> ♨️温泉記録♨️ </h1>
        <p className="subtitle">宇宙船地球号温泉行き🚀</p>
      </header>

      <div className="button-container">
        <button 
          className="main-button add-button"
          onClick={() => {
            resetForm();
            setShowAddForm(!showAddForm);
            setShowStats(false);
          }}
        >
          {showAddForm ? '✕ 閉じる' : '+ 新しい温泉を記録'}
        </button>
        <button 
          className="main-button stats-button"
          onClick={() => {
            setShowStats(!showStats);
            setShowAddForm(false);
          }}
        >
          {showStats ? '✕ 閉じる' : '📊 統計を見る'}
        </button>
      </div>

      {showAddForm && (
        <div className="form-container">
          <h2>{editingOnsen ? '温泉記録を編集' : '新しい温泉を記録'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>温泉名 *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="例: ○○温泉"
              />
            </div>

            <div className="form-group">
              <label>住所</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="例: 東京都○○区○○"
              />
            </div>

            <div className="form-group">
              <label>訪問日 *</label>
              <input
                type="date"
                name="visitDate"
                value={formData.visitDate}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>泉質（複数選択可）</label>
              <div className="checkbox-grid">
                {springQualityOptions.map(quality => (
                  <label key={quality} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.springQualities.includes(quality)}
                      onChange={() => handleSpringQualityToggle(quality)}
                    />
                    {quality}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>源泉温度</label>
                <input
                  type="text"
                  name="sourceTemp"
                  value={formData.sourceTemp}
                  onChange={handleInputChange}
                  placeholder="例: 42℃"
                />
              </div>

              <div className="form-group">
                <label>pH値</label>
                <input
                  type="text"
                  name="ph"
                  value={formData.ph}
                  onChange={handleInputChange}
                  placeholder="例: 7.5"
                />
              </div>
            </div>

            <div className="form-group">
              <label>施設・設備</label>
              <div className="checkbox-grid">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.facilities.openAirBath}
                    onChange={() => handleFacilityToggle('openAirBath')}
                  />
                  露天風呂
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.facilities.sauna}
                    onChange={() => handleFacilityToggle('sauna')}
                  />
                  サウナ
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.facilities.restRoom}
                    onChange={() => handleFacilityToggle('restRoom')}
                  />
                  休憩室
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.facilities.restaurant}
                    onChange={() => handleFacilityToggle('restaurant')}
                  />
                  レストラン
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.facilities.parking}
                    onChange={() => handleFacilityToggle('parking')}
                  />
                  駐車場
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>評価</label>
              <div className="rating-group">
                <div className="rating-item">
                  <span>お湯の質:</span>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={formData.ratings.waterQuality}
                    onChange={(e) => handleRatingChange('waterQuality', e.target.value)}
                  />
                  <span className="stars">{renderStars(formData.ratings.waterQuality)}</span>
                </div>
                <div className="rating-item">
                  <span>清潔さ:</span>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={formData.ratings.cleanliness}
                    onChange={(e) => handleRatingChange('cleanliness', e.target.value)}
                  />
                  <span className="stars">{renderStars(formData.ratings.cleanliness)}</span>
                </div>
                <div className="rating-item">
                  <span>アクセス:</span>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={formData.ratings.access}
                    onChange={(e) => handleRatingChange('access', e.target.value)}
                  />
                  <span className="stars">{renderStars(formData.ratings.access)}</span>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>入浴料金</label>
                <input
                  type="text"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="例: 800円"
                />
              </div>

              <div className="form-group">
                <label>営業時間</label>
                <input
                  type="text"
                  name="hours"
                  value={formData.hours}
                  onChange={handleInputChange}
                  placeholder="例: 10:00-22:00"
                />
              </div>
            </div>

            <div className="form-group">
              <label>混雑度</label>
              <select
                name="crowdedness"
                value={formData.crowdedness}
                onChange={handleInputChange}
              >
                {crowdednessOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>アメニティ</label>
              <input
                type="text"
                name="amenities"
                value={formData.amenities}
                onChange={handleInputChange}
                placeholder="例: シャンプー、ボディソープ、タオル"
              />
            </div>

            <div className="form-group">
              <label>写真URL</label>
              {formData.photoUrls.map((url, index) => (
                <div key={index} className="photo-url-input">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => handlePhotoUrlChange(index, e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                  />
                  {formData.photoUrls.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePhotoUrlField(index)}
                      className="remove-photo-button"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addPhotoUrlField}
                className="add-photo-button"
              >
                + 写真URLを追加
              </button>
            </div>

            <div className="form-group">
              <label>メモ・感想</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="4"
                placeholder="温泉の感想や気づいたことを記録しましょう"
              />
            </div>

            <div className="form-buttons">
              <button type="submit" className="submit-button">
                {editingOnsen ? '更新する' : '記録する'}
              </button>
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowAddForm(false);
                }}
                className="cancel-button"
              >
                キャンセル
              </button>
            </div>
          </form>
        </div>
      )}

      {showStats && (
        <div className="stats-container">
          <h2>📊 温泉巡り統計</h2>
          
          <div className="stats-summary">
            <div className="stat-card">
              <h3>総訪問回数</h3>
              <p className="stat-number">{onsens.length}回</p>
            </div>
            <div className="stat-card">
              <h3>訪問した温泉数</h3>
              <p className="stat-number">{new Set(onsens.map(o => o.name)).size}ヶ所</p>
            </div>
          </div>

          {getAverageRatings() && (
            <div className="average-ratings">
              <h3>平均評価</h3>
              <div className="rating-display">
                <div className="rating-display-item">
                  <span>お湯の質:</span>
                  <span className="stars">{renderStars(Math.round(getAverageRatings().waterQuality))}</span>
                  <span>{getAverageRatings().waterQuality}</span>
                </div>
                <div className="rating-display-item">
                  <span>清潔さ:</span>
                  <span className="stars">{renderStars(Math.round(getAverageRatings().cleanliness))}</span>
                  <span>{getAverageRatings().cleanliness}</span>
                </div>
                <div className="rating-display-item">
                  <span>アクセス:</span>
                  <span className="stars">{renderStars(Math.round(getAverageRatings().access))}</span>
                  <span>{getAverageRatings().access}</span>
                </div>
              </div>
            </div>
          )}

          {getFavoriteOnsens().length > 0 && (
            <div className="favorite-onsens">
              <h3>よく訪れる温泉 TOP5</h3>
              <ul>
                {getFavoriteOnsens().map((onsen, index) => (
                  <li key={index}>
                    <span className="rank">#{index + 1}</span>
                    <span className="name">{onsen.name}</span>
                    <span className="count">{onsen.count}回</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {getMonthlyStats().length > 0 && (
            <div className="chart-container">
              <h3>月別訪問回数</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getMonthlyStats()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="訪問回数" fill="#FF9EC8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {getSpringQualityStats().length > 0 && (
            <div className="chart-container">
              <h3>泉質別訪問回数</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getSpringQualityStats()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="訪問回数" fill="#B4A7D6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      <div className="onsen-list">
        <h2>温泉記録一覧</h2>
        {onsens.length === 0 ? (
          <p className="empty-message">まだ温泉が記録されていません。<br/>「+ 新しい温泉を記録」ボタンから始めましょう！</p>
        ) : (
          <div className="onsen-grid">
            {onsens.map(onsen => (
              <div key={onsen.id} className="onsen-card">
                {onsen.photoUrls && onsen.photoUrls.length > 0 && (
                  <div className="onsen-photos">
                    {onsen.photoUrls.slice(0, 3).map((url, index) => (
                      <img key={index} src={url} alt={`${onsen.name} ${index + 1}`} />
                    ))}
                  </div>
                )}
                <div className="onsen-content">
                  <h3>{onsen.name}</h3>
                  <p className="visit-date">📅 {format(parseISO(onsen.visitDate), 'yyyy年M月d日', { locale: ja })}</p>
                  
                  {onsen.address && (
                    <p className="address">📍 {onsen.address}</p>
                  )}

                  {onsen.springQualities && onsen.springQualities.length > 0 && (
                    <div className="spring-qualities">
                      {onsen.springQualities.map((quality, index) => (
                        <span key={index} className="quality-tag">{quality}</span>
                      ))}
                    </div>
                  )}

                  <div className="onsen-details">
                    {onsen.sourceTemp && <p>🌡️ 源泉温度: {onsen.sourceTemp}</p>}
                    {onsen.ph && <p>💧 pH: {onsen.ph}</p>}
                    {onsen.price && <p>💰 料金: {onsen.price}</p>}
                    {onsen.hours && <p>🕐 営業時間: {onsen.hours}</p>}
                    {onsen.crowdedness && <p>👥 混雑度: {onsen.crowdedness}</p>}
                  </div>

                  {onsen.facilities && Object.values(onsen.facilities).some(f => f) && (
                    <div className="facilities">
                      <p className="facilities-title">施設:</p>
                      <div className="facility-tags">
                        {onsen.facilities.openAirBath && <span>露天風呂</span>}
                        {onsen.facilities.sauna && <span>サウナ</span>}
                        {onsen.facilities.restRoom && <span>休憩室</span>}
                        {onsen.facilities.restaurant && <span>レストラン</span>}
                        {onsen.facilities.parking && <span>駐車場</span>}
                      </div>
                    </div>
                  )}

                  {onsen.amenities && (
                    <p className="amenities">🧴 アメニティ: {onsen.amenities}</p>
                  )}

                  <div className="ratings">
                    <div className="rating-display-item">
                      <span>お湯:</span>
                      <span className="stars">{renderStars(onsen.ratings?.waterQuality || 0)}</span>
                    </div>
                    <div className="rating-display-item">
                      <span>清潔:</span>
                      <span className="stars">{renderStars(onsen.ratings?.cleanliness || 0)}</span>
                    </div>
                    <div className="rating-display-item">
                      <span>アクセス:</span>
                      <span className="stars">{renderStars(onsen.ratings?.access || 0)}</span>
                    </div>
                  </div>

                  {onsen.notes && (
                    <p className="notes">💭 {onsen.notes}</p>
                  )}

                  <div className="card-buttons">
                    <button onClick={() => handleEdit(onsen)} className="edit-button">
                      編集
                    </button>
                    <button onClick={() => handleDelete(onsen.id)} className="delete-button">
                      削除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
