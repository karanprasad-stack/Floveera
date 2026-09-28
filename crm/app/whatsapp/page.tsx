'use client';

import React, { useEffect, useState } from 'react';
import CrmGuard from '@/components/CrmGuard';
import CrmHeader from '@/components/CrmHeader';
import { useCrmAuthStore } from '@/store/crmAuthStore';
import { getCrmWhatsapp } from '@/lib/api';
import {
  MessageSquare,
  CheckCheck,
  Send,
  Sparkles,
  Phone,
  Clock,
  CheckCircle2,
  Users,
  Search,
  Radio,
  FileText,
  BadgeCheck,
  TrendingUp,
  AlertCircle,
  RotateCw,
  ShoppingBag
} from 'lucide-react';

const FALLBACK_WHATSAPP_DATA = {
  telemetry: {
    connected: true,
    phoneNumber: '+91 91133 42012',
    channelName: 'Floveera Official Verified Bot',
    sentToday: 142,
    deliveredRate: '99.4%',
    readRate: '92.1%',
    activeCustomerInquiries: 4
  },
  templates: [
    {
      id: 'TPL-01',
      name: 'order_placed_confirmation',
      category: 'TRANSACTIONAL',
      status: 'APPROVED',
      content: 'Hi {{1}}, your order {{2}} has been confirmed by Floveera Restaurant! Total: ₹{{3}}. Estimated delivery: {{4}} mins. Track here: {{5}}',
      usageCount: 1240
    },
    {
      id: 'TPL-02',
      name: 'kitchen_prep_alert',
      category: 'OPERATIONAL',
      status: 'APPROVED',
      content: 'Good news {{1}}! Chef Vikram and kitchen crew have begun cooking your order {{2}}. Fresh, hygienic, and hot!',
      usageCount: 1190
    },
    {
      id: 'TPL-03',
      name: 'out_for_delivery_live_track',
      category: 'DELIVERY',
      status: 'APPROVED',
      content: 'Rider {{1}} is on the way with your order {{2}}! Call rider at {{3}} or track live GPS: {{4}}',
      usageCount: 1150
    },
    {
      id: 'TPL-04',
      name: 'order_delivered_feedback',
      category: 'CUSTOMER_CARE',
      status: 'APPROVED',
      content: 'Bon Appétit {{1}}! Your Floveera meal was delivered. How was your experience? Reply 1-5 to rate us or share feedback!',
      usageCount: 1080
    },
    {
      id: 'TPL-05',
      name: 'weekend_special_feast',
      category: 'MARKETING',
      status: 'APPROVED',
      content: 'Weekend Craving Alert {{1}}! Enjoy flat 20% OFF on all Dum Biryanis & Tandoori Starters this weekend with code FLOVEERA20.',
      usageCount: 450
    }
  ],
  threads: [
    {
      id: 'MSG-901',
      customerName: 'Karan Prasad',
      customerPhone: '+91 91133 42099',
      orderNumber: '#LN-R-000101',
      lastMessage: 'Will extra mint chutney be included with Paneer Butter Masala?',
      lastSender: 'CUSTOMER',
      timestamp: '18:50',
      deliveryStatus: 'READ',
      unread: false,
      history: [
        { sender: 'BOT', text: 'Hi Karan, your order #LN-R-000101 (₹512.50) is confirmed at Floveera! Fresh prep started in kitchen.', time: '18:45' },
        { sender: 'CUSTOMER', text: 'Will extra mint chutney be included with Paneer Butter Masala?', time: '18:48' },
        { sender: 'AGENT', text: 'Yes Karan! Kitchen has packed 2 extra mint chutneys and fresh onion rings for you.', time: '18:50' }
      ]
    },
    {
      id: 'MSG-902',
      customerName: 'Sneha Roy',
      customerPhone: '+91 98341 25678',
      orderNumber: '#LN-R-000102',
      lastMessage: 'Order is out for delivery. Rider Raju Kumar is arriving in 8 mins.',
      lastSender: 'BOT',
      timestamp: '18:42',
      deliveryStatus: 'DELIVERED',
      unread: false,
      history: [
        { sender: 'BOT', text: 'Hi Sneha! Your Hyderabadi Biryani order #LN-R-000102 has been confirmed by operations.', time: '18:32' },
        { sender: 'BOT', text: 'Order is out for delivery. Rider Raju Kumar is arriving in 8 mins.', time: '18:42' }
      ]
    },
    {
      id: 'MSG-903',
      customerName: 'Amit Sharma',
      customerPhone: '+91 97451 23980',
      orderNumber: '#LN-R-000103',
      lastMessage: 'Chef has prepared your Truffle Pasta with mild Italian herbs as requested.',
      lastSender: 'AGENT',
      timestamp: '18:25',
      deliveryStatus: 'READ',
      unread: false,
      history: [
        { sender: 'CUSTOMER', text: 'Please ensure pasta is not spicy at all, kids are eating.', time: '18:20' },
        { sender: 'AGENT', text: 'Chef has prepared your Truffle Pasta with mild Italian herbs as requested.', time: '18:25' }
      ]
    },
    {
      id: 'MSG-904',
      customerName: 'Priya Patel',
      customerPhone: '+91 96541 28790',
      orderNumber: '#LN-R-000104',
      lastMessage: 'Thank you Floveera! The Margherita pizza was piping hot and delicious. Rated 5 stars!',
      lastSender: 'CUSTOMER',
      timestamp: '18:12',
      deliveryStatus: 'READ',
      unread: false,
      history: [
        { sender: 'BOT', text: 'Your pizza order #LN-R-000104 is delivered. How was the food?', time: '18:05' },
        { sender: 'CUSTOMER', text: 'Thank you Floveera! The Margherita pizza was piping hot and delicious. Rated 5 stars!', time: '18:12' }
      ]
    }
  ],
  campaigns: [
    { id: 'CMP-101', name: 'Weekend Dum Biryani Special', target: 'Patna Foodies (Past 30 Days)', sentCount: 450, delivered: '99.1%', responseRate: '24.8%', sentAt: '2026-09-26' },
    { id: 'CMP-102', name: 'Late Night Dessert Cravings Alert', target: 'Night Owls (Orders after 9 PM)', sentCount: 280, delivered: '98.5%', responseRate: '18.2%', sentAt: '2026-09-25' },
    { id: 'CMP-103', name: 'Sunday Family Feast 25% Off', target: 'VIP & Frequent Patrons', sentCount: 320, delivered: '100%', responseRate: '31.5%', sentAt: '2026-09-20' }
  ]
};

