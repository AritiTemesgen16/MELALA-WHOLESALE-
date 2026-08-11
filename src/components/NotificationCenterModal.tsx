import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { NotificationChannel, NotificationEventType } from '../types';
import {
  Bell,
  CheckCheck,
  Trash2,
  X,
  Mail,
  MessageSquare,
  Send,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
  Server,
  Key,
  Play,
  Clock,
  Sparkles,
} from 'lucide-react';

export const NotificationCenterModal: React.FC = () => {
  const {
    isNotificationModalOpen,
    setIsNotificationModalOpen,
    notifications,
    unreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotifications,
    channelConfigs,
    sendTestNotification,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'feed' | 'architecture' | 'test_dispatcher'>('feed');
  const [filterAudience, setFilterAudience] = useState<'ALL' | 'CUSTOMER' | 'ADMIN'>('ALL');
  const [unreadOnly, setUnreadOnly] = useState<boolean>(false);

  // Test Dispatch state
  const [testEventType, setTestEventType] = useState<NotificationEventType>('CUSTOMER_ORDER_SUBMITTED');
  const [testChannel, setTestChannel] = useState<NotificationChannel>('EMAIL');

  if (!isNotificationModalOpen) return null;

  const filteredNotifications = notifications.filter((n) => {
    if (unreadOnly && n.read) return false;
    if (filterAudience !== 'ALL' && n.audience !== filterAudience) return false;
    return true;
  });

  const getChannelIcon = (ch: NotificationChannel) => {
    switch (ch) {
      case 'EMAIL':
        return <Mail className="w-3.5 h-3.5 text-blue-600" />;
      case 'SMS':
        return <Smartphone className="w-3.5 h-3.5 text-emerald-600" />;
      case 'TELEGRAM':
        return <Send className="w-3.5 h-3.5 text-cyan-600" />;
      case 'WHATSAPP':
        return <MessageSquare className="w-3.5 h-3.5 text-green-600" />;
      case 'IN_APP':
      default:
        return <Bell className="w-3.5 h-3.5 text-purple-600" />;
    }
  };

  const getEventBadgeColor = (eventType: NotificationEventType) => {
    if (eventType.startsWith('ADMIN_LOW_STOCK') || eventType.startsWith('ADMIN_EXPIRY')) {
      return 'bg-amber-100 text-amber-800 border-amber-200';
    }
    if (eventType.startsWith('ADMIN')) {
      return 'bg-purple-100 text-purple-800 border-purple-200';
    }
    return 'bg-teal-100 text-teal-800 border-teal-200';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-teal-500/20 text-teal-300 rounded-xl border border-teal-500/30">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold tracking-tight text-white">Notification Architecture</h2>
                {unreadNotificationCount > 0 && (
                  <span className="bg-teal-500 text-slate-950 text-xs font-bold px-2.5 py-0.5 rounded-full">
                    {unreadNotificationCount} New
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Multi-channel communication pipeline supporting Email, SMS, Telegram, WhatsApp & In-App.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsNotificationModalOpen(false)}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 space-x-6">
          <button
            onClick={() => setActiveTab('feed')}
            className={`pb-3 text-sm font-medium flex items-center space-x-2 border-b-2 transition ${
              activeTab === 'feed'
                ? 'border-teal-600 text-teal-700 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Live Alert Feed ({notifications.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            className={`pb-3 text-sm font-medium flex items-center space-x-2 border-b-2 transition ${
              activeTab === 'architecture'
                ? 'border-teal-600 text-teal-700 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Channel Credentials & Adapters</span>
          </button>

          <button
            onClick={() => setActiveTab('test_dispatcher')}
            className={`pb-3 text-sm font-medium flex items-center space-x-2 border-b-2 transition ${
              activeTab === 'test_dispatcher'
                ? 'border-teal-600 text-teal-700 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Play className="w-4 h-4 text-purple-600" />
            <span>Test Event Dispatcher</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          
          {/* TAB 1: LIVE ALERT FEED */}
          {activeTab === 'feed' && (
            <div className="space-y-4">
              {/* Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Audience:</span>
                  <div className="inline-flex rounded-lg bg-slate-200/80 p-0.5 text-xs font-medium">
                    <button
                      onClick={() => setFilterAudience('ALL')}
                      className={`px-2.5 py-1 rounded-md transition ${filterAudience === 'ALL' ? 'bg-white shadow-sm text-slate-900 font-bold' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setFilterAudience('CUSTOMER')}
                      className={`px-2.5 py-1 rounded-md transition ${filterAudience === 'CUSTOMER' ? 'bg-white shadow-sm text-slate-900 font-bold' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      Customer
                    </button>
                    <button
                      onClick={() => setFilterAudience('ADMIN')}
                      className={`px-2.5 py-1 rounded-md transition ${filterAudience === 'ADMIN' ? 'bg-white shadow-sm text-slate-900 font-bold' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      Admin/Sales
                    </button>
                  </div>

                  <label className="flex items-center space-x-1.5 text-xs text-slate-600 ml-4 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={unreadOnly}
                      onChange={(e) => setUnreadOnly(e.target.checked)}
                      className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                    />
                    <span>Unread only</span>
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  {unreadNotificationCount > 0 && (
                    <button
                      onClick={markAllNotificationsAsRead}
                      className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center space-x-1 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg border border-teal-200 transition"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>Mark All Read</span>
                    </button>
                  )}

                  {notifications.length > 0 && (
                    <button
                      onClick={clearNotifications}
                      className="text-xs font-semibold text-slate-600 hover:text-red-700 flex items-center space-x-1 bg-white hover:bg-red-50 px-3 py-1.5 rounded-lg border border-slate-200 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear History</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Notification List */}
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-slate-200 p-8">
                  <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-700 font-semibold text-base">No notifications found</p>
                  <p className="text-slate-500 text-xs mt-1">
                    No active notifications matching your selected filters. Trigger new events to see live multi-channel dispatch logs.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markNotificationAsRead(notif.id)}
                      className={`p-4 rounded-xl border transition cursor-pointer relative ${
                        notif.read
                          ? 'bg-white border-slate-200 hover:border-slate-300'
                          : 'bg-teal-50/40 border-teal-200 shadow-sm'
                      }`}
                    >
                      {!notif.read && (
                        <span className="absolute top-4 right-4 w-2.5 h-2.5 bg-teal-500 rounded-full animate-pulse" />
                      )}

                      <div className="flex items-start justify-between gap-3 pr-6">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getEventBadgeColor(notif.eventType)}`}>
                              {notif.eventType.replace(/_/g, ' ')}
                            </span>
                            <span className="text-[10px] font-medium text-slate-500 uppercase px-1.5 py-0.5 bg-slate-100 rounded">
                              Audience: {notif.audience}
                            </span>
                            <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                              <Clock className="w-3 h-3 inline" />
                              <span>{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </span>
                          </div>

                          <h4 className="text-sm font-bold text-slate-900 mt-1">{notif.title}</h4>
                          <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>
                        </div>
                      </div>

                      {/* Dispatched Channels Status Footer */}
                      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center space-x-2">
                          <span className="text-[11px] text-slate-400 font-medium">Triggered Channels:</span>
                          <div className="flex items-center space-x-1.5">
                            {notif.channelsTriggered.map((ch) => (
                              <span
                                key={ch}
                                className="p-1 bg-slate-100 rounded text-slate-700 flex items-center space-x-1 text-[11px] font-mono"
                                title={`Channel: ${ch}`}
                              >
                                {getChannelIcon(ch)}
                                <span>{ch}</span>
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Delivery Status Logs */}
                        <div className="flex items-center space-x-2">
                          {notif.channelsDelivered.map((d, idx) => (
                            <span
                              key={idx}
                              className={`text-[10px] font-medium px-2 py-0.5 rounded border ${
                                d.status === 'DELIVERED'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : d.status === 'DEVELOPMENT_MOCK_LOGGED'
                                  ? 'bg-amber-50 text-amber-800 border-amber-200 font-mono'
                                  : 'bg-red-50 text-red-700 border-red-200'
                              }`}
                              title={d.detail}
                            >
                              {d.channel}: {d.status === 'DEVELOPMENT_MOCK_LOGGED' ? 'DEV MOCK LOGGED' : d.status}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ARCHITECTURE & PROVIDERS */}
          {activeTab === 'architecture' && (
            <div className="space-y-6">
              {/* Architecture Explanation Banner */}
              <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 space-y-3">
                <div className="flex items-start space-x-3">
                  <ShieldCheck className="w-6 h-6 text-teal-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-base font-bold text-white">Extensible Multi-Provider Messaging Pipeline</h3>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      Melala's notification layer uses an isolated provider/adapter pattern. Third-party messaging credentials (SMTP, Twilio, Telegram, WhatsApp) are safely loaded from environment variables without hardcoding secrets.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-800/80 rounded-lg p-3 text-xs text-teal-300 border border-slate-700/80 flex items-center space-x-2">
                  <Info className="w-4 h-4 shrink-0 text-teal-400" />
                  <span>
                    <strong>Graceful Development Adapter:</strong> If external API environment variables are not configured, the system automatically uses a development adapter that formats and logs messages seamlessly rather than throwing runtime errors.
                  </span>
                </div>
              </div>

              {/* Provider Config Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {channelConfigs.map((cfg) => (
                  <div
                    key={cfg.channel}
                    className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className="p-2 rounded-lg bg-slate-100 text-slate-800">
                          {getChannelIcon(cfg.channel)}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{cfg.name}</h4>
                          <p className="text-xs text-slate-500">{cfg.providerName}</p>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                          cfg.isConfigured
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {cfg.isConfigured ? 'LIVE API READY' : 'DEV MOCK ADAPTER'}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-100 text-xs space-y-1.5">
                      <div className="flex items-center justify-between text-slate-500">
                        <span className="flex items-center space-x-1">
                          <Key className="w-3 h-3 text-slate-400" />
                          <span>Required Env Variables:</span>
                        </span>
                        <span className="font-mono text-[11px] text-slate-700 font-semibold">
                          {cfg.envKeys.join(', ') || 'None (Native)'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-slate-500">
                        <span>Current Pipeline Status:</span>
                        <span className="font-medium text-slate-800">{cfg.statusText}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: TEST DISPATCHER */}
          {activeTab === 'test_dispatcher' && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
              <div className="flex items-center space-x-3">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">Real-Time Event Simulator</h3>
                  <p className="text-xs text-slate-500">
                    Simulate any of the 15 supported customer or admin notification events to verify pipeline delivery across channels.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Select Notification Event:</label>
                  <select
                    value={testEventType}
                    onChange={(e) => setTestEventType(e.target.value as NotificationEventType)}
                    className="w-full text-xs font-mono p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500"
                  >
                    <optgroup label="Customer Events">
                      <option value="CUSTOMER_REGISTRATION_RECEIVED">CUSTOMER_REGISTRATION_RECEIVED</option>
                      <option value="CUSTOMER_ACCOUNT_APPROVED">CUSTOMER_ACCOUNT_APPROVED</option>
                      <option value="CUSTOMER_ACCOUNT_REJECTED">CUSTOMER_ACCOUNT_REJECTED</option>
                      <option value="CUSTOMER_ORDER_SUBMITTED">CUSTOMER_ORDER_SUBMITTED</option>
                      <option value="CUSTOMER_ORDER_STATUS_CHANGED">CUSTOMER_ORDER_STATUS_CHANGED</option>
                      <option value="CUSTOMER_QUOTATION_READY">CUSTOMER_QUOTATION_READY</option>
                      <option value="CUSTOMER_PROMOTION_ANNOUNCED">CUSTOMER_PROMOTION_ANNOUNCED</option>
                      <option value="CUSTOMER_REORDER_REMINDER">CUSTOMER_REORDER_REMINDER</option>
                    </optgroup>
                    <optgroup label="Admin / Sales Events">
                      <option value="ADMIN_NEW_CUSTOMER">ADMIN_NEW_CUSTOMER</option>
                      <option value="ADMIN_NEW_ORDER">ADMIN_NEW_ORDER</option>
                      <option value="ADMIN_NEW_QUOTATION">ADMIN_NEW_QUOTATION</option>
                      <option value="ADMIN_CALLBACK_REQUEST">ADMIN_CALLBACK_REQUEST</option>
                      <option value="ADMIN_NEW_LEAD">ADMIN_NEW_LEAD</option>
                      <option value="ADMIN_LOW_STOCK_WARNING">ADMIN_LOW_STOCK_WARNING</option>
                      <option value="ADMIN_EXPIRY_WARNING">ADMIN_EXPIRY_WARNING</option>
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Target Channel:</label>
                  <select
                    value={testChannel}
                    onChange={(e) => setTestChannel(e.target.value as NotificationChannel)}
                    className="w-full text-xs font-mono p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="EMAIL">EMAIL (SMTP / Resend Adapter)</option>
                    <option value="SMS">SMS (Ethio Telecom / Twilio Adapter)</option>
                    <option value="TELEGRAM">TELEGRAM (Telegram Bot Adapter)</option>
                    <option value="WHATSAPP">WHATSAPP (WhatsApp Business Cloud Adapter)</option>
                    <option value="IN_APP">IN_APP (Melala Native System Alert)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    sendTestNotification(testEventType, testChannel);
                    setActiveTab('feed');
                  }}
                  className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl transition shadow flex items-center justify-center space-x-2"
                >
                  <Play className="w-4 h-4" />
                  <span>Dispatch Test Event Now</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span>Melala Pharmaceutical Wholesale • Notification Service Engine</span>
          <button
            onClick={() => setIsNotificationModalOpen(false)}
            className="px-4 py-2 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition"
          >
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
};
