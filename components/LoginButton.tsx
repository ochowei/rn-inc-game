import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Colors } from '@/constants/Colors';

const user = {
  name: 'Jason',
  email: 'jason@example.com',
  password: 'password123',
};

const Avatar = ({ name }: { name: string }) => {
  const backgroundColor = useThemeColor({}, 'tint');
  return (
    <View style={[styles.avatar, { backgroundColor }]}>
      <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
    </View>
  );
};

export function LoginButton() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const borderColor = useThemeColor({}, 'icon');

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <ThemedView style={styles.container}>
      {isLoggedIn ? (
        <View style={styles.userInfoContainer}>
          <Avatar name={user.name} />
          <View>
            <ThemedText>Email: {user.email}</ThemedText>
            <ThemedText>Password: {user.password}</ThemedText>
          </View>
          <Pressable style={[styles.button, { borderColor }]} onPress={handleLogout}>
            <ThemedText>Logout</ThemedText>
          </Pressable>
        </View>
      ) : (
        <Pressable style={[styles.button, { borderColor }]} onPress={handleLogin}>
          <ThemedText>Login</ThemedText>
        </Pressable>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  userInfoContainer: {
    alignItems: 'center',
    gap: 10,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
});
