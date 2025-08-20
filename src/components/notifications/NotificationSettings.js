'use client';

import { useState, useEffect } from 'react';
import { FiSettings, FiClock, FiBell } from 'react-icons/fi';
import { getNotificationSettings, updateNotificationSettings } from '../../services/notifications';
import toast from 'react-hot-toast';

const NotificationSettings = ({ userId }) => {
  const [settings, setSettings] = useState({
    minutesBefore: 5,
    enabled: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (userId) {
      loadSettings();
    }
  }, [userId]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await getNotificationSettings(userId);
      
      if (response.success && response.data) {
        // 새로운 API는 단일 객체를 반환 (배열이 아님)
        const settingData = response.data;
        setSettings({
          minutesBefore: settingData.minutesBefore || 5,
          enabled: settingData.enabled !== false
        });
      }
    } catch (error) {
      console.error('알림 설정 로드 실패:', error);
      // 404 오류인 경우 알림 기능이 아직 구현되지 않았을 수 있음
      if (error.message && error.message.includes('404')) {
        console.log('알림 설정 기능이 아직 백엔드에서 구현되지 않았을 수 있습니다.');
      }
      // 기본값 유지
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await updateNotificationSettings(userId, settings);
      
      if (response.success) {
        toast.success('알림 설정이 저장되었습니다.');
      } else {
        toast.error(response.message || '알림 설정 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('알림 설정 저장 실패:', error);
      toast.error('알림 설정 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleMinutesChange = (minutes) => {
    setSettings(prev => ({
      ...prev,
      minutesBefore: minutes
    }));
  };

  const handleEnabledChange = (enabled) => {
    setSettings(prev => ({
      ...prev,
      enabled: enabled
    }));
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-48 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
          <FiSettings className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">버스 도착 알림 설정</h3>
          <p className="text-sm text-gray-600">즐겨찾기한 버스 노선의 도착 알림을 언제 받을지 설정하세요</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* 알림 활성화/비활성화 */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <FiBell className="w-5 h-5 text-gray-600" />
            <div>
              <h4 className="font-medium text-gray-900">버스 도착 알림</h4>
              <p className="text-sm text-gray-600">즐겨찾기한 노선의 버스 도착 알림을 받습니다</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={(e) => handleEnabledChange(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>

        {/* 알림 시간 설정 */}
        {settings.enabled && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FiClock className="w-5 h-5 text-gray-600" />
              <h4 className="font-medium text-gray-900">알림 시간</h4>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[3, 5, 10, 15].map((minutes) => (
                <button
                  key={minutes}
                  onClick={() => handleMinutesChange(minutes)}
                  className={`p-3 rounded-lg border-2 text-center transition-all duration-200 ${
                    settings.minutesBefore === minutes
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold text-lg">{minutes}분</div>
                  <div className="text-xs text-gray-500">전 알림</div>
                </button>
              ))}
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="p-1 bg-blue-100 text-blue-600 rounded">
                  <FiBell className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm text-blue-800">
                    <strong>{settings.minutesBefore}분 전</strong>에 알림을 받습니다
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    즐겨찾기한 노선의 버스가 도착하기 {settings.minutesBefore}분 전에 알림이 전송됩니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 저장 버튼 */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-6 py-2 rounded-lg font-medium transition-colors duration-200 ${
              saving
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-emerald-500 text-white hover:bg-emerald-600'
            }`}
          >
            {saving ? '저장 중...' : '설정 저장'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
