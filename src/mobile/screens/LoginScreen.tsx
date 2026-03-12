import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { useUserStore, DEMO_USERS } from '../shared/stores'

export function LoginScreen() {
  const login = useUserStore((state) => state.login)
  const [selectedUser, setSelectedUser] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async () => {
    setIsLoading(true)
    const user = DEMO_USERS[selectedUser]
    await login(user.username, user.password)
    setIsLoading(false)
  }

  return (
    <View style={styles.container}>
      <View style={styles.loginBox}>
        <Text style={styles.title}>欢迎回来</Text>
        <Text style={styles.subtitle}>我们很高兴再次见到你!</Text>

        <Text style={styles.label}>选择测试账号:</Text>
        <View style={styles.userButtons}>
          {DEMO_USERS.map((user, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setSelectedUser(index)}
              style={[
                styles.userButton,
                selectedUser === index && styles.userButtonSelected
              ]}
            >
              <Text style={[
                styles.userButtonText,
                selectedUser === index && styles.userButtonTextSelected
              ]}>
                {user.username}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          onPress={handleLogin}
          disabled={isLoading}
          style={styles.loginButton}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>登录</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#313338',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginBox: {
    backgroundColor: '#2b2d31',
    padding: 24,
    borderRadius: 8,
    width: '90%',
    maxWidth: 400,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#949ba4',
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    color: '#949ba4',
    marginBottom: 8,
  },
  userButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  userButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 4,
    backgroundColor: '#1e1f22',
    alignItems: 'center',
  },
  userButtonSelected: {
    backgroundColor: '#5865f2',
  },
  userButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#949ba4',
  },
  userButtonTextSelected: {
    color: '#fff',
  },
  loginButton: {
    backgroundColor: '#5865f2',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 4,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
})
