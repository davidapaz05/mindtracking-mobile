import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Carousel from './src/screens/carousel';
import PreLogin from './src/screens/pre_login';
import Cadastre from './src/screens/cadastre';
import Login from './src/screens/login';
import Redefine from './src/screens/redefine';
import Verification from './src/screens/verification';
import Questionnaire from './src/screens/questionnaire';

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
