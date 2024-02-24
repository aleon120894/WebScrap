import React, {useState, useCallback} from 'react';
import {View, TextInput, Button, Alert, StyleSheet, Text} from 'react-native';
import {storage} from '../../navigation';

const users = require('../../mock/users.json');

interface IUser {
  email: string;
  password: string;
}

const AuthScreen: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const authUser = useCallback(
    (email: string, password: string): IUser | undefined => {
      return users.find(
        user => user.email === email && user.password === password,
      );
    },
    [],
  );

  const handleLogin = useCallback(() => {
    // storage.clearAll();
    const user = authUser(email, password);
    if (user) {
      storage.set('email', `${user.email}`);
      storage.set('token', 'dummy-token');
    } else {
      Alert.alert('Error', 'Invalid email or password. Please try again.');
    }
  }, [authUser, email, password]);

  return (
    <View style={styles.container}>
      <View style={styles.welcome}>
        <Text style={styles.welcomeText}>{'Welcome!'}</Text>
      </View>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Enter your password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={true}
      />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  welcome: {
    alignItems: 'center',
    flex: 0.3,
  },
  welcomeText: {
    fontSize: 30,
    fontWeight: '600',
  },
  input: {
    height: 50,
    width: '100%',
    borderColor: 'gray',
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
});

export default AuthScreen;
