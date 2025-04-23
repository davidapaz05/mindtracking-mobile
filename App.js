import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Carousel from './components/screens/carousel';
import PreLogin from './components/screens/pre_login';
import Cadastre from './components/screens/cadastre';
import Login from './components/screens/login';
import Redefine from './components/screens/redefine';
import Verification from './components/screens/verification';
import Questionnaire from './components/screens/questionnaire';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Carousel">
        <Stack.Screen name="Carousel" component={Carousel} />
        <Stack.Screen name="pre_login" component={PreLogin}/>
        <Stack.Screen name="cadastre" component={Cadastre} />
        <Stack.Screen name="login" component={Login}/>
        <Stack.Screen name="verification" component={Verification}/>
        <Stack.Screen name="redefine" component={Redefine}/>
        <Stack.Screen name="questionnaire" component={Questionnaire}/>
        
        
      </Stack.Navigator>
    </NavigationContainer>
  );
}
