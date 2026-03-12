import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useUserStore } from '../shared/stores'
import { LoginScreen } from './screens/LoginScreen'
import { HomeScreen } from './screens/HomeScreen'

export type RootStackParamList = {
  Login: undefined
  Home: undefined
}

const Stack = createNativeStackNavigator<RootStackParamList>()

export function MobileApp() {
  const isAuthenticated = useUserStore((state) => state.isAuthenticated)

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {isAuthenticated ? (
          <Stack.Screen name="Home" component={HomeScreen} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}
