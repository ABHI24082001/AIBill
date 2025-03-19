import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

const OnboardingScreen2 = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Skip Button */}
      <TouchableOpacity
        onPress={() => navigation.replace('Login')}
        style={styles.skipButton}>
        <Text style={styles.skipText}>Skip</Text>
        <Ionicons name="arrow-forward" size={20} color="#fff" />
      </TouchableOpacity>

      {/* Illustration */}
      <Image source={require('../assets/image/cil.png')} style={styles.image} />

      {/* Text Content */}
      <Text style={styles.title}>AI-Powered Efficiency at Your Fingertips</Text>
      <Text style={styles.subtitle}>
        Use voice commands to generate bills faster than ever.
      </Text>

      {/* Pagination Dots */}
      <View style={styles.dotsContainer}>
        <View style={styles.dot} />
        <View style={[styles.dot, styles.activeDot]} />
        <View style={styles.dot} />
      </View>

      {/* Continue Button */}
      <TouchableOpacity
        style={styles.continueButton}
        onPress={() => navigation.replace('Splash3')}>
        <Text style={styles.continueText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  skipButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2d2d2d',
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  skipText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  image: {
    width: width * 0.8, // Responsive width
    height: width * 0.8,
    resizeMode: 'contain',
    marginBottom: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2d2d2d',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    color: '#808080',
    marginBottom: 15,
  },
  dotsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ddd',
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: '#2d2d2d',
    width: 12,
    height: 12,
  },
  continueButton: {
    backgroundColor: '#2d2d2d',
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  continueText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default OnboardingScreen2;
