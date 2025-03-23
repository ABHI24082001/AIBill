import React, {useState, useEffect} from 'react';
import {ActivityIndicator, View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {createStackNavigator} from '@react-navigation/stack';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {NavigationContainer} from '@react-navigation/native';
import Splash1 from '../screen/Splash1';
import Splash2 from '../screen/Splash2';
import Splash3 from '../screen/Splash3';
import Login from '../screen/Login';
import Profile from '../screen/Profile';
import Dashboard from '../screen/Dashboard';
import CustomDrawer from '../component/CustomDrawer';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Menu from '../screen/Menu';
import Blooth from '../screen/Blooth';
import Product from '../screen/Product';
import bluetooth from '../screen/bluetooth';
import Onboarding from '../screen/Onbodaring';
import RrportScreen from '../screen/RrportScreen';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const DrawerNavigator = () => (
  <Drawer.Navigator
    drawerContent={props => <CustomDrawer {...props} />}
    screenOptions={{
      drawerStyle: {backgroundColor: '#fff', width: 240},
      headerStyle: {
        backgroundColor: '#1ed2fa', // Change header background color
        elevation: 0, // Remove shadow on Android
        shadowOpacity: 0, // Remove shadow on iOS
        borderBottomWidth: 0, // Remove bottom border
      },
      headerTintColor: '#fff', // Change the color of the back button and title
      headerTitleStyle: {
        fontWeight: 'bold', // Make the title bold
        fontSize: 20, // Change the font size of the title
      },
      drawerActiveBackgroundColor: '#1ed2fa',
      drawerActiveTintColor: '#fff',
      drawerInactiveTintColor: '#333',
      headerTitle: 'AI Billing App', // Fixed title for all screens
      headerRightContainerStyle: {},
    }}>
    <Drawer.Screen
      name="Dashboard"
      component={Dashboard}
      options={{
        drawerIcon: ({color}) => (
          <Icon name="view-dashboard-outline" size={24} color={color} />
        ),
      }}
    />
    <Drawer.Screen
      name="Profile"
      component={Profile}
      options={{
        drawerIcon: ({color}) => (
          <Icon name="account-outline" size={24} color={color} />
        ),
      }}
    />
  </Drawer.Navigator>
);

const AppNavigator = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  useEffect(() => {
    const checkLoginStatus = async () => {
      const storedLoginStatus = await AsyncStorage.getItem('isLoggedIn');
      setIsLoggedIn(storedLoginStatus === 'true');
    };

    checkLoginStatus();
  }, []);

  if (isLoggedIn === null) {
    // Show loading screen while checking login status
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color="#1ed2fa" />
      </View>
    );
  }

 return (
   <NavigationContainer>
     <Stack.Navigator screenOptions={{headerShown: false}}>
       {isLoggedIn ? (
         // If logged in, go directly to DrawerNavigator
         <Stack.Screen name="Drawer" component={DrawerNavigator} />
       ) : (
         // Otherwise, show splash screens and login flow
         <>
           <Stack.Screen name="Splash1" component={Splash1} />
           <Stack.Screen name="Splash2" component={Splash2} />
           <Stack.Screen name="Splash3" component={Splash3} />
           <Stack.Screen name="Login" component={Login} />
         </>
       )}
       {/* Add Menu screen to the stack */}
       <Stack.Screen name="Menu" component={Menu} />
       <Stack.Screen name="Blooth" component={Blooth} />
       <Stack.Screen name="Product" component={Product} />
       <Stack.Screen name="bluetooth" component={bluetooth} />
       <Stack.Screen name="Onboarding" component={Onboarding} />
       <Stack.Screen name="ReportScreen" component={RrportScreen}/>
     </Stack.Navigator>
   </NavigationContainer>
 );
}
export default AppNavigator;