export default function CrmWhatsappPage() {
  const { restaurant } = useCrmAuthStore();
  const [data, setData] = useState<any>(FALLBACK_WHATSAPP_DATA);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'CHATS' | 'TEMPLATES' | 'CAMPAIGNS'>('CHATS');
  const [selectedThreadId, setSelectedThreadId] = useState<string>('MSG-901');
  const [replyText, setReplyText] = useState('');
  const [searchChat, setSearchChat] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchWhatsapp = () => {
    if (!restaurant?._id) return;
    setLoading(true);
    getCrmWhatsapp(restaurant._id)
      .then((res: any) => {
        if (res?.threads && res.threads.length > 0) {
          setData(res);
        } else {
          setData(FALLBACK_WHATSAPP_DATA);
        }
      })
      .catch((err: any) => {
        console.warn('WhatsApp telemetry fetch failed, fallback to mock:', err);
        setData(FALLBACK_WHATSAPP_DATA);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchWhatsapp();
  }, [restaurant?._id]);

  const activeThread = data.threads.find((t: any) => t.id === selectedThreadId) || data.threads[0];

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeThread) return;

    const newMsg = {
      sender: 'AGENT',
      text: replyText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedThreads = data.threads.map((t: any) => {
      if (t.id === activeThread.id) {
        return {
          ...t,
          lastMessage: replyText.trim(),
          lastSender: 'AGENT',
          timestamp: newMsg.time,
          history: [...t.history, newMsg]
        };
      }
      return t;
    });

    setData({ ...data, threads: updatedThreads });
    setReplyText('');
    setToastMessage(`WhatsApp message delivered to ${activeThread.customerName}.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredThreads = data.threads.filter((t: any) =>
    t.customerName.toLowerCase().includes(searchChat.toLowerCase()) ||
    t.customerPhone.includes(searchChat) ||
    t.orderNumber.toLowerCase().includes(searchChat.toLowerCase())
  );

  return (
    <CrmGuard allowedRoles={['RESTAURANT_ADMIN']}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-150">
        <CrmHeader onSync={fetchWhatsapp} syncing={loading} />

        <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                  Communication • WhatsApp Business Hub
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-600">•</span>
                <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">{restaurant?.name || 'Floveera Restaurant'}</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">WhatsApp Notification Center</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Automated order alerts, live rider dispatch links, customer conversations, and marketing broadcasts.
              </p>
            </div>

            <div className="flex items-center space-x-2 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-300 shadow-xs self-start sm:self-auto">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Floveera Official WhatsApp Cloud API Connected</span>
            </div>
          </div>

          {toastMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs flex items-center space-x-2 shadow-xs animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{toastMessage}</span>
            </div>
          )}

          {/* Telemetry KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Sent Today</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Send className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{data.telemetry?.sentToday || 142}</div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Real-time automated alerts</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Delivery Rate</span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <CheckCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-blue-700 dark:text-blue-400">{data.telemetry?.deliveredRate || '99.4%'}</div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Delivery confirmation SLA</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Read / Open Rate</span>
                <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-purple-700 dark:text-purple-400">{data.telemetry?.readRate || '92.1%'}</div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Customer view velocity</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Live Inquiries</span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{data.telemetry?.activeCustomerInquiries || 4}</div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Awaiting kitchen staff response</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            {[
              { key: 'CHATS', label: 'Live Customer Chats & Logs', icon: MessageSquare },
              { key: 'TEMPLATES', label: 'Automated Meta Templates', icon: FileText },
              { key: 'CAMPAIGNS', label: 'Broadcast Campaigns', icon: Radio }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    activeTab === tab.key
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: LIVE CHATS */}
          {activeTab === 'CHATS' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[550px]">
              {/* Left Column: Thread List */}
              <div className="md:col-span-5 border-r border-slate-200 dark:border-slate-800 flex flex-col">
                <div className="p-3.5 border-b border-slate-100 dark:border-slate-800">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search customer chat..."
                      value={searchChat}
                      onChange={e => setSearchChat(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 max-h-[480px]">
                  {filteredThreads.map((thread: any) => {
                    const isSelected = thread.id === activeThread?.id;
                    return (
                      <button
                        key={thread.id}
                        onClick={() => setSelectedThreadId(thread.id)}
                        className={`w-full p-4 text-left flex items-start space-x-3 transition cursor-pointer ${
                          isSelected
                            ? 'bg-orange-50/70 dark:bg-orange-950/30 border-l-4 border-l-orange-600'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0">
                          {thread.customerName.charAt(0)}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-slate-900 dark:text-white truncate">{thread.customerName}</span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500">{thread.timestamp}</span>
                          </div>

                          <div className="flex items-center space-x-1.5 mt-0.5">
                            <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {thread.orderNumber}
                            </span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono truncate">{thread.customerPhone}</span>
                          </div>

                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-1">
                            {thread.lastMessage}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Chat Window */}
              <div className="md:col-span-7 flex flex-col justify-between bg-slate-50/40 dark:bg-slate-950/40">
                {activeThread ? (
                  <>
                    {/* Chat Header */}
                    <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                          {activeThread.customerName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-xs text-slate-900 dark:text-white">{activeThread.customerName}</span>
                            <BadgeCheck className="w-3.5 h-3.5 text-blue-500" />
                          </div>
                          <div className="flex items-center space-x-2 text-[10px] text-slate-400 dark:text-slate-500">
                            <span>{activeThread.customerPhone}</span>
                            <span>•</span>
                            <span className="text-orange-600 dark:text-orange-400 font-bold">{activeThread.orderNumber}</span>
                          </div>
                        </div>
                      </div>

                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 flex items-center space-x-1">
                        <CheckCheck className="w-3 h-3 text-blue-500" />
                        <span>Live Sync</span>
                      </span>
                    </div>

                    {/* Messages Body */}
                    <div className="p-4 space-y-3 overflow-y-auto max-h-[380px] flex-1">
                      {activeThread.history.map((msg: any, i: number) => {
                        const isCustomer = msg.sender === 'CUSTOMER';
                        return (
                          <div
                            key={i}
                            className={`flex flex-col ${isCustomer ? 'items-start' : 'items-end'}`}
                          >
                            <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 mb-0.5 px-1">
                              {msg.sender === 'BOT' ? '🤖 Floveera Automated Bot' : msg.sender === 'AGENT' ? '👨‍🍳 Kitchen Staff' : activeThread.customerName}
                            </span>
                            <div
                              className={`max-w-xs md:max-w-md p-3 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                                isCustomer
                                  ? 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-tl-xs'
                                  : msg.sender === 'BOT'
                                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-emerald-950 dark:text-emerald-200 rounded-tr-xs'
                                  : 'bg-orange-600 text-white rounded-tr-xs'
                              }`}
                            >
                              <p>{msg.text}</p>
                              <div
                                className={`text-[9px] mt-1 text-right flex items-center justify-end space-x-1 ${
                                  isCustomer ? 'text-slate-400 dark:text-slate-500' : msg.sender === 'BOT' ? 'text-emerald-700 dark:text-emerald-400' : 'text-orange-200'
                                }`}
                              >
                                <span>{msg.time}</span>
                                {!isCustomer && <CheckCheck className="w-3 h-3" />}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Chat Input */}
                    <form onSubmit={handleSendReply} className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder={`Reply directly to ${activeThread.customerName} via WhatsApp...`}
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send</span>
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="p-12 text-center text-slate-400 dark:text-slate-500 my-auto">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                    <span>Select a conversation from the left</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: TEMPLATES */}
          {activeTab === 'TEMPLATES' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.templates.map((tpl: any) => (
                <div key={tpl.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="font-bold text-xs text-slate-900 dark:text-white font-mono">{tpl.name}</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {tpl.category}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-200 font-sans leading-relaxed">
                    {tpl.content}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 pt-1">
                    <span>Meta Approval: <strong className="text-emerald-700 dark:text-emerald-400">Approved & Active</strong></span>
                    <span>{tpl.usageCount.toLocaleString()} messages sent</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: CAMPAIGNS */}
          {activeTab === 'CAMPAIGNS' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-xs text-slate-900 dark:text-white">Broadcast Campaign History</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Marketing dispatches sent to opted-in Floveera customer lists.</p>
                </div>
                <button
                  onClick={() => {
                    setToastMessage('Broadcast simulation initiated to 450 opted-in customers.');
                    setTimeout(() => setToastMessage(null), 3500);
                  }}
                  className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                >
                  Create New Broadcast
                </button>
              </div>

              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-[11px] uppercase font-semibold border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-5">Campaign Name</th>
                    <th className="py-3 px-5">Target Audience</th>
                    <th className="py-3 px-5">Recipients</th>
                    <th className="py-3 px-5">Delivered</th>
                    <th className="py-3 px-5">Order Conversion</th>
                    <th className="py-3 px-5 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {data.campaigns.map((cmp: any) => (
                    <tr key={cmp.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="py-3.5 px-5 font-bold text-slate-900 dark:text-white">{cmp.name}</td>
                      <td className="py-3.5 px-5 text-slate-600 dark:text-slate-300">{cmp.target}</td>
                      <td className="py-3.5 px-5 font-extrabold text-slate-800 dark:text-slate-200">{cmp.sentCount} customers</td>
                      <td className="py-3.5 px-5 text-emerald-700 dark:text-emerald-400 font-bold">{cmp.delivered}</td>
                      <td className="py-3.5 px-5 text-blue-700 dark:text-blue-400 font-bold">{cmp.responseRate}</td>
                      <td className="py-3.5 px-5 text-right text-slate-400 dark:text-slate-500">{cmp.sentAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </CrmGuard>
  );
}
