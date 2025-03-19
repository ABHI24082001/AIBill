import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {FadeInUp} from 'react-native-reanimated';
import {FlatGrid} from 'react-native-super-grid';
import {useNavigation} from '@react-navigation/native';

const HomeScreen = () => {

  const navigation = useNavigation();

  const items = [
    {
      title: 'Home Screen',
      icon: 'book',
      colors: ['#A1C4FD', '#C2E9FB'],
      screen: 'Menu',
    },
    {
      title: ' Billing Screen',
      icon: 'music',
      colors: ['#F2994A', '#F2C94C'],
      screen: 'Blooth',
    },
    {
      title: 'Inventory Screen',
      icon: 'spa',
      colors: ['#8E2DE2', '#4A00E0'],
      screen: 'Onboarding',
    },
    {
      title: 'Customer Screen',
      icon: 'bed',
      colors: ['#56CCF2', '#2F80ED'],
      screen: 'Product',
    },
    {
      title: 'Reports Screen',
      icon: 'bed',
      colors: ['#deffba', '#9afc30'],
      screen: 'Onboarding',
    },
    {
      title: 'Bluetooth',
      icon: 'bed',
      colors: ['#fab9b4', '#f26b61'],
      screen: 'Onboarding',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Animated.Text style={styles.greeting} entering={FadeInUp.delay(200)}>
          Good Morning, User
        </Animated.Text>
        <Animated.Text style={styles.subText} entering={FadeInUp.delay(300)}>
          We wish you have a wonderful day
        </Animated.Text>

        <FlatGrid
          itemDimension={150}
          data={items}
          spacing={15}
          renderItem={({item}) => (
            <AnimatedTouchableOpacity
              style={styles.card}
              entering={FadeInUp.delay(400)}>
              <LinearGradient colors={item.colors} style={styles.gradient}>
                <Icon name={item.icon} size={30} color="white" />
                <Text style={styles.cardTitle}>{item.title}</Text>
                <TouchableOpacity
                  style={styles.startButton}
                  // onPress={() => navigation.navigate('Menu')}
                  onPress={() => navigation.navigate(item.screen)}
                  
                  >
                  <Text style={styles.startText}>START</Text>
                </TouchableOpacity>
              </LinearGradient>
            </AnimatedTouchableOpacity>
          )}
        />

        <Animated.View
          style={styles.thoughtContainer}
          entering={FadeInUp.delay(500)}>
          <Text style={styles.goodThought}>
            🌟 "Success is not the key to happiness. Happiness is the key to
            success."
          </Text>
          <Text style={styles.subThought}>
            - If you love what you are doing, you will be successful.
          </Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#e3fcfc'},
  container: {flex: 1, padding: 20},
  greeting: {fontSize: 26, fontWeight: 'bold', color: '#333', marginBottom: 5},
  subText: {fontSize: 16, color: 'gray', marginBottom: 20},
  card: {
    borderRadius: 20,
    elevation: 5,
    overflow: 'hidden',
  },
  gradient: {
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginVertical: 10,
  },
  startButton: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 10,
  },
  startText: {color: 'white', fontSize: 14, fontWeight: 'bold'},

  thoughtContainer: {
    marginTop: 30,
    padding: 20,
    borderRadius: 15,
    backgroundColor: '#FFF5E1',
    elevation: 3,
    alignItems: 'center',
  },
  goodThought: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  subThought: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
});

export default HomeScreen;
