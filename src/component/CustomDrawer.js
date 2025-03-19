import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
} from 'react-native';
import {DrawerContentScrollView} from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const CustomDrawer = ({navigation}) => (
  <DrawerContentScrollView contentContainerStyle={{flex: 1, padding: 0}}>
    {/* Welcome Message Box with Image Background */}
    <ImageBackground
      source={require('../assets/image/Billing management.png')} // Add an image in assets folder
      style={styles.welcomeBox}
      resizeMode="cover">
      <View style={styles.overlay}>
        <Icon name="printer" size={50} color="#fff" />
        <Text style={styles.welcomeText}>Welcome to AI Printer</Text>
      </View>
    </ImageBackground>

    {/* Menu Items */}
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigation.navigate('Dashboard')}>
        <Icon name="view-dashboard-outline" size={24} color="#333" />
        <Text style={styles.menuText}>Dashboard</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigation.navigate('Profile')}>
        <Icon name="account-outline" size={24} color="#333" />
        <Text style={styles.menuText}>Profile</Text>
      </TouchableOpacity>
    </View>
  </DrawerContentScrollView>
);

export default CustomDrawer;

const styles = StyleSheet.create({
  welcomeBox: {
    width: '100%',
    height: 180, // Adjust height as needed
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 40, // Round corners for a more rounded look
  },
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.5)', // Dark overlay for better visibility
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 40, // Round corners for a more rounded look
  },
  welcomeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  container: {
    flex: 1,
    padding: 20,
    borderRadius: 30,
    borderColor: '#000',
    borderWidth: 3,
    marginTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  menuText: {
    fontSize: 16,
    marginLeft: 15,
    color: '#333',
  },
});
