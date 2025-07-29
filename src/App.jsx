import React, { useState, useEffect, useCallback } from 'react';
import { PlusCircle, Trash2, Edit, UserPlus, UserMinus, Search, RefreshCcw } from 'lucide-react';

// Основной компонент приложения
export default function App() {
  // Состояние для хранения сегментов. Каждый сегмент имеет id, name и description.
  const [segments, setSegments] = useState([]);
  // Состояние для хранения связей пользователей и сегментов.
  // Формат: { userId: [segmentId1, segmentId2, ...], ... }
  const [userSegments, setUserSegments] = useState({});
  // Состояние для отслеживания выбранного сегмента для редактирования
  const [editingSegment, setEditingSegment] = useState(null);
  // Состояние для сообщения пользователю (успех/ошибка)
  const [message, setMessage] = useState('');
  // Состояние для отслеживания загрузки (например, при имитации API-запросов)
  const [loading, setLoading] = useState(false);

  // Функция для генерации уникального ID (имитация UUID)
  const generateId = () => Math.random().toString(36).substring(2, 11);

  // Имитация загрузки начальных данных (если бы они были в localStorage или API)
  useEffect(() => {
    // В реальном приложении здесь был бы fetch к API
    const storedSegments = JSON.parse(localStorage.getItem('segments')) || [];
    const storedUserSegments = JSON.parse(localStorage.getItem('userSegments')) || {};
    setSegments(storedSegments);
    setUserSegments(storedUserSegments);
  }, []);

  // Сохранение данных в localStorage при изменении segments или userSegments
  useEffect(() => {
    localStorage.setItem('segments', JSON.stringify(segments));
  }, [segments]);

  useEffect(() => {
    localStorage.setItem('userSegments', JSON.stringify(userSegments));
  }, [userSegments]);

  // Функция для отображения сообщений пользователю
  const showMessage = (msg, type = 'success') => {
    setMessage({ text: msg, type });
    const timer = setTimeout(() => setMessage(''), 3000); // Сообщение исчезает через 3 секунды
    return () => clearTimeout(timer);
  };

  // --- Функции для управления сегментами ---

  // Создание нового сегмента
  const handleCreateSegment = (name, description) => {
    if (!name.trim()) {
      showMessage('Имя сегмента не может быть пустым.', 'error');
      return;
    }
    if (segments.some(s => s.name === name)) {
      showMessage(`Сегмент с именем "${name}" уже существует.`, 'error');
      return;
    }
    setLoading(true);
    setTimeout(() => { // Имитация задержки API
      const newSegment = {
        id: generateId(),
        name: name.trim(),
        description: description.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setSegments(prev => [...prev, newSegment]);
      showMessage(`Сегмент "${name}" успешно создан!`);
      setLoading(false);
    }, 500);
  };

  // Редактирование существующего сегмента
  const handleUpdateSegment = (id, newName, newDescription) => {
    if (!newName.trim()) {
      showMessage('Имя сегмента не может быть пустым.', 'error');
      return;
    }
    if (segments.some(s => s.name === newName && s.id !== id)) {
      showMessage(`Сегмент с именем "${newName}" уже существует.`, 'error');
      return;
    }
    setLoading(true);
    setTimeout(() => { // Имитация задержки API
      setSegments(prev =>
        prev.map(s =>
          s.id === id
            ? { ...s, name: newName.trim(), description: newDescription.trim(), updatedAt: new Date().toISOString() }
            : s
        )
      );
      setEditingSegment(null); // Сброс режима редактирования
      showMessage(`Сегмент "${newName}" успешно обновлен!`);
      setLoading(false);
    }, 500);
  };

  // Удаление сегмента
  const handleDeleteSegment = (id, name) => {
    if (window.confirm(`Вы уверены, что хотите удалить сегмент "${name}"? Все пользователи будут удалены из этого сегмента.`)) {
      setLoading(true);
      setTimeout(() => { // Имитация задержки API
        setSegments(prev => prev.filter(s => s.id !== id));
        // Удаляем все записи о принадлежности пользователей к этому сегменту
        setUserSegments(prev => {
          const newState = {};
          for (const userId in prev) {
            newState[userId] = prev[userId].filter(segmentId => segmentId !== id);
            if (newState[userId].length === 0) {
              delete newState[userId]; // Удаляем пользователя, если у него нет сегментов
            }
          }
          return newState;
        });
        showMessage(`Сегмент "${name}" успешно удален.`);
        setLoading(false);
      }, 500);
    }
  };

  // --- Функции для управления пользователями в сегментах ---

  // Добавление пользователя в сегмент
  const handleAddUserToSegment = (userId, segmentId) => {
    if (!userId || !segmentId) {
      showMessage('Необходимо указать ID пользователя и выбрать сегмент.', 'error');
      return;
    }
    setLoading(true);
    setTimeout(() => { // Имитация задержки API
      setUserSegments(prev => {
        const currentSegments = prev[userId] || [];
        if (!currentSegments.includes(segmentId)) {
          return { ...prev, [userId]: [...currentSegments, segmentId] };
        }
        return prev; // Пользователь уже в этом сегменте
      });
      showMessage(`Пользователь ${userId} добавлен в сегмент.`);
      setLoading(false);
    }, 500);
  };

  // Удаление пользователя из сегмента
  const handleRemoveUserFromSegment = (userId, segmentId) => {
    if (!userId || !segmentId) {
      showMessage('Необходимо указать ID пользователя и выбрать сегмент.', 'error');
      return;
    }
    setLoading(true);
    setTimeout(() => { // Имитация задержки API
      setUserSegments(prev => {
        const currentSegments = prev[userId] || [];
        const newSegments = currentSegments.filter(id => id !== segmentId);
        if (newSegments.length === 0) {
          const newState = { ...prev };
          delete newState[userId];
          return newState;
        }
        return { ...prev, [userId]: newSegments };
      });
      showMessage(`Пользователь ${userId} удален из сегмента.`);
      setLoading(false);
    }, 500);
  };

  // Случайное распределение пользователей в сегмент
  const handleAssignRandomUsers = (segmentId, percentage) => {
    if (!segmentId) {
      showMessage('Выберите сегмент для случайного распределения.', 'error');
      return;
    }
    if (percentage < 0 || percentage > 100) {
      showMessage('Процент должен быть от 0 до 100.', 'error');
      return;
    }

    setLoading(true);
    setTimeout(() => { // Имитация задержки API
      const allPossibleUserIds = Array.from({ length: 1000 }, (_, i) => i + 1); // Имитация 1000 пользователей
      let assignedCount = 0;

      setUserSegments(prev => {
        const newSegmentsState = { ...prev };
        allPossibleUserIds.forEach(userId => {
          // Детерминированное распределение на основе хэша user_id для воспроизводимости
          // В реальном приложении это был бы более надежный хэш (CRC32, MD5)
          const hash = userId % 100; // Простой детерминированный "хэш"
          if (hash < percentage) { // Если хэш попадает в заданный процент
            const currentSegments = newSegmentsState[userId] || [];
            if (!currentSegments.includes(segmentId)) {
              newSegmentsState[userId] = [...currentSegments, segmentId];
              assignedCount++;
            }
          } else {
            // Если пользователь не попадает в процент, убеждаемся, что он не в сегменте
            const currentSegments = newSegmentsState[userId] || [];
            newSegmentsState[userId] = currentSegments.filter(id => id !== segmentId);
            if (newSegmentsState[userId].length === 0) {
              delete newSegmentsState[userId];
            }
          }
        });
        return newSegmentsState;
      });
      showMessage(`Случайно назначено ${assignedCount} пользователей в сегмент "${segments.find(s => s.id === segmentId)?.name}" (${percentage}%).`);
      setLoading(false);
    }, 1000);
  };

  // --- Компоненты UI ---

  // Компонент для отображения сообщений
  const MessageDisplay = ({ message }) => {
    if (!message) return null;
    const bgColor = message.type === 'error' ? 'bg-red-100 border-red-400 text-red-700' : 'bg-green-100 border-green-400 text-green-700';
    return (
      <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg border ${bgColor} z-50 animate-fade-in-down`}>
        <p>{message.text}</p>
      </div>
    );
  };

  // Компонент формы для создания/редактирования сегмента
  const SegmentForm = ({ onSubmit, initialData = null, onCancel }) => {
    const [name, setName] = useState(initialData ? initialData.name : '');
    const [description, setDescription] = useState(initialData ? initialData.description : '');

    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(name, description);
      if (!initialData) { // Очищаем форму только при создании
        setName('');
        setDescription('');
      }
    };

    return (
      <form onSubmit={handleSubmit} className="p-6 bg-white rounded-xl shadow-md space-y-4">
        <h3 className="text-xl font-semibold text-gray-800">{initialData ? 'Редактировать сегмент' : 'Создать новый сегмент'}</h3>
        <div>
          <label htmlFor="segment-name" className="block text-sm font-medium text-gray-700">Имя сегмента:</label>
          <input
            type="text"
            id="segment-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Например, MAIL_GPT"
            required
          />
        </div>
        <div>
          <label htmlFor="segment-description" className="block text-sm font-medium text-gray-700">Описание:</label>
          <textarea
            id="segment-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="3"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Краткое описание сегмента"
          ></textarea>
        </div>
        <div className="flex justify-end space-x-3">
          {initialData && (
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Отмена
            </button>
          )}
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            {initialData ? 'Обновить сегмент' : 'Создать сегмент'}
          </button>
        </div>
      </form>
    );
  };

  // Компонент для списка сегментов
  const SegmentList = ({ segments, onEdit, onDelete }) => {
    return (
      <div className="p-6 bg-white rounded-xl shadow-md">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Существующие сегменты</h3>
        {segments.length === 0 ? (
          <p className="text-gray-500">Сегменты пока не созданы.</p>
        ) : (
          <ul className="space-y-3">
            {segments.map(segment => (
              <li key={segment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <p className="font-medium text-gray-900">{segment.name}</p>
                  <p className="text-sm text-gray-600">{segment.description || 'Нет описания'}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => onEdit(segment)}
                    className="p-2 rounded-full text-blue-600 hover:bg-blue-100 transition-colors"
                    title="Редактировать сегмент"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onDelete(segment.id, segment.name)}
                    className="p-2 rounded-full text-red-600 hover:bg-red-100 transition-colors"
                    title="Удалить сегмент"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  // Компонент для управления пользователями в сегментах
  const UserSegmentManager = ({ segments, onAddUser, onRemoveUser, onAssignRandom }) => {
    const [userId, setUserId] = useState('');
    const [selectedSegmentId, setSelectedSegmentId] = useState('');
    const [percentage, setPercentage] = useState(30);

    const handleAdd = () => {
      onAddUser(userId, selectedSegmentId);
      setUserId(''); // Очистить поле после добавления
    };

    const handleRemove = () => {
      onRemoveUser(userId, selectedSegmentId);
      setUserId(''); // Очистить поле после удаления
    };

    const handleRandomAssign = () => {
      onAssignRandom(selectedSegmentId, percentage);
    };

    return (
      <div className="p-6 bg-white rounded-xl shadow-md space-y-6">
        <h3 className="text-xl font-semibold text-gray-800">Управление пользователями в сегментах</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="user-id-input" className="block text-sm font-medium text-gray-700">ID пользователя:</label>
            <input
              type="number"
              id="user-id-input"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Введите ID пользователя (например, 123)"
              min="1"
            />
          </div>
          <div>
            <label htmlFor="segment-select" className="block text-sm font-medium text-gray-700">Выберите сегмент:</label>
            <select
              id="segment-select"
              value={selectedSegmentId}
              onChange={(e) => setSelectedSegmentId(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
            >
              <option value="">-- Выберите сегмент --</option>
              {segments.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={handleAdd}
            disabled={!userId || !selectedSegmentId}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Добавить пользователя в сегмент
          </button>
          <button
            onClick={handleRemove}
            disabled={!userId || !selectedSegmentId}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <UserMinus className="w-5 h-5 mr-2" />
            Удалить пользователя из сегмента
          </button>
        </div>

        <div className="border-t border-gray-200 pt-6 mt-6 space-y-4">
          <h4 className="text-lg font-semibold text-gray-800">Случайное распределение пользователей</h4>
          <div className="flex items-center space-x-3">
            <label htmlFor="percentage-input" className="block text-sm font-medium text-gray-700">Процент:</label>
            <input
              type="number"
              id="percentage-input"
              value={percentage}
              onChange={(e) => setPercentage(parseInt(e.target.value))}
              className="w-20 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              min="0"
              max="100"
            />
            <span className="text-gray-700">%</span>
          </div>
          <button
            onClick={handleRandomAssign}
            disabled={!selectedSegmentId}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCcw className="w-5 h-5 mr-2" />
            Случайно распределить
          </button>
        </div>
      </div>
    );
  };

  // Компонент для поиска сегментов пользователя по ID
  const UserSegmentLookup = ({ segments, userSegmentsMapping }) => {
    const [lookupUserId, setLookupUserId] = useState('');
    const [foundSegments, setFoundSegments] = useState([]);
    const [lookupMessage, setLookupMessage] = useState('');

    const handleLookup = () => {
      if (!lookupUserId) {
        setLookupMessage('Пожалуйста, введите ID пользователя.');
        setFoundSegments([]);
        return;
      }
      const userSegmentsIds = userSegmentsMapping[lookupUserId] || [];
      if (userSegmentsIds.length === 0) {
        setLookupMessage(`Пользователь ${lookupUserId} не состоит ни в одном сегменте.`);
        setFoundSegments([]);
        return;
      }
      const segmentsForUser = segments.filter(s => userSegmentsIds.includes(s.id));
      setFoundSegments(segmentsForUser);
      setLookupMessage('');
    };

    return (
      <div className="p-6 bg-white rounded-xl shadow-md space-y-4">
        <h3 className="text-xl font-semibold text-gray-800">Найти сегменты пользователя</h3>
        <div className="flex items-center space-x-3">
          <input
            type="number"
            value={lookupUserId}
            onChange={(e) => setLookupUserId(e.target.value)}
            className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Введите ID пользователя"
            min="1"
          />
          <button
            onClick={handleLookup}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Search className="w-5 h-5 mr-2" />
            Найти
          </button>
        </div>
        {lookupMessage && <p className="text-red-500 text-sm">{lookupMessage}</p>}
        {foundSegments.length > 0 && (
          <div className="mt-4">
            <p className="font-medium text-gray-800">Сегменты для пользователя {lookupUserId}:</p>
            <ul className="list-disc list-inside text-gray-700">
              {foundSegments.map(s => (
                <li key={s.id}>{s.name} ({s.description})</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8 font-inter text-gray-900">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          body { font-family: 'Inter', sans-serif; }
          .animate-fade-in-down {
            animation: fadeInDown 0.5s ease-out forwards;
          }
          @keyframes fadeInDown {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
      <MessageDisplay message={message} />

      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-center text-blue-800 mb-8">Сервис управления пользовательскими сегментами VK</h1>

        {loading && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
            <div className="flex items-center text-white text-lg">
              <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Загрузка...
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Форма создания/редактирования сегмента */}
          <div className="lg:col-span-1">
            {editingSegment ? (
              <SegmentForm
                initialData={editingSegment}
                onSubmit={(name, description) => handleUpdateSegment(editingSegment.id, name, description)}
                onCancel={() => setEditingSegment(null)}
              />
            ) : (
              <SegmentForm onSubmit={handleCreateSegment} />
            )}
          </div>

          {/* Список сегментов */}
          <div className="lg:col-span-1">
            <SegmentList
              segments={segments}
              onEdit={setEditingSegment}
              onDelete={handleDeleteSegment}
            />
          </div>
        </div>

        {/* Управление пользователями в сегментах */}
        <UserSegmentManager
          segments={segments}
          onAddUser={handleAddUserToSegment}
          onRemoveUser={handleRemoveUserFromSegment}
          onAssignRandom={handleAssignRandomUsers}
        />

        {/* Поиск сегментов пользователя */}
        <UserSegmentLookup
          segments={segments}
          userSegmentsMapping={userSegments}
        />

        <div className="p-6 bg-white rounded-xl shadow-md">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Текущее состояние связей пользователей и сегментов (для отладки)</h3>
          <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
            {JSON.stringify(userSegments, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}