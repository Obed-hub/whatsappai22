import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { MessageSquare, Search, Send, User, Sparkles, AlertCircle } from 'lucide-react'

export default async function ConversationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetching conversations with messages (with mock fallback)
  let conversations = []
  try {
    const { data } = await supabase
      .from('conversations')
      .select('*, customers(*), messages(*)')
      .eq('vendor_id', user.id)
      .order('last_user_message_at', { ascending: false })
    
    conversations = data || []

    // DEMO DATA FALLBACK
    if (conversations.length === 0) {
      conversations = [
        {
          id: '1',
          last_user_message_at: new Date().toISOString(),
          customers: { name: 'Sarah Jenkins', phone: '+234 812 345 6789' },
          messages: [
            { id: 'm1', content: "I'd like to order 2 bags of coffee beans.", direction: 'inbound', created_at: new Date(Date.now() - 300000).toISOString() },
            { id: 'm2', content: "Sure! Which roast would you prefer? We have Dark and Medium.", direction: 'outbound', created_at: new Date(Date.now() - 200000).toISOString() },
            { id: 'm3', content: "Dark roast please!", direction: 'inbound', created_at: new Date(Date.now() - 100000).toISOString() }
          ]
        },
        {
          id: '2',
          last_user_message_at: new Date(Date.now() - 3600000).toISOString(),
          customers: { name: 'David Mills', phone: '+234 701 234 5678' },
          messages: [
            { id: 'm4', content: "Does the pour-over set come in black?", direction: 'inbound', created_at: new Date(Date.now() - 3600000).toISOString() }
          ]
        }
      ] as any
    }
  } catch (err) {
    console.error('Conversations Fetch Error:', err)
  }

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black font-outfit text-slate-900">Conversations</h1>
          <p className="text-slate-500 font-medium">Manage your WhatsApp customer chats in real-time.</p>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex">
        {/* Chat List */}
        <div className="w-80 border-r border-slate-100 flex flex-col">
          <div className="p-4 border-b border-slate-50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search chats..." 
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border-transparent rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.map((conv: any) => (
              <div 
                key={conv.id} 
                className="p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors group relative"
              >
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
                    {conv.customers?.name?.charAt(0) || <User className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-bold text-slate-900 truncate">{conv.customers?.name || conv.customers?.phone}</h4>
                      <span className="text-[10px] font-bold text-slate-400">
                        {new Date(conv.last_user_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {conv.messages?.[conv.messages.length - 1]?.content || 'Start a conversation'}
                    </p>
                  </div>
                </div>
                {/* AI Status Indicator */}
                <div className="absolute right-2 bottom-2">
                  <div className="flex items-center gap-1 bg-blue-50 px-1.5 py-0.5 rounded-full">
                    <Sparkles className="w-2.5 h-2.5 text-blue-500" />
                    <span className="text-[8px] font-black text-blue-600 uppercase">AI Active</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-slate-50/30">
          {/* Active Chat Header */}
          <div className="p-4 bg-white border-b border-slate-100 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-xs uppercase">
                {conversations[0]?.customers?.name?.charAt(0) || 'C'}
              </div>
              <div>
                <h3 className="text-sm font-black font-outfit text-slate-900">
                  {conversations[0]?.customers?.name || 'Customer'}
                </h3>
                <p className="text-[10px] font-bold text-green-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                  Connected via WhatsApp
                </p>
              </div>
            </div>
            <button className="p-2 text-slate-400 hover:text-slate-600 transition">
              <AlertCircle className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Thread */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {conversations[0]?.messages?.map((msg: any) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.direction === 'inbound' ? 'justify-start' : 'justify-end'}`}
              >
                <div className={`
                  max-w-[70%] p-3 rounded-2xl text-sm font-medium shadow-sm
                  ${msg.direction === 'inbound' 
                    ? 'bg-white text-slate-800 rounded-bl-none' 
                    : 'bg-blue-600 text-white rounded-br-none'}
                `}>
                  {msg.content}
                  <p className={`text-[9px] mt-1 font-bold uppercase opacity-50 ${msg.direction === 'inbound' ? 'text-slate-400' : 'text-blue-100'}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-slate-100">
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Type a message..." 
                className="flex-1 px-4 py-2 bg-slate-50 border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
              />
              <button className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100">
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
