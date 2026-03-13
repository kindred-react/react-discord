import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, ScrollView, FlatList, StyleSheet, SafeAreaView, StatusBar } from 'react-native'
import { useUserStore, useServerStore } from '../shared/stores'
import type { Server, Message } from '../shared/types'

export function HomeScreen() {
  const user = useUserStore((state) => state.user)
  const token = useUserStore((state) => state.token)
  const logout = useUserStore((state) => state.logout)
  
  const { 
    servers,
    currentServer, 
    channels, 
    currentChannel, 
    messages,
    members,
    fetchGuilds,
    fetchChannels,
    setCurrentServer,
    setCurrentChannel,
    addMessage
  } = useServerStore()
  
  const [messageInput, setMessageInput] = useState('')
  const [showMembers, setShowMembers] = useState(false)
  const [activeTab, setActiveTab] = useState<'servers' | 'channels'>('servers')

  useEffect(() => {
    if (user && token) {
      fetchGuilds(token)
    }
  }, [user, token])

  const handleServerClick = (server: Server) => {
    setCurrentServer(server)
    if (token) {
      fetchChannels(server.id, token)
    }
  }

  const handleSendMessage = () => {
    if (messageInput.trim() && user) {
      addMessage(messageInput, user)
      setMessageInput('')
    }
  }

  const textChannels = channels.filter(c => c.type === 'text')
  const voiceChannels = channels.filter(c => c.type === 'voice')
  const onlineMembers = members.filter(m => m.status === 'online')

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={styles.messageContainer}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.author.username[0].toUpperCase()}</Text>
      </View>
      <View style={styles.messageContent}>
        <View style={styles.messageHeader}>
          <Text style={styles.messageAuthor}>{item.author.username}</Text>
          <Text style={styles.messageTime}>
            {new Date(item.timestamp).toLocaleString('zh-CN', { 
              month: 'numeric', 
              day: 'numeric', 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
        </View>
        <Text style={styles.messageText}>{item.content}</Text>
      </View>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#202225" barStyle="light-content" />
      
      {/* Top Tab Bar */}
      <View style={styles.topBar}>
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'servers' && styles.tabActive]}
            onPress={() => setActiveTab('servers')}
          >
            <Text style={[styles.tabText, activeTab === 'servers' && styles.tabTextActive]}>
              服务器
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'channels' && styles.tabActive]}
            onPress={() => setActiveTab('channels')}
          >
            <Text style={[styles.tabText, activeTab === 'channels' && styles.tabTextActive]}>
              频道
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.mainContent}>
        {/* Server/Channel Sidebar */}
        <View style={styles.sidebar}>
          {activeTab === 'servers' ? (
            <ScrollView style={styles.serverList}>
              {servers.map((server) => (
                <TouchableOpacity
                  key={server.id}
                  onPress={() => handleServerClick(server)}
                  style={[
                    styles.serverItem,
                    currentServer?.id === server.id && styles.serverItemActive
                  ]}
                >
                  <View style={[
                    styles.serverIcon,
                    { backgroundColor: currentServer?.id === server.id ? server.color : '#36393f' }
                  ]}>
                    <Text style={styles.serverIconText}>{server.icon || '📁'}</Text>
                  </View>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.addButton}>
                <Text style={styles.addButtonText}>+</Text>
              </TouchableOpacity>
            </ScrollView>
          ) : (
            <ScrollView style={styles.channelList}>
              <Text style={styles.sectionTitle}>文字频道</Text>
              {textChannels.map((channel) => (
                <TouchableOpacity
                  key={channel.id}
                  onPress={() => setCurrentChannel(channel)}
                  style={[
                    styles.channelItem,
                    currentChannel?.id === channel.id && styles.channelItemActive
                  ]}
                >
                  <Text style={styles.hash}>#</Text>
                  <Text style={[
                    styles.channelName,
                    currentChannel?.id === channel.id && styles.channelNameActive
                  ]}>
                    {channel.name}
                  </Text>
                </TouchableOpacity>
              ))}
              
              <Text style={[styles.sectionTitle, { marginTop: 16 }]}>语音频道</Text>
              {voiceChannels.map((channel) => (
                <TouchableOpacity key={channel.id} style={styles.channelItem}>
                  <Text style={styles.voiceIcon}>🔊</Text>
                  <Text style={styles.channelName}>{channel.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Main Chat Area */}
        <View style={styles.chatArea}>
          {/* Chat Header */}
          <View style={styles.chatHeader}>
            <Text style={styles.chatHeaderTitle}>
              # {currentChannel?.name || 'general'}
            </Text>
            <TouchableOpacity onPress={() => setShowMembers(!showMembers)}>
              <Text style={styles.memberCount}>{onlineMembers.length} 在线</Text>
            </TouchableOpacity>
          </View>

          {/* Messages */}
          <FlatList
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            style={styles.messageList}
            contentContainerStyle={styles.messageListContent}
          />

          {/* Message Input */}
          <View style={styles.inputContainer}>
            <TextInput
              value={messageInput}
              onChangeText={setMessageInput}
              placeholder={`发送消息到 #${currentChannel?.name || 'general'}`}
              placeholderTextColor="#8e9297"
              style={styles.input}
              onSubmitEditing={handleSendMessage}
            />
            <TouchableOpacity onPress={handleSendMessage} style={styles.sendButton}>
              <Text style={styles.sendButtonText}>发送</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Members Panel */}
        {showMembers && (
          <View style={styles.membersPanel}>
            <Text style={styles.membersTitle}>在线 — {onlineMembers.length}</Text>
            {onlineMembers.map((member) => (
              <TouchableOpacity key={member.id} style={styles.memberItem}>
                <View style={styles.memberAvatar}>
                  <Text style={styles.memberAvatarText}>{member.username[0]}</Text>
                  <View style={[styles.statusDot, { backgroundColor: '#23a55a' }]} />
                </View>
                <Text style={styles.memberName}>{member.username}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* User Bar */}
      <View style={styles.userBar}>
        <View style={styles.userInfo}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>{user?.username?.[0]?.toUpperCase() || 'U'}</Text>
          </View>
          <View>
            <Text style={styles.userName}>{user?.username || 'User'}</Text>
            <Text style={styles.userDiscriminator}>#{user?.discriminator || '0000'}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>退出</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#313338',
  },
  topBar: {
    backgroundColor: '#202225',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#1e1f22',
    borderRadius: 4,
    padding: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 4,
  },
  tabActive: {
    backgroundColor: '#5865f2',
  },
  tabText: {
    color: '#8e9297',
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#fff',
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 72,
    backgroundColor: '#202225',
  },
  serverList: {
    flex: 1,
    paddingVertical: 8,
  },
  serverItem: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  serverItemActive: {
    backgroundColor: '#393c43',
    borderRadius: 16,
    marginHorizontal: 4,
  },
  serverIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serverIconText: {
    fontSize: 20,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#36393f',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    alignSelf: 'center',
  },
  addButtonText: {
    color: '#23a559',
    fontSize: 24,
    fontWeight: 'bold',
  },
  channelList: {
    flex: 1,
    padding: 8,
  },
  sectionTitle: {
    color: '#8e9297',
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  channelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginBottom: 2,
  },
  channelItemActive: {
    backgroundColor: '#393c43',
  },
  hash: {
    color: '#6b7280',
    fontSize: 18,
    marginRight: 6,
  },
  voiceIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  channelName: {
    color: '#8e9297',
    fontSize: 15,
  },
  channelNameActive: {
    color: '#fff',
  },
  chatArea: {
    flex: 1,
    backgroundColor: '#313338',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#202225',
  },
  chatHeaderTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  memberCount: {
    color: '#8e9297',
    fontSize: 14,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    padding: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#5865f2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  messageAuthor: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  messageTime: {
    color: '#8e9297',
    fontSize: 12,
  },
  messageText: {
    color: '#dcddde',
    fontSize: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#40444b',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 15,
  },
  sendButton: {
    backgroundColor: '#5865f2',
    borderRadius: 8,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  membersPanel: {
    width: 200,
    backgroundColor: '#2f3136',
    padding: 12,
  },
  membersTitle: {
    color: '#8e9297',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    gap: 8,
  },
  memberAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#5865f2',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  memberAvatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#2f3136',
  },
  memberName: {
    color: '#fff',
    fontSize: 14,
  },
  userBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#292b2f',
    padding: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#5865f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  userName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  userDiscriminator: {
    color: '#8e9297',
    fontSize: 12,
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  logoutButtonText: {
    color: '#8e9297',
    fontSize: 14,
  },
})
