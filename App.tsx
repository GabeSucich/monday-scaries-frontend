/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {
  SafeAreaView,
} from 'react-native';

import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ApiProvider } from './src/state/apiState';
import AuthProvider from './src/state/authState';
import Entry from './src/pages/Entry';
import BettorGroupsProvider from './src/state/bettorGroupsState';
import { NavigationContainer } from '@react-navigation/native';

function App(): React.JSX.Element {

  return (
    <NavigationContainer>
        <SafeAreaProvider>
          <AuthProvider>
            <ApiProvider>
              <BettorGroupsProvider>
                <SafeAreaView>
                  <Entry />
                </SafeAreaView>
              </BettorGroupsProvider>
            </ApiProvider>
          </AuthProvider>
        </SafeAreaProvider>
    </NavigationContainer>
  );
}

export default App;
