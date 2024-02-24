import React, {useEffect, useState} from 'react';
import AuthScreen from '../screens/AuthScreen';
import MainScreen from '../screens/MainScreen';
import {MMKV} from 'react-native-mmkv';

export const storage = new MMKV();
// storage.clearAll();

const RootScreen: React.FC = () => {
  const getToken: string | undefined = storage.getString('token');
  const [token, setToken] = useState<string | undefined>(getToken);

  useEffect(() => {
    const listener = storage.addOnValueChangedListener(() => {
      const getToken: string | undefined = storage.getString('token');
      getToken && setToken(getToken);
    });

    return () => {
      listener.remove();
    };
  }, []);

  return token ? <MainScreen /> : <AuthScreen />;
};

export default RootScreen;
